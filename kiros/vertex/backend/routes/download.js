import express from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getFile, incrementDownloads } from '../db.js';
import { decryptFile } from '../middleware/encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { key, iv } = req.query;

    if (!key || !iv) {
      return res.status(400).json({ error: 'Missing encryption key or IV' });
    }

    const fileRecord = await getFile(fileId);
    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Read encrypted file
    const filePath = join(__dirname, '../uploads', fileId);
    const encryptedBuffer = readFileSync(filePath);

    // Decrypt file
    const decryptedBuffer = decryptFile(encryptedBuffer, key, iv);

    // Increment download count
    await incrementDownloads(fileId);

    res.setHeader('Content-Type', fileRecord.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.send(decryptedBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

export default router;
