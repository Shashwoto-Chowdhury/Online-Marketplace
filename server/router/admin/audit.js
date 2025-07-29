const express = require('express');
const router = express.Router();
const adminauthorize = require('../../middleware/adminauthorize');
const pool = require('../../db'); 

router.get('/updateinfo', adminauthorize, async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT us.*, u.name AS user_name
            FROM "UserInfoUpdateLog" us
            JOIN "User" u ON us.user_id = u.user_id
            ORDER BY us.updated_at DESC
            `);

        res.json(result.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/passwordchange', adminauthorize, async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT pc.*, u.name AS user_name
            FROM "PasswordUpdateLog" pc
            JOIN "User" u ON pc.user_id = u.user_id
            ORDER BY pc.update_time DESC
            `);

        res.json(result.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

