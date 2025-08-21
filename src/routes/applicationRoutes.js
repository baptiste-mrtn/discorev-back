import express from "express";
import ApplicationController from "../controllers/applicationController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Postuler à une offre d'emploi
router.post("/apply", authenticateToken, ApplicationController.create);

// Récupérer les candidatures d'un candidat
router.get(
	"/candidate/:candidateId",
	authenticateToken,
	ApplicationController.getApplicationsByCandidate
);

// Récupérer les candidatures pour une offre d'emploi
router.get(
	"/job_offer/:jobOfferId",
	authenticateToken,
	ApplicationController.getApplicationsByJobOffer
);

// Mettre à jour le statut d'une candidature
router.patch(
	"/:applicationId/status",
	authenticateToken,
	ApplicationController.updateApplicationStatus
);

// Supprimer une candidature
router.delete("/:applicationId", authenticateToken, ApplicationController.delete);

export default router;
