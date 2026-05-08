const pool = require('../config/db');
const { sendNotification } = require('./notificationsController');

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
      'SELECT vacancy_status, unit_code, monthly_price FROM units WHERE unit_id = $1',
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

    // Notify the new tenant (non-blocking)
    try {
      const price = parseFloat(unitCheck.rows[0].monthly_price).toLocaleString('en-PH', { minimumFractionDigits: 2 });
      await sendNotification(userId, 'unit_assigned',
        `You have been assigned to Unit ${unitCheck.rows[0].unit_code}. Monthly rent: ₱${price}.`,
        parseInt(unitId)
      );
    } catch {}

    res.status(201).json({ success: true, message: 'Tenant assigned successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('Assign tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const removeTenant = async (req, res) => {
  const { id } = req.params;
  try {
    const tenantResult = await pool.query(
      `SELECT t.unit_id, t.user_id, un.unit_code
       FROM tenants t
       JOIN units un ON t.unit_id = un.unit_id
       WHERE t.tenant_id = $1`,
      [id]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant record not found.' });
    }
    const { unit_id, user_id, unit_code } = tenantResult.rows[0];
    await pool.query('UPDATE tenants SET is_archived = true WHERE tenant_id = $1', [id]);
    const remaining = await pool.query(
      'SELECT tenant_id FROM tenants WHERE unit_id = $1 AND is_archived = false',
      [unit_id]
    );
    if (remaining.rows.length === 0) {
      await pool.query("UPDATE units SET vacancy_status = 'vacant' WHERE unit_id = $1", [unit_id]);
    }

    // Notify the removed tenant (non-blocking)
    try {
      await sendNotification(user_id, 'unit_unassigned',
        `You have been unassigned from Unit ${unit_code}. Contact your landlord for more information.`,
        parseInt(unit_id)
      );
    } catch {}

    res.json({ success: true, message: 'Tenant removed and unit set to vacant.' });
  } catch (err) {
    console.error('Remove tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getMyTenantInfo = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.tenant_id, t.user_id, t.unit_id, t.lease_start_date, t.lease_end_date,
              u.first_name, u.last_name, u.email, u.phone_number,
              un.unit_code, un.monthly_price, un.floor_plan, un.location, un.bedrooms, un.description,
              ARRAY_AGG(DISTINCT m.file_path) FILTER (WHERE m.file_path IS NOT NULL) AS unit_photos
       FROM tenants t
       JOIN users u ON t.user_id = u.user_id
       JOIN units un ON t.unit_id = un.unit_id
       LEFT JOIN media m ON m.unit_id = un.unit_id AND m.maintenance_request_id IS NULL
       WHERE t.user_id = $1 AND t.is_archived = false
       GROUP BY t.tenant_id, t.user_id, t.unit_id, t.lease_start_date, t.lease_end_date,
                u.first_name, u.last_name, u.email, u.phone_number,
                un.unit_code, un.monthly_price, un.floor_plan, un.location, un.bedrooms, un.description
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

// Remove tenant by unit ID — single transaction
const removeTenantByUnit = async (req, res) => {
  const { unitId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find the active tenant for this unit
    const tenantResult = await client.query(
      `SELECT t.tenant_id, t.user_id, un.unit_code
       FROM tenants t
       JOIN units un ON t.unit_id = un.unit_id
       WHERE t.unit_id = $1 AND t.is_archived = false
       LIMIT 1`,
      [unitId]
    );
    if (tenantResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'No active tenant found for this unit.' });
    }
    const { tenant_id, user_id, unit_code } = tenantResult.rows[0];

    // Archive the tenant record (preserves account + history)
    await client.query(
      'UPDATE tenants SET is_archived = true WHERE tenant_id = $1',
      [tenant_id]
    );

    // Mark unit as vacant
    await client.query(
      "UPDATE units SET vacancy_status = 'vacant' WHERE unit_id = $1",
      [unitId]
    );

    // Cancel any pending payment declarations for this tenant
    await client.query(
      `UPDATE payments SET payment_status = 'cancelled', updated_at = NOW()
       WHERE tenant_id = $1 AND payment_status = 'pending_approval'`,
      [tenant_id]
    );

    // Fetch updated unit to return to client
    const unitResult = await client.query(
      'SELECT * FROM units WHERE unit_id = $1',
      [unitId]
    );

    await client.query('COMMIT');

    // Notify the removed tenant (non-blocking, outside transaction)
    try {
      await sendNotification(user_id, 'unit_unassigned',
        `You have been removed from Unit ${unit_code} by your landlord. Please contact them for more information.`,
        parseInt(unitId)
      );
    } catch {}

    res.json({
      success: true,
      message: `Tenant removed from Unit ${unit_code}. Unit is now vacant.`,
      data: unitResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Remove tenant by unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    client.release();
  }
};

module.exports = { getAllTenants, getTenant, assignTenant, removeTenant, removeTenantByUnit, getMyTenantInfo };
