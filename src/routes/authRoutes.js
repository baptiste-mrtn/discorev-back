import express from "express";
import AuthController from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticateToken, AuthController.getCurrentUser);
router.post("/refresh-token", AuthController.refreshToken);
router.get('/verify', AuthController.verifyToken);

export default router;
