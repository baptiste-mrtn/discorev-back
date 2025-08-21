import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// Import des routes
import authRoutes from "./src/routes/authRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import mediaRoutes from "./src/routes/mediaRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import jobOfferRoutes from "./src/routes/jobOfferRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import recruiterRoutes from "./src/routes/recruiterRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import historyRoutes from "./src/routes/historyRoutes.js";
import sanitizeRequest from "./src/middlewares/sanitizerMiddleware.js";
import caseConverter from "./src/middlewares/caseConverter.js";

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(caseConverter);
app.use("/uploads", express.static(path.resolve("uploads")));

// **Routes**
app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
app.use("/medias", mediaRoutes);
app.use("/upload", uploadRoutes);
app.use("/messages", messageRoutes);
app.use("/notifications", notificationRoutes);
app.use("/job_offers", jobOfferRoutes);
app.use("/users", userRoutes);
app.use("/recruiters", recruiterRoutes);
app.use("/applications", applicationRoutes);
app.use("/histories", historyRoutes);

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
	res.status(404).json({ message: "Route not found" });
});

// **Démarrage du serveur**
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
