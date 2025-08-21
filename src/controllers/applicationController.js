import BaseController from "./baseController.js";
import Application from "../models/applicationModel.js";
import User from "../models/userModel.js";

class ApplicationController extends BaseController {
	constructor() {
		super(Application);
	}
	async create(req, res) {
		const { jobOfferId, notes } = req.body;
		const userId = req.user.id; // Assurez-vous que req.user.id est défini par un middleware d'authentification

		if (!userId || !jobOfferId) {
			return res.status(400).json({ message: "User ID and Job Offer ID are required" });
		}

		try {
			// Vérifiez que l'utilisateur est bien un candidate
			const user = await User.getById(userId);
			if (!user || user.accountType !== "candidate") {
				return res.status(403).json({ message: "Only candidates can apply to job offers" });
			}

			const applicationId = await Application.create({
				candidateId: user.candidateId,
				jobOfferId,
				status: "sent",
				notes
			});
			return res
				.status(201)
				.json({ message: "Application submitted successfully", data: applicationId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	async getApplicationsByCandidate(req, res) {
		const candidateId = req.params.candidateId;

		try {
			const applications = await Application.getByCandidateId(candidateId);
			return res.status(200).json(applications);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	async getApplicationsByJobOffer(req, res) {
		const jobOfferId = req.params.jobOfferId;

		try {
			const applications = await Application.getByJobOfferId(jobOfferId);
			return res.status(200).json(applications);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	async updateApplicationStatus(req, res) {
		const jobOfferId = req.params.jobOfferId;
		const { status } = req.body;

		try {
			const applications = await Application.updateStatus(jobOfferId, status);
			return res
				.status(200)
				.json({ data: applications, message: "Application status updated successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
}

export default new ApplicationController();
