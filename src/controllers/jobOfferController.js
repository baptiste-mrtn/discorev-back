// controllers/jobOfferController.js
import BaseController from "./baseController.js";
import JobOffer from "../models/jobOfferModel.js";
import Recruiter from "../models/recruiterModel.js";

class JobOfferController extends BaseController {
	constructor() {
		super(JobOffer);
	}

	// GET /job_offers (public, active only)
	listActive = async (req, res, next) => {
		try {
			const {
				page = 1,
				limit = 20,
				sort = "publication_date",
				dir = "DESC",
				includeRecruiter,
				...rawFilters
			} = req.query;

			if (includeRecruiter === "1") {
				const data = await this.model.listActiveWithRecruiter({
					page: Number(page),
					limit: Number(limit),
					sort,
					dir,
					filters: rawFilters
				});
				return res.status(200).json({ message: "Active job offers", data });
			}

			// fallback sans JOIN
			const data = await this.model.getAll(
				{},
				{
					page: Number(page),
					limit: Number(limit),
					orderBy: sort,
					orderDir: dir,
					activeOnly: true
				}
			);
			return res.status(200).json({ message: "Active job offers", data });
		} catch (e) {
			next(e);
		}
	};

	// GET /recruiters/:recruiterId/job_offers (public, active by recruiter)
	listActiveByRecruiter = async (req, res, next) => {
		try {
			const {
				page = 1,
				limit = 20,
				sort = "publication_date",
				dir = "DESC",
				activeOnly
			} = req.query;

			const data = await this.model.getAll(
				{ recruiterId: req.params.id },
				{
					page: Number(page),
					limit: Number(limit),
					orderBy: sort,
					orderDir: dir,
					activeOnly: activeOnly === "false" ? false : true
				}
			);
			res.status(200).json({ message: "Job offers by recruiter", data });
		} catch (e) {
			next(e);
		}
	};

	getPublicOne = async (req, res, next) => {
		try {
			const offer = await this.model.getById(req.params.id);
			if (!offer) {
				return res.status(404).json({ message: "Not found" });
			}

			// Si l'offre est active → accessible à tous
			if (offer.status === "active") {
				return res.status(200).json({ message: "Retrieved successfully", data: offer });
			}

			const user = req.user; // injecté par optionalAuth
			if (!user) return res.status(403).json({ message: "Forbidden" });

			// Si l'offre est inactive → accessible seulement au propriétaire ou admin
			const recruiter = await Recruiter.getByUserId(user.id);

			if (user && (user.accountType === "admin" || recruiter.id === offer.recruiterId)) {
				return res.status(200).json({ message: "Retrieved successfully", data: offer });
			}

			// Sinon → interdit
			return res.status(403).json({ message: "Forbidden" });
		} catch (e) {
			next(e);
		}
	};

	// GET /me/job_offers (auth recruiter)
	listMine = async (req, res, next) => {
		try {
			const user = req.user || null; // Si pas connecté → null
			const offers = await this.model.getVisibleOffers(user);

			return res.status(200).json({
				message: "Job offers retrieved successfully",
				data: offers
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				status: "error",
				message: "Erreur lors de la récupération des offres"
			});
		}
	};

	// POST /job_offers
	create = async (req, res, next) => {
		try {
			const recruiter = await Recruiter.getByUserId(req.user.id);
			const payload = {
				...req.body,
				recruiterId: recruiter.id,
				status: req.body.status ?? "draft",
				publicationDate: req.body.status === "active" ? new Date() : null
			};
			const insertId = await this.model.create(payload);
			res.status(201).json({ message: "Created successfully", data: { id: insertId } });
		} catch (e) {
			next(e);
		}
	};

	// PUT /job_offers/:id
	update = async (req, res, next) => {
		try {
			const id = req.params.id;
			const body = {
				...req.body,
				publicationDate: req.body.status === "active" ? new Date() : null
			};
			await this.model.update(id, body);
			res.status(200).json({ message: "Updated successfully", data: { id } });
		} catch (e) {
			next(e);
		}
	};

	// PATCH /job_offers/:id (partial)
	patch = async (req, res, next) => {
		try {
			const id = req.params.id;
			await this.model.update(id, { ...req.body });
			res.status(200).json({ message: "Patched successfully", data: { id } });
		} catch (e) {
			next(e);
		}
	};

	// PATCH /job_offers/:id/status
	changeStatus = async (req, res, next) => {
		try {
			const id = req.params.id;
			const { status } = req.body; // draft | active | archived
			const payload = {
				status,
				publicationDate: status === "active" ? new Date() : null
			};
			await this.model.update(id, payload);
			res.status(200).json({ message: "Status updated", data: { id, status } });
		} catch (e) {
			next(e);
		}
	};

	// DELETE /job_offers/:id (soft delete)
	softDelete = async (req, res, next) => {
		try {
			const id = req.params.id;
			await this.model.update(id, { status: "archived", deletedAt: new Date() });
			res.status(200).json({ message: "Archived successfully", data: { id } });
		} catch (e) {
			next(e);
		}
	};
}

export default new JobOfferController();
