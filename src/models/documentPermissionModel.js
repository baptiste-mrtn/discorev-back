import BaseModel from "./BaseModel.js";
import dbHelpers from "../helpers/dbHelpers.js";

class DocumentPermission extends BaseModel {
	constructor() {
		super("document_permissions"); // table
	}

	/**
	 * Vérifie si un utilisateur est autorisé à voir un document
	 * @param {Number} documentId - ID du document
	 * @param {Number} userId - ID de l'utilisateur
	 * @returns {Boolean} - true si autorisé, sinon false
	 */
	async isUserAuthorized(documentId, userId) {
		// Vérifie que documentId et userId ne sont pas undefined
		console.log("🛠️ Vérification autorisation - Document ID:", documentId, "User ID:", userId);

		if (!documentId || !userId) {
			console.error("isUserAuthorized - documentId ou userId est undefined :", {
				documentId,
				userId
			});
			return false; // Refuser l'accès si un paramètre est invalide
		}

		const rows = await dbHelpers.dbSelect("document_permissions", {
			documentId,
			receiverId: userId
		});
		console.log("🔎 Résultat de la requête:", rows);
		return rows.length > 0;
	}

	/**
	 * Supprime un utilisateur des permissions associées à un document
	 * @param {Number} documentId - ID du document
	 * @param {Number} receiverId - ID du receveur
	 */
	async removePermission(documentId, receiverId) {
		return dbHelpers.dbDelete("document_permissions", { documentId, receiverId });
	}

	/**
	 * Met à jour les permissions d'un document
	 * @param {Number} documentId - ID du document
	 * @param {Number} targetUserId - ID de l'utilisateur cible
	 */
	async update(documentId, removeUsers, addUsers) {
		try {
			// 🔴 Suppression des utilisateurs
			if (removeUsers && removeUsers.length > 0) {
				for (const receiverId of removeUsers) {
					await this.removePermission(documentId, receiverId);
				}
			}

			// 🟢 Ajout des nouveaux utilisateurs
			if (addUsers && addUsers.length > 0) {
				for (const receiverId of addUsers) {
					// Vérifier si la permission existe déjà
					const existing = await dbHelpers.dbSelect("document_permissions", {
						documentId,
						receiverId
					});
					if (existing.length === 0) {
						await this.create(documentId, receiverId);
					}
				}
			}
		} catch (error) {
			console.error("Error updating document permissions:", error);
			throw error;
		}
	}
}

export default new DocumentPermission();
