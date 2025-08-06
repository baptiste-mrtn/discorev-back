// routes/uploadRoutes.js
import express from "express";
import { uploadHandler } from "../controllers/uploadController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { configurationStorage } from "../middlewares/storageMiddleware.js";

const multer = configurationStorage();
const router = express.Router();

router.post("/document", authenticateToken, multer.single("file"), (req, res) =>
	uploadHandler(req, res, "document")
);

router.post("/media", authenticateToken, multer.single("file"), (req, res) =>
	uploadHandler(req, res, "media")
);

export default router;
