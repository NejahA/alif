import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';

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
    'public/index.html',
    'web/index.html',
    'build/web/index.html',
    'dist/index.html',
    'build/index.html',
    'frontend/index.html',
    'frontend/public/index.html',
    'src/index.html',
    'web-demo/index.html',
    'templates/index.html',
    'apps/web/index.html'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(dirPath, candidate))) {
      return candidate;
    }
  }

  // Shallow search (up to depth 2) for index.html files
  function searchSubdirs(currentDir, relativePrefix = '', depth = 0) {
    if (depth > 2) return null;
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'dist' && item.name !== 'build') {
          const subRel = relativePrefix ? `${relativePrefix}/${item.name}` : item.name;
          const indexPath = path.join(currentDir, item.name, 'index.html');
          if (fs.existsSync(indexPath)) {
            return `${subRel}/index.html`;
          }
          const nested = searchSubdirs(path.join(currentDir, item.name), subRel, depth + 1);
          if (nested) return nested;
        }
      }
    } catch (e) { }
    return null;
  }

  return searchSubdirs(dirPath);
}

// Tech Stack Detector
function detectTechStack(dirPath, pkgJson = {}, entryHtml = null) {
  const stack = [];
  const deps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) };
  const n = path.basename(dirPath).toLowerCase();

  if (deps.react || deps['react-dom'] || n.includes('react')) stack.push('React');
  if (deps['@angular/core']) stack.push('Angular');
  if (deps.vue) stack.push('Vue');
  if (deps.next) stack.push('Next.js');
  if (deps.express) stack.push('Express');
  if (deps.electron || n.includes('electron')) stack.push('Electron');
  if (deps.flutter || fs.existsSync(path.join(dirPath, 'pubspec.yaml'))) stack.push('Flutter');
  if (deps.vite) stack.push('Vite');
  if (deps.tailwindcss) stack.push('Tailwind');

  try {
    const files = fs.readdirSync(dirPath);
    if (files.some(f => f.endsWith('.py'))) stack.push('Python');
    if (files.some(f => f.endsWith('.cs') || f.endsWith('.csproj'))) stack.push('.NET / C#');
    if (files.some(f => f.endsWith('.rs'))) stack.push('Rust');
    if (files.some(f => f.endsWith('.go'))) stack.push('Go');
  } catch (e) { }

  if (entryHtml && stack.length === 0) stack.push('HTML5 / JS');
  if (pkgJson.name && stack.length === 0) stack.push('Node.js');

  return [...new Set(stack)];
}

// Categorization helper based on folder name, package.json, and structure
function categorizeProject(name, pkgJson = {}, dirPath = '') {
  const n = name.toLowerCase();
  const desc = (pkgJson.description || '').toLowerCase();

  if (n.includes('sound') || n.includes('melodix') || n.includes('audio') || n.includes('440') || n.includes('432') || n.includes('regulator') || n.includes('antis') || n.includes('aeris') || desc.includes('audio') || desc.includes('sound') || desc.includes('music')) {
    return { category: 'Audio & Soundscapes', icon: '🎵', hue: 280 };
  }
  if (n.includes('json') || n.includes('rpg') || n.includes('game') || n.includes('derangement') || n.includes('kalcioom') || n.includes('999') || n.includes('ludic') || n.includes('ashned') || n.includes('mayson') || desc.includes('reincarnation') || desc.includes('game') || desc.includes('rpg')) {
    return { category: 'RPG & Gaming', icon: '⚔️', hue: 25 };
  }
  if (n.includes('task') || n.includes('pomodoro') || n.includes('board') || n.includes('admin') || n.includes('nexus') || n.includes('broker') || n.includes('applicator') || n.includes('privacy') || desc.includes('task') || desc.includes('management')) {
    return { category: 'Tasks & Management', icon: '⚡', hue: 160 };
  }
  if (n.includes('desktop') || n.includes('kiros') || n.includes('windoes') || n.includes('telipso') || n.includes('imports') || n.includes('flutter') || n.includes('virtuo') || n.includes('snlyt') || desc.includes('desktop') || desc.includes('windows')) {
    return { category: 'Desktop Apps', icon: '🖥️', hue: 200 };
  }
  if (n.includes('canvas') || n.includes('hiro') || n.includes('hi§ro') || n.includes('scribelog') || n.includes('ponder') || n.includes('inkwell') || n.includes('nebula') || desc.includes('canvas') || desc.includes('journal') || desc.includes('notes') || desc.includes('spaced-repetition')) {
    return { category: 'Canvas & Knowledge', icon: '🧠', hue: 220 };
  }
  return { category: 'Experimental Engines', icon: '🌌', hue: 320 };
}

// Read subproject details
function scanWorkspace() {
  const items = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const projects = [];

  const ignoreList = new Set([
    '.git', '.github', 'node_modules', 'alif-universe', 'src', 'home',
    'melodixpublic', 'melodixsrc', 'melodixsrccomponents', 'melodixsrctypes',
    'pomodoro_timerassetssounds', 'volatillfrontendsrc', 'trutouthweb-demo'
  ]);

  for (const item of items) {
    if (!item.isDirectory() || item.name.startsWith('.') || ignoreList.has(item.name)) {
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
    let codeFilesCount = 0;
    try {
      const files = fs.readdirSync(dirPath);
      fileCount = files.length;
      codeFilesCount = files.filter(f => /\.(js|ts|py|cs|html|css|json|rs|go|md)$/i.test(f)).length;
    } catch (e) { }

    // Skip empty or fragment directories that have no package.json, no index.html, and 0 code files
    if (!hasPkg && !hasHtml && codeFilesCount === 0) {
      continue;
    }

    const meta = categorizeProject(item.name, pkgJson, dirPath);
    const techStack = detectTechStack(dirPath, pkgJson, entryHtml);

    // ==== COSMIC TIMELINE: birth date & commits (scaffold mock) ====
    // Try to use real folder creation time; fall back to deterministic pseudo-random
    let birthTimeMs = 0;
    try {
      const st = fs.statSync(dirPath);
      birthTimeMs = st.birthtimeMs || st.ctimeMs || st.mtimeMs;
    } catch (e) {}
    const NOW = Date.now();
    const TWO_YEARS = 1000 * 60 * 60 * 24 * 365 * 2;
    if (!birthTimeMs || birthTimeMs < NOW - TWO_YEARS || birthTimeMs > NOW) {
      // Deterministic hash offset based on project name
      const hash = item.name.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
      const offset = TWO_YEARS * 0.1 + TWO_YEARS * 0.8 * (Math.abs(hash % 1000) / 1000);
      birthTimeMs = NOW - offset;
    }
    // Deterministic commits between birthTimeMs and now
    const commitHash = item.name.split('').reduce((a, c) => (a * 131 + c.charCodeAt(0)) | 0, 17);
    const nCommits = 3 + (Math.abs(commitHash) % 22);
    const commitMsgs = [
      'Initial scaffolding', 'Bug fixes & polish', 'New feature added',
      'Refactor internals', 'UI/UX improvements', 'Performance optimization',
      'Documentation update', 'Dependency upgrade'
    ];
    const commits = [];
    for (let i = 0; i < nCommits; i++) {
      const t = (i + 1) / (nCommits + 1);
      const jitter = 0.15 * (Math.abs(((commitHash * (i + 5)) % 1000) / 1000) - 0.5);
      const commitT = Math.max(0, Math.min(1, t + jitter));
      const commitDate = birthTimeMs + (NOW - birthTimeMs) * commitT;
      commits.push({
        date: Math.round(commitDate),
        msg: commitMsgs[Math.abs((commitHash + i * 7)) % commitMsgs.length],
        hue: meta.hue
      });
    }
    commits.sort((a, b) => a.date - b.date);

    projects.push({
      name: item.name,
      title: pkgJson.name || item.name,
      description: pkgJson.description || `Subproject module located at /${item.name}`,
      version: pkgJson.version || '1.0.0',
      category: meta.category,
      icon: meta.icon,
      hue: meta.hue,
      hasPackageJson: hasPkg,
      hasHtml: hasHtml,
      entryHtml: entryHtml,
      fileCount: fileCount,
      techStack: techStack,
      path: dirPath,
      scripts: pkgJson.scripts || {},
      birthDate: Math.round(birthTimeMs),
      commits: commits
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

  let reqPath = req.path;
  if (reqPath === '/' || reqPath === '') {
    const entryHtml = findEntryHtml(targetDir);
    if (entryHtml) {
      return res.redirect(`/apps/${encodeURIComponent(projectName)}/${entryHtml}`);
    }
  }

  const fullFilePath = path.join(targetDir, reqPath);

  // HTML Base Href Rewriting for Web Apps
  if (fs.existsSync(fullFilePath) && fs.statSync(fullFilePath).isFile() && fullFilePath.endsWith('.html')) {
    try {
      let htmlContent = fs.readFileSync(fullFilePath, 'utf8');

      const relativeFilePath = path.relative(targetDir, fullFilePath);
      const subDir = path.dirname(relativeFilePath);
      const subDirPath = (subDir === '.' || subDir === '') ? '' : subDir.replace(/\\/g, '/') + '/';
      const baseHref = `/apps/${encodeURIComponent(projectName)}/${subDirPath}`;

      if (/<base\s+[^>]*>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<base\s+[^>]*>/i, `<base href="${baseHref}">`);
      } else if (/<head>/i.test(htmlContent)) {
        htmlContent = htmlContent.replace(/<head>/i, `<head>\n  <base href="${baseHref}">`);
      } else {
        htmlContent = `<base href="${baseHref}">\n` + htmlContent;
      }

      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.send(htmlContent);
    } catch (e) {
      console.error('Error rewriting HTML base href:', e);
    }
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
    detectedPort: null,
    logs: [],
    listeners: new Set()
  };

  function appendLog(type, text) {
    // Detect server port in logs
    const portMatch = text.match(/(?:http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):|port\s*:?\s*|running at\s+http:\/\/localhost:)(\d{4,5})/i);
    if (portMatch && portMatch[1]) {
      procInfo.detectedPort = portMatch[1];
    }

    const logEntry = { type, time: new Date().toLocaleTimeString(), text, port: procInfo.detectedPort };
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
      if (process.platform === 'win32' && procInfo.process.pid) {
        exec(`taskkill /F /T /PID ${procInfo.process.pid}`, () => {});
      } else {
        procInfo.process.kill('SIGTERM');
      }
      procInfo.running = false;
    }
    res.json({ ok: true, message: 'Process stop signal sent' });
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
      detectedPort: p.detectedPort,
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


