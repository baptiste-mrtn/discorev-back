import express from "express";
import RecruiterController from "../controllers/recruiterController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
// Routes utilisateurs
router.get("/", RecruiterController.getAllRecruiters);
router.get("/:id", RecruiterController.getRecruiterById);
router.put("/:id", authenticateToken, RecruiterController.updateRecruiter);
router.delete("/:id", authenticateToken, RecruiterController.deleteRecruiter);
router.get("/company/:name", RecruiterController.getRecruiterByCompanyName);

export default router;
