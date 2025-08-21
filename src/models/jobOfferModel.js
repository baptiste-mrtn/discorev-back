import BaseModel from "./BaseModel.js";

class JobOffer extends BaseModel {
	constructor() {
		super("job_offers");
	}

	// Exemple : paginated + active + filtre
	async getPaginatedActive(filters = {}, page = 1, limit = 10) {
		return this.getAll(filters, {
			page,
			limit,
			activeOnly: true,
			orderBy: "created_at",
			orderDir: "DESC"
		});
	}
}

export default new JobOffer();
