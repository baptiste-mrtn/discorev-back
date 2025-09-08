import bcrypt from "bcrypt";
import db from "../src/config/db.js";

async function createSuperAdmin() {
	try {
		// Remplis ces informations pour créer le super admin
		const firstName = "***REMOVED***";
		const lastName = "***REMOVED***";
		const email = "***REMOVED***";
		const password = "***REMOVED***"; // 🔒 choisis un bon mot de passe fort
		const phoneNumber = "***REMOVED***"; // Optionnel, si tu veux l'ajouter

		// 1️⃣ Hash du mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		// 2️⃣ Insertion dans `users`
		const [userResult] = await db.execute(
			`INSERT INTO users (first_name, last_name, email, password, phone_number, account_type, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'admin', NOW(), NOW())`,
			[firstName, lastName, email, hashedPassword, phoneNumber]
		);

		const userId = userResult.insertId;

		// 3️⃣ Insertion dans `admins`
		await db.execute(
			`INSERT INTO admins (user_id, role, permissions, status, created_at, updated_at)
             VALUES (?, 'super-admin', '{"manage_users": true, "manage_orders": true, "manage_jobs": true, "manage_settings": true}', 1, NOW(), NOW())`,
			[userId]
		);

		console.log("✅ Super admin créé avec succès !");
		console.log(`📧 Email : ${email}`);
		console.log(`🔑 Mot de passe : ${password}`);
	} catch (error) {
		console.error("❌ Erreur lors de la création du super-admin :", error);
	} finally {
		process.exit();
	}
}

createSuperAdmin();
