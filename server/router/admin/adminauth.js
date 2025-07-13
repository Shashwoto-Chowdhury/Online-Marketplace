const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const adminauthorize = require('../../middleware/adminauthorize')
const pool = require('../../db')
const validInfo = require('../../middleware/validInfo')

router.post('/login', validInfo, async (req, res) => {
    try{
        const { email, password } = req.body

        // Check if admin exists
        const adminResult = await pool.query('SELECT * FROM "Admin" WHERE email = $1', [email])
        if (adminResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const admin = adminResult.rows[0]
        // Check password
        const isMatch = await bcrypt.compare(password, admin.password)
        console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Create JWT token
        const token = jwt.sign({ admin_id: admin.admin_id, email:admin.email, class:'admin' }, process.env.ADMIN_SECRET, { expiresIn: '1h' })

        res.json({ token: token, admin: { admin_id: admin.admin_id, name: admin.name, email: admin.email } })
    }
    catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ error: 'Server error' })
    }
});

router.get("/verify", adminauthorize, (req, res) => {
  try {
    res.json({verified: true});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router
