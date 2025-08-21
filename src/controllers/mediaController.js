import BaseController from "./baseController.js";
import Media from "../models/mediaModel.js";
import path from "path";
import fs from "fs";

class MediaController extends BaseController {
	constructor() {
		super(Media);
	}

	async delete(req, res) {
		const mediaId = req.params.id;

		try {
			const media = await Media.getById(mediaId);
			if (!media) {
				return res.status(404).json({ message: "Media not found." });
			}

			// Construction du chemin absolu du fichier
			const fullPath = path.resolve(process.cwd(), media.filePath);

			// Suppression physique du fichier s'il existe
			if (fs.existsSync(fullPath)) {
				fs.unlinkSync(fullPath);
			}

			// Suppression de l'entrée en BDD
			await Media.delete(mediaId);

			return res.status(200).json({ message: "Media deleted successfully." });
		} catch (error) {
			console.error("Erreur lors de la suppression du média :", error);
			return res.status(500).json({ message: "internal server error." });
		}
	}
}

export default new MediaController();
