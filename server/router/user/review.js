const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/get/buyer', authorize, async (req, res) => {
    const { userId } = req.query;

    try {
        const reviewsResult = await pool.query(`
            SELECT r.review_id, r.reviewer_id, r.review_type, r.rating, r.comment, r.created_at, u.name AS reviewer_username
            FROM "Review" r 
            JOIN "User" u ON r.reviewer_id = u.user_id
            WHERE r.reviewed_person_id = $1 AND r.review_type = 'buyer'
            ORDER BY r.created_at DESC
        `, [userId]);

        if (reviewsResult.rows.length === 0) {
            return res.status(404).json({ message: 'No reviews found' });
        }

        res.json(reviewsResult.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/get/seller', authorize, async (req, res) => {
    const { userId } = req.query;

    try {
        const reviewsResult = await pool.query(`
            SELECT r.review_id, r.reviewer_id, r.review_type, r.rating, r.comment, r.created_at, u.name AS reviewer_username
            FROM "Review" r
            JOIN "User" u ON r.reviewer_id = u.user_id
            WHERE r.reviewed_person_id = $1 AND r.review_type = 'seller'
            ORDER BY r.created_at DESC
        `, [userId]);

        if (reviewsResult.rows.length === 0) {
            return res.status(404).json({ message: 'No reviews found' });
        }

        res.json(reviewsResult.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;