import BaseController from "./baseController.js";
import Document from "../models/documentModel.js";
import DocumentPermission from "../models/documentPermissionModel.js";
import path from "path";
import fs from "fs/promises";

class DocumentPermissionsController extends BaseController {
	constructor() {
		super(DocumentPermission);
	}

	create = async (req, res) => {
		const { documentId, receiverId } = req.body;
		const userId = req.user.id; // Vérifie que req.user est bien défini

		console.log(
			"📩 Requête reçue -> Document ID:",
			documentId,
			"Receiver ID:",
			receiverId,
			"User ID:",
			userId
		);

		if (!documentId || !receiverId) {
			return res.status(400).json({ message: "Document ID and Receiver ID are required" });
		}

		try {
			const document = await Document.getById(documentId);
			console.log("📄 Document récupéré:", document);

			if (!document) {
				return res.status(404).json({ message: "Document not found" });
			}

			if (!doc.senderId) {
				console.error("❌ ERREUR: doc.senderId est undefined !");
				return res.status(500).json({ message: "Erreur interne: senderId manquant" });
			}

			if (userId !== doc.senderId) {
				return res.status(403).json({ message: "Unauthorized to share this document" });
			}

			if (doc.visibility !== "shared") {
				return res.status(401).json({ message: "This document is not shareable" });
			}

			const data = await DocumentPermission.create(documentId, receiverId);
			return res.status(200).json({ data, message: "Document has been shared successfully" });
		} catch (error) {
			console.error("❌ ERREUR GLOBALE:", error);
			return res.status(500).json({ message: "Internal server error", error });
		}
	};

	update = async (req, res) => {
		const { documentId, addUsers, removeUsers } = req.body;
		const userId = req.user.userId;

		if (!documentId || (!addUsers && !removeUsers)) {
			return res.status(400).json({ message: "Missing parameters" });
		}

		try {
			// Récupérer le document
			const document = await Document.getById(documentId);
			if (!document) {
				return res.status(404).json({ message: "Document not found" });
			}

			// Vérifier que l'utilisateur connecté est bien le propriétaire du document
			if (document.sender_id !== userId) {
				return res.status(403).json({ message: "Unauthorized" });
			}

			await DocumentPermission.update(documentId, addUsers, removeUsers);

			return res.status(200).json({ message: "Permissions updated successfully" });
		} catch (error) {
			console.error("Error updating permissions:", error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	revokeUserPermission = async (req, res) => {
		const { documentId, receiverId } = req.body;
		const requesterId = req.user.userId;

		if (!documentId || !receiverId) {
			return res.status(400).json({ message: "documentId and receiverId are required" });
		}

		try {
			// 1. Vérifie si le document existe et appartient bien au demandeur
			const document = await Document.getById(documentId);
			if (!document || document.length === 0) {
				return res.status(404).json({ message: "Document not found" });
			}

			const { sender_id: senderId, file_path: filePath } = document[0];

			if (requesterId !== senderId) {
				return res
					.status(403)
					.json({ message: "Unauthorized to revoke permission on this document" });
			}

			// 2. Supprime le lien symbolique du côté du receiver
			const sharedPath = path.posix.join(
				"uploads",
				String(receiverId),
				"shared",
				path.basename(filePath)
			);

			if (fs.existsSync(sharedPath) && fs.lstatSync(sharedPath).isSymbolicLink()) {
				fs.unlinkSync(sharedPath);
			}

			// 3. Supprime la permission en base de données
			await DocumentPermission.removePermission(documentId, receiverId);

			return res.status(200).json({
				message: `Access revoked for user ${receiverId}`
			});
		} catch (err) {
			console.error("Error revoking permission:", err);
			return res.status(500).json({ message: "Internal server error" });
		}
	};
}

export default new DocumentPermissionsController();
