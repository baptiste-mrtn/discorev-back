import db from "../config/db.js";
import conversion from "../utils/conversion.js";

const History = {
	async logAction(historyData) {
		const historyDataSnakeCase = await conversion.camelToSnake({
			...historyData
		});
		const columns = Object.keys(historyDataSnakeCase).join(", ");
		const placeholders = Object.keys(historyDataSnakeCase)
			.map(() => "?")
			.join(", ");
		const values = Object.values(historyDataSnakeCase);
		console.log(values);

		const [result] = await db.execute(
			`INSERT INTO histories (${columns}) VALUES (${placeholders})`,
			values
		);
		return result.insertId;
	},

	async getUserHistory(userId) {
		const [rows] = await db.execute(
			`SELECT * FROM histories WHERE user_id = ? ORDER BY created_at DESC`,
			[userId]
		);
		return rows;
	},

	async getAllHistory() {
		const [rows] = await db.execute(`SELECT * FROM histories ORDER BY created_at DESC`);
		return rows;
	},

	async deleteHistoryById(historyId) {
		await db.execute(`DELETE FROM histories WHERE id = ?`, [historyId]);
	}
};

export default History;
