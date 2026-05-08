const express = require('express');
const router = express.Router();
const { getAllTenants, getTenant, assignTenant, removeTenant, getMyTenantInfo } = require('../controllers/tenantsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, requireRole('admin'), getAllTenants);
router.get('/me', verifyToken, requireRole('tenant'), getMyTenantInfo);
router.get('/:id', verifyToken, requireRole('admin'), getTenant);
router.post('/', verifyToken, requireRole('admin'), assignTenant);
router.delete('/:id', verifyToken, requireRole('admin'), removeTenant);

module.exports = router;
