const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const user = result.rows[0];
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `This account is not registered as ${role}.` });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    // If tenant, get their active tenant record and unit
    let tenantInfo = null;
    if (user.role === 'tenant') {
      const tResult = await pool.query(
        `SELECT t.tenant_id, t.unit_id, t.lease_start_date, t.lease_end_date,
                u.unit_code, u.monthly_price, u.floor_plan, u.location
         FROM tenants t
         JOIN units u ON t.unit_id = u.unit_id
         WHERE t.user_id = $1 AND t.is_archived = false
         LIMIT 1`,
        [user.user_id]
      );
      if (tResult.rows.length > 0) {
        tenantInfo = tResult.rows[0];
      }
    }

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: userWithoutPassword, token, tenantInfo }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const register = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, role } = req.body;
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }
  if (!['admin', 'tenant'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }
  try {
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone_number, password, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, first_name, last_name, email, phone_number, role, created_at`,
      [firstName, lastName, email.toLowerCase(), phoneNumber || null, hashed, role]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ success: true, message: 'Account created successfully.', data: { user, token } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone_number, role, created_at FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login, register, getProfile };
