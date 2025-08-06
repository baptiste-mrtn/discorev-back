import dbHelpers from "../helpers/dbHelpers.js";
import { withMedias } from "../helpers/withMedias.js";
import { withTeamMembers } from "../helpers/withTeamMembers.js";

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

// Étape 1 : enrichir avec les membres
const recruiterWithTeam = withTeamMembers(baseRecruiter, [
	"getAllRecruiters",
	"getRecruiterByUserId",
	"getRecruiterById",
	"getRecruiterByCompanyName"
]);

// Étape 2 : enrichir avec les médias (si besoin)
const Recruiter = withMedias(recruiterWithTeam, "recruiter", [
	"getAllRecruiters",
	"getRecruiterByUserId",
	"getRecruiterById",
	"getRecruiterByCompanyName"
]);
export default Recruiter;
