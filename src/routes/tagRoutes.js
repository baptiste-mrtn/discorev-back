import express from "express";
import TagController from "../controllers/tagController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", TagController.getApprovedOnly); // tous les tags par catégorie
router.get("/recruiter/:recruiterId", TagController.getByRecruiterId); // tags d’un recruteur
router.post("/recruiter/:recruiterId", authenticateToken, TagController.setRecruiterTags); // ✅ ici

// Admin
router.get("/admin", TagController.getAllForAdmin);
router.patch("/:id/approve", TagController.approveTag);

export default router;
