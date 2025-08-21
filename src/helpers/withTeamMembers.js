import dbHelpers from "./dbHelpers.js";

export function withTeamMembers(model, methodNames = []) {
	const wrappedModel = { ...model };

	methodNames.forEach((methodName) => {
		const originalMethod = model[methodName];

		if (typeof originalMethod === "function") {
			wrappedModel[methodName] = async (...args) => {
				const result = await originalMethod.apply(model, args); // <-- bind le contexte

				if (!result) return result;

				if (!Array.isArray(result)) {
					const team = await dbHelpers.dbSelect("recruiter_team_members", {
						recruiterId: result.id
					});
					result.teamMembers = team;
					return result;
				}

				const recruiterIds = result.map((r) => r.id);
				const teamMap = await getGroupedTeamMembers(recruiterIds);

				return result.map((r) => ({
					...r,
					teamMembers: teamMap[r.id] || []
				}));
			};
		}
	});

	return wrappedModel;
}

async function getGroupedTeamMembers(recruiterIds) {
	if (recruiterIds.length === 0) return {};

	// Requête manuelle car dbSelect ne gère pas IN (encore)
	const placeholders = recruiterIds.map(() => "?").join(",");
	const sql = `SELECT * FROM recruiter_team_members WHERE recruiter_id IN (${placeholders})`;
	const [rows] = await dbHelpers.rawQuery(sql, recruiterIds); // <- rawQuery utilisé ici seulement pour IN

	// Remap avec camelCase si nécessaire
	const camelRows = rows.map((row) => dbHelpers.camelcaseKeys(row));

	// Groupement par recruiter_id
	return camelRows.reduce((acc, member) => {
		if (!acc[member.recruiterId]) acc[member.recruiterId] = [];
		acc[member.recruiterId].push(member);
		return acc;
	}, {});
}
