const express = require('express');
const router = express.Router();
const {
  submitId, uploadContract, getTenantDocuments, getUnitDocuments, verifyDocument, rejectDocument,
} = require('../controllers/documentsController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { documentIdUpload, contractUpload } = require('../middleware/upload');

router.post('/submit-id', verifyToken, requireRole('tenant'), (req, res, next) => {
  documentIdUpload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, submitId);
router.post('/upload-contract', verifyToken, requireRole('admin'), contractUpload, uploadContract);
router.get('/my-documents', verifyToken, requireRole('tenant'), getTenantDocuments);
router.get('/tenant/:userId', verifyToken, requireRole('admin'), getTenantDocuments);
router.get('/unit/:unitId', verifyToken, requireRole('admin'), getUnitDocuments);
router.put('/:id/verify', verifyToken, requireRole('admin'), verifyDocument);
router.put('/:id/reject', verifyToken, requireRole('admin'), rejectDocument);

module.exports = router;
