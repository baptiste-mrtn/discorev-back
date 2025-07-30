import dbHelpers from "../helpers/dbHelpers.js";

const Document = {
	/**
	 * Crée un document dans la base de données
	 * @param {Object} documentData - Données du document
	 * @returns {Number} - ID du document inséré
	 */
	async createDocument(documentData) {
		try {
			return await dbHelpers.dbInsert("documents", documentData);
		} catch (error) {
			console.error("Error creating document:", error);
			throw error;
		}
	},

	/**
	 * Récupère un document par son ID
	 * @param {Number} id - ID du document
	 * @returns {Object} - Document trouvé
	 */
	async getDocumentsById(id) {
		try {
			const rows = await dbHelpers.dbSelect("documents", { id });
			return rows[0] || null;
		} catch (error) {
			console.error("Error fetching document by ID:", error);
			throw error;
		}
	},

	/**
	 * Récupère tous les documents d'un utilisateur
	 * @param {Number} senderId - ID de l'expéditeur
	 * @returns {Array} - Liste des documents
	 */
	async getDocumentsBySenderId(senderId) {
		try {
			const rows = await dbHelpers.dbSelect("documents", { senderId });
			return rows;
		} catch (error) {
			console.error("Error fetching documents by sender ID:", error);
			throw error;
		}
	},

	/**
	 * Supprime un document par son ID
	 * @param {Number} documentId - ID du document à supprimer
	 */
	async deleteDocumentById(documentId) {
		try {
			await dbHelpers.dbDelete("documents", { id: documentId });
		} catch (error) {
			console.error("Error deleting document:", error);
			throw error;
		}
	},

	/**
	 * Ajoute une permission pour partager un document
	 * @param {Number} documentId - ID du document
	 * @param {Number} receiverId - ID du destinataire
	 * @returns {Number} - ID de l'autorisation ajoutée
	 */
	async addPermission(documentId, receiverId) {
		try {
			return await dbHelpers.dbInsert("document_permissions", { documentId, receiverId });
		} catch (error) {
			console.error("Error adding document permission:", error);
			throw error;
		}
	},

	/**
	 * Récupère tous les utilisateurs ayant accès à un document
	 * @param {Number} documentId - ID du document
	 * @returns {Array} - Liste des utilisateurs ayant accès
	 */
	async getDocumentPermissions(documentId) {
		try {
			const rows = await dbHelpers.dbSelect("document_permissions", { documentId });
			return rows.map((row) => row.receiverId);
		} catch (error) {
			console.error("Error fetching shared users:", error);
			throw error;
		}
	},

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

		const rows = await dbHelpers.dbSelect("document_permissions", { documentId, receiverId: userId });
		console.log("🔎 Résultat de la requête:", rows);
		return rows.length > 0;
	},

	/**
	 * Supprime toutes les permissions associées à un document
	 * @param {Number} documentId - ID du document
	 */
	async deleteDocumentPermissions(documentId) {
		try {
			await dbHelpers.dbDelete("document_permissions", { documentId });
		} catch (error) {
			console.error("Error deleting document permissions:", error);
			throw error;
		}
	},

	/**
	 * Supprime un utilisateur des permissions associées à un document
	 * @param {Number} documentId - ID du document
	 * @param {Number} receiverId - ID du receveur
	 */
	async removePermission(documentId, receiverId) {
		return dbHelpers.dbDelete("document_permissions", { documentId, receiverId });
	},

	/**
	 * Met à jour les permissions d'un document
	 * @param {Number} documentId - ID du document
	 * @param {Number} targetUserId - ID de l'utilisateur cible
	 */
	async updateDocumentPermissions(documentId, removeUsers, addUsers) {
		try {
			// 🔴 Suppression des utilisateurs
			if (removeUsers && removeUsers.length > 0) {
				for (const receiverId of removeUsers) {
					await dbHelpers.dbDelete("document_permissions", { documentId, receiverId });
				}
			}

			// 🟢 Ajout des nouveaux utilisateurs
			if (addUsers && addUsers.length > 0) {
				for (const receiverId of addUsers) {
					// Vérifier si la permission existe déjà
					const existing = await dbHelpers.dbSelect("document_permissions", { documentId, receiverId });
					if (existing.length === 0) {
						await dbHelpers.dbInsert("document_permissions", { documentId, receiverId });
					}
				}
			}
		} catch (error) {
			console.error("Error updating document permissions:", error);
			throw error;
		}
	},

	/**
	 * Récupère tous les documents (pour un admin)
	 * @returns {Array} - Liste des documents
	 */
	async getAllDocuments() {
		try {
			const rows = await dbHelpers.dbSelect("documents");
			return rows;
		} catch (error) {
			console.error("Error fetching all documents:", error);
			throw error;
		}
	}
};

export default Document;
