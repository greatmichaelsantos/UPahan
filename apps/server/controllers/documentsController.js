const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { sendNotification, getAdminUserId } = require('./notificationsController');

const submitId = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT t.tenant_id, t.unit_id FROM tenants t WHERE t.user_id = $1 AND t.is_archived = false LIMIT 1',
      [req.user.userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No active tenancy found.' });
    }
    const { tenant_id, unit_id } = userResult.rows[0];
    const { id_type } = req.body;

    if (!id_type) return res.status(400).json({ success: false, message: 'ID type is required.' });
    if (!req.files?.frontImage?.[0] || !req.files?.backImage?.[0]) {
      return res.status(400).json({ success: false, message: 'Both front and back images are required.' });
    }

    const existing = await pool.query(
      `SELECT document_id, status FROM documents
       WHERE tenant_user_id = $1 AND document_type = 'valid_id' AND status IN ('under_review','verified')
       LIMIT 1`,
      [req.user.userId]
    );
    if (existing.rows.length > 0) {
      const s = existing.rows[0].status;
      return res.status(400).json({
        success: false,
        message: s === 'verified' ? 'Your ID has already been verified.' : 'You already have an ID under review.',
      });
    }

    const frontImage = req.files.frontImage[0].filename;
    const backImage  = req.files.backImage[0].filename;

    const result = await pool.query(
      `INSERT INTO documents
         (tenant_user_id, unit_id, document_type, id_type, front_image, back_image, status, uploaded_by)
       VALUES ($1,$2,'valid_id',$3,$4,$5,'under_review','tenant')
       RETURNING *`,
      [req.user.userId, unit_id, id_type, frontImage, backImage]
    );

    // Notify admin (non-blocking)
    try {
      const adminId = await getAdminUserId();
      const userInfo = await pool.query('SELECT first_name, last_name FROM users WHERE user_id = $1', [req.user.userId]);
      if (adminId && userInfo.rows.length > 0) {
        const { first_name, last_name } = userInfo.rows[0];
        await sendNotification(adminId, 'new_document',
          `${first_name} ${last_name} submitted their valid ID for verification.`,
          result.rows[0].document_id
        );
      }
    } catch {}

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('VALID ID UPLOAD ERROR:', err.message);
    console.error('STACK:', err.stack);
    console.error('FILES:', req.files);
    console.error('BODY:', req.body);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

const uploadContract = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Contract file is required.' });

    const { unit_id, tenant_user_id, contract_start_date, contract_end_date, notes } = req.body;
    if (!unit_id || !tenant_user_id) {
      return res.status(400).json({ success: false, message: 'unit_id and tenant_user_id are required.' });
    }

    const result = await pool.query(
      `INSERT INTO documents
         (tenant_user_id, unit_id, document_type, contract_file, contract_start_date, contract_end_date, notes, status, uploaded_by)
       VALUES ($1,$2,'contract',$3,$4,$5,$6,'verified','admin')
       RETURNING *`,
      [tenant_user_id, unit_id, req.file.filename, contract_start_date || null, contract_end_date || null, notes || null]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('uploadContract error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getTenantDocuments = async (req, res) => {
  try {
    let tenantUserId;
    if (req.user.role === 'admin') {
      tenantUserId = req.params.userId;
    } else {
      tenantUserId = req.user.userId;
    }
    const result = await pool.query(
      `SELECT d.*, u.first_name || ' ' || u.last_name AS tenant_name, un.unit_code
       FROM documents d
       LEFT JOIN users u ON d.tenant_user_id = u.user_id
       LEFT JOIN units un ON d.unit_id = un.unit_id
       WHERE d.tenant_user_id = $1
       ORDER BY d.created_at DESC`,
      [tenantUserId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getTenantDocuments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getUnitDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.first_name || ' ' || u.last_name AS tenant_name
       FROM documents d
       LEFT JOIN users u ON d.tenant_user_id = u.user_id
       WHERE d.unit_id = $1
       ORDER BY d.created_at DESC`,
      [req.params.unitId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getUnitDocuments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const verifyDocument = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE documents SET status='verified', rejection_reason=NULL, updated_at=NOW()
       WHERE document_id=$1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Document not found.' });

    // Notify tenant (non-blocking)
    try {
      await sendNotification(result.rows[0].tenant_user_id, 'document_verified',
        'Your valid ID has been verified successfully.',
        result.rows[0].document_id
      );
    } catch {}

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('verifyDocument error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const rejectDocument = async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    if (!rejection_reason?.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }
    const result = await pool.query(
      `UPDATE documents SET status='rejected', rejection_reason=$1, updated_at=NOW()
       WHERE document_id=$2 RETURNING *`,
      [rejection_reason.trim(), req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Document not found.' });

    // Notify tenant (non-blocking)
    try {
      await sendNotification(result.rows[0].tenant_user_id, 'document_rejected',
        `Your valid ID was rejected. Reason: ${rejection_reason.trim()}. Please resubmit.`,
        result.rows[0].document_id
      );
    } catch {}

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('rejectDocument error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { submitId, uploadContract, getTenantDocuments, getUnitDocuments, verifyDocument, rejectDocument };
