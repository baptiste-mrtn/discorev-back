import Notification from '../models/notificationModel.js';

const NotificationController = {
    async createNotification(req, res) {
        const { userId, relatedId, relatedType, type, message } = req.body;

        if (!userId || !type || !message) {
            return res.status(400).json({ message: 'User ID, type, and message are required' });
        }

        try {
            const notificationId = await Notification.createNotification({
                userId,
                relatedId,
                relatedType,
                type,
                message,
            });
            return res.status(201).json({ message: 'Notification created successfully', notificationId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async getUserNotifications(req, res) {
        const userId = req.params.userId;

        try {
            const notifications = await Notification.getNotificationsByUserId(userId);
            return res.status(200).json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async markAsRead(req, res) {
        const notificationId = req.params.notificationId;

        try {
            await Notification.markNotificationAsRead(notificationId);
            return res.status(200).json({ message: 'Notification marked as read' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async markAllAsRead(req, res) {
        const userId = req.params.userId;

        try {
            await Notification.markAllNotificationsAsRead(userId);
            return res.status(200).json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async deleteNotification(req, res) {
        const notificationId = req.params.notificationId;

        try {
            await Notification.deleteNotification(notificationId);
            return res.status(200).json({ message: 'Notification deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    async deleteAllNotifications(req, res) {
        const userId = req.params.userId;

        try {
            await Notification.deleteAllNotifications(userId);
            return res.status(200).json({ message: 'All notifications deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
};

export default NotificationController;
