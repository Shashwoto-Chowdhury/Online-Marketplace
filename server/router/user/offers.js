const express = require('express'); 
const router = express.Router();
const authorize = require('../../middleware/authorize');
const pool = require('../../db');

router.get('/get', authorize, async (req, res) => {
    try{
        const userId = req.query.user_id || req.user.user_id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const companyId = await pool.query(`SELECT company_id FROM "Company" WHERE user_id = $1`, [userId]);
        if (companyId.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found for this user' });
        }
        const result = await pool.query(`SELECT * FROM "Offer" WHERE company_id = $1`, [companyId.rows[0].company_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No offers found' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: 'Internal server error' }); 
    }
});

router.post('/create', authorize, async (req, res) => {
  const { percentage, required_buying } = req.body;
  if (!percentage || !required_buying) {
    return res
      .status(400)
      .json({ message: 'Percentage and required buying amount are required' });
  }

  const userId = req.user.user_id;
  let company_id;

  // fetch company_id once, store in outer scope
  try {
    const companyRes = await pool.query(
      `SELECT company_id FROM "Company" WHERE user_id = $1`,
      [userId]
    );
    if (companyRes.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Company not found for this user' });
    }
    company_id = companyRes.rows[0].company_id;
  } catch (error) {
    console.error('Error checking company:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  // now use the company_id variable
  try {
    const result = await pool.query(
      `INSERT INTO "Offer" (company_id, percentage, required_buying)
         VALUES ($1, $2, $3) RETURNING *`,
      [company_id, percentage, required_buying]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/update/:offer_id', authorize, async (req, res) => {
    const { offer_id } = req.params;
    const { percentage, required_buying } = req.body;
    if (!offer_id || !percentage || !required_buying) {
        return res.status(400).json({ message: 'Offer ID, percentage, and required buying amount are required' });
    }
    try {
        const result = await pool.query(`UPDATE "Offer" SET percentage = $1, required_buying = $2 WHERE offer_id = $3 RETURNING *`, [percentage, required_buying, offer_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/delete/:offer_id', authorize, async (req, res) => {
    const { offer_id } = req.params;
    if (!offer_id) {
        return res.status(400).json({ message: 'Offer ID is required' });
    }
    try {
        const result = await pool.query(`DELETE FROM "Offer" WHERE offer_id = $1 RETURNING *`, [offer_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;