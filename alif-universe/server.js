import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Categorization helper based on folder name & package.json
function categorizeProject(name, pkgJson = {}) {
  const n = name.toLowerCase();
  const desc = (pkgJson.description || '').toLowerCase();

  if (n.includes('sound') || n.includes('melodix') || desc.includes('audio') || desc.includes('sound')) {
    return { category: 'Audio & Soundscapes', icon: '🎵', hue: 280 };
  }
  if (n.includes('json') || n.includes('rpg') || n.includes('derangement') || desc.includes('reincarnation') || desc.includes('game')) {
    return { category: 'RPG & Gaming', icon: '⚔️', hue: 25 };
  }
  if (n.includes('task') || n.includes('pomodoro') || n.includes('board') || n.includes('admin') || n.includes('nexus')) {
    return { category: 'Tasks & Management', icon: '⚡', hue: 160 };
  }
  if (n.includes('desktop') || n.includes('kiros') || n.includes('windoes') || n.includes('telipso')) {
    return { category: 'Desktop Apps', icon: '🖥️', hue: 200 };
  }
  if (n.includes('canvas') || n.includes('hi§ro') || n.includes('scribelog') || n.includes('ponder')) {
    return { category: 'Canvas & Knowledge', icon: '🧠', hue: 220 };
  }
  return { category: 'Experimental Engines', icon: '🌌', hue: 320 };
}

// Read subproject details
function scanWorkspace() {
  const items = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const projects = [];

  for (const item of items) {
    if (!item.isDirectory() || item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'alif-universe') {
      continue;
    }

    const dirPath = path.join(ROOT_DIR, item.name);
    let pkgJson = {};
    let hasPkg = false;
    let hasHtml = false;

    try {
      const pkgPath = path.join(dirPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        hasPkg = true;
      }
    } catch (e) { }

    try {
      hasHtml = fs.existsSync(path.join(dirPath, 'index.html'));
    } catch (e) { }

    let fileCount = 0;
    try {
      const files = fs.readdirSync(dirPath);
      fileCount = files.length;
    } catch (e) { }

    const meta = categorizeProject(item.name, pkgJson);

    projects.push({
      name: item.name,
      title: pkgJson.name || item.name,
      description: pkgJson.description || `Subproject located at ${item.name}`,
      version: pkgJson.version || '1.0.0',
      category: meta.category,
      icon: meta.icon,
      hue: meta.hue,
      hasPackageJson: hasPkg,
      hasHtml: hasHtml,
      fileCount: fileCount,
      path: dirPath,
      scripts: pkgJson.scripts || {}
    });
  }

  return projects;
}

// API Routes
app.get('/api/projects', (req, res) => {
  try {
    const projects = scanWorkspace();
    res.json({ ok: true, total: projects.length, projects });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const projects = scanWorkspace();
    const categories = {};
    projects.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    res.json({
      ok: true,
      totalProjects: projects.length,
      categories,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🌌 ALIVERSE Master Hub running at http://localhost:${PORT}`);
});
