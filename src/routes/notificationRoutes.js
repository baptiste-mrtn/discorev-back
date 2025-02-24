import express  from 'express';
import NotificationController  from '../controllers/notificationController.js';
import authenticateToken  from '../middlewares/authMiddleware.js';

const router = express.Router();

// Créer une notification
router.post('/create', authenticateToken, NotificationController.createNotification);

// Récupérer toutes les notifications d'un utilisateur
router.get('/user/:userId', authenticateToken, NotificationController.getUserNotifications);

// Marquer une notification comme lue
router.patch('/:notificationId/read', authenticateToken, NotificationController.markAsRead);

// Marquer toutes les notifications comme lues
router.patch('/user/:userId/read-all', authenticateToken, NotificationController.markAllAsRead);

// Supprimer une notification
router.delete('/:notificationId', authenticateToken, NotificationController.deleteNotification);

// Supprimer toutes les notifications d'un utilisateur
router.delete('/user/:userId', authenticateToken, NotificationController.deleteAllNotifications);

export default router;
