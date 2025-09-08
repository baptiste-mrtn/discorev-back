import BaseModel from "./BaseModel.js";
import db from "../config/db.js";
import path from "path";
import fs from "fs";

class Media extends BaseModel {
	constructor() {
		super("medias");
	}

	async getByUserId(userId) {
		const [rows] = await db.execute(
			`SELECT * FROM ${this.table} WHERE target_type = 'user' AND target_id = ?`,
			[userId]
		);
		return rows;
	}

	async getByTarget(targetType, targetId) {
		const [rows] = await db.execute(
			`SELECT * FROM ${this.table} WHERE target_type = ? AND target_id = ?`,
			[targetType, targetId]
		);
		return rows;
	}

	/**
	 * Supprime tous les médias d’un type spécifique pour un utilisateur (avec suppression physique)
	 */
	async deleteMediaByContext(targetType, targetId, type) {
		// Récupérer tous les médias concernés
		const [medias] = await db.execute(
			`SELECT * FROM ${this.table} WHERE target_type = ? AND target_id = ? AND type = ?`,
			[targetType, targetId, type]
		);

		// Supprimer les fichiers physiques
		for (const media of medias) {
			const fullPath = path.resolve(process.cwd(), media.file_path);
			if (fs.existsSync(fullPath)) {
				fs.unlinkSync(fullPath);
			}
			if (media.thumbnail_path) {
				const thumbPath = path.resolve(process.cwd(), media.thumbnail_path);
				if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
			}
		}

		// Supprimer les entrées en BDD
		await db.execute(
			`DELETE FROM ${this.table} WHERE target_type = ? AND target_id = ? AND type = ?`,
			[targetType, targetId, type]
		);
	}
}

export default new Media();
