import authenticateToken from "../middlewares/authMiddleware.js";
import express from "express";
import HistoryController from "../controllers/historyController.js";
import { isAdmin } from "../middlewares/roles.js";

const router = express.Router();

router.get("/", authenticateToken, isAdmin, HistoryController.getAll);

// Log a new action
router.post("/log", authenticateToken, HistoryController.logAction);

// Get history for a specific user
router.get("/user/:userId", authenticateToken, HistoryController.getUserHistory);

export default router;
