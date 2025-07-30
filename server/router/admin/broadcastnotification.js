const express = require('express');
const router = express.Router();
const adminAuthorize = require('../../middleware/adminauthorize');
const pool = require('../../db');

router.post('/send', adminAuthorize, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        // Insert notification into the database
        const adminId = req.admin.admin_id;
        const result = await pool.query(`
            INSERT INTO "AdminNotification" (content, admin_id, timestamp)
            VALUES ($1, $2, NOW()) RETURNING notification_id
        `, [content, adminId]);
        if (result.rows.length === 0) {
            return res.status(500).json({ error: 'Failed to create notification' });
        }
        // Notify all users (this could be a push notification, email, etc.)
        const userResult = await pool.query(`
            SELECT user_id FROM "User"
        `);
        const userIds = userResult.rows.map(user => user.user_id);
        for (const userId of userIds) {
            // Here you would implement the logic to send the notification to each user
            // This could be a push notification, email, etc.
            const timestamp = new Date().toISOString();
            req.app.get('io')
             .to(`user_${userId}`)
             .emit('newNotification', { content, timestamp });
        }
        return res.status(201).json({ notificationId: result.rows[0].notification_id });
    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/all', adminAuthorize, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT an.*, a.name FROM "AdminNotification" an
            JOIN "Admin" a ON an.admin_id = a.admin_id
            ORDER BY timestamp DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
