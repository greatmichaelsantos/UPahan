const pool = require('../config/db');

const getAllTenants = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.first_name, u.last_name, u.email, u.phone_number,
              un.unit_code, un.monthly_price, un.vacancy_status
       FROM tenants t
       JOIN users u ON t.user_id = u.user_id
       JOIN units un ON t.unit_id = un.unit_id
       WHERE t.is_archived = false
       ORDER BY un.unit_code`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get tenants error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getTenant = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT t.*, u.first_name, u.last_name, u.email, u.phone_number,
              un.unit_code, un.monthly_price, un.floor_plan, un.location
       FROM tenants t
       JOIN users u ON t.user_id = u.user_id
       JOIN units un ON t.unit_id = un.unit_id
       WHERE t.tenant_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const assignTenant = async (req, res) => {
  const { userId, unitId, leaseStartDate, leaseEndDate } = req.body;
  if (!userId || !unitId) {
    return res.status(400).json({ success: false, message: 'User ID and Unit ID are required.' });
  }
  try {
    const unitCheck = await pool.query(
      "SELECT vacancy_status FROM units WHERE unit_id = $1",
      [unitId]
    );
    if (unitCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }
    if (unitCheck.rows[0].vacancy_status !== 'vacant') {
      return res.status(400).json({ success: false, message: 'Unit is not vacant.' });
    }
    const existingTenant = await pool.query(
      'SELECT tenant_id FROM tenants WHERE user_id = $1 AND is_archived = false',
      [userId]
    );
    if (existingTenant.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already has an active tenancy.' });
    }
    const result = await pool.query(
      `INSERT INTO tenants (user_id, unit_id, lease_start_date, lease_end_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, unitId, leaseStartDate || null, leaseEndDate || null]
    );
    await pool.query("UPDATE units SET vacancy_status = 'occupied' WHERE unit_id = $1", [unitId]);
    res.status(201).json({ success: true, message: 'Tenant assigned successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('Assign tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const removeTenant = async (req, res) => {
  const { id } = req.params;
  try {
    const tenantResult = await pool.query('SELECT unit_id FROM tenants WHERE tenant_id = $1', [id]);
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant record not found.' });
    }
    const { unit_id } = tenantResult.rows[0];
    await pool.query('UPDATE tenants SET is_archived = true WHERE tenant_id = $1', [id]);
    const remaining = await pool.query(
      'SELECT tenant_id FROM tenants WHERE unit_id = $1 AND is_archived = false',
      [unit_id]
    );
    if (remaining.rows.length === 0) {
      await pool.query("UPDATE units SET vacancy_status = 'vacant' WHERE unit_id = $1", [unit_id]);
    }
    res.json({ success: true, message: 'Tenant removed and unit set to vacant.' });
  } catch (err) {
    console.error('Remove tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getMyTenantInfo = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.first_name, u.last_name, u.email, u.phone_number,
              un.unit_code, un.monthly_price, un.floor_plan, un.location
       FROM tenants t
       JOIN users u ON t.user_id = u.user_id
       JOIN units un ON t.unit_id = un.unit_id
       WHERE t.user_id = $1 AND t.is_archived = false
       LIMIT 1`,
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active tenancy found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get my tenant info error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllTenants, getTenant, assignTenant, removeTenant, getMyTenantInfo };
