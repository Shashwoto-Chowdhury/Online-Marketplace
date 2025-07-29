const express = require('express');
const router = express.Router();
const adminAuthorize = require('../../middleware/adminauthorize');
const pool = require('../../db');

router.get('/productreports', adminAuthorize, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT pr.*, u1.name as "reporter_name", u2.name as "reported_user_name", p.title as "product_title"
            FROM "ProductReport" pr
            JOIN "User" u1 ON pr.reporter_id = u1.user_id
            JOIN "User" u2 ON pr.reported_user_id = u2.user_id
            JOIN "Product" p ON pr.product_id = p.product_id
            ORDER BY pr.created_at DESC
        `)
        res.json(result.rows);
    }catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/messagereports', adminAuthorize, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT mr.*, u1.name as "reporter_name", u2.name as "reported_user_name", m.content as "message_content"
            FROM "MessageReport" mr
            JOIN "User" u1 ON mr.reporter_id = u1.user_id
            JOIN "User" u2 ON mr.reported_user_id = u2.user_id
            LEFT JOIN "Message" m ON mr.message_id = m.message_id
            ORDER BY mr.created_at DESC
        `)
        res.json(result.rows);
    }catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/productreport/resolve', adminAuthorize, async (req, res) => {
    try {
        const { reportId } = req.query;

        // Check if the report exists
        const reportResult = await pool.query(
            `SELECT * FROM "ProductReport" WHERE report_id = $1 AND status = 'pending'`,
            [reportId]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found or already processed.' });
        }

        // Update the report status
        await pool.query(
            `UPDATE "ProductReport" SET status = $1 WHERE report_id = $2`,
            ['resolved', reportId]
        );
        const productId = reportResult.rows[0].product_id;
        // Optionally, you can also delete the product if needed
        await pool.query(
            `DELETE FROM "Product" WHERE product_id = $1`,
            [productId]
        );
        const reported_user_id = reportResult.rows[0].reported_user_id;
        // Notify the reported user about the resolution
        const content2 = 'Your product has been removed due to a report.';
        const adminId = req.admin.admin_id;
        const timestamp2 = new Date().toISOString();
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, reported_user_id, content2, timestamp2]
        );
        req.app.get('io')
            .to(`user_${reported_user_id}`)
            .emit('newNotification', { content: content2, timestamp: timestamp2 });
        const reporter_id = reportResult.rows[0].reporter_id;
        const content = 'Your product report has been resolved by the admin.';
        const timestamp = new Date().toISOString();
        // Insert a notification for the reporter
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, reporter_id, content, timestamp]
        );
        req.app.get('io')
             .to(`user_${reporter_id}`)
             .emit('newNotification', { content, timestamp });

        res.status(200).json({ message: 'Report processed successfully.' });
    } catch (error) {
        console.error('Error processing product report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.post('/productreport/reject', adminAuthorize, async (req, res) => {
    try {
        const { reportId } = req.query;

        // Check if the report exists
        const reportResult = await pool.query(
            `SELECT * FROM "ProductReport" WHERE report_id = $1 AND status = 'pending'`,
            [reportId]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found or already processed.' });
        }

        // Update the report status to rejected
        await pool.query(
            `UPDATE "ProductReport" SET status = $1 WHERE report_id = $2`,
            ['rejected', reportId]
        );
        const reporter_id = reportResult.rows[0].reporter_id;
        const content = 'Your product report has been rejected by the admin.';
        const adminId = req.admin.admin_id;
        const timestamp = new Date().toISOString();
        // Insert a notification for the reporter
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, reporter_id, content, timestamp]
        );
        req.app.get('io')
             .to(`user_${reporter_id}`)
             .emit('newNotification', { content, timestamp });

        res.status(200).json({ message: 'Report rejected successfully.' });
    } catch (error) {
        console.error('Error rejecting product report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
router.post('/messagereport/resolve', adminAuthorize, async (req, res) => {
    try {
        const { reportId } = req.query;

        // Check if the report exists
        const reportResult = await pool.query(
            `SELECT * FROM "MessageReport" WHERE report_id = $1 AND status = 'pending'`,
            [reportId]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found or already processed.' });
        }

        // Update the report status
        const messageId = reportResult.rows[0].message_id;
        // Optionally, you can also delete the message if needed
        await pool.query(
            `DELETE FROM "Message" WHERE message_id = $1`,
            [messageId]
        );
        const reported_user_id = reportResult.rows[0].reported_user_id;
        // Notify the reported user about the resolution
        const content2 = 'Your message has been removed due to a report.';
        const timestamp2 = new Date().toISOString();
        const adminId = req.admin.admin_id;
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, reported_user_id, content2, timestamp2]
        );
        req.app.get('io')
             .to(`user_${reported_user_id}`)
             .emit('newNotification', { content: content2, timestamp: timestamp2 });
        // Update the report status to resolved
        await pool.query(
            `UPDATE "MessageReport" SET status = $1 WHERE report_id = $2`,
            ['resolved', reportId]
        );
        const reporter_id = reportResult.rows[0].reporter_id;
        const content = 'Your message report has been resolved by the admin.';
        const timestamp = new Date().toISOString();
        // Insert a notification for the reporter
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, reporter_id, content, timestamp]
        );
        req.app.get('io')
             .to(`user_${reporter_id}`)
             .emit('newNotification', { content, timestamp });

        res.status(200).json({ message: 'Report processed successfully.' });
    } catch (error) {
        console.error('Error processing message report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.post('/messagereport/reject', adminAuthorize, async (req, res) => {
    try {
        const { reportId } = req.query;

        // Check if the report exists
        const reportResult = await pool.query(
            `SELECT * FROM "MessageReport" WHERE report_id = $1 AND status = 'pending'`,
            [reportId]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found or already processed.' });
        }

        // Update the report status to rejected
        await pool.query(
            `UPDATE "MessageReport" SET status = $1 WHERE report_id = $2`,
            ['rejected', reportId]
        );
        const reporter_id = reportResult.rows[0].reporter_id;
        const content = 'Your message report has been rejected by the admin.';
        const adminId = req.admin.admin_id;
        const timestamp = new Date().toISOString();
        // Insert a notification for the reporter
        await pool.query(
            `INSERT INTO "AdminUserNotification" (admin_id, user_id, content, timestamp) VALUES ($1, $2, $3, $4)`,
            [adminId, reporter_id, content, timestamp]
        );
        req.app.get('io')
             .to(`user_${reporter_id}`)
             .emit('newNotification', { content, timestamp });

        res.status(200).json({ message: 'Report rejected successfully.' });
    } catch (error) {
        console.error('Error rejecting message report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.delete('/productreport/delete', adminAuthorize, async (req, res) => {
    try {
        const { reportId } = req.query;

        // Check if the report exists
        const reportResult = await pool.query(
            `SELECT * FROM "ProductReport" WHERE report_id = $1`,
            [reportId]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found.' });
        }

        // Delete the report
        await pool.query(
            `DELETE FROM "ProductReport" WHERE report_id = $1`,
            [reportId]
        );

        res.status(200).json({ message: 'Product report deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.delete('/messagereport/delete', adminAuthorize, async (req, res) => {
    try {
        const { reportId } = req.query;

        // Check if the report exists
        const reportResult = await pool.query(
            `SELECT * FROM "MessageReport" WHERE report_id = $1`,
            [reportId]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found.' });
        }

        // Delete the report
        await pool.query(
            `DELETE FROM "MessageReport" WHERE report_id = $1`,
            [reportId]
        );

        res.status(200).json({ message: 'Message report deleted successfully.' });
    } catch (error) {
        console.error('Error deleting message report:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;