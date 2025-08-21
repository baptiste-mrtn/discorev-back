import dbHelpers from "../helpers/dbHelpers.js";

const JobOffer = {
	async createJobOffer(jobOfferData) {
		return await dbHelpers.dbInsert("job_offers", jobOfferData);
	},

	async getAllJobOffers() {
		const rows = await dbHelpers.dbSelect("job_offers", { status: { $ne: "draft" } });
		// dbHelpers ne gère pas les opérateurs, donc on filtre ici
		return rows.filter(row => row.status !== "draft");
	},

	async getJobOfferById(jobOfferId) {
		const rows = await dbHelpers.dbSelect("job_offers", { id: jobOfferId });
		return rows[0];
	},

	async getJobOffersWithFilters(filters) {
		let dbFilters = {};
		if (filters.recruiterId) dbFilters.recruiterId = filters.recruiterId;
		if (filters.title) dbFilters.title = filters.title;
		if (filters.requirements) dbFilters.requirements = filters.requirements;
		if (filters.salaryRange) {
			// dbHelpers ne gère pas BETWEEN, donc on filtre après
			// On récupère tout et on filtre en JS
			const rows = await dbHelpers.dbSelect("job_offers", dbFilters);
			return rows.filter(row =>
				row.salaryRange >= filters.salaryRange.min && row.salaryRange <= filters.salaryRange.max
			);
		}
		if (filters.employmentType) dbFilters.employmentType = filters.employmentType;
		if (filters.location) dbFilters.location = filters.location;
		if (filters.remote !== undefined) dbFilters.remote = filters.remote;

		let rows = await dbHelpers.dbSelect("job_offers", dbFilters);
		rows = rows.filter(row => row.status !== "draft");
		// Tri par publication_date DESC
		rows.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
		return rows;
	},

	async getJobOffersByRecruiterId(recruiterId){
		const rows = await dbHelpers.dbSelect("job_offers", { recruiterId });
		return rows;
	},

	async updateJobOffer(jobOfferId, updatedFields) {
		await dbHelpers.dbUpdate("job_offers", updatedFields, { id: jobOfferId });
	},

	async deleteJobOffer(jobOfferId) {
		await dbHelpers.dbDelete("job_offers", { id: jobOfferId });
	}
};

export default JobOffer;
