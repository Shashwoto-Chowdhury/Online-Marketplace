const pool = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password, confirmed_password, location } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const folder = req.params.folder; // should be 'users'
    const image_url = req.file ? `/images/${folder}/${req.file.filename}` : null;

    const hashedPassword = await bcrypt.hash(password, 10);
    const created_at = new Date();

    const newUser = await pool.query(
      `INSERT INTO "User" (name, email, password, location, status, type, created_at, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id, name, email, type, status`,
      [name, email, hashedPassword, location, 'active', 'normal', created_at, image_url]
    );

    const token = jwt.sign(
      { user_id: newUser.rows[0].user_id, name: newUser.rows[0].name, email: newUser.rows[0].email, class: 'user', type: newUser.rows[0].type ,status: newUser.rows[0].status },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({ token: token, user: { user_id: newUser.rows[0].user_id, name: newUser.rows[0].name, email: newUser.rows[0].email, class: 'user', type: newUser.rows[0].type ,status: newUser.rows[0].status } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, email: user.email, class: 'user', type: user.type ,status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token: token, user: { user_id: user.user_id, name: user.name, email: user.email, class: 'user', type: user.type ,status: user.status } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login };
