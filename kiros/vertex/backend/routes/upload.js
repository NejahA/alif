import express from 'express';
import multer from 'multer';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { addFile } from '../db.js';
import { generateEncryptionKey, generateIV, encryptFile } from '../middleware/encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const encryptionKey = generateEncryptionKey();
    const iv = generateIV();

    // Encrypt file
    const encryptedBuffer = encryptFile(req.file.buffer, encryptionKey, iv);

    // Save encrypted file
    const uploadsDir = join(__dirname, '../uploads');
    const filePath = join(uploadsDir, fileId);
    writeFileSync(filePath, encryptedBuffer);

    // Save metadata
    await addFile({
      id: fileId,
      filename: fileId,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      encryptionKey,
      iv
    });

    res.json({
      fileId,
      encryptionKey,
      iv,
      downloadLink: `http://localhost:3000/download?fileId=${fileId}&key=${encryptionKey}&iv=${iv}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
