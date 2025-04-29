import JobOffer from "../models/jobOfferModel.js";
import Application from "../models/applicationModel.js";
import History from "../models/historyModel.js";
import User from "../models/userModel.js";
import Recruiter from "../models/recruiterModel.js";

const JobOfferController = {
	async createJobOffer(req, res) {
		const {
			recruiterId,
			title,
			description,
			requirements,
			salaryRange,
			employmentType,
			location,
			remote,
			expirationDate,
			status
		} = req.body;

		if (!recruiterId || !title || !employmentType) {
			return res.status(400).json({ message: "Required fields are missing" });
		}

		if (expirationDate && new Date(expirationDate) < new Date()) {
			return res.status(400).json({ message: "Expiration date must be in the future" });
		}

		try {
			const jobOfferData = {
				recruiterId,
				title,
				description,
				requirements,
				salaryRange,
				employmentType,
				location,
				remote: !!remote,
				status
			};

			if (expirationDate && expirationDate.trim() !== "") {
				jobOfferData.expirationDate = expirationDate;
			}

			const jobOfferId = await JobOffer.createJobOffer(jobOfferData);

			const recruiter = await Recruiter.getRecruiterById(recruiterId);
			const userId = recruiter.userId;

			await History.logAction({
				userId,
				relatedId: jobOfferId,
				relatedType: "job_offer",
				actionType: "create",
				details: "Job offer created by recruiter " + recruiterId + " with ID " + jobOfferId
			});

			return res.status(201).json({ message: "Job offer created successfully", jobOfferId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getAllJobOffers(req, res) {
		try {
			const jobOffers = await JobOffer.getAllJobOffers();

			const enrichedOffers = await Promise.all(
				jobOffers.map(async (offer) => {
					const company = await Recruiter.getRecruiterById(offer["recruiter_id"]);
					return {
						...offer,
						company
					};
				})
			);

			return res.status(200).json({
				data: enrichedOffers,
				message: "Job offers retrieved successfully"
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getJobOffersWithFilters(req, res) {
		const filters = req.query;

		try {
			const jobOffers = await JobOffer.getJobOffersWithFilters(filters);
			return res.status(200).json({ data: jobOffers });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getJobOffersByRecruiterId(req, res) {
		const recruiterId = req.params.recruiterId;

		try {
			const jobOffers = await JobOffer.getJobOffersByRecruiterId(recruiterId);
			return res
				.status(200)
				.json({ data: jobOffers, message: "Job offers retrieved successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getJobOfferDetails(req, res) {
		const jobOfferId = req.params.jobOfferId;

		try {
			const jobOffer = await JobOffer.getJobOfferById(jobOfferId);
			return jobOffer
				? res.status(200).json(jobOffer)
				: res.status(404).json({ message: "Job offer not found" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async updateJobOffer(req, res) {
		const jobOfferId = req.params.jobOfferId;
		const updates = req.body;

		try {
			await JobOffer.updateJobOffer(jobOfferId, updates);

			await History.logAction({
				userId,
				relatedType: "job_offer",
				actionType: "updated",
				details: "Job offer with ID " + jobOfferId + " updated"
			});

			return res.status(200).json({ message: "Job offer updated successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async deleteJobOffer(req, res) {
		const jobOfferId = req.params.jobOfferId;

		try {
			await JobOffer.deleteJobOffer(jobOfferId);

			await History.logAction({
				userId,
				relatedType: "job_offer",
				actionType: "delete",
				details: "Job offer with ID " + jobOfferId + " deleted"
			});

			return res.status(200).json({ message: "Job offer deleted successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
};

export default JobOfferController;
