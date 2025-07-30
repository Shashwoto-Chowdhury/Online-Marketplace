const express = require('express');
const router = express.Router();
const adminAuthorize = require('../../middleware/adminauthorize');
const pool = require('../../db');

router.get('/', adminAuthorize, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, name, type, status FROM "User"
        `);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching user list:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;