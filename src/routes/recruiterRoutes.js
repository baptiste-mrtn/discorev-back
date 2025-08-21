import express from "express";
import RecruiterController from "../controllers/recruiterController.js";
import RecruiterTeamMemberController from "../controllers/recruiterTeamMemberController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
// Routes utilisateurs
router.get("/", RecruiterController.getAllRecruiters);
router.get("/:id", RecruiterController.getRecruiterById);
router.get("/user/:id", RecruiterController.getRecruiterByUserId);
router.put("/:id", authenticateToken, RecruiterController.updateRecruiter);
router.delete("/:id", authenticateToken, RecruiterController.deleteRecruiter);
router.get("/company/:name", RecruiterController.getRecruiterByCompanyName);

router.get("/:id/team", RecruiterTeamMemberController.getTeamMembers);
router.post("/:id/team", authenticateToken, RecruiterTeamMemberController.addTeamMember);
router.post("/:id/team/bulk", authenticateToken, RecruiterTeamMemberController.addTeamMembersBulk);
router.put(
	"/:id/team/:memberId",
	authenticateToken,
	RecruiterTeamMemberController.updateTeamMember
);
router.delete("/:id/team", authenticateToken, RecruiterTeamMemberController.deleteTeamMember);

export default router;
