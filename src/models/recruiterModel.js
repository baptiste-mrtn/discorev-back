import db from "../config/db.js";
import conversion from "../utils/conversion.js";

const Recruiter = {
	async getAllRecruiters() {
		const [rows] = await db.execute("SELECT * FROM recruiters");
		return rows;
	},

	async createRecruiter(recruiterData) {
		const recruiterDataSnakeCase = await conversion.camelToSnake(recruiterData);

		const columns = Object.keys(recruiterDataSnakeCase).join(", ");
		const placeholders = Object.keys(recruiterDataSnakeCase)
			.map(() => "?")
			.join(", ");
		const values = Object.values(recruiterDataSnakeCase);

		const [result] = await db.execute(
			`INSERT INTO recruiters (${columns}) VALUES (${placeholders})`,
			values
		);
		return result.insertId;
	},

	async getRecruiterByUserId(userId) {
		const [rows] = await db.execute("SELECT * FROM recruiters WHERE user_id = ?", [userId]);
		return conversion.snakeToCamel(rows[0]);
	},

	async getRecruiterById(recruiterId) {
		const [rows] = await db.execute("SELECT * FROM recruiters WHERE id = ?", [recruiterId]);
		return conversion.snakeToCamel(rows[0]);
	},

	async updateRecruiter(recruiterId, updates) {
		updates = await conversion.camelToSnake(updates);
		const fields = Object.keys(updates)
			.map((field) => `${field} = ?`)
			.join(", ");
		const values = Object.values(updates);
		values.push(recruiterId);

		await db.execute(`UPDATE recruiters SET ${fields} WHERE id = ?`, values);
	},

	async deleteRecruiter(recruiterId) {
		await db.execute("DELETE FROM recruiters WHERE id = ?", [recruiterId]);
	}
};

export default Recruiter;
