import db from "../config/db.js";
import conversion from "../utils/conversion.js";

const JobOffer = {
	async createJobOffer(jobOfferData) {
		// Convertir les clés camelCase en snake_case
		const jobOfferDataSnakeCase = await conversion.camelToSnake({
			...jobOfferData
		});

		const columns = Object.keys(jobOfferDataSnakeCase).join(", ");
		const placeholders = Object.keys(jobOfferDataSnakeCase)
			.map(() => "?")
			.join(", ");
		const values = Object.values(jobOfferDataSnakeCase);
		console.log(values);
		const [result] = await db.execute(
			`INSERT INTO job_offers (${columns}) VALUES (${placeholders})`,
			values
		);
		return result.insertId;
	},

	async getAllJobOffers() {
		const [rows] = await db.execute("SELECT * FROM job_offers WHERE status != 'draft'");
		return rows;
	},

	async getJobOfferById(jobOfferId) {
		const [rows] = await db.execute("SELECT * FROM job_offers WHERE id = ?", [jobOfferId]);
		return rows[0];
	},

	async getJobOffersWithFilters(filters) {
		let query = "SELECT * FROM job_offers WHERE status != 'draft'";
		const values = [];

		if (filters.recruiterId) {
			query += " AND recruiter_id = ?";
			values.push(filters.recruiterId);
		}
		if (filters.title) {
			query += " AND title LIKE ?";
			values.push(filters.title);
		}
		if (filters.requirements) {
			query += " AND requirements LIKE ?";
			values.push(`%${filters.requirements}%`);
		}
		if (filters.salaryRange) {
			query += " AND salary_range BETWEEN ? AND ?";
			values.push(filters.salaryRange.min, filters.salaryRange.max);
		}
		if (filters.employmentType) {
			query += " AND employment_type = ?";
			values.push(filters.employmentType);
		}
		if (filters.location) {
			query += " AND location = ?";
			values.push(filters.location);
		}
		if (filters.remote !== undefined) {
			query += " AND remote = ?";
			values.push(filters.remote);
		}

		query += " ORDER BY publication_date DESC";

		const [rows] = await db.execute(query, values);
		return rows;
	},

	async updateJobOffer(jobOfferId, updatedFields) {
		updatedFields = await conversion.camelToSnake(updatedFields);
		const fields = Object.keys(updatedFields)
			.map((field) => `${field} = ?`)
			.join(", ");
		const values = Object.values(updatedFields);

		await db.execute(`UPDATE job_offers SET ${fields} WHERE id = ?`, [...values, jobOfferId]);
	},

	async deleteJobOffer(jobOfferId) {
		await db.execute("DELETE FROM job_offers WHERE id = ?", [jobOfferId]);
	}
};

export default JobOffer;
