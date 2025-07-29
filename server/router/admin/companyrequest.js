const express = require('express');
const router = express.Router();
const adminAuthorize = require('../../middleware/adminauthorize');
const pool = require('../../db');
const { tr } = require('zod/v4/locales');

router.get('/get', adminAuthorize, async (req, res) => {
    try{
        const result = await pool.query(`
            SELECT c.*, u.name FROM "CompanyUpgradeRequest" c
            JOIN "User" u ON c.user_id = u.user_id
            ORDER BY c.requested_at DESC
        `);
        res.json(result.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/approve', adminAuthorize, async (req, res) => {  
    try {
        const { requestId } = req.query;
        const adminId = req.admin.admin_id;

        // Check if the request exists
        const requestResult = await pool.query(
            `SELECT * FROM "CompanyUpgradeRequest" WHERE request_id = $1 AND status = 'pending'`,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found or already processed.' });
        }
        const userId = requestResult.rows[0].user_id;
        // Check if the user exists
        const userResult = await pool.query(
            `SELECT * FROM "User" WHERE user_id = $1`,
            [userId]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if(userResult.rows[0].status === 'banned') {
            return res.status(400).json({ error: 'Cannot approve request for a banned user.' });
        }
        // Update the user's status to 'company'
        await pool.query(
            `UPDATE "User" SET type = 'company' WHERE user_id = $1`,
            [userId]
        );
        const timestamp = new Date().toISOString();
        const content = 'Admin approved your company upgrade request';

        // Insert a notification for the user
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id,user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, userId, content, timestamp]
        );

        req.app.get('io')
             .to(`user_${userId}`)
             .emit('newNotification', { content, timestamp });
        // Update the request status to approved
        await pool.query(
            `UPDATE "CompanyUpgradeRequest" SET status = $1, responded_at = $2 WHERE request_id = $3`,
            ['approved', timestamp, requestId]
        );

        res.json({ message: 'Request approved successfully.' });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.post('/reject', adminAuthorize, async (req, res) => {
    try {
        const { requestId } = req.query;
        const adminId = req.admin.admin_id;

        // Check if the request exists
        const requestResult = await pool.query(
            `SELECT * FROM "CompanyUpgradeRequest" WHERE request_id = $1 AND status = 'pending'`,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found or already processed.' });
        }
        const timestamp = new Date().toISOString();
        const content = 'Admin rejected your company upgrade request';
        const userId = requestResult.rows[0].user_id;
        // Insert a notification for the user
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id,user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, userId, content, timestamp]
        );

        req.app.get('io')
             .to(`user_${userId}`)
             .emit('newNotification', { content, timestamp });
        // Update the request status to rejected
        await pool.query(
            `UPDATE "CompanyUpgradeRequest" SET status = $1, responded_at = $2 WHERE request_id = $3`,
            ['rejected', new Date().toISOString(), requestId]
        );

        res.json({ message: 'Request rejected successfully.' });   
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.delete('/delete', adminAuthorize, async (req, res) => {
    try {
        const { requestId } = req.query;

        // Check if the request exists
        const requestResult = await pool.query(
            `SELECT * FROM "CompanyUpgradeRequest" WHERE request_id = $1`,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found.' });
        }

        // Delete the request
        await pool.query(
            `DELETE FROM "CompanyUpgradeRequest" WHERE request_id = $1`,
            [requestId]
        );

        res.json({ message: 'Request deleted successfully.' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;