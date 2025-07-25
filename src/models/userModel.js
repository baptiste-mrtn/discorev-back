import db from "../config/db.js";
import conversion from "../utils/conversion.js";
import bcrypt from "bcrypt";

const User = {
	async getAllUsers() {
		const [rows] = await db.execute("SELECT * FROM users");
		return rows;
	},

	async createUser(userData) {
		const hashedPassword = await bcrypt.hash(userData.password, 10);

		// Convertir les clés camelCase en snake_case
		const userDataSnakeCase = await conversion.camelToSnake({
			...userData,
			password: hashedPassword
		});

		// Extraire les noms des colonnes et les valeurs
		const columns = Object.keys(userDataSnakeCase).join(", ");
		const placeholders = Object.keys(userDataSnakeCase)
			.map(() => "?")
			.join(", ");
		const values = Object.values(userDataSnakeCase);
		console.log(placeholders);
		console.log(values);
		const [result] = await db.execute(
			`INSERT INTO users (${columns}) VALUES (${placeholders})`,
			values
		);
		return result.insertId;
	},

	async getUserByEmail(email) {
		const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
		return rows[0];
	},

	async getUserBy(field, value) {
		field = conversion.camelToSnake(field);
		const query = `SELECT * FROM users WHERE ${field} = ?`;
		const [rows] = await db.execute(query, [value]);
		return rows[0];
	},

	async getUserById(userId) {
		if (!userId) {
			throw new Error("User ID is required");
		}

		const [rows] = await db.execute(
			`SELECT u.*, 
                    (SELECT c.id FROM candidates c WHERE c.user_id = u.id) AS candidate_id,
                    (SELECT r.id FROM recruiters r WHERE r.user_id = u.id) AS recruiter_id
             FROM users u
             WHERE u.id = ?`,
			[userId]
		);

		if (rows.length === 0) {
			return null;
		}

		const user = rows[0];

		// Remplacer les valeurs undefined par null
		for (const key in user) {
			if (user[key] === undefined) {
				user[key] = null;
			}
		}

		return user;
	},

	async updateUser(userId, updates) {
		updates = await conversion.camelToSnake(updates);
		const fields = Object.keys(updates)
			.map((field) => `${field} = ?`)
			.join(", ");
		const values = Object.values(updates);
		values.push(userId);

		await db.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
	},

	async deleteUser(userId) {
		await db.execute("DELETE FROM users WHERE id = ?", [userId]);
	}
};

export default User;
