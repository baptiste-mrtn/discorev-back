import Document from '../models/documentModel.js';

const DocumentController = {
    async uploadDocument(req, res) {
        const { senderId, senderType, title, type, visibility } = req.body;
        const filePath = req.file ? req.file.path : null;

        if (!filePath || !title || !type || !visibility) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!['candidate', 'recruiter'].includes(senderType)) {
            return res.status(400).json({ message: 'Invalid sender type' });
        }

        if (!['public', 'private'].includes(visibility)) {
            return res.status(400).json({ message: 'Invalid visibility' });
        }

        try {
            const documentId = await Document.createDocument({
                senderId,
                senderType,
                title,
                type,
                visibility,
                filePath,
            });
            return res.status(201).json({ message: 'Document uploaded successfully', documentId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getUserDocuments(req, res) {
        const senderId = req.params.senderId;

        try {
            const documents = await Document.getDocumentsBySenderId(senderId);
            return res.status(200).json(documents);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async deleteDocument(req, res) {
        const documentId = req.params.documentId;

        try {
            await Document.deleteDocumentById(documentId);
            return res.status(200).json({ message: 'Document deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async addDocumentPermission(req, res) {
        const { documentId, receiverId } = req.body;

        if (!documentId || !receiverId) {
            return res.status(400).json({ message: 'Document ID and Receiver ID are required' });
        }

        try {
            const permissionId = await Document.addPermission({ documentId, receiverId });
            return res.status(201).json({ message: 'Permission added successfully', permissionId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getDocumentPermissions(req, res) {
        const documentId = req.params.documentId;

        try {
            const permissions = await Document.getDocumentPermissions(documentId);
            return res.status(200).json(permissions);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
};

export default DocumentController;
