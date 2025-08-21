import Recruiter from "../models/recruiterModel.js";
import History from "../models/historyModel.js";
import deleteRecruiterFiles from "./documentController.js";

const RecruiterController = {
	// Get all recruiters
	async getAllRecruiters(req, res) {
		try {
			const recruiters = await Recruiter.getAllRecruiters();
			return res.status(200).json({ data: recruiters, message: "Recruiters founded" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	// Get recruiter by ID
	async getRecruiterById(req, res) {
		const recruiterId = req.params.id;

		try {
			const recruiter = await Recruiter.getRecruiterById(recruiterId);
			if (!recruiter) {
				return res.status(404).json({ message: "Recruiter not found" });
			}

			return res.status(200).json({ data: recruiter, message: "Recruiter founded" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	// Get recruiter by ID
	async getRecruiterByUserId(req, res) {
		const userId = req.params.id;

		try {
			const recruiter = await Recruiter.getRecruiterByUserId(userId);
			if (!recruiter) {
				return res.status(404).json({ message: "Recruiter not found" });
			}

			return res.status(200).json({ data: recruiter, message: "Recruiter founded" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	// Get recruiter by company name
	async getRecruiterByCompanyName(req, res) {
		const companyName = req.params.name;

		try {
			const recruiter = await Recruiter.getRecruiterByCompanyName(companyName);
			if (!recruiter) {
				return res.status(404).json({ message: "Recruiter not found" });
			}

			return res.status(200).json({ data: recruiter, message: "Recruiter founded" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	// Update recruiter profile
	async updateRecruiter(req, res) {
		const userId = req.params.id;
		const updates = req.body;

		try {
			const recruiter = await Recruiter.getRecruiterById(userId);
			if (!recruiter) {
				return res.status(404).json({ message: "Recruiter not found" });
			}

			console.log(updates);

			await Recruiter.updateRecruiter(userId, updates);

			// Log the update action
			await History.logAction({
				userId,
				relatedType: "profile",
				actionType: "update",
				details: "Recruiter profile updated"
			});

			return res.status(200).json({ message: "Recruiter updated successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	// Delete a recruiter
	async deleteRecruiter(req, res) {
		const userId = req.params.id;

		try {
			const recruiter = await Recruiter.getRecruiterById(userId);
			if (!recruiter) {
				return res.status(404).json({ message: "Recruiter not found" });
			}

			await deleteRecruiterFiles(userId);

			await History.logAction({
				userId,
				relatedType: "document",
				actionType: "delete",
				details: `Recruiter ${userId} files deleted`
			});

			await Recruiter.deleteRecruiter(userId);

			await History.logAction({
				userId,
				relatedType: "profile",
				actionType: "delete",
				details: `Recruiter ${userId} account deleted`
			});

			return res
				.status(200)
				.json({ message: "Recruiter account and files deleted successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
};

export default RecruiterController;
