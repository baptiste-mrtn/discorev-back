import dbHelpers from '../helpers/dbHelpers.js';

const Conversation = {
    async createConversation(participant1Id, participant2Id) {
        return await dbHelpers.dbInsert('conversations', {
            participant1Id,
            participant2Id
        });
    },

    async getConversationsByUserId(userId) {
        // Requête complexe, on garde le SQL direct
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
        // Requête complexe, on garde le SQL direct
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
