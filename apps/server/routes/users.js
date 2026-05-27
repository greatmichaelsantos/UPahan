const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const path    = require('path');
const pool    = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');

// Admin: all users
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone_number, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin: unassigned tenants
router.get('/unassigned-tenants', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_number
       FROM users u
       WHERE u.role = 'tenant'
         AND NOT EXISTS (
           SELECT 1 FROM tenants t WHERE t.user_id = u.user_id AND t.is_archived = false
         )
       ORDER BY u.first_name`
    );
    res.json({ success: true, data: result.rows });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Get own profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone_number, role, profile_photo, date_of_birth, created_at FROM users WHERE user_id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update own profile (name, phone, date_of_birth)
router.put('/me', verifyToken, async (req, res) => {
  const { first_name, last_name, phone_number, date_of_birth } = req.body;
  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({ success: false, message: 'First and last name are required.' });
  }
  if (phone_number) {
    if (!/^\d{11}$/.test(phone_number) || !phone_number.startsWith('09')) {
      return res.status(400).json({ success: false, message: 'Phone number must be 11 digits starting with 09.' });
    }
  }
  const dob = date_of_birth ? new Date(date_of_birth) : null;
  if (date_of_birth && (!dob || isNaN(dob.getTime()))) {
    return res.status(400).json({ success: false, message: 'Invalid date of birth.' });
  }
  try {
    const result = await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, phone_number=$3, date_of_birth=$4 WHERE user_id=$5
       RETURNING user_id, first_name, last_name, email, phone_number, role, profile_photo, date_of_birth`,
      [first_name.trim(), last_name.trim(), phone_number || null, dob || null, req.user.userId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Upload profile photo
router.post('/me/photo', verifyToken, avatarUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const filename = req.file.filename;
  try {
    const result = await pool.query(
      'UPDATE users SET profile_photo=$1 WHERE user_id=$2 RETURNING user_id, first_name, last_name, email, phone_number, role, profile_photo',
      [filename, req.user.userId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Change password
router.put('/me/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }
  try {
    const result = await pool.query('SELECT password FROM users WHERE user_id = $1', [req.user.userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [hashed, req.user.userId]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
