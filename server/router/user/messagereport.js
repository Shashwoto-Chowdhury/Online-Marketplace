const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');
const { tr } = require('zod/v4/locales');

router.post('/upload', authorize, async (req, res) => {
    try{
        const reporterId = req.user.user_id;
        const messageId = req.query.message_id;
        const { reason, details } = req.body;
        if (!messageId || !reason || !details) {
            return res.status(400).json({ error: 'Message ID, reason, and details are required' });
        }
        // Get the reported user_id from the message
        const messageResult = await pool.query(
            `SELECT sender_id FROM "Message" WHERE message_id = $1`,
            [messageId]
        );
        const reportedUserId = messageResult.rows[0]?.sender_id;
        await pool.query(
            `INSERT INTO "MessageReport" (reporter_id, reported_user_id, message_id, reason, details, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [reporterId, reportedUserId, messageId, reason, details, 'pending', new Date()]
        );
        res.status(201).json({ message: 'Message report submitted successfully.' });
    } catch (error) {
        console.error('Error submitting message report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;