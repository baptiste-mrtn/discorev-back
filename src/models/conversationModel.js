import db from '../config/db.js';

const Conversation = {
    async createConversation(participant1Id, participant2Id) {
        const [result] = await db.execute(
            'INSERT INTO conversations (participant1_id, participant2_id) VALUES (?, ?)',
            [participant1Id, participant2Id]
        );
        return result.insertId;
    },

    async getConversationsByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT c.*, 
                    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) AS last_message,
                    (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) AS last_message_time
             FROM conversations c
             WHERE c.participant1_id = ? OR c.participant2_id = ?
             ORDER BY last_message_time DESC`,
            [userId, userId]
        );
        return rows;
    },

    async findConversation(participant1Id, participant2Id) {
        const [rows] = await db.execute(
            `SELECT * FROM conversations 
             WHERE (participant1_id = ? AND participant2_id = ?) 
                OR (participant1_id = ? AND participant2_id = ?)`,
            [participant1Id, participant2Id, participant2Id, participant1Id]
        );
        return rows[0];
    },
};

export default Conversation;
