const express = require('express');
const router = express.Router();
const { getPayments, getPaymentSummary, createPayment, updatePayment, getCurrentMonthStatus } = require('../controllers/paymentsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, getPayments);
router.get('/summary', verifyToken, getPaymentSummary);
router.get('/current-month', verifyToken, requireRole('tenant'), getCurrentMonthStatus);
router.post('/', verifyToken, requireRole('admin'), createPayment);
router.put('/:id', verifyToken, requireRole('admin'), updatePayment);

module.exports = router;
