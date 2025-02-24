import express from "express";
import JobOfferController from "../controllers/jobOfferController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

//Routes /job_offers

//Création d'une offre d'emploi
router.post("/", authenticateToken, JobOfferController.createJobOffer);

//Récupération de toute les offres d'emploi
router.get("/", JobOfferController.getAllJobOffers);

//Récupération des offres d'emploi avec filtres
router.get("/filters", JobOfferController.getJobOffersWithFilters);

//Récupération des offres d'emploi d'un recruteur
router.get("/recruiter/:recruiterId", JobOfferController.getJobOffersByRecruiterId);

//Récupération des détails d'une offre d'emploi
router.get("/:jobOfferId", authenticateToken, JobOfferController.getJobOfferDetails);

//Suppression d'une offre d'emploi
router.delete("/:jobOfferId", authenticateToken, JobOfferController.deleteJobOffer);

export default router;
