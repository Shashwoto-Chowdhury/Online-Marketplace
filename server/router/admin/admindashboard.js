const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/adminauthorize');
const pool = require('../../db');

router.get('/usercount', authorize, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM "User"');
        res.json({ userCount: result.rows[0].count });
    } catch (err) {
        console.error('Error fetching user count:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.get('/productcount', authorize, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM "Product"');
        res.json({ productCount: result.rows[0].count });
    } catch (err) {
        console.error('Error fetching product count:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.get('/soldproductcount', authorize, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM "SellRecord"');
        res.json({ soldProductCount: result.rows[0].count });
    } catch (err) {
        console.error('Error fetching sold product count:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;