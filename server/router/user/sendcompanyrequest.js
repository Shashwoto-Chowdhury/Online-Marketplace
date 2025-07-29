const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.post('/', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const requestedAt = new Date();

        // Check if the user already has a pending request
        const existingRequest = await pool.query(
            `SELECT * FROM "CompanyUpgradeRequest" WHERE user_id = $1 AND status = 'pending'`,
            [userId]
        );
        if (existingRequest.rows.length > 0) {
            return res.status(400).json({ error: 'You already have a pending company upgrade request.' });
        }

        await pool.query(
            `INSERT INTO "CompanyUpgradeRequest" (user_id, requested_at, status) VALUES ($1, $2, $3)`,
            [userId, requestedAt, 'pending']
        );

        res.status(201).json({ message: 'Company upgrade request submitted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;