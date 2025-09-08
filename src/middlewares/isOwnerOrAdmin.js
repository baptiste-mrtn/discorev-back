import JobOffer from "../models/jobOfferModel.js";
import Recruiter from "../models/recruiterModel.js";

const isOwnerOrAdmin = async (req, res, next) => {
	try {
		const offerId = req.params.id;
		const offer = await JobOffer.getById(offerId);
		const recruiter = await Recruiter.getByUserId(req.user.id);

		if (!offer) {
			return res.status(404).json({ message: "Offer not found" });
		}

		const isOwner =
			req.user.accountType === "admin" ||
			(req.user.accountType === "recruiter" && offer.recruiterId === recruiter.id);

		if (!isOwner) {
			return res.status(403).json({ message: "Forbidden" });
		}

		// Si tout va bien, on passe
		next();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export default isOwnerOrAdmin;
