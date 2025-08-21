import BaseModel from "./BaseModel.js";
import { withMedias } from "../helpers/withMedias.js";

class Admin extends BaseModel {
	constructor() {
		super("admins"); // table
	}
}

let model = new Admin();

// Enrichir avec les médias
model = withMedias(model, "admin", ["getAll", "getById", "getByUserId"]);

export default model;
