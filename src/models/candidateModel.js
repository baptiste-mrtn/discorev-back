import dbHelpers from "../helpers/dbHelpers.js";
import { withMedias } from "../helpers/withMedias.js";

const baseCandidate = {
	async getAllCandidates() {
		const rows = await dbHelpers.dbSelect("candidates");
		return rows;
	},

	async createCandidate(candidateData) {
		return await dbHelpers.dbInsert("candidates", candidateData);
	},

	async getCandidateByUserId(userId) {
		const rows = await dbHelpers.dbSelect("candidates", { userId });
		return rows[0];
	},

	async updateCandidate(candidateId, updates) {
		await dbHelpers.dbUpdate("candidates", updates, { id: candidateId });
	},

	async deleteCandidate(candidateId) {
		await dbHelpers.dbDelete("candidates", { id: candidateId });
	}
};


const Candidate = withMedias(baseCandidate, "candidate", [
	"getAllCandidates",
	"getCandidateByUserId"
]);
export default Candidate;
