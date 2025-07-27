const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.post('/upload', authorize, async (req, res) => {
    const { title, description, location, category_id, sub_category_id, brand_id } = req.body;
    const requester_id = req.user.user_id;
    const posted_at = new Date();
    const parsedCategory = parseInt(category_id);
    const parsedSubcategory = parseInt(sub_category_id);
    const parsedBrand = parseInt(brand_id);

    try {
        // 1. Insert product request into "ProductRequest" table
        const requestResult = await pool.query(`INSERT INTO "ProductRequest" (title, description, location, category_id, sub_category_id, brand_id, requester_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING request_id`, [title, description, location, parsedCategory, parsedSubcategory, parsedBrand, requester_id, posted_at]);
        
        const request_id = requestResult.rows[0].request_id;

        res.status(201).json({ message: "Product request created", request_id });
    } catch (err) {
        console.error('Product request creation error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/', authorize, async (req, res) => {
    try {
        const requester_id = req.user.user_id;
        const requests = await pool.query(`SELECT request_id, title, description, location FROM "ProductRequest" WHERE requester_id = $1`, [requester_id]);
        res.status(200).json(requests.rows);
    } catch (err) {
        console.error('Error fetching product requests:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.get('/all', authorize, async (req, res) => {
    try {
        const requests = await pool.query(`SELECT request_id, title, description, location FROM "ProductRequest" WHERE requester_id != $1`, [req.user.user_id]);
        res.status(200).json(requests.rows);
    } catch (err) {
        console.error('Error fetching all product requests:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.get('/details', authorize, async (req, res) => {
    try {
        const { request_id } = req.query;
        const requestDetails = await pool.query(`SELECT p.request_id, p.requester_id, p.title, p.description, p.location, c.name as category, s.name as sub_category, b.name as brand, u.name as requester_name FROM "ProductRequest" p JOIN "User" u ON p.requester_id = u.user_id JOIN "Category" c ON p.category_id = c.category_id JOIN "SubCategory" s ON p.sub_category_id = s.sub_category_id JOIN "Brand" b ON p.brand_id = b.brand_id WHERE p.request_id = $1`, [request_id]);

        if (requestDetails.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.status(200).json(requestDetails.rows[0]);
    } catch (err) {
        console.error('Error fetching product request details:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.delete('/delete', authorize, async (req, res) => {
    try {
        const { request_id } = req.query;
        await pool.query(`DELETE FROM "ProductRequest" WHERE request_id = $1 AND requester_id = $2`, [request_id, req.user.user_id]);
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (err) {
        console.error('Error deleting product request:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;