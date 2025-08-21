import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import "dotenv/config";

async function initDatabase() {
	try {
		// Connexion temporaire sans base sélectionnée
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: Number(process.env.DB_PORT) || 3306,
			multipleStatements: true
		});

		// Lecture et exécution du fichier SQL
		const sqlPath = path.join(path.resolve(), "sync/discorev.sql"); // adapte le chemin si besoin
		const sql = fs.readFileSync(sqlPath, "utf8");

		await connection.query(sql);
		console.log('✅ Base de données "discorev" et ses tables ont été créées avec succès !');

		await connection.end(); // Termine la connexion temporaire
	} catch (err) {
		console.error("❌ Erreur lors de l'initialisation de la base de données :", err);
	}
}

initDatabase();
