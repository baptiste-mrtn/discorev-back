import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";

// Variables DB depuis .env
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME || !DB_PORT) {
	console.error("❌ Erreur : variables DB manquantes dans le .env");
	process.exit(1);
}

// Création du dossier backup
const backupDir = "./backups";
if (!fs.existsSync(backupDir)) {
	fs.mkdirSync(backupDir);
}

// Nom du fichier
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = `${backupDir}/backup_${DB_NAME}_${timestamp}.sql`;

console.log(`📦 Sauvegarde de la base '${DB_NAME}' dans ${backupFile}...`);

try {
	execSync(
		`mysqldump -p "${DB_PORT}"  -h "${DB_HOST}" -u "${DB_USER}" --password="${DB_PASSWORD}" "${DB_NAME}" > "${backupFile}"`,
		{ stdio: "inherit", shell: "/bin/bash" }
	);
	console.log("✅ Sauvegarde terminée !");
} catch (error) {
	console.error("❌ Erreur pendant la sauvegarde :", error.message);
	process.exit(1);
}
