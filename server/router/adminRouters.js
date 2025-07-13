const express = require('express');
const router = express.Router();

router.use('/auth', require('./admin/adminauth'));
router.use('/dashboard', require('./admin/admindashboard'));

module.exports = router;