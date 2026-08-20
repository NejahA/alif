import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Track active child processes
const activeProcesses = new Map();

// Helper to find entry HTML file in a project folder
function findEntryHtml(dirPath) {
  const candidates = [
    'index.html',
    'web/index.html',
    'public/index.html',
    'dist/index.html',
    'src/index.html',
    'web-demo/index.html',
    'frontend/index.html',
    'templates/index.html',
    'apps/web/index.html'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(dirPath, candidate))) {
      return candidate;
    }
  }

  // Recursive shallow search if not in standard candidates
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        const subIndex = path.join(item.name, 'index.html');
        if (fs.existsSync(path.join(dirPath, subIndex))) {
          return subIndex;
        }
      }
    }
  } catch (e) { }

  return null;
}

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

    try {
      const pkgPath = path.join(dirPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        hasPkg = true;
      }
    } catch (e) { }

    const entryHtml = findEntryHtml(dirPath);
    const hasHtml = entryHtml !== null;

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
      entryHtml: entryHtml,
      fileCount: fileCount,
      path: dirPath,
      scripts: pkgJson.scripts || {}
    });
  }

  return projects;
}

// Serve Original Subprojects Static Assets Dynamic Route
app.use('/apps/:projectName', (req, res, next) => {
  const projectName = decodeURIComponent(req.params.projectName);
  const targetDir = path.resolve(ROOT_DIR, projectName);

  if (!targetDir.startsWith(ROOT_DIR)) {
    return res.status(403).send('Access Denied');
  }

  if (!fs.existsSync(targetDir)) {
    return res.status(404).send('Project directory not found');
  }

  express.static(targetDir, { dotfiles: 'ignore' })(req, res, next);
});

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

    let runningCount = 0;
    activeProcesses.forEach(p => {
      if (p.running) runningCount++;
    });

    res.json({
      ok: true,
      totalProjects: projects.length,
      activeProcesses: runningCount,
      categories,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Process Management APIs
app.post('/api/run-script', (req, res) => {
  const { projectName, scriptName } = req.body;
  if (!projectName || !scriptName) {
    return res.status(400).json({ ok: false, error: 'Missing projectName or scriptName' });
  }

  const projectDir = path.resolve(ROOT_DIR, projectName);
  if (!fs.existsSync(projectDir)) {
    return res.status(404).json({ ok: false, error: 'Project directory not found' });
  }

  const pid = Date.now().toString() + '_' + Math.floor(Math.random() * 1000);

  const proc = spawn('npm', ['run', scriptName], {
    cwd: projectDir,
    shell: true
  });

  const procInfo = {
    pid,
    projectName,
    scriptName,
    startTime: new Date().toISOString(),
    process: proc,
    running: true,
    logs: [],
    listeners: new Set()
  };

  function appendLog(type, text) {
    const logEntry = { type, time: new Date().toLocaleTimeString(), text };
    procInfo.logs.push(logEntry);
    if (procInfo.logs.length > 500) procInfo.logs.shift();

    for (const listener of procInfo.listeners) {
      listener(logEntry);
    }
  }

  appendLog('system', `🚀 Launching script "npm run ${scriptName}" in /${projectName}...`);

  proc.stdout.on('data', (data) => {
    appendLog('stdout', data.toString());
  });

  proc.stderr.on('data', (data) => {
    appendLog('stderr', data.toString());
  });

  proc.on('close', (code) => {
    procInfo.running = false;
    procInfo.exitCode = code;
    appendLog('system', `🏁 Process exited with code ${code}`);
  });

  proc.on('error', (err) => {
    procInfo.running = false;
    appendLog('stderr', `❌ Process error: ${err.message}`);
  });

  activeProcesses.set(pid, procInfo);
  res.json({ ok: true, pid, projectName, scriptName });
});

app.post('/api/stop-process', (req, res) => {
  const { pid } = req.body;
  const procInfo = activeProcesses.get(pid);
  if (!procInfo) {
    return res.status(404).json({ ok: false, error: 'Process not found' });
  }

  try {
    if (procInfo.process && procInfo.running) {
      procInfo.process.kill('SIGTERM');
      procInfo.running = false;
    }
    res.json({ ok: true, message: 'Process stopped' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/processes', (req, res) => {
  const list = [];
  activeProcesses.forEach((p, pid) => {
    list.push({
      pid,
      projectName: p.projectName,
      scriptName: p.scriptName,
      startTime: p.startTime,
      running: p.running,
      exitCode: p.exitCode
    });
  });
  res.json({ ok: true, processes: list });
});

app.get('/api/logs/:pid', (req, res) => {
  const { pid } = req.params;
  const procInfo = activeProcesses.get(pid);

  if (!procInfo) {
    return res.status(404).json({ ok: false, error: 'Process not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send existing logs immediately
  procInfo.logs.forEach(log => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });

  const listener = (logEntry) => {
    res.write(`data: ${JSON.stringify(logEntry)}\n\n`);
  };

  procInfo.listeners.add(listener);

  req.on('close', () => {
    procInfo.listeners.delete(listener);
  });
});

app.listen(PORT, () => {
  console.log(`🌌 ALIVERSE Master Hub running at http://localhost:${PORT}`);
});

