import BaseController from "./baseController.js";
import Recruiter from "../models/recruiterModel.js";
import History from "../models/historyModel.js";
import deleteRecruiterFiles from "./documentController.js";

class RecruiterController extends BaseController {
	constructor() {
		super(Recruiter);
	}

	getByUserId = async (req, res) => {
		try {
			const recruiter = await this.model.getByUserId(req.params.id);
			if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });
			res.status(200).json({ data: recruiter, message: "Recruiter founded" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	getByCompanyName = async (req, res) => {
		try {
			const recruiter = await this.model.getByCompanyName(req.params.name);
			if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });
			res.status(200).json({ data: recruiter, message: "Recruiter founded" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	delete = async (req, res) => {
		try {
			const recruiter = await this.model.getByUserId(req.params.id);
			if (!recruiter) return res.status(404).json({ message: "Recruiter not found" });

			await deleteRecruiterFiles(req.params.id);

			await History.logAction({
				userId: req.params.id,
				relatedType: "document",
				actionType: "delete",
				details: `Recruiter ${req.params.id} files deleted`
			});

			await this.model.delete(req.params.id);

			await History.logAction({
				userId: req.params.id,
				relatedType: "profile",
				actionType: "delete",
				details: `Recruiter ${req.params.id} account deleted`
			});

			res.status(200).json({ message: "Recruiter account and files deleted successfully" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		}
	};
}

export default new RecruiterController();
