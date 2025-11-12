import dbHelpers from "./dbHelpers.js";

export async function withTags(result, ...args) {
	const model = args[args.length - 1];
	if (!result) return result;

	// Si un seul recruteur
	if (!Array.isArray(result)) {
		const tags = await getTagsForRecruiters([result.id]);
		result.tags = tags[result.id] || {};
		return result;
	}

	// Si plusieurs recruteurs
	const recruiterIds = result.map((r) => r.id);
	const tagsByRecruiter = await getTagsForRecruiters(recruiterIds);

	return result.map((r) => ({
		...r,
		tags: tagsByRecruiter[r.id] || {}
	}));
}

async function getTagsForRecruiters(recruiterIds) {
	if (!recruiterIds.length) return {};

	const placeholders = recruiterIds.map(() => "?").join(",");
	const sql = `
		SELECT 
			rt.recruiter_id,
			t.id AS tag_id,
			t.name AS tag_name,
			tc.name AS category_name
		FROM recruiter_tag rt
		JOIN tags t ON t.id = rt.tag_id
		JOIN tag_categories tc ON tc.id = t.category_id
		WHERE rt.recruiter_id IN (${placeholders})
	`;

	const [rows] = await dbHelpers.rawQuery(sql, recruiterIds);
	const camelRows = rows.map((r) => dbHelpers.camelcaseKeys(r));

	const grouped = {};
	for (const row of camelRows) {
		if (!grouped[row.recruiterId]) grouped[row.recruiterId] = {};
		if (!grouped[row.recruiterId][row.categoryName])
			grouped[row.recruiterId][row.categoryName] = [];
		grouped[row.recruiterId][row.categoryName].push(row.tagName);
	}

	return grouped;
}
