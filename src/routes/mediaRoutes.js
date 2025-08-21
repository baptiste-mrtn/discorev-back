import express from "express";
import MediaController from "../controllers/mediaController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:id", MediaController.getOne);
router.delete("/:id", authenticateToken, MediaController.delete);

export default router;
