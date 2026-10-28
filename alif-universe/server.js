import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
// Everything the hub is allowed to touch. Sibling folders of `alif` (e.g. graen,
// pulsar, overheatr) are part of the ecosystem too, so containment is checked
// against the parent workspace rather than the `alif` folder alone.
const BASE_DIR = path.resolve(ROOT_DIR, '..');

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

// ---------- Bulk launch engine utilities ----------

// Bulk queue slot releasers: hub pid -> release callback (so exit frees the slot early)
const bulkSlotReleasers = new Map();

// Strip ANSI escape codes + carriage returns so logs render cleanly in the browser
const ANSI_RE = /\u001B\[[0-9;?]*[ -/]*[@-~]/g;
function stripAnsi(str) {
  return String(str).replace(ANSI_RE, '').replace(/\r/g, '');
}

// Allocate a unique port for every spawned dev server so nothing collides.
const portPool = { used: new Set(), next: Number(process.env.PORT_POOL_START) || 5100 };
function allocatePort() {
  for (let i = 0; i < 800; i++) {
    const p = portPool.next++;
    if (portPool.next > 5900) portPool.next = 5100;
    if (!portPool.used.has(p)) {
      portPool.used.add(p);
      return p;
    }
  }
  return null;
}
function releasePort(port) {
  if (port) portPool.used.delete(Number(port));
}

// Hand a URL to Chrome so Flutter web apps show up in a real browser window
function openInChrome(url) {
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', 'chrome', url], { detached: true, stdio: 'ignore' }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', ['-a', 'Google Chrome', url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('google-chrome', [url], { detached: true, stdio: 'ignore' }).unref();
    }
    return true;
  } catch (e) {
    console.error('openInChrome failed:', e.message);
    return false;
  }
}

// Which package.json script should "Run All" prefer for each project?
const LAUNCH_SCRIPT_PRIORITY = [
  { name: 'dev', score: 100 },
  { name: 'flutter:chrome', score: 95 },
  { name: 'start', score: 90 },
  { name: 'serve', score: 70 },
  { name: 'preview', score: 60 },
  { name: 'develop', score: 55 },
  { name: 'app', score: 35 },
  { name: 'electronserve', score: 32 },
  { name: 'electron', score: 30 },
  { name: 'watch', score: 28 },
  { name: 'dotnet:run', score: 26 },
  { name: 'flutter:web', score: 25 },
  { name: 'django:run', score: 24 },
  { name: 'flask:run', score: 24 },
  { name: 'node:serve', score: 22 }
];

// A one-shot script (build/test/lint) is not something you "run" as a live app
function isOneShotCommand(cmd) {
  if (!cmd) return true;
  const c = String(cmd).toLowerCase();
  if (/\bdev\b|\bserve\b|\bpreview\b|\bwatch\b|\bstart\b/.test(c)) return false;
  return /\b(build|test|lint|format|typecheck|tsc|deploy|publish|analyze)\b/.test(c);
}

function buildLaunchPlan(project) {
  const scripts = project.scripts || {};
  for (const s of LAUNCH_SCRIPT_PRIORITY) {
    if (scripts[s.name]) return { runnable: true, scriptName: s.name, score: s.score };
  }
  const fallback = Object.keys(scripts).find(k => !isOneShotCommand(scripts[k]));
  if (fallback) return { runnable: true, scriptName: fallback, score: 10 };
  return { runnable: false, scriptName: null, score: 0 };
}

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
    'app/index.html',
    'popup.html',
    'popup/popup.html'
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
  if (deps.flutter || fs.existsSync(path.join(dirPath, 'pubspec.yaml')) || fs.existsSync(path.join(dirPath, 'pubspec.lock'))) stack.push('Flutter');
  if (deps.vite) stack.push('Vite');
  if (deps.tailwindcss) stack.push('Tailwind');

  try {
    const files = fs.readdirSync(dirPath);
    if (files.includes('manifest.json') || files.includes('manifest.v2.json') || files.includes('manifest.v3.json')) stack.push('Browser Extension');
    if (files.some(f => f.endsWith('.py') || ['requirements.txt', 'pyproject.toml', 'Pipfile'].includes(f))) stack.push('Python');
    if (files.some(f => f.endsWith('.cs') || f.endsWith('.csproj') || f.endsWith('.sln'))) stack.push('.NET / C#');
    if (files.some(f => f.endsWith('.rs') || files.includes('Cargo.toml'))) stack.push('Rust');
    if (files.some(f => f.endsWith('.go') || files.includes('go.mod'))) stack.push('Go');
    if (files.some(f => f.endsWith('.cpp') || f.endsWith('.c') || f.endsWith('.h') || f === 'CMakeLists.txt' || f === 'Makefile')) stack.push('C / C++');
    if (files.some(f => f.endsWith('.kt') || f.endsWith('.java') || f === 'build.gradle' || f === 'build.gradle.kts')) stack.push('Android / Kotlin');
  } catch (e) { }

  if (entryHtml && stack.length === 0) stack.push('HTML5 / JS');
  if (pkgJson.name && stack.length === 0) stack.push('Node.js');
  if (stack.length === 0) stack.push('Source Module');

  return [...new Set(stack)];
}

// Categorization helper based on folder name, package.json, and tech stack
function categorizeProject(name, techStack = [], pkgJson = {}, dirPath = '') {
  const n = name.toLowerCase();
  const desc = (pkgJson.description || '').toLowerCase();
  const hasFlutter = techStack.includes('Flutter') || n.includes('flutter');
  const hasAndroid = techStack.includes('Android / Kotlin');
  const isExtension = techStack.includes('Browser Extension') || n.includes('extension');

  if (isExtension) {
    return { category: 'Browser Extensions', icon: '🧩', hue: 45 };
  }
  if (hasFlutter || hasAndroid) {
    return { category: 'Mobile & Desktop', icon: '📱', hue: 200 };
  }
  if (n.includes('sound') || n.includes('melodix') || n.includes('audio') || n.includes('440') || n.includes('432') || n.includes('regulator') || n.includes('antis') || n.includes('aeris') || n.includes('acapella') || n.includes('midi') || desc.includes('audio') || desc.includes('sound') || desc.includes('music')) {
    return { category: 'Audio & Soundscapes', icon: '🎵', hue: 280 };
  }
  if (n.includes('json') || n.includes('rpg') || n.includes('game') || n.includes('derangement') || n.includes('kalcioom') || n.includes('999') || n.includes('ludic') || n.includes('ashned') || n.includes('mayson') || n.includes('ninja') || n.includes('gladiator') || desc.includes('reincarnation') || desc.includes('game') || desc.includes('rpg')) {
    return { category: 'RPG & Gaming', icon: '⚔️', hue: 25 };
  }
  if (n.includes('task') || n.includes('pomodoro') || n.includes('board') || n.includes('admin') || n.includes('nexus') || n.includes('broker') || n.includes('applicator') || n.includes('privacy') || desc.includes('task') || desc.includes('management')) {
    return { category: 'Tasks & Management', icon: '⚡', hue: 160 };
  }
  if (n.includes('desktop') || n.includes('kiros') || n.includes('windoes') || n.includes('telipso') || n.includes('imports') || n.includes('virtuo') || n.includes('snlyt') || desc.includes('desktop') || desc.includes('windows')) {
    return { category: 'Mobile & Desktop', icon: '🖥️', hue: 200 };
  }
  if (n.includes('canvas') || n.includes('hiro') || n.includes('hi§ro') || n.includes('scribelog') || n.includes('ponder') || n.includes('inkwell') || n.includes('nebula') || n.includes('quill') || n.includes('readoc') || desc.includes('canvas') || desc.includes('journal') || desc.includes('notes') || desc.includes('spaced-repetition')) {
    return { category: 'Canvas & Knowledge', icon: '🧠', hue: 220 };
  }
  if (techStack.includes('Express') || techStack.includes('Python') || n.includes('backend') || n.includes('api') || n.includes('server')) {
    return { category: 'Web Services & APIs', icon: '🌐', hue: 120 };
  }
  return { category: 'Experimental Engines', icon: '🌌', hue: 320 };
}

// Read subproject details
function isProjectRoot(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    // Project indicators
    if (files.includes('package.json')) return true;
    if (files.includes('pubspec.yaml') || files.includes('pubspec.lock')) return true;
    if (files.includes('index.html')) return true;
    if (files.some(f => f.endsWith('.csproj') || f.endsWith('.sln'))) return true;
    if (files.includes('Cargo.toml')) return true;
    if (files.includes('go.mod')) return true;
    if (files.includes('requirements.txt') || files.includes('pyproject.toml') || files.includes('Pipfile')) return true;
    if (files.includes('manifest.json') || files.includes('manifest.v2.json') || files.includes('manifest.v3.json')) return true;
    if (files.includes('build.gradle') || files.includes('build.gradle.kts') || files.includes('settings.gradle') || files.includes('settings.gradle.kts') || files.includes('pom.xml')) return true;
    if (files.includes('CMakeLists.txt') || files.includes('Makefile')) return true;
    if (files.includes('docker-compose.yml') || files.includes('Dockerfile')) return true;
    if (files.some(f => ['main.py', 'app.py', 'server.py', 'run.py', 'manage.py', 'wincontrol.py', 'atlas.py', 'midi_launcher.py', 'pc_server.py', '__init__.py'].includes(f))) return true;
    return false;
  } catch (e) { return false; }
}

// Build a descriptor for a directory already known to be a project root.
// Returns null for empty fragment folders that carry no project markers.
function buildProjectEntry(fullDir, relativeDir, projectName) {
  const NOW = Date.now();
  const TWO_YEARS = 1000 * 60 * 60 * 24 * 365 * 2;

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
    codeFilesCount = files.filter(f => /\.(js|ts|py|cs|html|css|json|rs|go|md|dart|jsx|tsx|yaml|yml|swift|kt|java|c|cpp|h)$/i.test(f)).length;
  } catch (e) { }

  const isStrongProject = hasPkg || hasHtml || fs.existsSync(path.join(fullDir, 'pubspec.yaml')) || fs.existsSync(path.join(fullDir, 'Cargo.toml')) || fs.existsSync(path.join(fullDir, 'manifest.json')) || fs.existsSync(path.join(fullDir, 'build.gradle')) || fs.existsSync(path.join(fullDir, 'build.gradle.kts'));
  if (!isStrongProject && codeFilesCount === 0) return null;

  const techStack = detectTechStack(fullDir, pkgJson, entryHtml);
  const meta = categorizeProject(projectName, techStack, pkgJson, fullDir);

  // Virtual scripts for non-npm projects
  const scripts = { ...(pkgJson.scripts || {}) };
  if (techStack.includes('Flutter')) {
    // A bare `flutter run` asks which device to use and would hang a bulk
    // launch waiting on stdin, so it is always replaced by an explicit device.
    delete scripts['flutter:run'];
    const hasWebPlatform = fs.existsSync(path.join(fullDir, 'web', 'index.html'));
    const enableWeb = hasWebPlatform ? '' : 'flutter create . --platforms web && ';

    // Serve the app, then let the hub open it in Chrome. `flutter run -d chrome`
    // is unreliable here: its DWDS debugger fails to attach to Chrome's
    // DevTools port (ECONNREFUSED) and flutter exits, killing the app.
    scripts['flutter:chrome'] = `${enableWeb}flutter run -d web-server --web-hostname 127.0.0.1`;
    scripts['flutter:chrome-debug'] = `${enableWeb}flutter run -d chrome`;
    scripts['flutter:build-web'] = 'flutter build web';
  }
  if (techStack.includes('Android / Kotlin')) {
    if (!scripts.build && !scripts['gradle:build']) {
      scripts['gradle:build'] = process.platform === 'win32' ? '.\\gradlew assembleDebug' : './gradlew assembleDebug';
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
  if (techStack.includes('.NET / C#')) {
    if (!scripts.start && !scripts.run && !scripts['dotnet:run']) {
      scripts['dotnet:run'] = 'dotnet run';
    }
  }
  if (techStack.includes('Python')) {
    if (!scripts.start && !scripts.run && !scripts['python:run']) {
      try {
        const files = fs.readdirSync(fullDir);
        const mainFile = files.find(f => ['main.py', 'app.py', 'server.py', 'index.py', 'run.py', 'pc_server.py', 'wincontrol.py', 'atlas.py', 'midi_launcher.py'].includes(f)) || files.find(f => f.endsWith('.py'));
        if (mainFile) scripts['python:run'] = `python ${mainFile}`;
        else if (files.includes('manage.py')) scripts['django:run'] = 'python manage.py runserver';
      } catch (e) {}
    }
  }
  // A Node package whose scripts are all one-shot (or missing) but that ships a
  // conventional server entry file can still be started directly.
  if (hasPkg && !Object.keys(scripts).some(k => !isOneShotCommand(scripts[k]))) {
    const nodeEntry = ['server.js', 'index.js', 'app.js', 'main.js']
      .find(f => fs.existsSync(path.join(fullDir, f)));
    if (nodeEntry) scripts['node:serve'] = `node ${nodeEntry}`;
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

  return {
    name: projectName,
    title: pkgJson.name || projectName,
    description: pkgJson.description || `Subproject module at ${relativeDir}`,
    version: pkgJson.version || '1.0.0',
    category: meta.category,
    icon: meta.icon,
    hue: meta.hue,
    hasPackageJson: hasPkg,
    hasHtml: hasHtml,
    isFlutter: techStack.includes('Flutter'),
    entryHtml: entryHtml,
    fileCount: fileCount,
    techStack: techStack,
    path: fullDir,
    relativePath: relativeDir,
    scripts: scripts,
    birthDate: Math.round(birthTimeMs),
    commits: commits
  };
}

// Projects that live next to `alif` (graen, pulsar, overheatr, …) belong to the
// same workspace, so they are surfaced as top-level projects too.
function scanSiblingRoots(projects) {
  let items;
  try {
    items = fs.readdirSync(BASE_DIR, { withFileTypes: true });
  } catch (e) { return; }

  for (const item of items) {
    if (!item.isDirectory() || item.name.startsWith('.')) continue;
    const fullDir = path.join(BASE_DIR, item.name);
    if (fullDir === ROOT_DIR) continue;
    if (projectPathMap.has(item.name)) continue;
    if (!isProjectRoot(fullDir)) continue;

    const entry = buildProjectEntry(fullDir, `../${item.name}`, item.name);
    if (!entry) continue;
    projectPathMap.set(item.name, `../${item.name}`);
    projects.push(entry);
  }
}

function scanWorkspace() {
  projectPathMap.clear();
  const projects = [];

  const ignoreList = new Set([
    '.git', '.github', 'node_modules', 'alif-universe', 'src', 'home',
    'melodixpublic', 'melodixsrc', 'melodixsrccomponents', 'melodixsrctypes',
    'pomodoro_timerassetssounds', 'volatillfrontendsrc', 'trutouthweb-demo',
    '.dart_tool', '.idea', '.vscode', 'build', 'dist', '__pycache__', 'gradle', '.gradle'
  ]);

  // Top-level container dirs that we should RECURSE INTO instead of treating as projects
  const containerDirs = new Set([
    'o-o', 'antis', 'kiros', 'Beta', 'MERN Belt Exam', 'flutters', "react's", "expoe' s", 'windoes', 'flutter',
    'Career Service', 'Filmmakers and Movies', 'React assignments', 'iot-control', 'nate', 'nile', 'old mill',
    'scratch', 'time-traveling-toaster', 'tries', 'volatill', 'webs', 'new', 'misc', 'Weelk 0', 'ninja man',
    'domoiq', 'malware_guardian', 'mediach', 'n8n', 'librepods-main', 'Nexus', 'bluetough', 'achmed'
  ]);

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
        const isContainer = containerDirs.has(item.name) || containerDirs.has(item.name.replace(/['\s]/g, ''));
        processDir(childRel, depth + 1, isContainer);
      }
      return;
    }

    // Determine if this directory itself is a project root
    const thisIsProject = isProjectRoot(fullDir);

    if (thisIsProject) {
      // Determine flattened project name for display + routing
      const parts = relativeDir.split(/[\/\\]/).filter(Boolean);
      const projectName = parts.length === 1 ? parts[0] : parts.join('--');

      const entry = buildProjectEntry(fullDir, relativeDir, projectName);
      if (!entry) {
        // Not a valid project - skip adding but still recurse if it might contain projects
        for (const item of items) {
          if (!item.isDirectory() || item.name.startsWith('.') || ignoreList.has(item.name)) continue;
          const childRel = relativeDir ? `${relativeDir}/${item.name}` : item.name;
          processDir(childRel, depth + 1, false);
        }
        return;
      }
      projectPathMap.set(projectName, relativeDir);
      projects.push(entry);
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
  scanSiblingRoots(projects);

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

  if (!targetDir.startsWith(BASE_DIR)) {
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

// ---------- Process Management APIs ----------

// Resolve a project name to its on-disk directory (null when missing/unsafe)
function resolveProjectDir(projectName) {
  if (projectPathMap.size === 0) {
    try { scanWorkspace(); } catch (e) { console.warn('Lazy scan failed:', e.message); }
  }
  const relativeDir = projectPathMap.get(projectName) || projectName;
  const dir = path.resolve(ROOT_DIR, relativeDir);
  if (!dir.startsWith(BASE_DIR)) return null;
  return fs.existsSync(dir) ? dir : null;
}

// Static projects (HTML-only, no dev-server script) don't need a child process —
// the hub already serves them at /apps/<name>/. They are registered as lightweight
// "served" entries so "Run All" surfaces every app in the Fleet with an Open action.
function registerStaticApp(projectName) {
  const pid = `static:${projectName}`;
  if (activeProcesses.has(pid)) return pid;
  activeProcesses.set(pid, {
    pid,
    projectName,
    scriptName: 'static',
    static: true,
    bulk: true,
    port: null,
    detectedPort: null,
    running: true,
    exitCode: null,
    startTime: new Date().toISOString(),
    logs: [],
    listeners: new Set(),
    process: null,
    url: `/apps/${encodeURIComponent(projectName)}/`
  });
  return pid;
}

// Launch one project script as a managed child process.
// Returns { ok:true, pid, port, ... } or { ok:false, status, error }
function launchProject(projectName, scriptName, opts = {}) {
  const projectDir = resolveProjectDir(projectName);
  if (!projectDir) {
    return { ok: false, status: 404, error: `Project directory not found: ${projectName}` };
  }

  const projects = scanWorkspace();
  const project = projects.find(p => p.name === projectName);
  if (!project) {
    return { ok: false, status: 404, error: 'Project metadata not found' };
  }

  const command = project.scripts[scriptName];
  if (!command) {
    return { ok: false, status: 400, error: `Script "${scriptName}" not found in project` };
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

  const port = opts.port || allocatePort();

  // Vite ignores the PORT env var, so forward the port explicitly
  let runCommand = isNpmScript ? `npm run ${scriptName}` : command;
  if (isNpmScript && port && /\bvite\b/i.test(command) && !/\bbuild\b/i.test(command)) {
    runCommand += ` -- --port ${port}`;
  }

  // Flutter web also needs an explicit, collision-free port
  const isFlutterRun = /\bflutter run\b/.test(runCommand);
  if (isFlutterRun && port && !/--web-port/.test(runCommand)) {
    runCommand = runCommand.replace(/\bflutter run\b/g, `flutter run --web-port ${port}`);
  }

  // Dev servers cannot start without node_modules — install first when missing
  const nodeModulesPath = path.join(projectDir, 'node_modules');
  const needsInstall = opts.autoInstall !== false
    && project.hasPackageJson
    && !fs.existsSync(nodeModulesPath);

  // --legacy-peer-deps works around an npm 10.x crash in peer resolution
  // ("Cannot read properties of null (reading 'edgesOut')") that aborts installs.
  const installPrefix = needsInstall
    ? 'npm install --no-audit --no-fund --legacy-peer-deps && '
    : '';

  const pid = Date.now().toString() + '_' + Math.floor(Math.random() * 100000);

  const procInfo = {
    pid,
    projectName,
    scriptName,
    bulk: !!opts.bulk,
    port,
    installing: needsInstall,
    isFlutter: isFlutterRun,
    openInChrome: !!opts.openInChrome,
    openedInChrome: false,
    startTime: new Date().toISOString(),
    running: true,
    exitCode: null,
    logs: [],
    listeners: new Set(),
    process: null
  };

  const appendLog = (type, content) => {
    const text = stripAnsi(content);
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      text
    };

    if (type === 'stdout' && !procInfo.detectedPort) {
      if (procInfo.isFlutter) {
        // `flutter run -d chrome` serves the app on the --web-port we assigned.
        // Don't parse URLs here: the lines it prints contain the Dart VM service
        // port, which is a different, useless port.
        if (/Flutter run key commands|Debug service listening on|This app is linked to the debug service/.test(text)) {
          procInfo.detectedPort = String(procInfo.port);
          logEntry.port = procInfo.detectedPort;
        }
      } else {
        const match = text.match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::\]):(\d+)/);
        if (match) {
          procInfo.detectedPort = match[1];
          logEntry.port = match[1];
        }
      }

      // The app is up, so this launch no longer needs to throttle the queue
      if (procInfo.detectedPort) {
        const releaser = bulkSlotReleasers.get(pid);
        if (releaser) releaser();

        if (procInfo.openInChrome && !procInfo.openedInChrome) {
          procInfo.openedInChrome = true;
          const url = `http://localhost:${procInfo.detectedPort}`;
          appendLog('system', `🌐 Opening ${url} in Chrome`);
          openInChrome(url);
        }
      }
    }

    procInfo.logs.push(logEntry);
    // Bound memory for long-running dev servers
    if (procInfo.logs.length > 800) procInfo.logs.splice(0, procInfo.logs.length - 800);
    procInfo.listeners.forEach(l => l(logEntry));
  };

  const spawnCommand = installPrefix + runCommand;
  procInfo.command = spawnCommand;

  appendLog('system', `🚀 Launching: ${spawnCommand} in /${projectName}${port ? ` (PORT=${port})` : ''}${needsInstall ? ' — installing dependencies first (this can take a while)...' : ''}`);

  const proc = spawn(spawnCommand, [], {
    shell: true,
    cwd: projectDir,
    env: { ...process.env, PORT: port ? String(port) : process.env.PORT, BROWSER: 'none' }
  });

  procInfo.process = proc;

  proc.stdout.on('data', (data) => appendLog('stdout', data.toString()));
  proc.stderr.on('data', (data) => appendLog('stderr', data.toString()));

  proc.on('close', (code) => {
    procInfo.running = false;
    procInfo.exitCode = code;
    releasePort(procInfo.port);
    appendLog('system', `🏁 Process exited with code ${code}`);
    // Free the bulk queue slot immediately instead of waiting for the timer
    const releaser = bulkSlotReleasers.get(pid);
    if (releaser) releaser();
  });

  proc.on('error', (err) => {
    procInfo.running = false;
    releasePort(procInfo.port);
    appendLog('stderr', `❌ Process error: ${err.message}`);
    const releaser = bulkSlotReleasers.get(pid);
    if (releaser) releaser();
  });

  activeProcesses.set(pid, procInfo);
  return { ok: true, pid, projectName, scriptName, port, needsInstall };
}

// Kill a managed process by its hub pid
function stopProjectProcess(pid) {
  const procInfo = activeProcesses.get(pid);
  if (!procInfo) return false;
  try {
    // Static "served" entries have no child process — just unregister them
    if (procInfo.static) {
      activeProcesses.delete(pid);
      return true;
    }
    if (procInfo.process && procInfo.running) {
      if (process.platform === 'win32' && procInfo.process.pid) {
        exec(`taskkill /F /T /PID ${procInfo.process.pid}`, () => { });
      } else {
        procInfo.process.kill('SIGTERM');
      }
    }
    procInfo.running = false;
    releasePort(procInfo.port);
    return true;
  } catch (err) {
    console.error('stopProjectProcess failed:', err.message);
    return false;
  }
}

app.post('/api/run-script', (req, res) => {
  const { projectName, scriptName } = req.body;
  if (!projectName || !scriptName) {
    return res.status(400).json({ ok: false, error: 'Missing projectName or scriptName' });
  }

  const result = launchProject(projectName, scriptName);
  if (!result.ok) {
    return res.status(result.status || 500).json({ ok: false, error: result.error });
  }
  res.json({ ok: true, pid: result.pid, projectName: result.projectName, scriptName: result.scriptName, port: result.port });
});

app.post('/api/stop-process', (req, res) => {
  const { pid } = req.body;
  if (!activeProcesses.has(pid)) {
    return res.status(404).json({ ok: false, error: 'Process not found' });
  }
  stopProjectProcess(pid);
  res.json({ ok: true, message: 'Process stop signal sent' });
});

// Open a managed app (or any URL) in Chrome
app.post('/api/open-in-chrome', (req, res) => {
  const { pid, url } = req.body || {};
  let target = url;

  if (!target && pid) {
    const procInfo = activeProcesses.get(pid);
    if (procInfo && procInfo.detectedPort) {
      target = `http://localhost:${procInfo.detectedPort}`;
    }
  }
  if (!target) {
    return res.status(400).json({ ok: false, error: 'No URL available for that process yet' });
  }

  const opened = openInChrome(target);
  res.json({ ok: opened, url: target });
});

// ---------- Bulk queue engine ----------
// Launching 200+ dev servers at once would freeze the machine, so the queue
// keeps at most `concurrency` launches in flight. A slot is released when the
// process exits, or after `slotMs` (long-running dev servers shouldn't hold
// slots forever — the point is to throttle the expensive install/startup phase).
const bulk = {
  active: false,
  queue: [],
  inFlight: 0,
  concurrency: 5,
  slotMs: 150000,
  openInChrome: false,
  total: 0,
  launched: 0,
  failed: 0,
  startedAt: null,
  finishedAt: null,
  current: []
};

function bulkPump() {
  while (bulk.inFlight < bulk.concurrency && bulk.queue.length > 0) {
    const item = bulk.queue.shift();
    bulk.inFlight++;

    const res = launchProject(item.name, item.scriptName, {
      bulk: true,
      autoInstall: true,
      openInChrome: bulk.openInChrome
    });

    if (!res.ok) {
      bulk.failed++;
      bulk.inFlight--;
      continue;
    }

    bulk.launched++;
    bulk.current.push({ pid: res.pid, projectName: item.name, scriptName: item.scriptName, port: res.port });

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      clearTimeout(timer);
      bulkSlotReleasers.delete(res.pid);
      bulk.inFlight = Math.max(0, bulk.inFlight - 1);
      bulk.current = bulk.current.filter(c => c.pid !== res.pid);
      // Keep pumping on the next tick so we don't recurse deeply
      setTimeout(() => {
        if (bulk.queue.length === 0 && bulk.inFlight === 0) {
          bulk.active = false;
          bulk.finishedAt = new Date().toISOString();
        } else if (bulk.active) {
          bulkPump();
        }
      }, 0);
    };
    const timer = setTimeout(release, res.needsInstall ? bulk.slotMs : 15000);
    bulkSlotReleasers.set(res.pid, release);
  }

  if (bulk.queue.length === 0 && bulk.inFlight === 0) {
    bulk.active = false;
    bulk.finishedAt = new Date().toISOString();
  }
}

// Preview what "Run All" would launch, without spawning anything
app.get('/api/launch-plan', (req, res) => {
  try {
    const projects = scanWorkspace();
    const runningNames = new Set();
    activeProcesses.forEach(p => { if (p.running) runningNames.add(p.projectName); });

    const runnable = [];
    const staticOnly = [];
    const idle = [];
    for (const p of projects) {
      const plan = buildLaunchPlan(p);
      if (plan.runnable) {
        const dir = resolveProjectDir(p.name);
        const needsInstall = !!p.hasPackageJson && !!dir && !fs.existsSync(path.join(dir, 'node_modules'));
        runnable.push({
          name: p.name,
          scriptName: plan.scriptName,
          score: plan.score,
          category: p.category,
          isFlutter: !!p.isFlutter,
          needsInstall
        });
      } else if (p.hasHtml) {
        staticOnly.push(p.name);
      } else {
        idle.push(p.name);
      }
    }
    runnable.sort((a, b) => b.score - a.score);
    res.json({
      ok: true,
      total: projects.length,
      runnableTotal: runnable.length,
      flutterTotal: runnable.filter(r => r.isFlutter).length,
      needsInstallTotal: runnable.filter(r => r.needsInstall).length,
      staticOnlyTotal: staticOnly.length,
      idleTotal: idle.length,
      alreadyRunning: [...runningNames],
      runnable,
      staticOnly,
      idle
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Bulk launch: queue every runnable project, throttled by the slot engine
app.post('/api/run-all', (req, res) => {
  try {
    const {
      limit = 0,
      concurrency = 5,
      slotMs = 150000,
      category = 'all',
      runtime = 'all',
      openInChrome = false
    } = req.body || {};

    let projects = scanWorkspace();
    if (category && category !== 'all') {
      projects = projects.filter(p => p.category === category);
    }
    if (runtime === 'flutter') {
      projects = projects.filter(p => p.isFlutter);
    }

    const runningNames = new Set();
    activeProcesses.forEach(p => { if (p.running) runningNames.add(p.projectName); });

    const runnable = [];
    const staticOnly = [];
    const idle = [];
    for (const p of projects) {
      const plan = buildLaunchPlan(p);
      if (!plan.runnable) {
        if (p.hasHtml) staticOnly.push(p.name);
        else idle.push(p.name);
        continue;
      }
      if (runningNames.has(p.name)) continue;
      runnable.push({ name: p.name, scriptName: plan.scriptName, score: plan.score });
    }
    runnable.sort((a, b) => b.score - a.score);

    // HTML-only apps need no process: the hub already serves them at
    // /apps/<name>/, so just register them so they show up in the Fleet.
    staticOnly.forEach(registerStaticApp);

    const selected = limit > 0 ? runnable.slice(0, Math.max(1, limit)) : runnable;

    if (selected.length === 0) {
      return res.json({
        ok: true,
        planned: 0,
        totalRunnable: runnable.length,
        staticServed: staticOnly.length,
        idle: idle.length,
        message: staticOnly.length
          ? `No new dev servers to launch. ${staticOnly.length} static app(s) registered in the Fleet.`
          : 'Nothing new to launch.'
      });
    }

    // Reset the queue engine
    bulk.queue = selected.map(s => ({ name: s.name, scriptName: s.scriptName }));
    bulk.inFlight = 0;
    bulk.concurrency = Math.max(1, Math.min(Number(concurrency) || 5, 20));
    bulk.slotMs = Math.max(5000, Number(slotMs) || 45000);
    bulk.openInChrome = !!openInChrome;
    bulk.total = selected.length;
    bulk.launched = 0;
    bulk.failed = 0;
    bulk.current = [];
    bulk.startedAt = new Date().toISOString();
    bulk.finishedAt = null;
    bulk.active = true;

    bulkPump();

    res.json({
      ok: true,
      planned: selected.length,
      totalRunnable: runnable.length,
      skippedAlreadyRunning: runningNames.size,
      staticServed: staticOnly.length,
      idle: idle.length,
      concurrency: bulk.concurrency,
      firstWaveLaunched: bulk.launched,
      queue: selected.map(s => s.name)
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Live progress of the bulk queue
app.get('/api/bulk-status', (req, res) => {
  res.json({
    ok: true,
    active: bulk.active,
    total: bulk.total,
    launched: bulk.launched,
    failed: bulk.failed,
    remaining: bulk.queue.length,
    inFlight: bulk.inFlight,
    concurrency: bulk.concurrency,
    current: bulk.current,
    startedAt: bulk.startedAt,
    finishedAt: bulk.finishedAt
  });
});

// Bulk stop: kill every managed process and drain the queue
app.post('/api/stop-all', (req, res) => {
  bulk.queue = [];
  bulk.active = false;

  const stopped = [];
  activeProcesses.forEach((p, pid) => {
    if (p.running) {
      stopProjectProcess(pid);
      stopped.push(pid);
    }
  });
  bulkSlotReleasers.forEach(releaser => releaser());
  res.json({ ok: true, stopped: stopped.length, pids: stopped });
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
      bulk: p.bulk,
      static: !!p.static,
      url: p.url || null,
      installing: p.installing,
      isFlutter: p.isFlutter,
      command: p.command,
      port: p.port,
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


