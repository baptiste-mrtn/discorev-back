import History from "../models/historyModel.js";
import BaseController from "./baseController.js";
class HistoryController extends BaseController {
	constructor() {
		super(History);
	}
	logAction = async (req, res) => {
		const { userId, relatedId, relatedType, actionType, details } = req.body;

		if (!userId || !relatedType || !actionType) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		try {
			const historyId = await History.logAction({
				userId,
				relatedId,
				relatedType,
				actionType,
				details
			});
			return res.status(201).json({ message: "Action logged successfully", historyId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	async getUserHistory(req, res) {
		const userId = req.params.userId;

		try {
			const history = await History.getUserHistory(userId);
			return res.status(200).json(history);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
}

export default new HistoryController();
