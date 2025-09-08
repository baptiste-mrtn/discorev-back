import BaseModel from "./BaseModel.js";
import { withMedias } from "../helpers/withMedias.js";
import { enrichModel } from "../helpers/enrichModel.js";

class User extends BaseModel {
	constructor() {
		super("users"); // table
	}

	async getByEmail(email) {
		const rows = await this.getBy("email", email);
		return rows[0] || null;
	}

	async deleteRefreshToken() {
		const rows = await this.getBy("email", email);
		return rows[0] || null;
	}
}

// instance enrichie, toutes les méthodes de BaseModel restent accessibles
const model = enrichModel(new User(), [
	{
		methods: ["getAll", "getById", "getByUserId", "getByEmail", "update"],
		enhancer: (orig, ...args) => withMedias(orig, "user", args)
	}
]);

export default model;
