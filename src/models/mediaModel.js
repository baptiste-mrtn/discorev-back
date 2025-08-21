import dbHelpers from "../helpers/dbHelpers.js";

const Media = {
	/**
	 * Crée un média dans la base de données
	 * @param {Object} mediaData - Données du média
	 * @returns {Number} - ID du média inséré
	 */
	async createMedia(mediaData) {
		return await dbHelpers.dbInsert("medias", mediaData);
	},

	/**
	 * Récupère un média par son ID
	 * @param {Number} id - ID du média
	 * @returns {Object|null} - Média trouvé ou null
	 */
	async getMediaById(id) {
		const rows = await dbHelpers.dbSelect("medias", { id });
		return rows[0] || null;
	},

	/**
	 * Récupère tous les médias d'un utilisateur
	 * @param {Number} userId - ID de l'utilisateur
	 * @returns {Array} - Liste des médias
	 */
	async getMediaByUserId(userId) {
		return await dbHelpers.dbSelect("medias", { userId });
	},

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
	},

	/**
	 * Met à jour un média
	 * @param {Number} mediaId - ID du média
	 * @param {Object} updates - Champs à mettre à jour
	 */
	async updateMedia(mediaId, updates) {
		await dbHelpers.dbUpdate("medias", updates, { id: mediaId });
	},

	/**
	 * Supprime un média
	 * @param {Number} mediaId - ID du média
	 */
	async deleteMedia(mediaId) {
		await dbHelpers.dbDelete("medias", { id: mediaId });
	},

	/**
	 * Supprime un média doublon
	 * @param {Number} mediaId - ID du média
	 */
	async deleteMediaByContext(targetType, targetId, type) {
		await dbHelpers.dbDelete("medias", { targetType, targetId, type });
	}
};

export default Media;
