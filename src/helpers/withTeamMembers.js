import dbHelpers from "./dbHelpers.js";

export async function withTeamMembers(result, ...args) {
	const model = args[args.length - 1]; // dernier argument = modèle
	if (!result) return result;

	// si résultat unique
	if (!Array.isArray(result)) {
		const team = await dbHelpers.dbSelect("recruiter_team_members", {
			recruiter_id: result.id
		});
		result.teamMembers = team;
		return result;
	}

	// si tableau
	const recruiterIds = result.map((r) => r.id);
	const rows = await dbHelpers.rawQuery(
		`SELECT * FROM recruiter_team_members WHERE recruiter_id IN (${recruiterIds
			.map(() => "?")
			.join(",")})`,
		recruiterIds
	);

	const camelRows = rows.map((r) => dbHelpers.camelcaseKeys(r));
	const grouped = camelRows.reduce((acc, m) => {
		if (!acc[m.recruiterId]) acc[m.recruiterId] = [];
		acc[m.recruiterId].push(m);
		return acc;
	}, {});

	return result.map((r) => ({ ...r, teamMembers: grouped[r.id] || [] }));
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
