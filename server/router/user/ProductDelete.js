const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');
const fs = require('fs');
const path = require('path');

router.delete('/', authorize, async (req, res) => {
    try {
        const { product_id } = req.query;
        const userId = req.user.user_id;

        // 1. Get image URLs for the product
        const imagesResult = await pool.query(
            `SELECT image_url FROM "ProductImage" WHERE product_id = $1`,
            [product_id]
        );
        const imageUrls = imagesResult.rows.map(row => row.image_url);

        // 2. Delete the product (and images from DB if ON DELETE CASCADE is set)
        const result = await pool.query(
            `DELETE FROM "Product" WHERE product_id = $1 AND seller_id = $2`,
            [product_id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }

        // 3. Delete image files from disk
        imageUrls.forEach(imgUrl => {
            // imgUrl should be like '/images/products/filename.jpg'
            const filePath = path.join(__dirname, '..', '..', 'public', imgUrl);
            fs.unlink(filePath, err => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete image file:', filePath, err);
                }
            });
        });

        res.status(200).json({ message: 'Product and images deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        if (err.code === 'P0001') {
            console.log(err.message);
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});
module.exports = router;