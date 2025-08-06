import RecruiterTeamMember from "../models/recruiterTeamMemberModel.js";

const RecruiterTeamMemberController = {
	async getTeamMembers(req, res) {
		try {
			const recruiterId = req.params.id;
			const members = await RecruiterTeamMember.getMembersByRecruiterId(recruiterId);
			res.status(200).json(members);
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Erreur serveur" });
		}
	},

	async addTeamMember(req, res) {
		try {
			const recruiterId = req.params.id;
			const { name, email, role } = req.body;

			if (!name) {
				return res.status(400).json({ message: "Champs requis manquants" });
			}
			console.log("req.body : ");
			console.log(req.body);
			await RecruiterTeamMember.createMember({ recruiterId, name, email, role });
			res.status(201).json({ message: "Membre ajouté avec succès" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Erreur serveur" });
		}
	},

	async addTeamMembersBulk(req, res) {
		try {
			const recruiterId = req.params.id;
			const { members } = req.body;

			if (!Array.isArray(members) || members.length === 0) {
				return res.status(400).json({ message: "Liste vide" });
			}

			await RecruiterTeamMember.createMembersBulk(recruiterId, members);
			res.status(201).json({ message: "Membres ajoutés avec succès" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Erreur serveur" });
		}
	},

	async updateTeamMember(req, res) {
		try {
			const memberId = req.params.memberId;
			const { name, email, role } = req.body;

			if (!name && !email && !role) {
				return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
			}

			const updates = {
				...(name && { name }),
				...(email && { email }),
				...(role && { role })
			};

			const affected = await RecruiterTeamMember.updateMember(memberId, updates);
			if (affected === 0) {
				return res.status(404).json({ message: "Membre non trouvé" });
			}

			res.status(200).json({ message: "Membre mis à jour avec succès" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Erreur serveur" });
		}
	},

	async deleteTeamMember(req, res) {
		try {
			const memberId = req.params.memberId;

			const affected = await RecruiterTeamMember.deleteMember(memberId);
			if (affected === 0) {
				return res.status(404).json({ message: "Membre non trouvé" });
			}

			res.status(200).json({ message: "Membre supprimé avec succès" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Erreur serveur" });
		}
	}
};

export default RecruiterTeamMemberController;
