import BaseModel from "./BaseModel.js";
import { withMedias } from "../helpers/withMedias.js";

class Candidate extends BaseModel {
	constructor() {
		super("recruiters"); // table
	}
}

let model = new Candidate();

model = withMedias(model, "candidate", ["getAll", "getByUserId", "getById"]);

export default model;
