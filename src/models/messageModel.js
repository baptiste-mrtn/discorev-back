import dbHelpers from '../helpers/dbHelpers.js';

const Message = {
    async sendMessage(conversationId, senderId, content) {
        return await dbHelpers.dbInsert('messages', {
            conversationId,
            senderId,
            content
        });
    },

    async getMessagesByConversationId(conversationId) {
        // Requête complexe, on garde le SQL direct
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
        // Requête complexe, on garde le SQL direct
        await db.execute(
            `UPDATE messages 
             SET is_read = TRUE 
             WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE`,
            [conversationId, userId]
        );
    },
};

export default Message;
