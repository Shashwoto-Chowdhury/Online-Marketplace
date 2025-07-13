const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const upload = require('../../middleware/upload');
const pool = require('../../db');
const fs = require('fs');
const path = require('path');

router.post('/:folder', authorize, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, price, location, category_id, sub_category_id, brand_id, quantity } = req.body;
        const seller_id = req.user.user_id;
        const posted_at = new Date();
        const folder = req.params.folder;

        const parsedPrice = Number(price);
        const parsedCategory = parseInt(category_id);
        const parsedSubcategory = parseInt(sub_category_id);
        const parsedBrand = parseInt(brand_id);
        const parsedQuantity = parseInt(quantity);
        console.log("check: ", { category_id, sub_category_id, brand_id, price, quantity });
        console.log("Check: ", { parsedCategory, parsedSubcategory, parsedBrand, parsedPrice, parsedQuantity });
        // 1. Insert product into "Product" table
        const productResult = await pool.query(`INSERT INTO "Product" (title, description, price, location, category_id, sub_category_id, brand_id, seller_id, quantity, posted_at)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING product_id`, [title, description, parsedPrice, location, parsedCategory, parsedSubcategory, parsedBrand, seller_id, parsedQuantity, posted_at]);

        const product_id = productResult.rows[0].product_id;

        // 2. Save uploaded image URLs to "ProductImage"
        const imageUrls = req.files.map(file => `/images/${folder}/${file.filename}`);

        const imageQueries = imageUrls.map(url => {
            return pool.query(`INSERT INTO "ProductImage" (product_id, image_url)VALUES ($1, $2)`, [product_id, url]);
        });

        await Promise.all(imageQueries);

        res.status(201).json({ message: "Product created", product_id, imageUrls });
    } catch (err) {
        console.error('Product creation error:', err);
        // If an error occurs, delete the uploaded files as it is already uploaded
        if (req.files) {
            const folder = req.params.folder;
            req.files.forEach(file => {
                const fullPath = path.join(__dirname, '..', '..', 'public', 'images', folder, file.filename);
                fs.unlink(fullPath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                    else console.log('Deleted file:', file.filename);
                });
            });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
