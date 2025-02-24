import db from "../config/db.js";

const Application = {
	async createApplication({ candidateId, jobOfferId, notes }) {
		const [result] = await db.execute(
			`INSERT INTO applications 
            (candidate_id, job_offer_id, notes) 
            VALUES (?, ?, ?)`,
			[candidateId, jobOfferId, notes || null]
		);
		return result.insertId;
	},

	async getApplicationsByCandidateId(candidateId) {
		const [rows] = await db.execute(
			`SELECT a.*, j.title AS job_title, j.location, j.employment_type 
            FROM applications a 
            JOIN job_offers j ON a.job_offer_id = j.id 
            WHERE a.candidate_id = ? 
            ORDER BY a.date_applied DESC`,
			[candidateId]
		);
		return rows;
	},

	async getApplicationsByJobOfferId(jobOfferId) {
		const [rows] = await db.execute(
			`SELECT a.*, c.*, u.first_name, u.last_name, u.email 
            FROM applications a 
            JOIN candidates c ON a.candidate_id = c.id 
            JOIN users u ON c.user_id = u.id
            WHERE a.job_offer_id = ?`,
			[jobOfferId]
		);
		return rows;
	},

	async updateApplicationStatus(applicationId, status) {
		await db.execute(
			`UPDATE applications 
            SET status = ? 
            WHERE id = ?`,
			[status, applicationId]
		);
	},

	async deleteApplication(applicationId) {
		await db.execute("DELETE FROM applications WHERE id = ?", [applicationId]);
	}
};

export default Application;
