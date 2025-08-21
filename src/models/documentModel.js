import BaseModel from "./BaseModel.js";
import dbHelpers from "../helpers/dbHelpers.js";

class Document extends BaseModel {
	constructor() {
		super("documents"); // table
	}

	/**
	 * Récupère tous les documents d'un utilisateur
	 * @param {Number} senderId - ID de l'expéditeur
	 * @returns {Array} - Liste des documents
	 */
	async getBySenderId(senderId) {
		try {
			const rows = await dbHelpers.dbSelect("documents", { senderId });
			return rows;
		} catch (error) {
			console.error("Error fetching documents by sender ID:", error);
			throw error;
		}
	}
}

export default new Document();
