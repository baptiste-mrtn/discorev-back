import BaseController from "./baseController.js";
import Media from "../models/mediaModel.js";
import path from "path";
import fs from "fs";

class MediaController extends BaseController {
	constructor() {
		super(Media);
	}

	/**
	 * Récupère tous les médias d'un utilisateur
	 */
	async getAllByUserId(req, res) {
		const userId = parseInt(req.params.userId, 10);
		if (isNaN(userId)) {
			return res.status(400).json({ message: "Invalid userId." });
		}

		try {
			const medias = await Media.getByUserId(userId);
			return res.status(200).json({
				data: medias,
				message: "Medias retrieved successfully."
			});
		} catch (error) {
			console.error("Error retrieving medias by userId:", error);
			return res.status(500).json({ message: "Internal server error." });
		}
	}

	/**
	 * Supprime un média (BDD + fichier physique)
	 */
	async delete(req, res) {
		const mediaId = parseInt(req.params.id, 10);
		if (isNaN(mediaId)) {
			return res.status(400).json({ message: "Invalid mediaId." });
		}

		try {
			const media = await Media.getById(mediaId);
			if (!media) {
				return res.status(404).json({ message: "Media not found." });
			}

			// Suppression du fichier physique
			const fullPath = path.resolve(process.cwd(), media.filePath);
			if (fs.existsSync(fullPath)) {
				fs.unlinkSync(fullPath);
			}

			// Suppression de l'entrée en BDD
			await Media.delete(mediaId);

			return res.status(200).json({ message: "Media deleted successfully." });
		} catch (error) {
			console.error("Error deleting media:", error);
			return res.status(500).json({ message: "Internal server error." });
		}
	}
}

export default new MediaController();
