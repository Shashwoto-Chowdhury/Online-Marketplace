const express = require('express');
const router = express.Router();
const authorize = require('../../middleware/authorize');
const validInfo = require('../../middleware/validInfo');
const upload = require('../../middleware/upload');
const { register, login } = require('../../controllers/user/authController');

router.post('/register/:folder', upload.single('image'), validInfo, register);
router.post('/login', validInfo, login);
router.get("/verify", authorize, (req, res) => {
  try {
    res.json({verified: true});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
