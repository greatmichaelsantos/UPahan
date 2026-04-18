const pool = require('../config/db');

const getPayments = async (req, res) => {
  try {
    const { month, tenantId, status } = req.query;
    let query, params = [];

    if (req.user.role === 'admin') {
      query = `
        SELECT p.*, u.first_name || ' ' || u.last_name AS tenant_name,
               un.unit_code, un.monthly_price
        FROM payments p
        JOIN tenants t ON p.tenant_id = t.tenant_id
        JOIN users u ON t.user_id = u.user_id
        JOIN units un ON p.unit_id = un.unit_id
        WHERE 1=1
      `;
      if (month) { query += ` AND p.month_covered = $${params.length + 1}`; params.push(month); }
      if (tenantId) { query += ` AND p.tenant_id = $${params.length + 1}`; params.push(tenantId); }
      if (status) { query += ` AND p.payment_status = $${params.length + 1}`; params.push(status); }
      query += ' ORDER BY p.payment_date DESC';
    } else {
      const tenantResult = await pool.query(
        'SELECT tenant_id FROM tenants WHERE user_id = $1 AND is_archived = false LIMIT 1',
        [req.user.userId]
      );
      if (tenantResult.rows.length === 0) {
        return res.json({ success: true, data: [] });
      }
      const myTenantId = tenantResult.rows[0].tenant_id;
      query = `
        SELECT p.*, un.unit_code, un.monthly_price
        FROM payments p
        JOIN units un ON p.unit_id = un.unit_id
        WHERE p.tenant_id = $1
      `;
      params.push(myTenantId);
      if (month) { query += ` AND p.month_covered = $${params.length + 1}`; params.push(month); }
      query += ' ORDER BY p.payment_date DESC';
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getPaymentSummary = async (req, res) => {
  try {
    let tenantId;
    if (req.user.role === 'tenant') {
      const tenantResult = await pool.query(
        'SELECT tenant_id FROM tenants WHERE user_id = $1 AND is_archived = false LIMIT 1',
        [req.user.userId]
      );
      if (tenantResult.rows.length === 0) {
        return res.json({ success: true, data: { totalPaid: 0, totalPending: 0 } });
      }
      tenantId = tenantResult.rows[0].tenant_id;
    } else {
      tenantId = req.query.tenantId;
    }

    const paid = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE tenant_id = $1 AND payment_status = 'paid'",
      [tenantId]
    );
    const pending = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE tenant_id = $1 AND payment_status IN ('pending', 'unpaid')",
      [tenantId]
    );
    res.json({
      success: true,
      data: {
        totalPaid: parseFloat(paid.rows[0].total),
        totalPending: parseFloat(pending.rows[0].total)
      }
    });
  } catch (err) {
    console.error('Payment summary error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createPayment = async (req, res) => {
  const { tenantId, unitId, amount, paymentDate, paymentStatus, monthCovered, paymentType, paymentMethod, notes } = req.body;
  if (!tenantId || !unitId || !amount || !monthCovered) {
    return res.status(400).json({ success: false, message: 'Tenant, unit, amount, and month are required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO payments (tenant_id, unit_id, amount, payment_date, payment_status, month_covered, payment_type, payment_method, notes, verified_by_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [tenantId, unitId, parseFloat(amount), paymentDate || new Date(), paymentStatus || 'paid',
       monthCovered, paymentType || 'full', paymentMethod || null, notes || null, true]
    );
    res.status(201).json({ success: true, message: 'Payment recorded.', data: result.rows[0] });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, verifiedByAdmin, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE payments SET
         payment_status = COALESCE($1, payment_status),
         verified_by_admin = COALESCE($2, verified_by_admin),
         notes = COALESCE($3, notes)
       WHERE payment_id = $4 RETURNING *`,
      [paymentStatus, verifiedByAdmin, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }
    res.json({ success: true, message: 'Payment updated.', data: result.rows[0] });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCurrentMonthStatus = async (req, res) => {
  try {
    const tenantResult = await pool.query(
      'SELECT tenant_id, unit_id FROM tenants WHERE user_id = $1 AND is_archived = false LIMIT 1',
      [req.user.userId]
    );
    if (tenantResult.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    const { tenant_id, unit_id } = tenantResult.rows[0];
    const month = new Date().toISOString().substring(0, 7);
    const payResult = await pool.query(
      `SELECT payment_status, SUM(amount) AS total_paid
       FROM payments
       WHERE tenant_id = $1 AND month_covered = $2
       GROUP BY payment_status
       ORDER BY payment_status`,
      [tenant_id, month]
    );
    const nextDue = new Date();
    nextDue.setDate(1);
    nextDue.setMonth(nextDue.getMonth() + 1);
    res.json({
      success: true,
      data: {
        payments: payResult.rows,
        nextDue: nextDue.toISOString().substring(0, 10),
        month
      }
    });
  } catch (err) {
    console.error('Current month status error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getPayments, getPaymentSummary, createPayment, updatePayment, getCurrentMonthStatus };
