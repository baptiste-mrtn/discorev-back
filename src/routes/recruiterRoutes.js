import express from "express";
import authenticateToken from "../middlewares/authMiddleware.js";
import RecruiterController from "../controllers/recruiterController.js";
import jobOfferController from "../controllers/jobOfferController.js";
import RecruiterTeamMemberController from "../controllers/recruiterTeamMemberController.js";

const router = express.Router();

// === CRUD générique hérité de BaseController ===
router.get("/:id", RecruiterController.getOne);
router.post("/", authenticateToken, RecruiterController.create);
router.put("/:id", authenticateToken, RecruiterController.update);
router.delete("/:id", authenticateToken, RecruiterController.delete);

// === Routes custom ===
router.get("/", RecruiterController.getAll);
router.get("/company/:name", RecruiterController.getByCompanyName);
router.get("/user/:userId", RecruiterController.getOneByUserId);

// Offres actives d’un recruteur (vitrine publique).
router.get("/:id/job_offers", jobOfferController.listMine);

router.get("/:id/team", RecruiterTeamMemberController.getTeamMembers);
router.post("/:id/team", authenticateToken, RecruiterTeamMemberController.create);
router.post("/:id/team/bulk", authenticateToken, RecruiterTeamMemberController.addTeamMembersBulk);
router.put("/:id/team/:memberId", authenticateToken, RecruiterTeamMemberController.update);
router.delete("/:id/team", authenticateToken, RecruiterTeamMemberController.delete);

export default router;
