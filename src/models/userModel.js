import dbHelpers from "../helpers/dbHelpers.js";
import bcrypt from "bcrypt";
import { withMedias } from "../helpers/withMedias.js";

const baseUser = {
	async getAllUsers() {
		const rows = await dbHelpers.dbSelect("users");
		return rows;
	},

	async createUser(userData) {
		const hashedPassword = await bcrypt.hash(userData.password, 10);

		// Ajouter le hashedPassword dans userData
		const userDataWithHashedPassword = {
			...userData,
			password: hashedPassword
		};

		return await dbHelpers.dbInsert("users", userDataWithHashedPassword);
	},

	async getUserByEmail(email) {
		const rows = await dbHelpers.dbSelect("users", { email });
		return rows[0];
	},

	async getUserBy(field, value) {
		const rows = await dbHelpers.dbSelect("users", { [field]: value });
		return rows[0];
	},

	async getUserById(userId) {
		if (!userId) {
			throw new Error("User ID is required");
		}

		const rows = await dbHelpers.dbSelect("users", { id: userId });
		if (rows.length === 0) {
			return null;
		}
		const user = rows[0];
		// Ajout des champs candidate_id et recruiter_id si besoin
		// Nécessite une requête supplémentaire car dbHelpers ne gère pas les sous-requêtes
		const candidateRows = await dbHelpers.dbSelect("candidates", { userId: user.id });
		const recruiterRows = await dbHelpers.dbSelect("recruiters", { userId: user.id });
		user.candidate_id = candidateRows[0]?.id || null;
		user.recruiter_id = recruiterRows[0]?.id || null;
		// Remplacer les valeurs undefined par null
		for (const key in user) {
			if (user[key] === undefined) {
				user[key] = null;
			}
		}
		return user;
	},

	async updateUser(userId, updates) {
		await dbHelpers.dbUpdate("users", updates, { id: userId });
	},

	async deleteUser(userId) {
		await dbHelpers.dbDelete("users", { id: userId });
	}
};

const User = withMedias(baseUser, "user", [
	"getAllUsers",
	"getUserByEmail",
	"getUserById",
	"getUserBy"
]);

export default User;
