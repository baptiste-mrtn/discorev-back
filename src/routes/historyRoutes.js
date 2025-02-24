import express  from 'express';
import HistoryController  from '../controllers/historyController.js';
import authenticateToken  from '../middlewares/authMiddleware.js';

const router = express.Router();

// Log a new action
router.post('/log', authenticateToken, HistoryController.logAction);

// Get history for a specific user
router.get('/user/:userId', authenticateToken, HistoryController.getUserHistory);

// Get all history
router.get('/all', authenticateToken, HistoryController.getAllHistory);

// Delete a specific history entry
router.delete('/:historyId', authenticateToken, HistoryController.deleteHistory);

export default router;
