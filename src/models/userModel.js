import dbHelpers from "../helpers/dbHelpers.js";
import BaseModel from "./BaseModel.js";
import { withMedias } from "../helpers/withMedias.js";

class User extends BaseModel {
	constructor() {
		super("users"); // table
	}

	async getByEmail(email) {
		const rows = await dbHelpers.dbSelect("users", { email });
		return rows[0];
	}

	async getUserBy(field, value) {
		const rows = await dbHelpers.dbSelect("users", { [field]: value });
		return rows[0];
	}

	async getById(userId) {
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
	}
}

let model = new User();

// Enrichir avec les médias
model = withMedias(model, "user", ["getAll", "getById", "getUserBy", "getByEmail"]);

export default model;
