import BaseModel from "./BaseModel.js";

class Application extends BaseModel {
	constructor() {
		super("applications"); // table
	}

	async getByCandidateId(candidateId) {
		// Requête complexe, on garde le SQL direct
		const [rows] = await db.execute(
			`SELECT a.*, j.title AS job_title, j.location, j.employment_type 
			FROM applications a 
			JOIN job_offers j ON a.job_offer_id = j.id 
			WHERE a.candidate_id = ? 
			ORDER BY a.date_applied DESC`,
			[candidateId]
		);
		return rows;
	}

	async getByJobOfferId(jobOfferId) {
		// Requête complexe, on garde le SQL direct
		const [rows] = await db.execute(
			`SELECT a.*, c.*, u.first_name, u.last_name, u.email 
			FROM applications a 
			JOIN candidates c ON a.candidate_id = c.id 
			JOIN users u ON c.user_id = u.id
			WHERE a.job_offer_id = ?`,
			[jobOfferId]
		);
		return rows;
	}

	async updateStatus(applicationId, status) {
		await this.update("applications", { status }, { id: applicationId });
	}
}

export default new Application();
