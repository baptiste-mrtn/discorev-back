import mysql from "mysql2/promise";
import "dotenv/config";

// Pool principal (pour les requêtes classiques)
const db = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	multipleStatements: true
});

export default db;
