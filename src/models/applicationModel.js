import dbHelpers from "../helpers/dbHelpers.js";

const Application = {
	async createApplication({ candidateId, jobOfferId, notes }) {
		return await dbHelpers.dbInsert("applications", {
			candidateId,
			jobOfferId,
			notes: notes || null
		});
	},

	async getApplicationsByCandidateId(candidateId) {
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
	},

	async getApplicationsByJobOfferId(jobOfferId) {
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
	},

	async updateApplicationStatus(applicationId, status) {
		await dbHelpers.dbUpdate("applications", { status }, { id: applicationId });
	},

	async deleteApplication(applicationId) {
		await dbHelpers.dbDelete("applications", { id: applicationId });
	}
};

export default Application;
