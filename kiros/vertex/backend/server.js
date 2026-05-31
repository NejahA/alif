import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import uploadRoutes from './routes/upload.js';
import downloadRoutes from './routes/download.js';
import filesRoutes from './routes/files.js';
import { initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/files', filesRoutes);

app.listen(PORT, () => {
  console.log(`Vertex backend running on http://localhost:${PORT}`);
});
