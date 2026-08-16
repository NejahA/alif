const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/authMiddleware');
const logger = require('../config/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * @swagger
 * /api/uploads/file:
 *   post:
 *     summary: Upload a file
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: File uploaded successfully }
 *       400: { description: Invalid file }
 *       401: { description: Unauthorized }
 */
router.post('/file', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file provided',
    });
  }

  logger.info(`File uploaded by user ${req.user.id}: ${req.file.filename}`);

  res.json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/uploads/${req.file.filename}`,
    },
  });
});

module.exports = router;
