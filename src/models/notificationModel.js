import db  from '../config/db.js';

const Notification = {
    async createNotification({ userId, relatedId, relatedType, type, message }) {
        const [result] = await db.execute(
            `INSERT INTO notifications (user_id, related_id, related_type, type, message) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, relatedId, relatedType, type, message]
        );
        return result.insertId;
    },

    async getNotificationsByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    },

    async markNotificationAsRead(notificationId) {
        await db.execute(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE id = ?`,
            [notificationId]
        );
    },

    async markAllNotificationsAsRead(userId) {
        await db.execute(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );
    },

    async deleteNotification(notificationId) {
        await db.execute(
            `DELETE FROM notifications 
             WHERE id = ?`,
            [notificationId]
        );
    },

    async deleteAllNotifications(userId) {
        await db.execute(
            `DELETE FROM notifications 
             WHERE user_id = ?`,
            [userId]
        );
    },
};

export default Notification;
