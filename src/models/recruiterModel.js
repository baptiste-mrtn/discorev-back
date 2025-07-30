import dbHelpers from "../helpers/dbHelpers.js";
import { withMedias } from "../helpers/withMedias.js";

const baseRecruiter = {
	async getAllRecruiters() {
		const rows = await dbHelpers.dbSelect("recruiters");
		return rows;
	},

	async createRecruiter(recruiterData) {
		return await dbHelpers.dbInsert("recruiters", recruiterData);
	},

	async getRecruiterByUserId(userId) {
		const rows = await dbHelpers.dbSelect("recruiters", { userId });
		return rows[0];
	},

	async getRecruiterById(recruiterId) {
		const rows = await dbHelpers.dbSelect("recruiters", { id: recruiterId });
		return rows[0];
	},

	async getRecruiterByCompanyName(companyName) {
		const rows = await dbHelpers.dbSelect("recruiters", { companyName });
		return rows[0];
	},

	async updateRecruiter(recruiterId, updates) {
		await dbHelpers.dbUpdate("recruiters", updates, { id: recruiterId });
	},

	async deleteRecruiter(recruiterId) {
		await dbHelpers.dbDelete("recruiters", { id: recruiterId });
	}
};

const Recruiter = withMedias(baseRecruiter, "recruiter", [
	"getAllRecruiters",
	"getRecruiterByUserId",
	"getRecruiterById",
	"getRecruiterByCompanyName"
]);

export default Recruiter;
