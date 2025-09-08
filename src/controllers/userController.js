import User from "../models/userModel.js";
import History from "../models/historyModel.js";
import deleteUserFiles from "./documentController.js";
import BaseController from "./baseController.js";

class UserController extends BaseController {
	constructor() {
		super(User);
	}


	getOneByEmail = async (req, res) => {
		const email = req.params.email;

		try {
			const user = await User.getByEmail(email);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			return res.status(200).json({ data: user, message: "User retrieved successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	// Delete a user
	delete = async (req, res) => {
		const userId = req.params.id;

		try {
			const user = await User.getById(userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			await deleteUserFiles(userId);

			await History.logAction({
				userId,
				relatedType: "document",
				actionType: "delete",
				details: `User ${userId} files deleted`
			});

			await User.deleteUser(userId);

			await History.logAction({
				userId,
				relatedType: "profile",
				actionType: "delete",
				details: `User ${userId} account deleted`
			});

			return res.status(200).json({ message: "User account and files deleted successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};
}

export default new UserController();
