import snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";
import db from "../config/db.js";

const ALLOWED_TABLES = [
	"users",
	"job_offers",
	"recruiters",
	"candidates",
	"admins",
	"histories",
	"applications",
	"conversations",
	"notifications",
	"documents",
	"document_permissions",
	"messages",
	"medias",
	"media_permissions",
	"recruiter_team_members",
	"plans",
	"subscriptions",
	"websites"
];

// INSERT
async function dbInsert(table, data) {
	if (!ALLOWED_TABLES.includes(table)) {
		throw new Error("Table not allowed for insertion");
	}
	const snakeData = snakecaseKeys(data);
	const columns = Object.keys(snakeData).join(", ");
	const placeholders = Object.keys(snakeData)
		.map(() => "?")
		.join(", ");
	const values = Object.values(snakeData);
	const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
	const [result] = await db.execute(sql, values);
	return result.insertId;
}

// SELECT
async function dbSelect(table, filters = {}) {
	if (!ALLOWED_TABLES.includes(table)) {
		throw new Error("Table not allowed for insertion");
	}
	const snakeFilters = snakecaseKeys(filters);
	const whereClause = Object.keys(snakeFilters)
		.map((key) => `${key} = ?`)
		.join(" AND ");
	const values = Object.values(snakeFilters);
	const sql = `SELECT * FROM ${table}` + (whereClause ? ` WHERE ${whereClause}` : "");
	const [rows] = await db.execute(sql, values);
	return rows.map((row) => camelcaseKeys(row));
}

async function dbSelectPaginated(table, filters = {}, options = {}) {
	if (!ALLOWED_TABLES.includes(table)) {
		throw new Error("Table not allowed for selection");
	}

	const snakeFilters = snakecaseKeys(filters);

	const whereClause = Object.keys(snakeFilters)
		.map((key) => `${key} = ?`)
		.join(" AND ");

	const values = Object.values(snakeFilters);

	const page = options.page && options.page > 0 ? options.page : 1;
	const limit = options.limit && options.limit > 0 ? options.limit : 10;
	const offset = (page - 1) * limit;

	// Option de tri
	const orderBy = options.orderBy ? options.orderBy : "id ASC";

	// 1. Compter le total avec les filtres
	const countSql = `SELECT COUNT(*) as total FROM \`${table}\` ${
		whereClause ? "WHERE " + whereClause : ""
	}`;
	const [countResult] = await db.execute(countSql, values);
	const total = countResult[0].total;

	// 2. Récupérer les résultats paginés
	const sql = `SELECT * FROM \`${table}\` ${
		whereClause ? "WHERE " + whereClause : ""
	} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
	const [rows] = await db.execute(sql, [...values, limit, offset]);

	return {
		results: rows.map((row) => camelcaseKeys(row)),
		total,
		page,
		limit
	};
}

// UPDATE
async function dbUpdate(table, data, filters) {
	if (!ALLOWED_TABLES.includes(table)) {
		throw new Error("Table not allowed for insertion");
	}
	const snakeData = snakecaseKeys(data);
	const snakeFilters = snakecaseKeys(filters);
	const setClause = Object.keys(snakeData)
		.map((key) => `${key} = ?`)
		.join(", ");
	const whereClause = Object.keys(snakeFilters)
		.map((key) => `${key} = ?`)
		.join(" AND ");
	const values = [...Object.values(snakeData), ...Object.values(snakeFilters)];
	const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
	const [result] = await db.execute(sql, values);
	return result.affectedRows;
}

// DELETE
async function dbDelete(table, filters) {
	if (!ALLOWED_TABLES.includes(table)) {
		throw new Error("Table not allowed for insertion");
	}
	const snakeFilters = snakecaseKeys(filters);
	const whereClause = Object.keys(snakeFilters)
		.map((key) => `${key} = ?`)
		.join(" AND ");
	const values = Object.values(snakeFilters);
	const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
	const [result] = await db.execute(sql, values);
	return result.affectedRows;
}

async function rawQuery(sql, params = []) {
	const [rows] = await db.execute(sql, params);
	return [rows];
}

export default {
	dbInsert,
	dbSelect,
	dbSelectPaginated,
	dbUpdate,
	dbDelete,
	rawQuery,
	camelcaseKeys
};
