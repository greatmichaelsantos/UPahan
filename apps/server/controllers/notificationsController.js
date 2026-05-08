const pool = require('../config/db');

// Internal helper — non-throwing, safe to call from any controller
const sendNotification = async (userId, type, message, referenceId = null) => {
  if (!userId) return;
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, reference_id) VALUES ($1, $2, $3, $4)`,
      [userId, type, message, referenceId]
    );
  } catch (err) {
    console.error('sendNotification error:', err.message);
  }
};

// Looks up the admin user_id (first admin in the system)
const getAdminUserId = async () => {
  try {
    const result = await pool.query(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);
    return result.rows[0]?.user_id || null;
  } catch {
    return null;
  }
};

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT notification_id, user_id, type, message, is_read, reference_id, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.user.userId]
    );
    res.json({ success: true, data: { count: parseInt(result.rows[0].count) } });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE notification_id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('markAsRead error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('deleteNotification error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  sendNotification,
  getAdminUserId,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
