const express = require('express');
const router = express.Router();
const adminAuthorize = require('../../middleware/adminauthorize');
const pool = require('../../db');

router.post('/', adminAuthorize, async (req, res) => {
    try {
        const { userId } = req.query;

        const result = await pool.query(`
            SELECT * FROM "User" WHERE user_id = $1
        `, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        if (user.status === 'banned') {
            return res.status(400).json({ error: 'User is already banned' });
        }
        await pool.query(`
            UPDATE "User" SET status = 'banned' WHERE user_id = $1
        `, [userId]);

        res.status(200).json({ message: 'User banned successfully' });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/unban', adminAuthorize, async (req, res) => {
    try {
        const { userId } = req.query;

        const result = await pool.query(`
            SELECT * FROM "User" WHERE user_id = $1
        `, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        if (user.status !== 'banned') {
            return res.status(400).json({ error: 'User is not banned' });
        }
        await pool.query(`
            UPDATE "User" SET status = 'active' WHERE user_id = $1
        `, [userId]);

        res.status(200).json({ message: 'User unbanned successfully' });
    } catch (error) {
        console.error('Error unbanning user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;