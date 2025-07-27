const express = require('express');
const router = express.Router();

router.use('/auth', require('./user/auth'));
router.use('/homepage', require('./user/homepage'));
router.use('/productupload', require('./user/productupload'));
router.use('/userdetails', require('./user/userdetails'));
router.use('/productdetails', require('./user/productdetails'));
router.use('/wishlist', require('./user/wishlist'));
router.use('/notification', require('./user/notification'));
router.use('/review', require('./user/review'));
router.use('/productrequest', require('./user/productrequest'));
router.use('/historypage', require('./user/historypage'));
router.use('/productdelete', require('./user/ProductDelete'));
router.use('/upgrade-request', require('./user/sendcompanyrequest'));
router.use('/productreport', require('./user/productreport'));
router.use('/offers', require('./user/offers'));
router.use('/conversations', require('./user/conversations'));
router.use('/messagereport', require('./user/messagereport'));

module.exports = router;