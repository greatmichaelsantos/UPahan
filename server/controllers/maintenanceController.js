const pool = require('../config/db');
const path = require('path');

const getRequests = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    let query, params = [];

    if (req.user.role === 'admin') {
      query = `
        SELECT mr.*, u.first_name || ' ' || u.last_name AS tenant_name,
               un.unit_code,
               ARRAY_AGG(DISTINCT mp.file_path) FILTER (WHERE mp.file_path IS NOT NULL) AS photos
        FROM maintenance_requests mr
        JOIN tenants t ON mr.tenant_id = t.tenant_id
        JOIN users u ON t.user_id = u.user_id
        JOIN units un ON mr.unit_id = un.unit_id
        LEFT JOIN maintenance_photos mp ON mr.request_id = mp.request_id
        WHERE 1=1
      `;
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
        SELECT mr.*, un.unit_code,
               ARRAY_AGG(DISTINCT mp.file_path) FILTER (WHERE mp.file_path IS NOT NULL) AS photos
        FROM maintenance_requests mr
        JOIN units un ON mr.unit_id = un.unit_id
        LEFT JOIN maintenance_photos mp ON mr.request_id = mp.request_id
        WHERE mr.tenant_id = $${params.length + 1}
      `;
      params.push(myTenantId);
    }

    if (status) { query += ` AND mr.status = $${params.length + 1}`; params.push(status); }
    if (priority) { query += ` AND mr.priority_level = $${params.length + 1}`; params.push(priority); }
    if (category) { query += ` AND mr.issue_category = $${params.length + 1}`; params.push(category); }

    query += ' GROUP BY mr.request_id';
    if (req.user.role === 'admin') query += ', u.first_name, u.last_name, un.unit_code';
    else query += ', un.unit_code';
    query += ' ORDER BY mr.report_date DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT mr.*, u.first_name || ' ' || u.last_name AS tenant_name,
              u.email AS tenant_email, u.phone_number AS tenant_phone,
              un.unit_code, un.floor_plan, un.location,
              ARRAY_AGG(DISTINCT mp.file_path) FILTER (WHERE mp.file_path IS NOT NULL) AS photos
       FROM maintenance_requests mr
       JOIN tenants t ON mr.tenant_id = t.tenant_id
       JOIN users u ON t.user_id = u.user_id
       JOIN units un ON mr.unit_id = un.unit_id
       LEFT JOIN maintenance_photos mp ON mr.request_id = mp.request_id
       WHERE mr.request_id = $1
       GROUP BY mr.request_id, u.first_name, u.last_name, u.email, u.phone_number, un.unit_code, un.floor_plan, un.location`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get request error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createRequest = async (req, res) => {
  const { issueCategory, subject, description, priorityLevel } = req.body;
  if (!issueCategory || !subject) {
    return res.status(400).json({ success: false, message: 'Category and subject are required.' });
  }
  try {
    const tenantResult = await pool.query(
      'SELECT tenant_id, unit_id FROM tenants WHERE user_id = $1 AND is_archived = false LIMIT 1',
      [req.user.userId]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active tenancy found.' });
    }
    const { tenant_id, unit_id } = tenantResult.rows[0];
    const result = await pool.query(
      `INSERT INTO maintenance_requests (tenant_id, unit_id, issue_category, subject, description, priority_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tenant_id, unit_id, issueCategory, subject, description || null, priorityLevel || 'low']
    );
    res.status(201).json({ success: true, message: 'Request submitted.', data: result.rows[0] });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateRequest = async (req, res) => {
  const { id } = req.params;
  const { status, priorityLevel } = req.body;
  try {
    let resolvedDate = null;
    if (status === 'completed') resolvedDate = new Date();
    const result = await pool.query(
      `UPDATE maintenance_requests SET
         status = COALESCE($1, status),
         priority_level = COALESCE($2, priority_level),
         resolved_date = CASE WHEN $1 = 'completed' THEN NOW() ELSE resolved_date END
       WHERE request_id = $3 RETURNING *`,
      [status, priorityLevel, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    res.json({ success: true, message: 'Request updated.', data: result.rows[0] });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const uploadRequestPhotos = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const insertPromises = req.files.map(file => {
      const relativePath = `/uploads/maintenance/${path.basename(file.path)}`;
      return pool.query(
        'INSERT INTO maintenance_photos (request_id, file_path) VALUES ($1, $2) RETURNING *',
        [id, relativePath]
      );
    });
    const results = await Promise.all(insertPromises);
    const photos = results.map(r => r.rows[0]);
    res.json({ success: true, message: 'Photos uploaded.', data: photos });
  } catch (err) {
    console.error('Upload maintenance photos error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getRequests, getRequest, createRequest, updateRequest, uploadRequestPhotos };
