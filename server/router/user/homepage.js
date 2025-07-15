const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/nearbyproducts', authorize, async (req, res) => {
  try {
    const loc = await pool.query('SELECT location FROM "User" WHERE user_id = $1', [req.user.user_id]);
    const userLocation = loc.rows[0].location;
    const { category_id, sub_category_id, brand_id, min_price, max_price, page, limit } = req.query;
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const offset   = (pageNum - 1) * limitNum;

    let query  = `SELECT DISTINCT ON (p.product_id)
                     p.product_id, p.title, p.price, p.location, pi.image_url
                  FROM "Product" p
                  LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                  WHERE p.quantity > 0 AND p.location = $1`;
    const values = [userLocation];
    let idx = 2;

    if (category_id)      { query += ` AND p.category_id = $${idx}`;      values.push(category_id); idx++; }
    if (sub_category_id)  { query += ` AND p.sub_category_id = $${idx}`;  values.push(sub_category_id); idx++; }
    if (brand_id)         { query += ` AND p.brand_id = $${idx}`;         values.push(brand_id); idx++; }
    if (min_price)        { query += ` AND p.price >= $${idx}`;          values.push(min_price); idx++; }
    if (max_price)        { query += ` AND p.price <= $${idx}`;          values.push(max_price); idx++; }

    // exclude own products
    query += ` AND p.seller_id != $${idx}`; values.push(req.user.user_id); idx++;

    // add ordering, paging
    query += ` ORDER BY p.product_id`;
    query += ` OFFSET $${idx} LIMIT $${idx + 1}`;
    values.push(offset, limitNum);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/companyproducts', authorize, async (req, res) => {
  try {
    const { category_id, sub_category_id, brand_id, min_price, max_price, page, limit } = req.query;
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const offset   = (pageNum - 1) * limitNum;

    let query  = `SELECT DISTINCT ON (p.product_id)
                     p.product_id, p.title, p.price, p.location, pi.image_url
                  FROM "Product" p
                  LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                  LEFT JOIN "User" u ON p.seller_id = u.user_id
                  WHERE p.quantity > 0 AND u.type = 'company'`;
    const values = [];
    let idx = 1;

    if (category_id)      { query += ` AND p.category_id = $${idx}`;      values.push(category_id); idx++; }
    if (sub_category_id)  { query += ` AND p.sub_category_id = $${idx}`;  values.push(sub_category_id); idx++; }
    if (brand_id)         { query += ` AND p.brand_id = $${idx}`;         values.push(brand_id); idx++; }
    if (min_price)        { query += ` AND p.price >= $${idx}`;          values.push(min_price); idx++; }
    if (max_price)        { query += ` AND p.price <= $${idx}`;          values.push(max_price); idx++; }

    query += ` AND p.seller_id != $${idx}`; values.push(req.user.user_id); idx++;

    query += ` ORDER BY p.product_id`;
    query += ` OFFSET $${idx} LIMIT $${idx + 1}`;
    values.push(offset, limitNum);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/allproducts', authorize, async (req, res) => {
  try {
    const { category_id, sub_category_id, brand_id, min_price, max_price, page, limit } = req.query;
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const offset   = (pageNum - 1) * limitNum;

    let query  = `SELECT DISTINCT ON (p.product_id)
                     p.product_id, p.title, p.price, p.location, pi.image_url
                  FROM "Product" p
                  LEFT JOIN "ProductImage" pi ON p.product_id = pi.product_id
                  WHERE p.quantity > 0`;
    const values = [];
    let idx = 1;

    if (category_id)      { query += ` AND p.category_id = $${idx}`;      values.push(category_id); idx++; }
    if (sub_category_id)  { query += ` AND p.sub_category_id = $${idx}`;  values.push(sub_category_id); idx++; }
    if (brand_id)         { query += ` AND p.brand_id = $${idx}`;         values.push(brand_id); idx++; }
    if (min_price)        { query += ` AND p.price >= $${idx}`;          values.push(min_price); idx++; }
    if (max_price)        { query += ` AND p.price <= $${idx}`;          values.push(max_price); idx++; }

    query += ` AND p.seller_id != $${idx}`; values.push(req.user.user_id); idx++;

    query += ` ORDER BY p.product_id`;
    query += ` OFFSET $${idx} LIMIT $${idx + 1}`;
    values.push(offset, limitNum);

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
