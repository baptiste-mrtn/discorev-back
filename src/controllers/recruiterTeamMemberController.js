import RecruiterTeamMember from "../models/recruiterTeamMemberModel.js";
import BaseController from "./baseController.js";

class RecruiterTeamMemberController extends BaseController {
	constructor() {
		super(RecruiterTeamMember); // CRUD générique
	}
	getTeamMembers = async (req, res) => {
		try {
			const recruiterId = req.params.id;
			const members = await RecruiterTeamMember.getGroupedTeamMembers(recruiterId);
			res.status(200).json(members);
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Erreur serveur" });
		}
	};

	addTeamMembersBulk = async (req, res) => {
		try {
			const recruiterId = req.params.id;
			const { members } = req.body;

			if (!Array.isArray(members) || members.length === 0) {
				return res.status(400).json({ message: "Liste vide" });
			}

			await this.model.createMembersBulk(recruiterId, members);
			res.status(201).json({ message: "Membres ajoutés avec succès" });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Erreur serveur" });
		}
	};

	update = async (req, res, next) => {
		try {
			const recruiterId = req.params.id;
			const memberId = req.params.memberId;
			const memberData = req.body; // ou req.body.member si tu l’envoies comme ça

			await this.model.updateByRecruiter(recruiterId, memberId, memberData);

			console.log(`✅ Updated member ${memberId} for recruiter ${recruiterId}`);

			res.status(200).json({
				message: "Updated successfully",
				data: { recruiterId, memberId }
			});
		} catch (err) {
			next(err);
		}
	};
}

export default new RecruiterTeamMemberController();
