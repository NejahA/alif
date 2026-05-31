import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import taskRoutes from './routes/tasks.js';
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
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`FlowwState backend running on http://localhost:${PORT}`);
});
