import BaseModel from "./baseModel.js";
import dbHelpers from "../helpers/dbHelpers.js";
class Notification extends BaseModel {
	constructor() {
		super("notifications"); // table
	}

	async getByUserId(userId) {
		const rows = await dbHelpers.dbSelect("notifications", { userId });
		// Tri côté JS si besoin
		return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}

	async markNotificationAsRead(notificationId) {
		await dbHelpers.dbUpdate("notifications", { isRead: true }, { id: notificationId });
	}

	async markAllNotificationsAsRead(userId) {
		// dbHelpers ne gère pas les conditions complexes, on récupère puis on met à jour
		const rows = await dbHelpers.dbSelect("notifications", { userId, isRead: false });
		for (const notif of rows) {
			await dbHelpers.dbUpdate("notifications", { isRead: true }, { id: notif.id });
		}
	}

	async deleteAllNotifications(userId) {
		await dbHelpers.dbDelete("notifications", { userId });
	}
}

export default new Notification();
