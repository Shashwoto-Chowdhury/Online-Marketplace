const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/nearbyproducts', authorize, async (req, res) => {
    try {
        const loc = await pool.query('SELECT location FROM "User" WHERE user_id = $1', [req.user.user_id]);
        const userLocation = loc.rows[0].location;
        const { category_id, sub_category_id, brand_id, min_price, max_price } = req.query;

        let query = `SELECT DISTINCT ON (p.product_id) p.product_id, p.title, p.price, p.location, pi.image_url FROM "Product" p LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id WHERE quantity>0 AND location = $1`;
        let values = [userLocation];
        let index = 2;
        // Add filters based on query parameters
        if (category_id) {
            query += ` AND category_id = $${index++}`;
            values.push(category_id);
        }
        if (sub_category_id) {
            query += ` AND sub_category_id = $${index++}`;
            values.push(sub_category_id);
        }
        if (brand_id) {
            query += ` AND brand_id = $${index++}`;
            values.push(brand_id);
        }

        if (min_price) {
            query += ` AND price >= $${index++}`;
            values.push(min_price);
        }

        if (max_price) {
            query += ` AND price <= $${index++}`;
            values.push(max_price);
        }
        query += ` AND p.seller_id != $${index++}`; // Exclude products from the same user
        values.push(req.user.user_id);
        // Execute the query
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/companyproducts', authorize, async (req, res) => {
    try {
        const { category_id, sub_category_id, brand_id, min_price, max_price } = req.query;
        // Fetch products from companies, excluding the current user's products
        let query = `SELECT distinct on(p.product_id) p.product_id, p.title, p.price, p.location, pi.image_url
                    FROM "Product" p 
                    LEFT JOIN "ProductImage" pi on p.product_id=pi.product_id
                    LEFT JOIN "User" u on p.seller_id=u.user_id
                    WHERE p.quantity>0 AND u.type='company'`;
        let values = [];
        let index = 1;

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
        query += ` AND p.seller_id != $${index++}`; // Exclude products from the same user
        values.push(req.user.user_id);

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/allproducts', authorize, async (req, res) => {
    try {
        const { category_id, sub_category_id, brand_id, min_price, max_price } = req.query;

        let query = `SELECT DISTINCT ON (p.product_id) p.product_id, p.title, p.price, p.location, pi.image_url
                    FROM "Product" p 
                    LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                    WHERE p.quantity > 0`;
        let values = [];
        let index = 1;

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
        query += ` AND p.seller_id != $${index++}`; // Exclude products from the same user
        values.push(req.user.user_id);

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Filter endpoints for categories, subcategories, and brands
router.get('/filter/categories', authorize, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Category"');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/filter/subcategories', authorize, async (req, res) => {
    try {
        const { category_id } = req.query;
        if (!category_id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }
        const result = await pool.query('SELECT * FROM "SubCategory" WHERE category_id = $1', [category_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching subcategories:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/filter/brands', authorize, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Brand"');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching brands:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
