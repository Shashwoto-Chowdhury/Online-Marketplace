const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.post('/upload', authorize, async (req, res) => {
    try {
        const reporter_id = req.user.user_id;
        const { product_id, reason, details } = req.body;
        const created_at = new Date();

        // Get the seller_id (reported_user_id) for the product
        const productResult = await pool.query(
            `SELECT seller_id FROM "Product" WHERE product_id = $1`,
            [product_id]
        );
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const reported_user_id = productResult.rows[0].seller_id;

        await pool.query(
            `INSERT INTO "ProductReport" 
                (reporter_id, reported_user_id, product_id, reason, details, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [reporter_id, reported_user_id, product_id, reason, details, 'pending', created_at]
        );

        res.status(201).json({ message: 'Product report submitted successfully.' });
    } catch (error) {
        console.error('Error submitting product report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
