import express from "express";
import MediaController from "../controllers/mediaController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:id", MediaController.getMediaById);
router.delete("/:id", authenticateToken, MediaController.deleteMedia);

export default router;
