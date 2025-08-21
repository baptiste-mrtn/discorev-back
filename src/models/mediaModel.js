import BaseModel from "./BaseModel.js";
import dbHelpers from "../helpers/dbHelpers.js";

class Media extends BaseModel {
	constructor() {
		super("medias"); // table
	}

	/**
	 * Récupère tous les médias d'un utilisateur
	 * @param {Number} userId - ID de l'utilisateur
	 * @returns {Array} - Liste des médias
	 */
	async getByUserId(userId) {
		return await dbHelpers.dbSelect("medias", { userId });
	}

	/**
	 * Récupère tous les médias d'un type d'utilisateur
	 * @param {String} targetType - Type de l'utilisateur (recruiter, candidate, user)
	 * @param {Number} targetId - ID de l'utilisateur
	 * @returns {Array} - Liste des médias
	 */
	async getByTarget(targetType, targetId) {
		const rows = await dbHelpers.dbSelect("medias", {
			targetType,
			targetId
		});
		return rows;
	}

	/**
	 * Supprime un média doublon
	 * @param {Number} mediaId - ID du média
	 */
	async deleteMediaByContext(targetType, targetId, type) {
		await dbHelpers.dbDelete("medias", { targetType, targetId, type });
	}
}

export default new Media();
