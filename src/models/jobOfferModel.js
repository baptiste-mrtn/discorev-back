// models/jobOfferModel.js
import db from "../config/db.js";
import camelcaseKeys from "camelcase-keys";
import BaseModel from "./BaseModel.js";

class JobOffer extends BaseModel {
	constructor() {
		super("job_offers");
	}

	async listActiveWithRecruiter({
		page = 1,
		limit = 20,
		sort = "publication_date",
		dir = "DESC",
		filters = {}
	}) {
		const allowedSort = ["publication_date", "salary_min", "salary_max", "id"];
		const allowedDir = ["ASC", "DESC"];
		if (!allowedSort.includes(sort)) sort = "publication_date";
		if (!allowedDir.includes(dir)) dir = "DESC";

		const offset = (page - 1) * limit;

		const where = ["j.status = 'active'"];
		where.push("(status != 'archived' OR recruiter_id = ?)");

		const vals = [];

		if (filters.q) {
			where.push("(j.title LIKE ? OR j.description LIKE ?)");
			vals.push(`%${filters.q}%`, `%${filters.q}%`);
		}
		if (filters.location) {
			where.push("j.location = ?");
			vals.push(filters.location);
		}
		if (filters.sector) {
			where.push("j.sector = ?");
			vals.push(filters.sector);
		}
		if (filters.type) {
			where.push("j.employment_type = ?");
			vals.push(filters.type);
		}
		if (filters.remote !== undefined) {
			where.push("j.remote = ?");
			vals.push(!!Number(filters.remote));
		}

		const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

		const sql = `
      SELECT
        j.*,
        JSON_OBJECT(
          'id', r.id,
          'companyName', r.company_name,
          'companyLogo', r.company_logo,
          'location', r.location,
          'sector', r.sector,
          'website', r.website
        ) AS recruiter
      FROM job_offers j
      LEFT JOIN recruiters r ON r.id = j.recruiter_id
      ${whereSql}
      ORDER BY ${sort} ${dir}
      LIMIT ? OFFSET ?
    `;

		const [rows] = await db.execute(sql, [...vals, Number(limit), Number(offset)]);
		const parsed = rows.map((r) => {
			const { recruiter, ...rest } = r;
			return { ...camelcaseKeys(rest), recruiter: recruiter ? JSON.parse(recruiter) : null };
		});
		return parsed;
	}

	async getVisibleOffers(user) {
		let query = `SELECT * FROM job_offers`;
		let params = [];

		if (!user) {
			// Utilisateur non connecté → seulement les offres actives
			query += ` WHERE status = ?`;
			params.push("active");
		} else if (user.accountType === "admin") {
			// Admin → toutes les offres
		} else if (user.accountType === "recruiter") {
			// Recruteur → toutes sauf "archived"
			query += ` WHERE status != ?`;
			params.push("archived");
		} else {
			// Candidat ou autre → seulement actives
			query += ` WHERE status = ?`;
			params.push("active");
		}

		query += ` ORDER BY created_at DESC`;

		const rows = await db.query(query, params);
		return rows[0];
	}

	async getVisibleOfferById(id, user) {
		let query = `SELECT * FROM job_offers WHERE id = ?`;
		let params = [id];

		if (!user) {
			query += ` AND status = ?`;
			params.push("active");
		} else if (user.accountType === "recruiter") {
			query += ` AND status != ?`;
			params.push("archived");
		}
		// Admin → pas de filtre supplémentaire

		const row = await db.query(query, params);
		return row[0] || null;
	}
}

export default new JobOffer();
