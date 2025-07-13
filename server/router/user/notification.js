const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/productnotifications', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Fetch product notifications for the user
        const notificationsResult = await pool.query(`
            SELECT DISTINCT ON(p.product_id) p.product_id, p.title, pi.image_url, n.notification_id,n.content, n.created_at
            FROM "ProductNotification" n
            JOIN "Product" p ON n.product_id = p.product_id
            LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
            WHERE n.user_id = $1
        `, [userId]);

        if (notificationsResult.rows.length === 0) {
            return res.status(404).json({ message: 'No product notifications found' });
        }

        res.status(200).json(notificationsResult.rows);
    } catch (err) {
        console.error('Error fetching product notifications:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.get('/adminnotifications', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Fetch admin notifications for the user
        const notificationsResult = await pool.query(`
            SELECT notification_id, content, created_at
            FROM "AdminNotification"
        `);

        if (notificationsResult.rows.length === 0) {
            return res.status(404).json({ message: 'No admin notifications found' });
        }

        res.status(200).json(notificationsResult.rows);
    } catch (err) {
        console.error('Error fetching admin notifications:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
