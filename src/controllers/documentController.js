import BaseController from "./baseController.js";
import Document from "../models/documentModel.js";
import DocumentPermission from "../models/documentPermissionModel.js";
import path from "path";
import fs from "fs/promises";

class DocumentController extends BaseController {
	constructor() {
		super(Document);
	}

	uploadDocument = async (req, res) => {
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
			const documentId = await Document.create({
				senderId,
				senderType,
				title,
				type,
				visibility,
				filePath
			});

			if (visibility === "shared" && receiverId) {
				await DocumentPermission.create({
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
	};

	downloadDocument = async (req, res) => {
		const documentId = req.params.documentId;
		const user = req.user || null; // L'utilisateur peut être null si non connecté

		try {
			const doc = await Document.getById(documentId);

			if (!doc) {
				return res.status(404).json({ message: "Document not found" });
			}

			// Vérification des permissions
			const isOwner = user && doc.sender_id === user.userId;
			const isSharedWithUser =
				user && (await DocumentPermission.isUserAuthorized(documentId, user.userId));
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
	};

	getUserDocuments = async (req, res) => {
		const senderId = req.params.senderId;

		try {
			const documents = await Document.getBySenderId(senderId);
			return res.status(200).json({ data: documents });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error", data: error });
		}
	};

	deleteDocument = async (req, res) => {
		const { documentId } = req.body;
		const userId = req.user.id;

		if (!documentId) {
			return res.status(400).json({ message: "Document ID is required" });
		}

		try {
			const document = await Document.getById(documentId);
			if (!document) {
				return res.status(404).json({ message: "Document not found" });
			}

			const { sender_id: senderId, file_path: filePath } = document;

			if (userId !== senderId) {
				return res.status(403).json({ message: "Unauthorized" });
			}

			const sharedUsers = await DocumentPermission.getAll(documentId);
			const deletedForUsers = [];

			for (const user of sharedUsers) {
				const sharedPath = path.posix.join(
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

			await DocumentPermission.delete(documentId);

			return res.status(200).json({
				message: "Document and symbolic links deleted successfully",
				deletedForUsers
			});
		} catch (err) {
			console.error("Error deleting document:", err);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	deleteAllUserFiles = async (userId) => {
		const userPath = path.posix.join(`uploads/${userId}`);

		if (fs.existsSync(userPath)) {
			fs.rmSync(userPath, { recursive: true, force: true }); // Supprime le dossier et tout son contenu
		}
	};
}

export default new DocumentController();
