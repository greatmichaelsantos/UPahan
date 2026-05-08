const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationsController');

router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/read-all', verifyToken, markAllAsRead);
router.put('/:id/read', verifyToken, markAsRead);
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;
