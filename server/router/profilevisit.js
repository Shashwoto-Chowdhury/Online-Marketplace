const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:userId', async (req, res) => {
  try {
    // parse and validate userId param
    const rawId = req.params.userId;
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    // fetch user basic info + calc fields
    const userRes = await pool.query(
      `SELECT 
         name, email, location, status, type,
         seller_rating(user_id)   AS seller_rating,
         buyer_rating(user_id)    AS buyer_rating,
         sell_count(user_id)      AS sell_count,
         image_url
       FROM "User"
       WHERE user_id = $1`,
      [userId]
    );
    if (!userRes.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];

    // fetch reviews for this user
    const revRes = await pool.query(
      `SELECT 
         r.review_id,
         r.reviewer_id,
         u.name    AS reviewer_username,
         r.review_type,
         r.rating,
         r.comment,
         r.created_at
       FROM "Review" r
       JOIN "User" u
         ON r.reviewer_id = u.user_id
       WHERE r.reviewed_person_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      ...user,
      reviews: revRes.rows
    });
  } catch (error) {
    console.error('Error fetching profile visit:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;