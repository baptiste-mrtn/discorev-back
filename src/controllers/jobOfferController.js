import BaseController from "./baseController.js";
import JobOffer from "../models/jobOfferModel.js";
import Recruiter from "../models/recruiterModel.js";

class JobOfferController extends BaseController {
	constructor() {
		super(JobOffer); // CRUD générique
	}

	// === Récupérer toutes les offres actives enrichies avec recruteur ===
	getAll = async (req, res) => {
		try {
			const offers = await this.model.getAll(
				{}, // pas de filtre spécifique
				{ activeOnly: true, orderBy: "publication_date", orderDir: "DESC" }
			);

			const enriched = await Promise.all(
				offers.map(async (offer) => {
					const recruiter = await Recruiter.getBy(offer.recruiterId);
					return { ...offer, recruiter };
				})
			);

			res.status(200).json({ message: "Active job offers", data: enriched });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// === Pagination avec filtres et enrichissement ===
	getPaginated = async (req, res) => {
		try {
			const page = parseInt(req.query.page) || 1;
			const limit = parseInt(req.query.limit) || 10;
			const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

			const offers = await this.model.getAll(filters, {
				activeOnly: true,
				page,
				limit,
				orderBy: "created_at",
				orderDir: "DESC"
			});

			const enriched = await Promise.all(
				offers.map(async (offer) => {
					const recruiter = await Recruiter.getById(offer.recruiterId);
					return { ...offer, recruiter };
				})
			);

			res.status(200).json({ page, limit, data: enriched, message: "Paginated job offers" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// === Offres par recruteur ===
	getByRecruiter = async (req, res) => {
		try {
			const recruiterId = req.params.recruiterId;
			const offers = await this.model.getAll({ recruiterId }, { activeOnly: true });
			res.status(200).json({ message: "Job offers by recruiter", data: offers });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	// === Filtres simples ===
	getWithFilters = async (req, res) => {
		try {
			const filters = req.query || {};
			const offers = await this.model.getAll(filters, { activeOnly: true });
			res.status(200).json({ message: "Filtered job offers", data: offers });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		}
	};
}

export default new JobOfferController();
