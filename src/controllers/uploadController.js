// controllers/uploadController.js
import Document from "../models/documentModel.js";
import Media from "../models/mediaModel.js";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import sharp from "sharp";

// Génère une miniature d'image
const generateImageThumbnail = async (filePath) => {
	const thumbPath = filePath.replace(/(\.\w+)$/, "_thumb$1");
	await sharp(filePath).resize(300).toFile(thumbPath);
	return thumbPath;
};

// Génère une miniature de vidéo
const generateVideoThumbnail = (filePath) => {
	const thumbPath = filePath.replace(/\.\w+$/, "_thumb.jpg");
	return new Promise((resolve, reject) => {
		ffmpeg(filePath)
			.on("end", () => resolve(thumbPath))
			.on("error", reject)
			.screenshots({
				timestamps: ["00:00:01"],
				filename: path.basename(thumbPath),
				folder: path.dirname(thumbPath),
				size: "320x?"
			});
	});
};

export const uploadHandler = async (req, res, uploadType) => {
	try {
		if (!["document", "media"].includes(uploadType)) {
			return res.status(400).json({ message: "Invalid upload type" });
		}

		const user = req.user;
		const mimeType = req.file?.mimetype;
		const rawFilePath = req.file?.path;
		if (!rawFilePath) {
			return res.status(400).json({ message: "Missing file path" });
		}
		// Remplacer tous les backslash par des slash
		const filePath = rawFilePath.replace(/\\/g, "/");

		if (!filePath) {
			return res.status(400).json({ message: "Missing file path" });
		}

		if (uploadType === "document") {
			const { title, type, visibility, receiverId } = req.body;
			if (!title || !type || !visibility) {
				return res.status(400).json({ message: "Missing fields for document" });
			}

			const docId = await Document.createDocument({
				senderId: user.id,
				senderType: user.accountType,
				title,
				type,
				visibility,
				filePath
			});

			if (visibility === "shared" && receiverId) {
				await Document.addPermission({ documentId: docId, receiverId });
			}

			return res.status(201).json({ message: "Document uploaded", data: { docId } });
		} else if (uploadType === "media") {
			const { context, targetType, targetId, type, title = null } = req.body;
			if (!context || !targetType || !targetId || !type) {
				return res.status(400).json({ message: "Missing fields for media" });
			}
			console.log("req.body : ");
			console.log(req.body);

			// Contexts uniques à gérer (ajoute ce dont tu as besoin)
			const uniqueContexts = ["company_logo", "profile_picture"];

			// Si c'est un contexte unique, supprimer l'ancien média avant insertion
			if (uniqueContexts.includes(context)) {
				await Media.deleteMediaByContext(targetType, targetId, type);
			}

			// Générer une miniature si besoin
			let thumbnailPath = null;
			if (mimeType.startsWith("image/")) {
				thumbnailPath = await generateImageThumbnail(filePath);
			} else if (mimeType.startsWith("video/")) {
				thumbnailPath = await generateVideoThumbnail(filePath);
			}

			const mediaId = await Media.createMedia({
				uploaderId: user.id,
				uploaderType: user.accountType,
				targetType,
				targetId,
				type,
				title,
				filePath: filePath,
				context,
				mimeType,
				thumbnailPath,
				visibility: req.body.visibility || "public"
			});
			console.log(mediaId);
			return res.status(201).json({ message: "Media uploaded", data: { mediaId } });
		}

		return res.status(400).json({ message: "Invalid upload type" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Upload failed" });
	}
};
