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
		const rows = await this.getAll({ recruiterId });

		// Regrouper par recruiterId
		return rows.reduce((acc, member) => {
			if (!acc[member.recruiterId]) {
				acc[member.recruiterId] = [];
			}
			acc[member.recruiterId].push(member);
			return acc;
		}, {});
	}

	async updateByRecruiter(recruiterId, memberId, data) {
		const snakeData = snakecaseKeys(data);
		const setClause = Object.keys(snakeData)
			.map((key) => `${key} = ?`)
			.join(", ");
		const values = [...Object.values(snakeData), recruiterId, memberId];

		await db.execute(
			`UPDATE ${this.table} 
		 SET ${setClause} 
		 WHERE recruiter_id = ? AND id = ?`,
			values
		);
	}

	async deleteByRecruiter(recruiterId, memberId) {
		await db.execute(`DELETE FROM ${this.table} WHERE recruiter_id = ? AND id = ?`, [
			recruiterId,
			memberId
		]);
	}
}

export default new RecruiterTeamMember();
