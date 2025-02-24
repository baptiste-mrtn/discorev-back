import db from "../config/db.js";
import conversion from "../utils/conversion.js";

const Candidate = {
	async getAllCandidates() {
		const [rows] = await db.execute("SELECT * FROM candidates");
		return rows;
	},

	async createCandidate(candidateData) {
		const candidateDataSnakeCase = await conversion.camelToSnake(candidateData);

		const columns = Object.keys(candidateDataSnakeCase).join(", ");
		const placeholders = Object.keys(candidateDataSnakeCase)
			.map(() => "?")
			.join(", ");
		const values = Object.values(candidateDataSnakeCase);

		const [result] = await db.execute(
			`INSERT INTO candidates (${columns}) VALUES (${placeholders})`,
			values
		);
		return result.insertId;
	},

	async getCandidateByUserId(userId) {
		const [rows] = await db.execute("SELECT * FROM candidates WHERE user_id = ?", [userId]);
		return rows[0];
	},

	async updateCandidate(candidateId, updates) {
		updates = await conversion.camelToSnake(updates);
		const fields = Object.keys(updates)
			.map((field) => `${field} = ?`)
			.join(", ");
		const values = Object.values(updates);
		values.push(candidateId);

		await db.execute(`UPDATE candidates SET ${fields} WHERE id = ?`, values);
	},

	async deleteCandidate(candidateId) {
		await db.execute("DELETE FROM candidates WHERE id = ?", [candidateId]);
	}
};

export default Candidate;
