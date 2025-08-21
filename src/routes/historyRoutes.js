import authenticateToken from "../middlewares/authMiddleware.js";
import express from "express";
import HistoryController from "../controllers/HistoryController.js";

const router = express.Router();

// Log a new action
router.post("/log", authenticateToken, HistoryController.logAction);

// Get history for a specific user
router.get("/user/:userId", authenticateToken, HistoryController.getUserHistory);

export default router;
