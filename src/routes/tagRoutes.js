import express from "express";
import TagController from "../controllers/tagController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import { isAdmin, isRecruiter } from "../middlewares/roles.js";

const router = express.Router();

router.get("/", TagController.getApprovedOnly); // tous les tags par catégorie
router.get("/recruiter/:recruiterId", TagController.getByRecruiterId); // tags d’un recruteur
router.post(
	"/recruiter/:recruiterId",
	authenticateToken,
	isRecruiter,
	TagController.setRecruiterTags
); // ✅ ici

// Admin
router.get("/admin", authenticateToken, isAdmin, TagController.getAllForAdmin);
router.patch("/:id/approve", authenticateToken, isAdmin, TagController.approveTag);

export default router;
