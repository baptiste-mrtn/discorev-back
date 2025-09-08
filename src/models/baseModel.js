import db from "../config/db.js";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";

class BaseModel {
	constructor(table) {
		this.table = table;
	}

	/**
	 * Récupère toutes les lignes avec filtres, pagination et activeOnly
	 * @param {Object} filters - filtres à appliquer (ex: { recruiterId: 5 })
	 * @param {Object} options - options : page, limit, orderBy, orderDir, activeOnly
	 */
	async getAll(filters = {}, options = {}) {
		const {
			page = 1,
			limit = 100,
			orderBy = "id",
			orderDir = "ASC",
			activeOnly = false
		} = options;

		const offset = (page - 1) * limit;
		const finalFilters = { ...filters };

		// On force toujours le filtre status="active" si activeOnly=true
		if (activeOnly) {
			finalFilters.status = "active";
		}

		const snakeFilters = snakecaseKeys(finalFilters);
		const filterKeys = Object.keys(snakeFilters);

		const whereClause = filterKeys.length
			? " WHERE " + filterKeys.map((key) => `${key} = ?`).join(" AND ")
			: "";

		// Injecter LIMIT et OFFSET directement pour éviter l'erreur MySQL2
		const sql = `SELECT * FROM ${
			this.table
		}${whereClause} ORDER BY ${orderBy} ${orderDir} LIMIT ${parseInt(limit)} OFFSET ${parseInt(
			offset
		)}`;

		const values = Object.values(snakeFilters); // uniquement les filtres

		const [rows] = await db.execute(sql, values);
		return camelcaseKeys(rows);
	}

	// CRUD générique
	async getById(id) {
		const [rows] = await db.execute(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
		return rows.length ? camelcaseKeys(rows[0]) : null;
	}

	// CRUD générique
	async getByUserId(userid) {
		const [rows] = await db.execute(`SELECT * FROM ${this.table} WHERE user_id = ?`, [userid]);
		return rows.length ? camelcaseKeys(rows[0]) : null;
	}

	async getBy(column, value) {
		const filters = snakecaseKeys({ [column]: value });
		const key = Object.keys(filters)[0];
		const val = Object.values(filters)[0];
		const [rows] = await db.execute(`SELECT * FROM ${this.table} WHERE ${key} = ?`, [val]);
		return camelcaseKeys(rows); // un tableau
	}

	async create(data) {
		const snakeData = snakecaseKeys(data);
		const keys = Object.keys(snakeData).join(", ");
		const placeholders = Object.keys(snakeData)
			.map(() => "?")
			.join(", ");
		const values = Object.values(snakeData);

		const [result] = await db.execute(
			`INSERT INTO ${this.table} (${keys}) VALUES (${placeholders})`,
			values
		);
		return result.insertId;
	}

	async update(id, data) {
		const snakeData = snakecaseKeys(data);
		const setClause = Object.keys(snakeData)
			.map((key) => `${key} = ?`)
			.join(", ");
		const values = [...Object.values(snakeData), id];

		await db.execute(`UPDATE ${this.table} SET ${setClause} WHERE id = ?`, values);
	}

	async delete(id) {
		await db.execute(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
	}
}

export default BaseModel;
