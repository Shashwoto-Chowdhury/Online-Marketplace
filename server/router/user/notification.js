const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/productnotifications', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Fetch product notifications for the user
        const notificationsResult = await pool.query(`
            SELECT pn.*, p.title
            FROM "ProductNotification" pn
            JOIN "Product" p ON pn.product_id = p.product_id
            WHERE pn.user_id = $1
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
        // const userId = req.user.user_id;

        // Fetch admin notifications for the user
        const notificationsResult = await pool.query(`
            SELECT an.*, a.name AS admin_name
            FROM "AdminNotification" an
            JOIN "Admin" a ON an.admin_id = a.admin_id
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
router.get('/adminusernotifications', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Fetch notifications sent by the admin
        const notificationsResult = await pool.query(`
            SELECT an.*, a.name AS admin_name
            FROM "AdminUserNotification" an
            JOIN "Admin" a ON an.admin_id = a.admin_id
            WHERE an.user_id = $1
        `, [userId]);

        if (notificationsResult.rows.length === 0) {
            return res.status(404).json({ message: 'No notifications found' });
        }

        res.status(200).json(notificationsResult.rows);
    } catch (err) {
        console.error('Error fetching admin user notifications:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
