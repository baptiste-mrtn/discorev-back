import BaseModel from "./baseModel.js";

class RecruiterTeamMember extends BaseModel {
	constructor() {
		super("recruiter_team_members");
	}

	async createMembersBulk(recruiterId, members) {
		for (const { name, email, role } of members) {
			if (!name || !email || !role) continue;
			await this.create({
				recruiterId,
				name,
				email,
				role
			});
		}
	}

	async getGroupedTeamMembers(recruiterId) {
		const rows = await this.findAll({ recruiterId });

		// Regrouper par recruiterId
		return rows.reduce((acc, member) => {
			if (!acc[member.recruiterId]) {
				acc[member.recruiterId] = [];
			}
			acc[member.recruiterId].push(member);
			return acc;
		}, {});
	}
}

export default new RecruiterTeamMember();
