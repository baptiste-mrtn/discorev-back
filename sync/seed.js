import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "discorev";

const SEEDS_DIR = path.join(__dirname, "seeds");

/** Connexion à la base */
async function connect() {
	return mysql.createConnection({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASS,
		database: DB_NAME,
		multipleStatements: true
	});
}

/** Récupère tous les fichiers seeds SQL */
function getSeedFiles() {
	if (!fs.existsSync(SEEDS_DIR)) return [];
	return fs
		.readdirSync(SEEDS_DIR)
		.filter((f) => f.toLowerCase().endsWith(".sql"))
		.sort();
}

/** Nettoie les fichiers */
function sanitizeSql(sql) {
	return sql
		.split("\n")
		.filter((line) => {
			const l = line.trim().toUpperCase();
			if (l.startsWith("CREATE DATABASE")) return false;
			if (l.startsWith("USE ")) return false;
			return true;
		})
		.join("\n");
}

async function runSeeds() {
	try {
		const conn = await connect();
		const files = getSeedFiles();

		if (!files.length) {
			console.log("⚠️ Aucun fichier de seed trouvé.");
			await conn.end();
			return;
		}

		for (const file of files) {
			console.log(`🌱 Insertion du seed : ${file}`);
			const sql = sanitizeSql(fs.readFileSync(path.join(SEEDS_DIR, file), "utf8"));
			try {
				await conn.query(sql);
				console.log(`✅ Seed appliqué : ${file}`);
			} catch (err) {
				console.error(`❌ Erreur dans le seed ${file}:`, err.message);
				await conn.end();
				process.exit(1);
			}
		}

		await conn.end();
		console.log("🎉 Tous les seeds ont été appliqués avec succès !");
	} catch (err) {
		console.error("❌ Erreur globale du seed:", err);
		process.exit(1);
	}
}

runSeeds();
