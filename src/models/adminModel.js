import BaseModel from "./BaseModel.js";
import { withMedias } from "../helpers/withMedias.js";
import { enrichModel } from "../helpers/enrichModel.js";

class Admin extends BaseModel {
	constructor() {
		super("admins"); // table
	}
}

// Enrichir avec les médias
const model = enrichModel(new Admin(), [
	{
		methods: ["getAll", "getById", "getByUserId"],
		enhancer: (res) => withMedias(res, "admin")
	}
]);
export default model;
