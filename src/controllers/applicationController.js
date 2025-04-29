import Application from "../models/applicationModel.js";
import User from "../models/userModel.js";
import conversion from "../utils/conversion.js";

const ApplicationController = {
	async applyToJob(req, res) {
		const { jobOfferId, notes } = req.body;
		const userId = req.user.id; // Assurez-vous que req.user.id est défini par un middleware d'authentification

		if (!userId || !jobOfferId) {
			return res.status(400).json({ message: "User ID and Job Offer ID are required" });
		}

		try {
			// Vérifiez que l'utilisateur est bien un candidate
			const user = await User.getUserById(userId);
			const userCamel = await conversion.snakeToCamel(user);
			if (!user || userCamel.accountType !== "candidate") {
				return res.status(403).json({ message: "Only candidates can apply to job offers" });
			}

			const applicationId = await Application.createApplication({
				candidateId: userCamel.candidateId,
				jobOfferId,
				status: "sent",
				notes
			});
			return res
				.status(201)
				.json({ message: "Application submitted successfully", applicationId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getApplicationsByCandidate(req, res) {
		const candidateId = req.params.candidateId;

		try {
			const applications = await Application.getApplicationsByCandidateId(candidateId);
			return res.status(200).json(applications);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getApplicationsByJobOffer(req, res) {
		const jobOfferId = req.params.jobOfferId;

		try {
			const applications = await Application.getApplicationsByJobOfferId(jobOfferId);
			return res.status(200).json(applications);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
};

export default ApplicationController;
