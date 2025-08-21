import Media from "../models/mediaModel.js";

/**
 * Attache automatiquement les médias à une entité ou une liste d'entités
 * @param {Object|Array} data - Objet ou liste d’objets à enrichir
 * @param {string} targetType - 'recruiter', 'candidate', 'user', etc.
 * @returns L'objet ou la liste avec la clé `medias` ajoutée
 */
export const attachMedias = async (data, targetType) => {
	if (!data) return data;

	// Si tableau
	if (Array.isArray(data)) {
		return Promise.all(data.map((item) => attachMedias(item, targetType)));
	}

	// Sinon, objet unique
	let medias = await Media.getByTarget(targetType, data.id);

	// Fallback si user n'a pas de média
	if (targetType === "user" && medias.length === 0) {
		// imports dynamiques pour casser les cycles
		const { default: Recruiter } = await import("../models/recruiterModel.js");
		const { default: Candidate } = await import("../models/candidateModel.js");
		const { default: Admin } = await import("../models/adminModel.js");

		const recruiter = await Recruiter.getByUserId(data.id);
		if (recruiter) {
			medias = await Media.getByTarget("recruiter", recruiter.id);
		} else {
			const candidate = await Candidate.getByUserId(data.id);
			if (candidate) {
				medias = await Media.getByTarget("candidate", candidate.id);
			} else {
				const admin = await Admin.getByUserId(data.id);
				if (admin) {
					medias = await Media.getByTarget("admin", admin.id);
				}
			}
		}
	}

	return {
		...data,
		medias
	};
};
