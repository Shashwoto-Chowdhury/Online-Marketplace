const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');
const { tr } = require('zod/v4/locales');

router.get('/onsellproducts', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await pool.query(`SELECT DISTINCT ON (p.product_id) p.product_id, p.title, p.price, p.location, p.quantity, pi.image_url
                    FROM "Product" p 
                    LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                    WHERE p.quantity > 0 AND p.seller_id = $1`, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching on-sell products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/soldproducts', authorize, async (req, res) => {
    try{
        const userId = req.user.user_id;
        const result = await pool.query(`SELECT DISTINCT ON (p.product_id) sr.sell_id, p.product_id, p.title, p.price, p.location, sr.quantity, pi.image_url
                    FROM "SellRecord" sr
                    JOIN "Product" p ON sr.product_id = p.product_id 
                    LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                    WHERE sr.seller_id = $1`, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sold products:', error);
        res.status(500).json({ error: 'Internal server error' });   
    }
});

router.get('/boughtproducts', authorize, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await pool.query(`SELECT DISTINCT ON (p.product_id) sr.sell_id, p.product_id, p.title, p.price, p.location, sr.quantity, pi.image_url
                    FROM "SellRecord" sr
                    JOIN "Product" p ON sr.product_id = p.product_id 
                    LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                    WHERE sr.buyer_id = $1`, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bought products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
});

router.get('/selldetails', authorize, async (req, res) => {
    try {
        const { sell_id } = req.query;
        const result = await pool.query(`SELECT sr.sell_id, p.product_id, p.title, p.price, p.location, c.name as category, s.name as subcategory, b.name as brand, sr.quantity, sr.selling_price, pi.image_url
                    FROM "SellRecord" sr
                    JOIN "Product" p ON sr.product_id = p.product_id 
                    LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                    LEFT JOIN "Category" c ON p.category_id = c.category_id
                    LEFT JOIN "SubCategory" s ON p.sub_category_id = s.sub_category_id
                    LEFT JOIN "Brand" b ON p.brand_id = b.brand_id
                    WHERE sr.sell_id = $1`, [sell_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sell record not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching sell details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }  
});

module.exports = router;
