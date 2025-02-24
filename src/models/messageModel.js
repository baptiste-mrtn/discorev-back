import db from '../config/db.js';

const Message = {
    async sendMessage(conversationId, senderId, content) {
        const [result] = await db.execute(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
            [conversationId, senderId, content]
        );
        return result.insertId;
    },

    async getMessagesByConversationId(conversationId) {
        const [rows] = await db.execute(
            `SELECT m.*, u.name AS sender_name
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.conversation_id = ?
             ORDER BY m.sent_at ASC`,
            [conversationId]
        );
        return rows;
    },

    async markAsRead(conversationId, userId) {
        await db.execute(
            `UPDATE messages 
             SET is_read = TRUE 
             WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE`,
            [conversationId, userId]
        );
    },
};

export default Message;
