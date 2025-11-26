import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "discorev";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const BACKUP_DIR = path.join(__dirname, "backups");

// Shell pour redirection '>' (Windows vs Unix)
const SHELL = process.platform === "win32" ? "cmd.exe" : "/bin/bash";

/** Vérifie si la base existe */
async function databaseExists() {
	const conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS });
	const [rows] = await conn.query(
		"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
		[DB_NAME]
	);
	await conn.end();
	return rows.length > 0;
}

/** Crée la DB si besoin */
async function ensureDatabase() {
	const conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASS });
	await conn.query(
		`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
	);
	await conn.end();
}

/** Backup si la DB existe */
function backupIfExistsSync() {
	if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const backupFile = path.join(BACKUP_DIR, `backup_${DB_NAME}_${timestamp}.sql`);

	console.log(`📦 Sauvegarde de la BDD '${DB_NAME}' vers ${backupFile} ...`);

	const dumpCmd = `mysqldump \
	--column-statistics=0 \
	-h "${DB_HOST}" \
	-u "${DB_USER}" \
	--password="${DB_PASS}" \
	"${DB_NAME}" > "${backupFile}"`;
	const execArgs = { shell: SHELL, stdio: "inherit" };

	execSync(process.platform === "win32" ? dumpCmd : `${dumpCmd}`, execArgs);
	console.log("✅ Sauvegarde OK");
}

/** Connexion à la DB avec multi-statements */
async function connectToDatabase() {
	return mysql.createConnection({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASS,
		database: DB_NAME,
		multipleStatements: true
	});
}

/** Lit les fichiers de migrations triés */
function getMigrationFiles() {
	if (!fs.existsSync(MIGRATIONS_DIR)) return [];
	return fs
		.readdirSync(MIGRATIONS_DIR)
		.filter((f) => f.toLowerCase().endsWith(".sql"))
		.sort();
}

/** Retire CREATE DATABASE / USE pour éviter conflit */
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

/** Table migrations */
async function ensureMigrationsTable(conn) {
	await conn.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(conn) {
	const [rows] = await conn.query("SELECT filename FROM migrations");
	return new Set(rows.map((r) => r.filename));
}

async function markMigrationApplied(conn, filename) {
	await conn.query("INSERT INTO migrations (filename) VALUES (?)", [filename]);
}

async function run() {
	try {
		const exists = await databaseExists();
		if (exists) backupIfExistsSync();
		else console.log(`ℹ️ La base '${DB_NAME}' n'existe pas encore, pas de backup nécessaire.`);

		await ensureDatabase();

		const conn = await connectToDatabase();
		await ensureMigrationsTable(conn);
		const applied = await getAppliedMigrations(conn);

		const files = getMigrationFiles();
		for (const file of files) {
			if (applied.has(file)) {
				console.log(`⏩ Skip: ${file}`);
				continue;
			}

			let sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
			sql = sanitizeSql(sql).trim();

			if (!sql) {
				console.log(`⚠️ Fichier vide après sanitization: ${file} → marqué comme appliqué.`);
				await markMigrationApplied(conn, file);
				continue;
			}

			console.log(`🚀 Applying: ${file}`);
			try {
				await conn.query(sql);
				await markMigrationApplied(conn, file);
				console.log(`✅ Applied: ${file}`);
			} catch (err) {
				console.error(`❌ Échec migration ${file}:`, err);
				await conn.end();
				process.exit(1);
			}
		}

		await conn.end();
		console.log("🎉 Toutes les migrations ont été exécutées !");
	} catch (err) {
		console.error("❌ Erreur globale:", err);
		process.exit(1);
	}
}

run();
