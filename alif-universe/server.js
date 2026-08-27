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

// Map of flattened project name -> actual relative dir path (for nested projects)
// e.g. "o-o--halal" -> "o-o/halal", "antis--ashcil" -> "antis/ashcil"
const projectPathMap = new Map();

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
    'apps/web/index.html',
    'client/index.html',
    'client/public/index.html',
    'demo/index.html',
    'app/index.html'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(dirPath, candidate))) {
      return candidate;
    }
  }

  // Shallow search (up to depth 3) for index.html files
  function searchSubdirs(currentDir, relativePrefix = '', depth = 0) {
    if (depth > 3) return null;
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'dist' && item.name !== 'build' && item.name !== '__pycache__' && item.name !== '.dart_tool') {
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
    if (files.some(f => f.endsWith('.rs') || files.includes('Cargo.toml'))) stack.push('Rust');
    if (files.some(f => f.endsWith('.go') || files.includes('go.mod'))) stack.push('Go');
    if (files.includes('requirements.txt') || files.includes('pyproject.toml')) stack.push('Python');
  } catch (e) { }

  if (entryHtml && stack.length === 0) stack.push('HTML5 / JS');
  if (pkgJson.name && stack.length === 0) stack.push('Node.js');

  return [...new Set(stack)];
}

// Categorization helper based on folder name, package.json, and tech stack
function categorizeProject(name, techStack = [], pkgJson = {}, dirPath = '') {
  const n = name.toLowerCase();
  const desc = (pkgJson.description || '').toLowerCase();
  const hasFlutter = techStack.includes('Flutter') || n.includes('flutter');

  if (hasFlutter) {
    return { category: 'Desktop Apps', icon: '📱', hue: 200 };
  }

  if (n.includes('sound') || n.includes('melodix') || n.includes('audio') || n.includes('440') || n.includes('432') || n.includes('regulator') || n.includes('antis') || n.includes('aeris') || desc.includes('audio') || desc.includes('sound') || desc.includes('music')) {
    return { category: 'Audio & Soundscapes', icon: '🎵', hue: 280 };
  }
  if (n.includes('json') || n.includes('rpg') || n.includes('game') || n.includes('derangement') || n.includes('kalcioom') || n.includes('999') || n.includes('ludic') || n.includes('ashned') || n.includes('mayson') || desc.includes('reincarnation') || desc.includes('game') || desc.includes('rpg')) {
    return { category: 'RPG & Gaming', icon: '⚔️', hue: 25 };
  }
  if (n.includes('task') || n.includes('pomodoro') || n.includes('board') || n.includes('admin') || n.includes('nexus') || n.includes('broker') || n.includes('applicator') || n.includes('privacy') || desc.includes('task') || desc.includes('management')) {
    return { category: 'Tasks & Management', icon: '⚡', hue: 160 };
  }
  if (n.includes('desktop') || n.includes('kiros') || n.includes('windoes') || n.includes('telipso') || n.includes('imports') || n.includes('virtuo') || n.includes('snlyt') || desc.includes('desktop') || desc.includes('windows')) {
    return { category: 'Desktop Apps', icon: '🖥️', hue: 200 };
  }
  if (n.includes('canvas') || n.includes('hiro') || n.includes('hi§ro') || n.includes('scribelog') || n.includes('ponder') || n.includes('inkwell') || n.includes('nebula') || desc.includes('canvas') || desc.includes('journal') || desc.includes('notes') || desc.includes('spaced-repetition')) {
    return { category: 'Canvas & Knowledge', icon: '🧠', hue: 220 };
  }
  return { category: 'Experimental Engines', icon: '🌌', hue: 320 };
}

// Read subproject details
function isProjectRoot(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    // Project indicators
    if (files.includes('package.json')) return true;
    if (files.includes('pubspec.yaml')) return true;
    if (files.includes('index.html')) return true;
    if (files.some(f => f.endsWith('.csproj'))) return true;
    if (files.includes('Cargo.toml')) return true;
    if (files.includes('go.mod')) return true;
    if (files.includes('requirements.txt')) return true;
    if (files.includes('pyproject.toml')) return true;
    return false;
  } catch (e) { return false; }
}

function scanWorkspace() {
  projectPathMap.clear();
  const projects = [];

  const ignoreList = new Set([
    '.git', '.github', 'node_modules', 'alif-universe', 'src', 'home',
    'melodixpublic', 'melodixsrc', 'melodixsrccomponents', 'melodixsrctypes',
    'pomodoro_timerassetssounds', 'volatillfrontendsrc', 'trutouthweb-demo',
    '.dart_tool', '.idea', '.vscode', 'build', 'dist', '__pycache__'
  ]);

  // Top-level container dirs that we should RECURSE INTO instead of treating as projects
  const containerDirs = new Set([
    'o-o', 'antis', 'kiros', 'Beta', 'MERN Belt Exam', 'flutters', "react's", "expoe' s", 'windoes', 'flutter'
  ]);

  const NOW = Date.now();
  const TWO_YEARS = 1000 * 60 * 60 * 24 * 365 * 2;

  function processDir(relativeDir, depth = 0, parentIsContainer = false) {
    const fullDir = path.join(ROOT_DIR, relativeDir);
    let items;
    try {
      items = fs.readdirSync(fullDir, { withFileTypes: true });
    } catch (e) { return; }

    const baseName = path.basename(relativeDir) || relativeDir;

    // SKIP the workspace root itself (depth 0, empty rel) - never a project, just a container
    if (depth === 0 && relativeDir === '') {
      for (const item of items) {
        if (!item.isDirectory() || item.name.startsWith('.') || ignoreList.has(item.name)) continue;
        const childRel = item.name;
        const isContainer = containerDirs.has(item.name);
        processDir(childRel, depth + 1, isContainer);
      }
      return;
    }

    // Determine if this directory itself is a project root
    const thisIsProject = isProjectRoot(fullDir);

    if (thisIsProject) {
      // ----- Build project entry -----
      let pkgJson = {};
      let hasPkg = false;
      try {
        const pkgPath = path.join(fullDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
          pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          hasPkg = true;
        }
      } catch (e) { }

      const entryHtml = findEntryHtml(fullDir);
      const hasHtml = entryHtml !== null;

      let fileCount = 0;
      let codeFilesCount = 0;
      try {
        const files = fs.readdirSync(fullDir);
        fileCount = files.length;
        // Added .yaml, .yml, .dart, .swift, .kt to the regex
        codeFilesCount = files.filter(f => /\.(js|ts|py|cs|html|css|json|rs|go|md|dart|jsx|tsx|yaml|yml|swift|kt)$/i.test(f)).length;
      } catch (e) { }

      // Skip empty fragment directories (unless it had clear project markers like pubspec.yaml)
      const isStrongProject = hasPkg || hasHtml || fs.existsSync(path.join(fullDir, 'pubspec.yaml')) || fs.existsSync(path.join(fullDir, 'Cargo.toml'));
      
      if (!isStrongProject && codeFilesCount === 0) {
        // Not a valid project - skip adding but still recurse if it might contain projects
        for (const item of items) {
          if (!item.isDirectory() || item.name.startsWith('.') || ignoreList.has(item.name)) continue;
          const childRel = relativeDir ? `${relativeDir}/${item.name}` : item.name;
          processDir(childRel, depth + 1, false);
        }
        return;
      }

      // Determine flattened project name for display + routing
      // Top-level dirs keep their simple name
      // Nested dirs get "parent--child" naming
      let projectName;
      const parts = relativeDir.split(/[\/\\]/).filter(Boolean);
      if (parts.length === 1) {
        projectName = parts[0];
      } else {
        projectName = parts.join('--');
      }
      projectPathMap.set(projectName, relativeDir);

      const techStack = detectTechStack(fullDir, pkgJson, entryHtml);
      const meta = categorizeProject(projectName, techStack, pkgJson, fullDir);

      // Virtual scripts for non-npm projects
      const scripts = { ...(pkgJson.scripts || {}) };
      if (techStack.includes('Flutter')) {
        if (!scripts.start && !scripts.dev && !scripts['flutter:run']) {
          scripts['flutter:run'] = 'flutter run';
        }
      }
      if (techStack.includes('Rust')) {
        if (!scripts.start && !scripts.run && !scripts['cargo:run']) {
          scripts['cargo:run'] = 'cargo run';
        }
      }
      if (techStack.includes('Go')) {
        if (!scripts.start && !scripts.run && !scripts['go:run']) {
          scripts['go:run'] = 'go run .';
        }
      }
      if (techStack.includes('Python')) {
        if (!scripts.start && !scripts.run && !scripts['python:run']) {
          const mainFile = fs.readdirSync(fullDir).find(f => f === 'main.py' || f === 'app.py' || f === 'index.py');
          if (mainFile) scripts['python:run'] = `python ${mainFile}`;
          else if (fs.existsSync(path.join(fullDir, 'manage.py'))) scripts['django:run'] = 'python manage.py runserver';
        }
      }

      // ==== COSMIC TIMELINE: birth date & commits ====
      let birthTimeMs = 0;
      try {
        const st = fs.statSync(fullDir);
        birthTimeMs = st.birthtimeMs || st.ctimeMs || st.mtimeMs;
      } catch (e) {}
      if (!birthTimeMs || birthTimeMs < NOW - TWO_YEARS || birthTimeMs > NOW) {
        const hash = projectName.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
        const offset = TWO_YEARS * 0.1 + TWO_YEARS * 0.8 * (Math.abs(hash % 1000) / 1000);
        birthTimeMs = NOW - offset;
      }
      const commitHash = projectName.split('').reduce((a, c) => (a * 131 + c.charCodeAt(0)) | 0, 17);
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
        name: projectName,
        title: pkgJson.name || projectName,
        description: pkgJson.description || `Subproject module at /${relativeDir}`,
        version: pkgJson.version || '1.0.0',
        category: meta.category,
        icon: meta.icon,
        hue: meta.hue,
        hasPackageJson: hasPkg,
        hasHtml: hasHtml,
        entryHtml: entryHtml,
        fileCount: fileCount,
        techStack: techStack,
        path: fullDir,
        relativePath: relativeDir,
        scripts: scripts,
        birthDate: Math.round(birthTimeMs),
        commits: commits
      });
    }

    // Recurse into subdirectories (unless ignored) to find nested projects
    // We recurse up to depth 5, skipping known ignored directories
    if (depth < 5) {
      for (const item of items) {
        if (!item.isDirectory() || item.name.startsWith('.') || ignoreList.has(item.name)) continue;
        
        // Don't recurse into obvious build/asset/platform dirs
        if (['node_modules', '.dart_tool', 'build', 'dist', 'android', 'ios', 'macos', 'linux', 'windows', '.git', '.github', '.idea', '.vscode', '__pycache__', 'assets', 'public', 'static', 'lib', 'src', 'components', 'vendor', 'coverage', '.next', '.nuxt', 'out', 'web'].includes(item.name)) {
          // Exception: only skip 'web' if we already found a project at this level
          if (item.name === 'web' && !thisIsProject) {
            // allow recursion into web if it's not a subfolder of a project
          } else {
            continue;
          }
        }

        const childRel = relativeDir ? `${relativeDir}/${item.name}` : item.name;
        processDir(childRel, depth + 1, parentIsContainer || thisIsProject);
      }
    }
  }

  processDir('', 0, false);

  return projects;
}

// Helper: rewrite absolute asset paths in HTML/CSS/JS content
function rewriteAbsoluteAssetPaths(content, assetPrefix) {
  // Ensure prefix doesn't end with /
  const prefix = assetPrefix.replace(/\/$/, '');

  // 1. Rewrite absolute paths in src="..." and href="..." attributes
  // Matches: src="/anything" or href="/anything"  (not starting with //, http:, data:, etc.)
  content = content.replace(/\b(src|href|poster|srcset)\s*=\s*(["'])(\/(?!\/)[^"']+)\2/gi, (match, attr, quote, url) => {
    // Skip data URIs, blob:, etc.
    if (url.startsWith('//') || url.startsWith('data:') || url.startsWith('blob:')) return match;
    return `${attr}=${quote}${prefix}${url}${quote}`;
  });

  // 2. Rewrite absolute paths in url(...) within inline styles and <style> blocks
  // Matches: url(/path), url('/path'), url("/path")
  content = content.replace(/url\(\s*(["']?)\/(?!\/)([^"')]+)\1\s*\)/gi, (match, quote, urlPath) => {
    if (urlPath.startsWith('/') || urlPath.startsWith('data:') || urlPath.startsWith('blob:')) return match;
    return `url(${quote}${prefix}/${urlPath}${quote})`;
  });

  // 3. Rewrite absolute paths in <img srcset> with x descriptors (less common)
  // 4. Rewrite import statements in JS modules that use absolute paths
  // import ... from "/path" or import "/path"
  content = content.replace(/(import\s+(?:[^'";]+?\s+from\s+)?)(["'])\/(?!\/)([^'"]+)\2/g, (match, pre, quote, mod) => {
    if (mod.startsWith('http') || mod.startsWith('data:') || mod.startsWith('//')) return match;
    return `${pre}${quote}${prefix}/${mod}${quote}`;
  });

  // 5. Rewrite fetch("/path"), axios.get("/path") etc.  (heuristic: "/..." string literal preceded by non-word char)
  // Be careful not to double-rewrite already-prefixed paths
  content = content.replace(/([\s(,={:\[])(["'])\/(?!\/)([A-Za-z0-9_\-./@?=&%+~#]+)\2/g, (match, pre, quote, rest) => {
    // Skip if already starts with our prefix
    const candidate = `/${rest}`;
    if (rest.startsWith(prefix.replace(/^\//, ''))) return match;
    // Skip URLs that are protocol-full
    if (rest.startsWith('http') || rest.startsWith('data:') || rest.startsWith('blob:')) return match;
    // Skip common non-asset string contexts (heuristic: rest too short or has no /)
    return `${pre}${quote}${prefix}${candidate}${quote}`;
  });

  return content;
}

// Serve Original Subprojects Static Assets Dynamic Route
app.use('/apps/:projectName', (req, res, next) => {
  const projectName = decodeURIComponent(req.params.projectName);

  // Resolve real directory: either direct ROOT_DIR/projectName OR via projectPathMap
  // Ensure projectPathMap is populated (lazy init for safety on first request)
  if (projectPathMap.size === 0) {
    try { scanWorkspace(); } catch (e) { console.warn('Lazy workspace scan failed:', e.message); }
  }
  let relativeDir = projectPathMap.get(projectName);
  if (!relativeDir) {
    // Fallback: assume it's a top-level directory if projectPathMap is empty (first request)
    relativeDir = projectName;
  }
  const targetDir = path.resolve(ROOT_DIR, relativeDir);

  if (!targetDir.startsWith(ROOT_DIR)) {
    return res.status(403).send('Access Denied');
  }

  if (!fs.existsSync(targetDir)) {
    return res.status(404).send(`Project directory not found: ${projectName} (resolved to ${relativeDir})`);
  }

  let reqPath = req.path;
  if (reqPath === '/' || reqPath === '') {
    const entryHtml = findEntryHtml(targetDir);
    if (entryHtml) {
      return res.redirect(`/apps/${encodeURIComponent(projectName)}/${entryHtml}`);
    }
  }

  const fullFilePath = path.join(targetDir, reqPath);

  // Rewrite content for text-based assets
  if (fs.existsSync(fullFilePath) && fs.statSync(fullFilePath).isFile()) {
    const ext = path.extname(fullFilePath).toLowerCase();
    const isTextAsset = ['.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.svg', '.json'].includes(ext);

    if (isTextAsset) {
      try {
        let fileContent = fs.readFileSync(fullFilePath, 'utf8');
        const relativeFilePath = path.relative(targetDir, fullFilePath);
        const subDir = path.dirname(relativeFilePath);
        const subDirPath = (subDir === '.' || subDir === '') ? '' : subDir.replace(/\\/g, '/') + '/';
        const baseHref = `/apps/${encodeURIComponent(projectName)}/${subDirPath}`;
        const assetPrefix = baseHref.replace(/\/$/, '');

        // 1) HTML: inject base tag + rewrite absolute asset paths
        if (ext === '.html' || ext === '.htm') {
          // Inject or replace <base> tag
          if (/<base\s+[^>]*>/i.test(fileContent)) {
            fileContent = fileContent.replace(/<base\s+[^>]*>/i, `<base href="${baseHref}">`);
          } else if (/<head>/i.test(fileContent)) {
            fileContent = fileContent.replace(/<head>/i, `<head>\n  <base href="${baseHref}">`);
          } else {
            fileContent = `<base href="${baseHref}">\n` + fileContent;
          }
          // Also rewrite absolute paths to be safe
          fileContent = rewriteAbsoluteAssetPaths(fileContent, assetPrefix);

          res.setHeader('Content-Type', 'text/html; charset=UTF-8');
          return res.send(fileContent);
        }

        // 2) CSS: rewrite url("/path") references
        if (ext === '.css') {
          fileContent = rewriteAbsoluteAssetPaths(fileContent, assetPrefix);
          res.setHeader('Content-Type', 'text/css; charset=UTF-8');
          return res.send(fileContent);
        }

        // 3) JS/MJS/CJS: rewrite import "/..." and fetch("/...") patterns
        if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
          fileContent = rewriteAbsoluteAssetPaths(fileContent, assetPrefix);
          res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
          return res.send(fileContent);
        }

        // 4) SVG (may contain url(...) references and hrefs)
        if (ext === '.svg') {
          fileContent = rewriteAbsoluteAssetPaths(fileContent, assetPrefix);
          res.setHeader('Content-Type', 'image/svg+xml; charset=UTF-8');
          return res.send(fileContent);
        }
      } catch (e) {
        console.error('Error rewriting asset paths for', req.path, ':', e.message);
      }
    }
  }

  express.static(targetDir, { dotfiles: 'ignore' })(req, res, () => {
    // SPA Fallback: if not found, serve index.html
    const entryHtml = findEntryHtml(targetDir);
    if (entryHtml) {
      const entryPath = path.join(targetDir, entryHtml);
      if (fs.existsSync(entryPath)) {
        try {
          let fileContent = fs.readFileSync(entryPath, 'utf8');
          const subDir = path.dirname(entryHtml);
          const subDirPath = (subDir === '.' || subDir === '') ? '' : subDir.replace(/\\/g, '/') + '/';
          const baseHref = `/apps/${encodeURIComponent(projectName)}/${subDirPath}`;
          const assetPrefix = baseHref.replace(/\/$/, '');

          // Inject base tag
          if (/<base\s+[^>]*>/i.test(fileContent)) {
            fileContent = fileContent.replace(/<base\s+[^>]*>/i, `<base href="${baseHref}">`);
          } else if (/<head>/i.test(fileContent)) {
            fileContent = fileContent.replace(/<head>/i, `<head>\n  <base href="${baseHref}">`);
          } else {
            fileContent = `<base href="${baseHref}">\n` + fileContent;
          }

          fileContent = rewriteAbsoluteAssetPaths(fileContent, assetPrefix);
          res.setHeader('Content-Type', 'text/html; charset=UTF-8');
          return res.send(fileContent);
        } catch (e) {
          return next();
        }
      }
    }
    next();
  });
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

  // Ensure map populated
  if (projectPathMap.size === 0) {
    try { scanWorkspace(); } catch (e) { console.warn('Lazy scan failed:', e.message); }
  }
  const relativeDir = projectPathMap.get(projectName) || projectName;
  const projectDir = path.resolve(ROOT_DIR, relativeDir);
  if (!fs.existsSync(projectDir)) {
    return res.status(404).json({ ok: false, error: `Project directory not found: ${projectName} (resolved to ${relativeDir})` });
  }

  const pid = Date.now().toString() + '_' + Math.floor(Math.random() * 1000);

  // Find the actual command to run
  const projects = scanWorkspace();
  const project = projects.find(p => p.name === projectName);
  if (!project) {
    return res.status(404).json({ ok: false, error: 'Project metadata not found' });
  }

  const command = project.scripts[scriptName];
  if (!command) {
    return res.status(400).json({ ok: false, error: `Script "${scriptName}" not found in project` });
  }

  // Check if it's an npm script by reading package.json again
  let isNpmScript = false;
  try {
    const pkgPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.scripts && pkg.scripts[scriptName]) isNpmScript = true;
    }
  } catch (e) { }

  const fullCommand = isNpmScript ? `npm run ${scriptName}` : command;

  const procInfo = {
    pid,
    projectName,
    scriptName,
    startTime: new Date().toISOString(),
    running: true,
    exitCode: null,
    logs: [],
    listeners: new Set(),
    process: null
  };

  const appendLog = (type, content) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      text: content.toString()
    };

    if (type === 'stdout' && content.toString().includes('http://localhost:')) {
      const match = content.toString().match(/http:\/\/localhost:(\d+)/);
      if (match) {
        procInfo.detectedPort = match[1];
        logEntry.port = match[1];
      }
    }

    procInfo.logs.push(logEntry);
    procInfo.listeners.forEach(l => l(logEntry));
  };

  appendLog('system', `🚀 Launching: ${fullCommand} in /${projectName}...`);

  const proc = spawn(fullCommand, [], {
    shell: true,
    cwd: projectDir
  });

  procInfo.process = proc;

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


