const express= require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/:productId', authorize, async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.user_id;

    try {
        const productResult = await pool.query('SELECT p.product_id,p.seller_id,p.title,p.description,p.price,p.quantity,p.location,c.name as category,s.name as sub_category,b.name as brand, u.name as seller_name, u.image_url as seller_image FROM "Product" p JOIN "Category" c on p.category_id=c.category_id join "SubCategory" s on p.sub_category_id=s.sub_category_id join "Brand" b on p.brand_id=b.brand_id JOIN "User" u ON p.seller_id = u.user_id WHERE p.product_id = $1', [productId]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = productResult.rows[0];
        const sellerId = product.seller_id;
        const images = await pool.query('SELECT image_url FROM "ProductImage" WHERE product_id = $1', [productId]);

        if(sellerId != userId){
            const percentageResult = await pool.query(`SELECT o.percentage
                                                        FROM "PremiumBuy" pr 
                                                        JOIN "Offer" o on pr.offer_id = o.offer_id
                                                        JOIN "Company" c on o.company_id = c.company_id
                                                        WHERE c.user_id = $1 AND pr.buyer_id = $2
                                                        ORDER BY o.percentage DESC;`, [sellerId, userId]);
            product.offer_percentage = percentageResult.rows.length > 0 ? percentageResult.rows[0].percentage : 0;
        }

        product.images = images.rows.map(row => row.image_url);
        res.json(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;