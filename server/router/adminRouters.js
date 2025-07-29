const express = require('express');
const router = express.Router();

router.use('/auth', require('./admin/adminauth'));
router.use('/dashboard', require('./admin/admindashboard'));
router.use('/audit', require('./admin/audit'));
router.use('/companyrequest', require('./admin/companyrequest'));
router.use('/reports', require('./admin/reports'));
router.use('/banuser', require('./admin/banuser'));

module.exports = router;