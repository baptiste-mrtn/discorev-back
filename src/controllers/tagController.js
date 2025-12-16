import db from "../config/db.js";

class TagController {
	// GET /tags/approved
	getApprovedOnly = async (req, res, next) => {
		try {
			const [rows] = await db.query(`
			SELECT 
				tc.id AS category_id,
				tc.name AS category_name,
				t.id AS tag_id,
				t.name AS tag_name
			FROM tag_categories tc
			LEFT JOIN tags t ON t.category_id = tc.id
			WHERE t.approved = 1
			ORDER BY tc.name, t.name
		`);

			const grouped = {};
			for (const r of rows) {
				if (!grouped[r.category_name]) grouped[r.category_name] = [];
				if (r.tag_name) grouped[r.category_name].push(r.tag_name);
			}

			res.status(200).json({ message: "Retrieved approved tags only", data: grouped });
		} catch (err) {
			next(err);
		}
	};

	// GET /tags/admin
	getAllForAdmin = async (req, res, next) => {
		try {
			const [rows] = await db.query(`
			SELECT 
				tc.id AS category_id,
				tc.name AS category_name,
				t.id AS tag_id,
				t.name AS tag_name,
				t.slug AS tag_slug,
				t.approved
			FROM tag_categories tc
			LEFT JOIN tags t ON t.category_id = tc.id
			ORDER BY tc.name, t.name
		`);

			const grouped = {};
			for (const r of rows) {
				if (!grouped[r.category_name]) grouped[r.category_name] = [];
				if (r.tag_name) {
					grouped[r.category_name].push({
						id: r.tag_id,
						name: r.tag_name,
						slug: r.tag_slug,
						approved: !!r.approved
					});
				}
			}

			res.status(200).json({ message: "Retrieved all tags (admin)", data: grouped });
		} catch (err) {
			next(err);
		}
	};

	// GET /tags/recruiter/:id
	getByRecruiterId = async (req, res, next) => {
		try {
			const recruiterId = req.params.recruiterId;
			const [rows] = await db.query(
				`SELECT 
					t.name AS tag_name,
					tc.name AS category_name
				FROM recruiter_tag rt
				JOIN tags t ON rt.tag_id = t.id
				JOIN tag_categories tc ON t.category_id = tc.id
				WHERE rt.recruiter_id = ?`,
				[recruiterId]
			);

			const grouped = {};
			for (const r of rows) {
				if (!grouped[r.category_name]) grouped[r.category_name] = [];
				grouped[r.category_name].push(r.tag_name);
			}

			res.status(200).json({ message: "Retrieved successfully", data: grouped });
		} catch (err) {
			next(err);
		}
	};

	// POST /tags/recruiter/:id
	async setRecruiterTags(req, res, next) {
		const { recruiterId } = req.params;
		const { tags } = req.body; // tableau de noms de tags
		if (!Array.isArray(tags)) {
			return res.status(400).json({ message: "Invalid tags format" });
		}

		try {
			const conn = await db.getConnection();
			await conn.beginTransaction();

			for (const tagName of tags) {
				const cleanName = tagName.trim();
				if (cleanName.length < 2 || cleanName.length > 30) continue;
				if (/[^a-zA-ZÀ-ÿ0-9\s\-\']/g.test(cleanName)) continue;

				const slug = cleanName.toLowerCase().replace(/\s+/g, "-");

				// Vérifie si le tag existe déjà
				const [existing] = await conn.query(`SELECT id FROM tags WHERE slug = ?`, [slug]);
				let tagId;

				if (existing.length) {
					tagId = existing[0].id;
				} else {
					// Si le tag n'existe pas, on le crée avec approved = 0 (à valider)
					const [result] = await conn.query(
						`INSERT INTO tags (name, slug, approved) VALUES (?, ?, 0)`,
						[cleanName, slug]
					);
					tagId = result.insertId;
				}

				// Vérifie si le lien recruteur_tag existe déjà
				const [link] = await conn.query(
					`SELECT * FROM recruiter_tag WHERE recruiter_id = ? AND tag_id = ?`,
					[recruiterId, tagId]
				);

				if (!link.length) {
					await conn.query(
						`INSERT INTO recruiter_tag (recruiter_id, tag_id) VALUES (?, ?)`,
						[recruiterId, tagId]
					);
				}
			}

			await conn.commit();
			conn.release();
			res.status(200).json({ message: "Tags updated successfully" });
		} catch (err) {
			next(err);
		}
	}

	async approveTag(req, res, next) {
		const { id } = req.params;

		try {
			// 1️⃣ Récupérer l'état actuel
			const [[tag]] = await db.query("SELECT approved FROM tags WHERE id = ?", [id]);

			if (!tag) {
				return res.status(404).json({ message: "Tag not found" });
			}

			// 2️⃣ Toggle
			const newValue = !tag.approved;

			await db.query("UPDATE tags SET approved = ? WHERE id = ?", [newValue, id]);

			// 3️⃣ Retourner le nouvel état
			res.status(200).json({ approved: newValue });
		} catch (err) {
			next(err);
		}
	}
}

export default new TagController();
