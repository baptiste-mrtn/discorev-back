import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import { loadResource, checkOwnerOrRole } from "../middlewares/permissions.js";
import { isRecruiter } from "../middlewares/roles.js";
import jobOfferController from "../controllers/jobOfferController.js";
import JobOffer from "../models/jobOfferModel.js";

const router = express.Router();

// === Routes custom ===

// Liste des offres actives (status=active) avec filtres, tri, pagination.
// Option includeRecruiter=1 pour renvoyer aussi les infos recruteur.
router.get("/", jobOfferController.listActive);

// Détail d’une offre active (si inactive → 404 pour le public).
router.get("/:id", jobOfferController.getPublicOne);

// Auth (recruiter/admin)
// Toutes les offres du recruteur connecté (actives/inactives/brouillons) — dashboard.
router.get(
	"/me",
	authenticateToken,
	isRecruiter,
	loadResource(JobOffer),
	checkOwnerOrRole(JobOffer, { adminLevels: ["admin", "super-admin"] }),
	jobOfferController.listMine
);

router.post(
	"/",
	authenticateToken,
	isRecruiter,
	jobOfferController.create
);

router.put(
	"/:id",
	authenticateToken,
	loadResource(JobOffer),
	checkOwnerOrRole(JobOffer, { adminLevels: ["admin", "super-admin"] }),
	jobOfferController.update
);

// Update partiel (status, dates, etc.).
router.patch(
	"/:id",
	authenticateToken,
	loadResource(JobOffer),
	checkOwnerOrRole(JobOffer, { adminLevels: ["admin", "super-admin"] }),
	jobOfferController.patch
);

// Changement de statut rapide (ex: draft → active / archived).
router.patch(
	"/:id/status",
	authenticateToken,
	loadResource(JobOffer),
	checkOwnerOrRole(JobOffer, { adminLevels: ["admin", "super-admin"] }),
	jobOfferController.changeStatus
);

router.delete(
	"/:id",
	authenticateToken,
	loadResource(JobOffer),
	checkOwnerOrRole(JobOffer, { adminLevels: ["admin", "super-admin"] }),
	jobOfferController.softDelete
);

export default router;
