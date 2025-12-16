import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import { isAdmin, isRecruiter } from "../middlewares/roles.js";
import jobOfferController from "../controllers/jobOfferController.js";

const router = express.Router();

// === Routes custom ===

// Liste des offres actives (status=active) avec filtres, tri, pagination.
// Option includeRecruiter=1 pour renvoyer aussi les infos recruteur.
router.get("/", jobOfferController.listActive);

router.get("/all", authenticateToken, isAdmin, jobOfferController.getAll);

// Détail d’une offre active (si inactive → 404 pour le public).
router.get("/:id", jobOfferController.getPublicOne);

// Auth (recruiter/admin)
// Toutes les offres du recruteur connecté (actives/inactives/brouillons) — dashboard.
router.get("/me", authenticateToken, isRecruiter, jobOfferController.listMine);

router.post("/", authenticateToken, isRecruiter, jobOfferController.create);

router.put("/:id", authenticateToken, jobOfferController.update);

// Update partiel (status, dates, etc.).
router.patch("/:id", authenticateToken, jobOfferController.patch);

// Changement de statut rapide (ex: draft → active / archived).
router.patch("/:id/status", authenticateToken, jobOfferController.changeStatus);

router.delete("/:id", authenticateToken, isRecruiter, jobOfferController.softDelete);

router.delete("/:id", authenticateToken, isAdmin, jobOfferController.delete);

export default router;
