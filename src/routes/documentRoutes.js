import express  from 'express';
import DocumentController  from '../controllers/documentController.js';
import authenticateToken  from '../middlewares/authMiddleware.js';
import multer  from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', authenticateToken, upload.single('file'), DocumentController.uploadDocument);
router.get('/user/:senderId', authenticateToken, DocumentController.getUserDocuments);
router.delete('/:documentId', authenticateToken, DocumentController.deleteDocument);
router.post('/permissions', authenticateToken, DocumentController.addDocumentPermission);
router.get('/permissions/:documentId', authenticateToken, DocumentController.getDocumentPermissions);

export default router;
