import Document from "../models/documentModel.js";
import conversion from "../utils/conversion.js";
import path from "path";
import fs from "fs/promises";

const DocumentController = {
	async uploadDocument(req, res) {
		const { title, type, visibility, receiverId } = req.body;
		const user = req.user;
		const senderId = user.id;
		const senderType = user["account_type"];
		const filePath = req.file ? req.file.path : null;

		if (!filePath) {
			return res.status(400).json({ message: "Missing file path" });
		}

		if (!filePath || !title || !type || !visibility) {
			return res.status(400).json({ message: "All fields are required" });
		}

		if (!["candidate", "recruiter"].includes(senderType)) {
			return res.status(400).json({ message: "Invalid sender type" });
		}

		if (!["public", "private", "shared"].includes(visibility)) {
			return res.status(400).json({ message: "Invalid visibility" });
		}

		try {
			const documentId = await Document.createDocument({
				senderId,
				senderType,
				title,
				type,
				visibility,
				filePath
			});

			if (visibility === "shared" && receiverId) {
				await Document.addPermission({
					documentId,
					receiverId
				});
			}

			return res.status(201).json({
				message: "Document uploaded successfully",
				data: { documentId, title, type, visibility, filePath }
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async downloadDocument(req, res) {
		const documentId = req.params.documentId;
		const user = req.user || null; // L'utilisateur peut être null si non connecté

		console.log("User:", user); // Vérifie si l'utilisateur est bien récupéré
		console.log("Document ID:", documentId); // Vérifie si l'ID du document est bien récupéré

		try {
			const doc = await Document.getDocumentsById(documentId);

			console.log("Document:", doc); // Vérifie si le document est bien récupéré

			if (!doc) {
				return res.status(404).json({ message: "Document not found" });
			}

			// Vérification des permissions
			const isOwner = user && doc.sender_id === user.userId;
			const isSharedWithUser =
				user && (await Document.isUserAuthorized(documentId, user.userId));
			const isPublic = doc.visibility === "public";

			if (
				(doc.visibility === "private" && !isOwner) || // Seul le propriétaire peut voir un document privé
				(doc.visibility === "shared" && !isOwner && !isSharedWithUser) // Partagé mais non autorisé
			) {
				return res
					.status(403)
					.json({ message: "You are not authorized to access this document" });
			}

			// Chemin du fichier à télécharger
			const filePath = doc.file_path; // Assure-toi que `file_path` est bien stocké en base de données
			if (!filePath) {
				return res.status(500).json({ message: "File path not found for this document" });
			}

			// Télécharger le fichier
			return res.download(filePath, doc.file_name, (err) => {
				if (err) {
					console.error("Error sending file:", err);
					return res.status(500).json({ message: "Error downloading document" });
				}
			});
		} catch (error) {
			console.error("Error in downloadDocument:", error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getUserDocuments(req, res) {
		const senderId = req.params.senderId;

		try {
			const documents = await Document.getDocumentsBySenderId(senderId);
			return res.status(200).json(documents);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error", data: error });
		}
	},

	async deleteDocument(req, res) {
		const { documentId } = req.body;
		const userId = req.user.id;

		if (!documentId) {
			return res.status(400).json({ message: "Document ID is required" });
		}

		try {
			const document = await Document.getDocumentsById(documentId);
			if (!document) {
				return res.status(404).json({ message: "Document not found" });
			}

			const { sender_id: senderId, file_path: filePath } = document;

			if (userId !== senderId) {
				return res.status(403).json({ message: "Unauthorized" });
			}

			const sharedUsers = await Document.getSharedUsersByDocumentId(documentId);
			const deletedForUsers = [];

			for (const user of sharedUsers) {
				const sharedPath = path.join(
					"uploads",
					String(user.receiver_id),
					"shared",
					path.basename(filePath)
				);

				if (fs.existsSync(sharedPath) && fs.lstatSync(sharedPath).isSymbolicLink()) {
					fs.unlinkSync(sharedPath);
					deletedForUsers.push(`${user.first_name} ${user.last_name}`);
				}
			}

			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}

			await Document.deleteDocumentPermissions(documentId);

			return res.status(200).json({
				message: "Document and symbolic links deleted successfully",
				deletedForUsers
			});
		} catch (err) {
			console.error("Error deleting document:", err);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async deleteAllUserFiles(userId) {
		const userPath = path.join(`uploads/${userId}`);

		if (fs.existsSync(userPath)) {
			fs.rmSync(userPath, { recursive: true, force: true }); // Supprime le dossier et tout son contenu
		}
	},

	// Permissions

	async addDocumentPermission(req, res) {
		const { documentId, receiverId } = req.body;

		if (!documentId || !receiverId) {
			return res.status(400).json({ message: "Document ID and Receiver ID are required" });
		}

		try {
			const permissionId = await Document.addPermission({ documentId, receiverId });
			return res.status(201).json({ message: "Permission added successfully", permissionId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getDocumentPermissions(req, res) {
		const documentId = req.params.documentId;

		try {
			const permissions = await Document.getDocumentPermissions(documentId);
			return res.status(200).json(permissions);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
};

export default DocumentController;
