import db  from '../config/db.js';

const Document = {
    async createDocument({ senderId, senderType, title, type, visibility, filePath }) {
        const [result] = await db.execute(
            'INSERT INTO documents (sender_id, sender_type, title, type, visibility, file_path) VALUES (?, ?, ?, ?, ?, ?)',
            [senderId, senderType, title, type, visibility, filePath]
        );
        return result.insertId;
    },

    async getDocumentsBySenderId(senderId) {
        const [rows] = await db.execute(
            'SELECT * FROM documents WHERE sender_id = ?',
            [senderId]
        );
        return rows;
    },

    async deleteDocumentById(documentId) {
        await db.execute('DELETE FROM documents WHERE id = ?', [documentId]);
    },

    async addPermission({ documentId, receiverId }) {
        const [result] = await db.execute(
            'INSERT INTO document_permissions (document_id, receiver_id) VALUES (?, ?)',
            [documentId, receiverId]
        );
        return result.insertId;
    },

    async getDocumentPermissions(documentId) {
        const [rows] = await db.execute(
            'SELECT * FROM document_permissions WHERE document_id = ?',
            [documentId]
        );
        return rows;
    },
};

export default Document;