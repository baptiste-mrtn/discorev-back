import express from "express";
import UserController from "../controllers/userController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes utilisateurs
router.get("/", authenticateToken, UserController.getAll);
router.get("/:id", authenticateToken, UserController.getOne);
router.get("/email/:email", authenticateToken, UserController.getOneByEmail);
router.put("/:id", authenticateToken, UserController.update);
router.delete("/:id", authenticateToken, UserController.delete);

export default router;
