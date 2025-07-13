const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/get', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { category_id, sub_category_id, brand_id, min_price, max_price } = req.query;
        // Fetch wishlist items for the user

        //view wishlist items with filters
        
        let query = `SELECT DISTINCT ON(p.product_id) p.product_id, p.title, p.price, p.location, pi.image_url
            FROM "WishlistItem" w
            JOIN "Product" p ON w.product_id = p.product_id
            LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
            WHERE w.user_id = $1`;
        let values = [userId];
        let index = 2;

        if (category_id) {
            query += ` AND p.category_id = $${index++}`;
            values.push(category_id);
        }
        if (sub_category_id) {
            query += ` AND p.sub_category_id = $${index++}`;
            values.push(sub_category_id);
        }
        if (brand_id) {
            query += ` AND p.brand_id = $${index++}`;
            values.push(brand_id);
        }
        if (min_price) {
            query += ` AND p.price >= $${index++}`;
            values.push(min_price);
        }
        if (max_price) {
            query += ` AND p.price <= $${index++}`;
            values.push(max_price);
        }
        //console.log('Executing query:', query, 'with values:', values);
        const wishlistResult = await pool.query(query, values);

        if (wishlistResult.rows.length === 0) {
            return res.status(404).json({ message: 'Wishlist is empty' });
        }
        console.log(wishlistResult.rows);

        res.status(200).json(wishlistResult.rows);
    } catch (err) {
        console.error('Error fetching wishlist:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.get('/check', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { product_id } = req.query;

        // Check if the product exists in the wishlist
        const existingWishlistItem = await pool.query('SELECT * FROM "WishlistItem" WHERE user_id = $1 AND product_id = $2', [userId, product_id]);
        // If the product is found, return true, otherwise false will show in the frontend
        if (existingWishlistItem.rows.length > 0) {
            return res.status(200).json({ isWishlisted: true });
        } else {
            return res.status(404).json({ isWishlisted: false });
        }
    } catch (err) {
        console.error('Error checking wishlist:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.post('/add', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { product_id } = req.query;

        // Check if the product already exists in the wishlist
        const existingWishlistItem = await pool.query('SELECT * FROM "WishlistItem" WHERE user_id = $1 AND product_id = $2', [userId, product_id]);

        if (existingWishlistItem.rows.length > 0) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }
        const dateAdded = new Date();
        // Add product to wishlist
        await pool.query('INSERT INTO "WishlistItem" (user_id, product_id, added_at) VALUES ($1, $2, $3)', [userId, product_id, dateAdded]);

        res.status(201).json({ message: 'Product added to wishlist' });
    } catch (err) {
        console.error('Error adding to wishlist:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.delete('/remove', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { product_id } = req.query;

        // Check if the product exists in the wishlist
        const existingWishlistItem = await pool.query('SELECT * FROM "WishlistItem" WHERE user_id = $1 AND product_id = $2', [userId, product_id]);

        if (existingWishlistItem.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found in wishlist' });
        }

        // Remove product from wishlist
        await pool.query('DELETE FROM "WishlistItem" WHERE user_id = $1 AND product_id = $2', [userId, product_id]);

        res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;