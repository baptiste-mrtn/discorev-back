import BaseModel from "./BaseModel.js";
import { withMedias } from "../helpers/withMedias.js";
import { withTeamMembers } from "../helpers/withTeamMembers.js";

class Recruiter extends BaseModel {
	constructor() {
		super("recruiters"); // table
	}

	async getByCompanyName(companyName) {
		const rows = await this.getAll({ companyName });
		return rows[0] || null;
	}
}

let model = new Recruiter();

// Étape 1 : enrichir avec les membres
model = withTeamMembers(model, ["getAll", "getById", "getByUserId", "getByCompanyName"]);

// Étape 2 : enrichir avec les médias
model = withMedias(model, "recruiter", ["getAll", "getById", "getByUserId", "getByCompanyName"]);

export default model;
