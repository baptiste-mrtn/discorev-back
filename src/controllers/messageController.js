import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

const MessageController = {
    async createOrGetConversation(req, res) {
        const { participant1Id, participant2Id } = req.body;

        if (!participant1Id || !participant2Id) {
            return res.status(400).json({ message: 'Both participant IDs are required' });
        }

        try {
            let conversation = await Conversation.findConversation(participant1Id, participant2Id);

            if (!conversation) {
                const conversationId = await Conversation.createConversation(participant1Id, participant2Id);
                conversation = { id: conversationId, participant1_id: participant1Id, participant2_id: participant2Id };
            }

            return res.status(200).json(conversation);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getUserConversations(req, res) {
        const userId = req.params.userId;

        try {
            const conversations = await Conversation.getConversationsByUserId(userId);
            return res.status(200).json(conversations);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async sendMessage(req, res) {
        const { conversationId, senderId, content } = req.body;

        if (!conversationId || !senderId || !content) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            const messageId = await Message.sendMessage(conversationId, senderId, content);
            return res.status(201).json({ message: 'Message sent successfully', messageId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getMessages(req, res) {
        const conversationId = req.params.conversationId;

        try {
            const messages = await Message.getMessagesByConversationId(conversationId);
            return res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async markMessagesAsRead(req, res) {
        const { conversationId } = req.params;
        const userId = req.user.id;

        try {
            await Message.markAsRead(conversationId, userId);
            return res.status(200).json({ message: 'Messages marked as read' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
};

const sendNotification = async (userId, message) => {
    io.to(`user_${userId}`).emit('receiveNotification', message);
};

export default MessageController;
