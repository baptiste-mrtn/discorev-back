import mysql from "mysql2/promise";
import "dotenv/config";
import fs from "fs";
import path from "path";

// Pool principal (pour les requêtes classiques)
const db = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT
});

async function initDatabase() {
	try {
		// Connexion temporaire sans base sélectionnée
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
			multipleStatements: true
		});

		// Lecture et exécution du fichier SQL
		const sqlPath = path.join(path.resolve(), "discorev.sql"); // adapte le chemin si besoin
		const sql = fs.readFileSync(sqlPath, "utf8");

		await connection.query(sql);
		console.log('✅ Base de données "discorev" et ses tables ont été créées avec succès !');

		await connection.end(); // Termine la connexion temporaire
	} catch (err) {
		console.error("❌ Erreur lors de l'initialisation de la base de données :", err);
	}
}

// Exporte à la fois le pool et l’init
export { db, initDatabase };
