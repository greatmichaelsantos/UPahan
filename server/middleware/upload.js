const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (subDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const unitPhotoUpload = multer({
  storage: createStorage('units'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

const maintenancePhotoUpload = multer({
  storage: createStorage('maintenance'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

module.exports = { unitPhotoUpload, maintenancePhotoUpload };
