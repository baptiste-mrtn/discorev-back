import dbHelpers from "../helpers/dbHelpers.js";
import BaseModel from "./BaseModel.js";

class History extends BaseModel {
	constructor() {
		super("histories");
	}
	logLogin = async (userId) => {
		return await dbHelpers.dbInsert("histories", {
			userId,
			relatedType: "auth",
			actionType: "login"
		});
	};

	logAction = async ({ userId, relatedId = null, relatedType, actionType, details = null }) => {
		return await dbHelpers.dbInsert("histories", {
			userId,
			relatedId,
			relatedType,
			actionType,
			details
		});
	};

	getUserHistory = async (userId) => {
		const rows = await dbHelpers.dbSelect("histories", { userId });
		// Tri côté JS si nécessaire
		return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	};

	getAllHistory = async () => {
		const rows = await dbHelpers.dbSelect("histories");
		return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	};
}

export default new History();
