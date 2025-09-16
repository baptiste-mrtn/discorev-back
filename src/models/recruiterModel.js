import BaseModel from "./baseModel.js";
import { enrichModel } from "../helpers/enrichModel.js";
import { withTeamMembers } from "../helpers/withTeamMembers.js";
import { withMedias } from "../helpers/withMedias.js";

class Recruiter extends BaseModel {
	constructor() {
		super("recruiters");
	}

	async getByCompanyName(name) {
		const row = await this.getBy("companyName", name);
		return row || null;
	}
}

const model = enrichModel(new Recruiter(), [
	{
		methods: ["getAll", "getById", "getByUserId", "getByCompanyName"],
		enhancer: withTeamMembers
	},
	{
		methods: ["getAll", "getById", "getByUserId", "getByCompanyName"],
		enhancer: (res) => withMedias(res, "recruiter")
	}
]);

export default model;
