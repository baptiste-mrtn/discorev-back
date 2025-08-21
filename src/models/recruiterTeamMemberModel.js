import dbHelpers from "../helpers/dbHelpers.js";

const RecruiterTeamMember = {
	async createMember(data) {
		console.log("data : ");
		console.log(data);
		return await dbHelpers.dbInsert("recruiter_team_members", data);
	},

	async createMembersBulk(recruiterId, members) {
		for (const { name, email, role } of members) {
			if (!name || !email || !role) continue;
			await dbHelpers.dbInsert("recruiter_team_members", {
				recruiterId,
				name,
				email,
				role
			});
		}
	},

	async updateMember(memberId, updates) {
		return await dbHelpers.dbUpdate("recruiter_team_members", updates, { id: memberId });
	},

	async deleteMember(memberId) {
		return await dbHelpers.dbDelete("recruiter_team_members", { id: memberId });
	},

	async getMembersByRecruiterId(recruiterId) {
		return await dbHelpers.dbSelect("recruiter_team_members", { recruiterId });
	}
};

export default RecruiterTeamMember;
