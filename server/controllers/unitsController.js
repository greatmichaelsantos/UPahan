const pool = require('../config/db');
const path = require('path');

const getAllUnits = async (req, res) => {
  try {
    const { search, status, type } = req.query;
    let query = `
      SELECT u.*,
             ARRAY_AGG(DISTINCT up.file_path) FILTER (WHERE up.file_path IS NOT NULL) AS photos,
             t.tenant_id,
             usr.first_name || ' ' || usr.last_name AS tenant_name,
             COALESCE(
               (SELECT p.payment_status FROM payments p
                WHERE p.tenant_id = t.tenant_id
                  AND p.month_covered = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
                ORDER BY p.created_at DESC LIMIT 1),
               'unpaid'
             ) AS payment_status
      FROM units u
      LEFT JOIN unit_photos up ON u.unit_id = up.unit_id
      LEFT JOIN tenants t ON u.unit_id = t.unit_id AND t.is_archived = false
      LEFT JOIN users usr ON t.user_id = usr.user_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (u.unit_code ILIKE $${idx} OR u.location ILIKE $${idx} OR u.floor_plan ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      query += ` AND u.vacancy_status = $${idx}`;
      params.push(status);
      idx++;
    }
    // Guest/public: only vacant units
    if (!req.user || req.user.role === 'guest') {
      query += ` AND u.vacancy_status = 'vacant'`;
    }

    query += ' GROUP BY u.unit_id, t.tenant_id, usr.first_name, usr.last_name ORDER BY u.unit_code';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get units error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.*,
              ARRAY_AGG(DISTINCT up.file_path) FILTER (WHERE up.file_path IS NOT NULL) AS photos,
              t.tenant_id, t.lease_start_date, t.lease_end_date,
              usr.first_name || ' ' || usr.last_name AS tenant_name,
              usr.email AS tenant_email, usr.phone_number AS tenant_phone
       FROM units u
       LEFT JOIN unit_photos up ON u.unit_id = up.unit_id
       LEFT JOIN tenants t ON u.unit_id = t.unit_id AND t.is_archived = false
       LEFT JOIN users usr ON t.user_id = usr.user_id
       WHERE u.unit_id = $1
       GROUP BY u.unit_id, t.tenant_id, t.lease_start_date, t.lease_end_date,
                usr.first_name, usr.last_name, usr.email, usr.phone_number`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createUnit = async (req, res) => {
  const { unitCode, monthlyPrice, vacancyStatus, floorPlan, location, description } = req.body;
  if (!unitCode || !monthlyPrice) {
    return res.status(400).json({ success: false, message: 'Unit code and monthly price are required.' });
  }
  try {
    const existing = await pool.query('SELECT unit_id FROM units WHERE unit_code = $1', [unitCode.toUpperCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Unit code already exists.' });
    }
    const result = await pool.query(
      `INSERT INTO units (unit_code, monthly_price, vacancy_status, floor_plan, location, description, admin_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [unitCode.toUpperCase(), parseFloat(monthlyPrice), vacancyStatus || 'vacant', floorPlan || null, location || null, description || null, req.user.userId]
    );
    res.status(201).json({ success: true, message: 'Unit created successfully.', data: result.rows[0] });
  } catch (err) {
    console.error('Create unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateUnit = async (req, res) => {
  const { id } = req.params;
  const { unitCode, monthlyPrice, vacancyStatus, floorPlan, location, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE units SET unit_code = COALESCE($1, unit_code), monthly_price = COALESCE($2, monthly_price),
       vacancy_status = COALESCE($3, vacancy_status), floor_plan = COALESCE($4, floor_plan),
       location = COALESCE($5, location), description = COALESCE($6, description)
       WHERE unit_id = $7 RETURNING *`,
      [unitCode, monthlyPrice ? parseFloat(monthlyPrice) : null, vacancyStatus, floorPlan, location, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }
    res.json({ success: true, message: 'Unit updated.', data: result.rows[0] });
  } catch (err) {
    console.error('Update unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteUnit = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM units WHERE unit_id = $1 RETURNING unit_id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }
    res.json({ success: true, message: 'Unit deleted.' });
  } catch (err) {
    console.error('Delete unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const uploadUnitPhotos = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const insertPromises = req.files.map(file => {
      const relativePath = `/uploads/units/${path.basename(file.path)}`;
      return pool.query(
        'INSERT INTO unit_photos (unit_id, file_path) VALUES ($1, $2) RETURNING *',
        [id, relativePath]
      );
    });
    const results = await Promise.all(insertPromises);
    const photos = results.map(r => r.rows[0]);
    res.json({ success: true, message: 'Photos uploaded.', data: photos });
  } catch (err) {
    console.error('Upload photos error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getCollectionSummary = async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().substring(0, 7);
    const totalOccupied = await pool.query(
      "SELECT COUNT(*) FROM units WHERE vacancy_status = 'occupied'"
    );
    const totalPaid = await pool.query(
      `SELECT COUNT(DISTINCT p.tenant_id) FROM payments p
       WHERE p.month_covered = $1 AND p.payment_status = 'paid' AND p.verified_by_admin = true`,
      [month]
    );
    const occupied = parseInt(totalOccupied.rows[0].count) || 0;
    const paid = parseInt(totalPaid.rows[0].count) || 0;
    const percentage = occupied > 0 ? Math.round((paid / occupied) * 100) : 0;
    res.json({
      success: true,
      data: { occupied, paid, percentage, month }
    });
  } catch (err) {
    console.error('Collection summary error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllUnits, getUnit, createUnit, updateUnit, deleteUnit, uploadUnitPhotos, getCollectionSummary };
