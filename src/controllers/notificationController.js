import BaseController from "./baseController.js";
import Notification from "../models/notificationModel.js";

class NotificationController extends BaseController {
	constructor() {
		super(Notification);
	}

	getUserNotifications = async (req, res) => {
		const userId = req.params.userId;

		try {
			const notifications = await Notification.getByUserId(userId);
			return res.status(200).json(notifications);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	markAsRead = async (req, res) => {
		const notificationId = req.params.notificationId;

		try {
			await Notification.markNotificationAsRead(notificationId);
			return res.status(200).json({ message: "Notification marked as read" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	markAllAsRead = async (req, res) => {
		const userId = req.params.userId;

		try {
			await Notification.markAllNotificationsAsRead(userId);
			return res.status(200).json({ message: "All notifications marked as read" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	deleteAllNotifications = async (req, res) => {
		const userId = req.params.userId;

		try {
			await Notification.deleteAllNotifications(userId);
			return res.status(200).json({ message: "All notifications deleted successfully" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};
}

export default new NotificationController();
