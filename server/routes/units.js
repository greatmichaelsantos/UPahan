const express = require('express');
const router = express.Router();
const {
  getAllUnits, getUnit, createUnit, updateUnit,
  deleteUnit, uploadUnitPhotos, getCollectionSummary
} = require('../controllers/unitsController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { unitPhotoUpload } = require('../middleware/upload');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
};

router.get('/', optionalAuth, getAllUnits);
router.get('/collection-summary', verifyToken, requireRole('admin'), getCollectionSummary);
router.get('/:id', optionalAuth, getUnit);
router.post('/', verifyToken, requireRole('admin'), createUnit);
router.put('/:id', verifyToken, requireRole('admin'), updateUnit);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUnit);
router.post('/:id/photos', verifyToken, requireRole('admin'), unitPhotoUpload.array('photos', 10), uploadUnitPhotos);

module.exports = router;
