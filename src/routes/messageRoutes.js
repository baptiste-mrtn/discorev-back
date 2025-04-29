import express from "express";
import MessageController from "../controllers/messageController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Créer ou récupérer une conversation
router.post("/conversation", authenticateToken, MessageController.createOrGetConversation);

// Récupérer les conversations d'un utilisateur
router.get("/user/:userId", authenticateToken, MessageController.getUserConversations);

// Envoyer un message
router.post("/send", authenticateToken, MessageController.sendMessage);

// Récupérer les messages d'une conversation
router.get(
	"/conversation/:conversationId/messages",
	authenticateToken,
	MessageController.getMessages
);

// Marquer les messages comme lus
router.patch(
	"/conversation/:conversationId/read",
	authenticateToken,
	MessageController.markMessagesAsRead
);

export default router;
