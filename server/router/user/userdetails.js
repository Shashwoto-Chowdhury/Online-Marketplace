const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');
const bcrypt = require('bcrypt'); // Add this at the top with other requires

router.get('/', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await pool.query('SELECT name, email, location, status, type, seller_rating(user_id) as "seller_rating", buyer_rating(user_id) as "buyer_rating", sell_count(user_id) as "sell_count", image_url FROM "User" WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
//UPDATE user details
// This endpoint allows users to update their details like name and location.
router.put('/update', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { name, location } = req.body;

        const currentDetails = await pool.query(
            `SELECT NAME, LOCATION FROM "User" WHERE user_id = $1`,
            [userId]
        );
        if(currentDetails.rows[0].name === name && currentDetails.rows[0].location === location) {
            return res.status(400).json({ error: 'No changes detected' });
        }

        const result = await pool.query(
            `UPDATE "User" SET name = $1, location = $2 WHERE user_id = $3 RETURNING *`,
            [name, location, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user details:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/updatepassword', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { current, newPass } = req.body;

        // Verify old password using bcrypt
        const userResult = await pool.query('SELECT password FROM "User" WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(current, userResult.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Old password is incorrect' });
        }

        // Hash new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedNewPass = await bcrypt.hash(newPass, salt);

        await pool.query('UPDATE "User" SET password = $1 WHERE user_id = $2', [hashedNewPass, userId]);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
// This code defines an Express router for user details management.