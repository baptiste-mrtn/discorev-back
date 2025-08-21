import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import JobOfferController from "../controllers/jobOfferController.js";

const router = express.Router();

// === CRUD générique hérité de BaseController ===
router.get("/:id", JobOfferController.getOne);
router.post("/", authenticateToken, JobOfferController.create);
router.put("/:id", authenticateToken, JobOfferController.update);
router.delete("/:id", authenticateToken, JobOfferController.delete);

// === Routes custom ===
router.get("/", JobOfferController.getAll); // toutes les offres actives enrichies
router.get("/paginated", JobOfferController.getPaginated); // pagination + filtres
router.get("/recruiter/:recruiterId", JobOfferController.getByRecruiter);
router.get("/filters", JobOfferController.getWithFilters);

export default router;
