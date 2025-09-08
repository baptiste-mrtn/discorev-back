import BaseModel from "./BaseModel.js";
import { withMedias } from "../helpers/withMedias.js";
import { enrichModel } from "../helpers/enrichModel.js";

class Candidate extends BaseModel {
	constructor() {
		super("candidates"); // table
	}
}

// instance enrichie, toutes les méthodes de BaseModel restent accessibles
const model = enrichModel(new Candidate(), [
	{
		methods: ["getAll", "getById", "getByUserId", "getByCompanyName"],
		enhancer: (orig, ...args) => withMedias(orig, "candidate", args)
	}
]);

export default model;
