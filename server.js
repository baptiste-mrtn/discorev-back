import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

// Import des routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import mediaRoutes from "./src/routes/mediaRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import jobOfferRoutes from "./src/routes/jobOfferRoutes.js";
import recruiterRoutes from "./src/routes/recruiterRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import historyRoutes from "./src/routes/historyRoutes.js";
import tagRoutes from "./src/routes/tagRoutes.js";

import crudRoutes from "./src/routes/crudRoutes.js";
import BaseController from "./src/controllers/baseController.js";
import BaseModel from "./src/models/baseModel.js";

import errorHandler from "./src/middlewares/errorHandler.js";
import sanitizeRequest from "./src/middlewares/sanitizerMiddleware.js";
import caseConverter from "./src/middlewares/caseConverter.js";
import authenticateToken from "./src/middlewares/authMiddleware.js";
import isAdmin from "./src/middlewares/isAdmin.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

// **Middlewares**
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true
	})
);

const allowedOrigins = ["http://localhost:8000", "http://127.0.0.1:8000"];

app.use(
	cors({
		origin: (origin, callback) => {
			// Autorise les appels Postman (sans origine) + localhost/127.0.0.1
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS: " + origin));
			}
		},
		credentials: true
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(caseConverter);

app.use("/uploads", express.static(path.resolve("uploads")));

// Tables simples (CRUD générique)
const GENERIC_TABLES = [
	{
		name: "admins",
		middlewares: {
			getAll: [authenticateToken, isAdmin],
			getOne: [authenticateToken, isAdmin],
			getOneByUserId: [authenticateToken, isAdmin],
			create: [authenticateToken, isAdmin],
			update: [authenticateToken, isAdmin],
			delete: [authenticateToken, isAdmin]
		}
	},
	{
		name: "websites",
		middlewares: {
			getAll: [],
			getOne: [],
			getOneByUserId: [authenticateToken],
			create: [authenticateToken],
			update: [authenticateToken],
			delete: [authenticateToken]
		}
	},
	{
		name: "website_sections",
		middlewares: {
			getAll: [],
			getOne: [],
			getOneByUserId: [authenticateToken],
			create: [authenticateToken],
			update: [authenticateToken],
			delete: [authenticateToken]
		}
	},
	{
		name: "plans",
		middlewares: {
			getAll: [], // public
			getOne: [], // public
			getOneByUserId: [authenticateToken],
			create: [authenticateToken, isAdmin], // réservé
			update: [authenticateToken, isAdmin],
			delete: [authenticateToken, isAdmin]
		}
	},
	{
		name: "subscriptions",
		middlewares: {
			getAll: [authenticateToken],
			getOne: [authenticateToken],
			getOneByUserId: [authenticateToken],
			create: [authenticateToken],
			update: [authenticateToken],
			delete: [authenticateToken]
		}
	}
];

GENERIC_TABLES.forEach(async ({ name, middlewares }) => {
	// Chemins potentiels
	const modelPath = path.resolve(`./models/${name}Model.js`);
	const controllerPath = path.resolve(`./controllers/${name}Controller.js`);

	// Charger le modèle
	let model;
	if (fs.existsSync(modelPath)) {
		const customModel = await import(modelPath);
		model = customModel.default || customModel; // compat export default
		console.log(`Custom model loaded for ${name}`);
	} else {
		model = new BaseModel(name);
	}

	// Charger le contrôleur
	let controller;
	if (fs.existsSync(controllerPath)) {
		const customController = await import(controllerPath);
		controller = customController.default || customController;
		console.log(`Custom controller loaded for ${name}`);
	} else {
		controller = new BaseController(model);
	}

	// Initialiser les routes
	console.log(`Routes for ${name} initialized`);
	app.use(`/${name}`, crudRoutes(controller, middlewares));
});

// **Routes**
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/medias", mediaRoutes);
app.use("/upload", uploadRoutes);
app.use("/messages", messageRoutes);
app.use("/notifications", notificationRoutes);
app.use("/job_offers", jobOfferRoutes);
app.use("/recruiters", recruiterRoutes);
app.use("/applications", applicationRoutes);
app.use("/histories", historyRoutes);
app.use("/tags", tagRoutes);

app.use(errorHandler);

// **Gestion des connexions Socket.IO**
io.on("connection", (socket) => {
	console.log(`User connected: ${socket.id}`);

	socket.on("joinRoom", (userId) => {
		const room = `user_${userId}`;
		socket.join(room);
		console.log(`User ${userId} joined room: ${room}`);
	});

	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id}`);
	});
});

// **Point d'entrée par défaut**
app.get("/", (req, res) => {
	res.send("Server is running...");
});

// **Erreur 404**
app.use((req, res) => {
	console.log(`404 Not Found: ${req.originalUrl}`);
	res.status(404).json({ message: "Route not found" });
});

// **Démarrage du serveur**
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	listRoutes(app);
	console.log(`Server is running on http://localhost:${PORT}`);
});

function listRoutes(app) {
	const printRoutes = (stack, basePath = "") => {
		stack.forEach((middleware) => {
			if (middleware.route) {
				// Route simple
				const methods = Object.keys(middleware.route.methods)
					.map((m) => m.toUpperCase())
					.join(", ");
				console.log(`${methods} ${basePath}${middleware.route.path}`);
			} else if (middleware.name === "router" && middleware.handle.stack) {
				// Router monté
				const newBasePath =
					basePath +
					(middleware.regexp.source
						.replace("^\\", "") // nettoie regex
						.replace("\\/?(?=\\/|$)", "")
						.replace(/\\\//g, "/")
						.replace(/(\(\?:\(\?\=\/\|\$\)\))\?$/, "") || "");
				printRoutes(middleware.handle.stack, newBasePath);
			}
		});
	};

	printRoutes(app._router.stack);
}

export default app;
