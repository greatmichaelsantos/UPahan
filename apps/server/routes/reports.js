const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

function getDateRange(query) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (query.period === 'weekly') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start: start.toISOString().split('T')[0], end: todayStr };
  }
  if (query.period === 'monthly') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: start.toISOString().split('T')[0], end: todayStr };
  }
  if (query.period === 'custom' && query.start_date && query.end_date) {
    return { start: query.start_date, end: query.end_date };
  }
  // default: current month
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { start: start.toISOString().split('T')[0], end: todayStr };
}

// GET /api/reports/landlord
router.get('/landlord', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const adminId = req.user.userId;

    // Units
    const unitsRes = await pool.query(
      `SELECT vacancy_status FROM units WHERE admin_id = $1 AND is_archived = false`,
      [adminId]
    );
    const totalUnits    = unitsRes.rows.length;
    const occupiedUnits = unitsRes.rows.filter(u => u.vacancy_status === 'occupied').length;
    const vacantUnits   = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? `${Math.round((occupiedUnits / totalUnits) * 100)}%` : '0%';

    // Payments in range
    const paymentsRes = await pool.query(
      `SELECT p.amount, p.payment_status, p.is_late, p.month_covered,
              u.unit_code,
              us.first_name || ' ' || us.last_name AS tenant_name
       FROM payments p
       JOIN units u ON p.unit_id = u.unit_id
       JOIN tenants t ON p.tenant_id = t.tenant_id
       JOIN users us ON t.user_id = us.user_id
       WHERE u.admin_id = $1
         AND DATE(p.created_at) BETWEEN $2 AND $3`,
      [adminId, start, end]
    );
    const payments = paymentsRes.rows;
    const totalCollected = payments
      .filter(p => ['paid', 'partial', 'verified'].includes(p.payment_status))
      .reduce((s, p) => s + parseFloat(p.amount), 0);
    const latePayments   = payments.filter(p => p.is_late).length;
    const notVerified    = payments.filter(p => p.payment_status === 'rejected').length;

    const paymentBreakdown = payments.map(p => ({
      unit_code:     p.unit_code,
      tenant:        p.tenant_name,
      amount:        parseFloat(p.amount),
      status:        p.payment_status === 'paid' || p.payment_status === 'verified' ? 'verified'
                   : p.payment_status === 'rejected' ? 'not_verified'
                   : p.payment_status,
      is_late:       p.is_late,
      month_covered: p.month_covered,
    }));

    // Maintenance in range
    const maintRes = await pool.query(
      `SELECT m.status, m.category, m.created_at,
              u.unit_code,
              us.first_name || ' ' || us.last_name AS tenant_name
       FROM maintenance_requests m
       JOIN units u ON m.unit_id = u.unit_id
       JOIN tenants t ON m.tenant_id = t.tenant_id
       JOIN users us ON t.user_id = us.user_id
       WHERE u.admin_id = $1
         AND DATE(m.created_at) BETWEEN $2 AND $3`,
      [adminId, start, end]
    );
    const maint = maintRes.rows;
    const resolved = maint.filter(m => m.status === 'completed').length;
    const pending  = maint.filter(m => m.status !== 'completed').length;

    const maintBreakdown = maint.map(m => ({
      unit_code: m.unit_code,
      tenant:    m.tenant_name,
      category:  m.category,
      status:    m.status,
      date:      m.created_at ? m.created_at.toISOString().split('T')[0] : null,
    }));

    res.json({
      success: true,
      data: {
        period: { start, end },
        units: {
          total:          totalUnits,
          occupied:       occupiedUnits,
          vacant:         vacantUnits,
          occupancy_rate: occupancyRate,
        },
        payments: {
          total_collected:   totalCollected,
          total_transactions: payments.length,
          late_payments:     latePayments,
          not_verified:      notVerified,
          breakdown:         paymentBreakdown,
        },
        maintenance: {
          total_requests: maint.length,
          resolved,
          pending,
          breakdown: maintBreakdown,
        },
      },
    });
  } catch (err) {
    console.error('Landlord report error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/reports/tenant
router.get('/tenant', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const tenantRes = await pool.query(
      `SELECT t.tenant_id, t.unit_id, u.unit_code, u.monthly_price, u.due_day
       FROM tenants t
       JOIN units u ON t.unit_id = u.unit_id
       WHERE t.user_id = $1 AND t.is_archived = false LIMIT 1`,
      [req.user.userId]
    );
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active tenancy found.' });
    }
    const { tenant_id, unit_code, monthly_price, due_day } = tenantRes.rows[0];

    // Payments in range
    const paymentsRes = await pool.query(
      `SELECT amount, payment_status, is_late, month_covered, payment_date, created_at
       FROM payments
       WHERE tenant_id = $1 AND DATE(created_at) BETWEEN $2 AND $3`,
      [tenant_id, start, end]
    );
    const payments = paymentsRes.rows;
    const totalPaid = payments
      .filter(p => ['paid', 'partial', 'verified'].includes(p.payment_status))
      .reduce((s, p) => s + parseFloat(p.amount), 0);
    const latePayments = payments.filter(p => p.is_late).length;

    const paymentBreakdown = payments.map(p => ({
      amount:        parseFloat(p.amount),
      status:        p.payment_status === 'paid' || p.payment_status === 'verified' ? 'verified'
                   : p.payment_status === 'rejected' ? 'not_verified'
                   : p.payment_status,
      is_late:       p.is_late,
      month_covered: p.month_covered,
      date:          p.payment_date ? new Date(p.payment_date).toISOString().split('T')[0] : null,
    }));

    // Maintenance in range
    const maintRes = await pool.query(
      `SELECT category, status, created_at
       FROM maintenance_requests
       WHERE tenant_id = $1 AND DATE(created_at) BETWEEN $2 AND $3`,
      [tenant_id, start, end]
    );
    const maint = maintRes.rows;
    const resolved = maint.filter(m => m.status === 'completed').length;
    const pending  = maint.filter(m => m.status !== 'completed').length;

    const maintBreakdown = maint.map(m => ({
      category: m.category,
      status:   m.status,
      date:     m.created_at ? m.created_at.toISOString().split('T')[0] : null,
    }));

    res.json({
      success: true,
      data: {
        period: { start, end },
        unit: {
          unit_code,
          monthly_rent: parseFloat(monthly_price),
          due_day:      parseInt(due_day) || 5,
        },
        payments: {
          total_paid,
          total_transactions: payments.length,
          late_payments:      latePayments,
          breakdown:          paymentBreakdown,
        },
        maintenance: {
          total_requests: maint.length,
          resolved,
          pending,
          breakdown: maintBreakdown,
        },
      },
    });
  } catch (err) {
    console.error('Tenant report error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
