// --- ALIVERSE — Master Hub Frontend App ---

let projectsData = [];
let filteredProjects = [];
let activeCategory = 'all';
let searchQuery = '';
let selectedProjectForModal = null;
let currentPid = null;
let activeEventSource = null;

// DOM Elements
const canvas = document.getElementById('galaxy-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const projectsGrid = document.getElementById('projects-grid');
const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');
const btnViewGalaxy = document.getElementById('btn-view-galaxy');
const btnViewGrid = document.getElementById('btn-view-grid');
const galaxyView = document.getElementById('galaxy-view');
const gridView = document.getElementById('grid-view');

// Modals
const inspectorModal = document.getElementById('inspector-modal');
const appViewerModal = document.getElementById('app-viewer-modal');
const terminalModal = document.getElementById('terminal-modal');
const appIframe = document.getElementById('app-iframe');
const terminalLogs = document.getElementById('terminal-logs');

// Galaxy View State
let W = window.innerWidth, H = window.innerHeight;
let viewX = 0, viewY = 0, viewZoom = 1;
let isDragging = false, dragStartX = 0, dragStartY = 0;
let hoveredNode = null;
let selectedNode = null;
let galaxyNodes = [];
let starParticles = [];
let mouseTrailParticles = [];
let rippleEffects = [];

// Category Domain Centers & Angles in Galaxy View
const DOMAIN_CONFIG = {
  'Canvas & Knowledge': { angle: 0, icon: '🧠', hue: 220 },
  'RPG & Gaming': { angle: Math.PI / 3, icon: '⚔️', hue: 25 },
  'Audio & Soundscapes': { angle: (2 * Math.PI) / 3, icon: '🎵', hue: 280 },
  'Tasks & Management': { angle: Math.PI, icon: '⚡', hue: 160 },
  'Desktop Apps': { angle: (4 * Math.PI) / 3, icon: '🖥️', hue: 200 },
  'Experimental Engines': { angle: (5 * Math.PI) / 3, icon: '🌌', hue: 320 }
};

// Background Star Particles
function initStarParticles() {
  starParticles = [];
  for (let i = 0; i < 150; i++) {
    starParticles.push({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005
    });
  }
}

// Fetch Projects & Stats
async function fetchProjects() {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    if (data.ok) {
      projectsData = data.projects;
      const totalEl = document.getElementById('stat-total');
      if (totalEl) totalEl.textContent = `${data.total} Subprojects`;
      updateCategoryCounts();
      applyFilters();
      initGalaxyNodes();
    }
  } catch (err) {
    console.warn('Backend API offline or static mode:', err);
  }
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.ok) {
      const procEl = document.getElementById('stat-processes');
      if (procEl) {
        procEl.textContent = `${data.activeProcesses || 0} Active`;
        procEl.className = data.activeProcesses > 0 ? 'stat-val text-emerald' : 'stat-val text-amber';
      }
    }
  } catch (e) { }
}

// Update Category Count Badges
function updateCategoryCounts() {
  const counts = {
    all: projectsData.length,
    'Canvas & Knowledge': 0,
    'RPG & Gaming': 0,
    'Audio & Soundscapes': 0,
    'Tasks & Management': 0,
    'Desktop Apps': 0,
    'Experimental Engines': 0
  };

  projectsData.forEach(p => {
    if (counts[p.category] !== undefined) counts[p.category]++;
  });

  const countAll = document.getElementById('count-all');
  if (countAll) countAll.textContent = counts.all;
  const countCanvas = document.getElementById('count-canvas');
  if (countCanvas) countCanvas.textContent = counts['Canvas & Knowledge'];
  const countRpg = document.getElementById('count-rpg');
  if (countRpg) countRpg.textContent = counts['RPG & Gaming'];
  const countAudio = document.getElementById('count-audio');
  if (countAudio) countAudio.textContent = counts['Audio & Soundscapes'];
  const countTasks = document.getElementById('count-tasks');
  if (countTasks) countTasks.textContent = counts['Tasks & Management'];
  const countDesktop = document.getElementById('count-desktop');
  if (countDesktop) countDesktop.textContent = counts['Desktop Apps'];
  const countExp = document.getElementById('count-experimental');
  if (countExp) countExp.textContent = counts['Experimental Engines'];
}

// Filter projects
function applyFilters() {
  filteredProjects = projectsData.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.techStack || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  renderGrid();
  initGalaxyNodes();
}

// Render Grid Codex View
function renderGrid() {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = '';

  if (filteredProjects.length === 0) {
    projectsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 60px 20px;">
      <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
      <div style="font-size: 16px; font-weight: 600; color: #fff;">No matching subprojects found</div>
      <div style="font-size: 12px; margin-top: 4px;">Try refining your search query or switching domain filter chips</div>
    </div>`;
    return;
  }

  filteredProjects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const stackBadges = (p.techStack || []).map(t => `<span class="tech-badge">${escapeHTML(t)}</span>`).join(' ');

    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="card-icon">${p.icon}</span>
          <div>
            <div class="card-title">${escapeHTML(p.name)}</div>
            <div class="card-cat">${escapeHTML(p.category)}</div>
          </div>
        </div>
        <div class="card-desc">${escapeHTML(p.description)}</div>
      </div>
      <div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
          ${stackBadges}
        </div>
        <div class="card-bottom">
          <span style="font-size: 10px; color: var(--text-dim);">${p.fileCount} files</span>
          ${p.hasHtml ? `<button class="card-launch-btn btn-card-launch">🚀 Launch</button>` : `<button class="card-launch-btn btn-card-inspect">⚙️ Inspect</button>`}
        </div>
      </div>
    `;

    const launchBtn = card.querySelector('.btn-card-launch');
    if (launchBtn) {
      launchBtn.onclick = (e) => {
        e.stopPropagation();
        launchLiveApp(p);
      };
    }

    card.onclick = () => openInspector(p);
    projectsGrid.appendChild(card);
  });
}

// Inspector Modal
function openInspector(p) {
  if (!inspectorModal) return;
  selectedProjectForModal = p;

  document.getElementById('modal-icon').textContent = p.icon;
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-category').textContent = p.category;
  document.getElementById('modal-desc').textContent = p.description;
  document.getElementById('modal-path').textContent = p.path;
  document.getElementById('modal-version').textContent = p.version;
  document.getElementById('modal-files').textContent = `${p.fileCount} files/dirs`;
  document.getElementById('modal-html').textContent = p.hasHtml ? `Yes (${p.entryHtml || 'index.html'})` : 'No (backend/cli)';

  const techContainer = document.getElementById('modal-tech-stack');
  if (techContainer) {
    techContainer.innerHTML = (p.techStack || []).map(t => `<span class="tech-badge" style="font-size: 11px; padding: 4px 8px;">${escapeHTML(t)}</span>`).join(' ') || '<span style="font-size: 11px; color: var(--text-dim);">Vanilla Node / JS</span>';
  }

  const btnLaunchModal = document.getElementById('btn-modal-launch-action');
  if (btnLaunchModal) {
    if (p.hasHtml) {
      btnLaunchModal.textContent = '🚀 Launch Web App';
      btnLaunchModal.style.display = 'inline-block';
      btnLaunchModal.onclick = () => {
        closeInspector();
        launchLiveApp(p);
      };
    } else {
      const serverScript = Object.keys(p.scripts || {}).find(k => ['dev', 'start', 'server', 'backend', 'dev:full'].includes(k.toLowerCase())) || Object.keys(p.scripts || {})[0];
      if (serverScript) {
        btnLaunchModal.textContent = `⚡ Start Server (${serverScript})`;
        btnLaunchModal.style.display = 'inline-block';
        btnLaunchModal.onclick = () => {
          closeInspector();
          runProjectScript(p, serverScript);
        };
      } else {
        btnLaunchModal.style.display = 'none';
      }
    }
  }

  const scriptsContainer = document.getElementById('modal-scripts');
  if (scriptsContainer) {
    scriptsContainer.innerHTML = '';
    const scriptKeys = Object.keys(p.scripts || {});
    if (scriptKeys.length === 0) {
      scriptsContainer.innerHTML = '<span style="font-size: 11px; color: var(--text-dim);">No package.json scripts defined</span>';
    } else {
      scriptKeys.forEach(k => {
        const tag = document.createElement('span');
        tag.className = 'script-tag';
        tag.textContent = `▶️ ${k}: ${p.scripts[k]}`;
        tag.title = 'Click to run this script live';
        tag.onclick = (e) => {
          e.stopPropagation();
          closeInspector();
          runProjectScript(p, k);
        };
        scriptsContainer.appendChild(tag);
      });
    }
  }

  inspectorModal.classList.remove('hidden');
}

function closeInspector() {
  if (inspectorModal) inspectorModal.classList.add('hidden');
}

// --- Live App Launcher (Iframe Embed) ---
function launchLiveApp(p, overrideUrl = null) {
  if (!appViewerModal || !appIframe) return;

  const appUrl = overrideUrl || `/apps/${encodeURIComponent(p.name)}/${p.entryHtml || 'index.html'}`;

  document.getElementById('viewer-icon').textContent = p.icon || '🌐';
  document.getElementById('viewer-name').textContent = `${p.name} — Live App`;
  document.getElementById('viewer-path').textContent = appUrl;

  appIframe.src = appUrl;
  appViewerModal.classList.remove('hidden');

  // Reload action
  const btnReload = document.getElementById('btn-viewer-reload');
  if (btnReload) {
    btnReload.onclick = () => {
      appIframe.src = appUrl;
    };
  }

  // Open Direct Action
  const btnExternal = document.getElementById('btn-viewer-external');
  if (btnExternal) {
    btnExternal.onclick = () => {
      window.open(appUrl, '_blank');
    };
  }
}

function closeLiveApp() {
  if (!appViewerModal || !appIframe) return;
  appIframe.src = 'about:blank';
  appViewerModal.classList.add('hidden');
}

// --- Live Script Execution & Terminal Console ---
async function runProjectScript(p, scriptName) {
  if (!terminalModal || !terminalLogs) return;

  terminalLogs.innerHTML = '';
  document.getElementById('terminal-title').textContent = `${p.name} — npm run ${scriptName}`;
  const statusBadge = document.getElementById('terminal-status');
  if (statusBadge) {
    statusBadge.textContent = 'Launching...';
    statusBadge.className = 'status-badge status-running';
  }

  const btnConnect = document.getElementById('btn-terminal-connect');
  if (btnConnect) btnConnect.classList.add('hidden');

  terminalModal.classList.remove('hidden');

  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  try {
    const res = await fetch('/api/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: p.name, scriptName })
    });

    const data = await res.json();
    if (!data.ok) {
      appendTerminalLog('stderr', `Error launching script: ${data.error}`);
      return;
    }

    currentPid = data.pid;
    fetchStats();

    // Stream SSE logs
    activeEventSource = new EventSource(`/api/logs/${currentPid}`);

    activeEventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        appendTerminalLog(log.type, log.text);

        if (log.port) {
          if (btnConnect) {
            btnConnect.textContent = `⚡ Connect Viewer (Port ${log.port})`;
            btnConnect.classList.remove('hidden');
            btnConnect.onclick = () => {
              launchLiveApp(p, `http://localhost:${log.port}`);
            };
          }
        }

        if (log.text && log.text.includes('exited with code')) {
          if (statusBadge) {
            statusBadge.textContent = 'Stopped';
            statusBadge.className = 'status-badge status-stopped';
          }
          fetchStats();
        }
      } catch (e) { }
    };

    activeEventSource.onerror = () => {
      if (statusBadge) {
        statusBadge.textContent = 'Disconnected';
        statusBadge.className = 'status-badge status-stopped';
      }
    };

  } catch (err) {
    appendTerminalLog('stderr', `Connection failed: ${err.message}`);
  }
}

function appendTerminalLog(type, text) {
  if (!terminalLogs) return;
  const line = document.createElement('div');
  line.className = `log-${type || 'stdout'}`;
  line.textContent = text;
  terminalLogs.appendChild(line);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

async function stopCurrentProcess() {
  if (!currentPid) return;
  try {
    await fetch('/api/stop-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid: currentPid })
    });
    appendTerminalLog('system', '🛑 Process stop signal sent');
    fetchStats();
  } catch (err) {
    appendTerminalLog('stderr', `Stop error: ${err.message}`);
  }
}

function closeTerminal() {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }
  if (terminalModal) terminalModal.classList.add('hidden');
}

// --- Galaxy Canvas Engine ---
function resizeCanvas() {
  if (!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function initGalaxyNodes() {
  galaxyNodes = [];
  const domainRadii = 280;

  filteredProjects.forEach((p) => {
    const config = DOMAIN_CONFIG[p.category] || { angle: 0, hue: 320 };
    const baseAngle = config.angle;
    const spread = (Math.random() - 0.5) * 0.8;
    const dist = domainRadii + (Math.random() - 0.5) * 140;

    const x = Math.cos(baseAngle + spread) * dist;
    const y = Math.sin(baseAngle + spread) * dist;

    galaxyNodes.push({
      project: p,
      x: x,
      y: y,
      baseX: x,
      baseY: y,
      radius: 8 + Math.min(12, p.fileCount * 0.4),
      hue: p.hue,
      orbitSpeed: 0.0003 + Math.random() * 0.0004,
      angle: Math.atan2(y, x),
      dist: dist
    });
  });
}

function drawGalaxy() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2 + viewX, H / 2 + viewY);
  ctx.scale(viewZoom, viewZoom);

  // Render Star Particles
  starParticles.forEach(star => {
    star.alpha += star.twinkleSpeed;
    if (star.alpha > 0.9 || star.alpha < 0.2) star.twinkleSpeed = -star.twinkleSpeed;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Mouse Trail Particles (behind nodes)
  mouseTrailParticles = mouseTrailParticles.filter(p => p.life > 0);
  mouseTrailParticles.forEach(p => {
    p.life -= p.decay;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    const alpha = Math.max(0, p.life);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Central Sun (ALIF Core)
  const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
  sunGrad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
  sunGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.35)');
  sunGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ALIVERSE CORE', 0, 0);

  // Render Orbit Rings & Nodes
  hoveredNode = null;
  const mouseX = (window.lastMouseX - (W / 2 + viewX)) / viewZoom;
  const mouseY = (window.lastMouseY - (H / 2 + viewY)) / viewZoom;

  galaxyNodes.forEach(node => {
    node.angle += node.orbitSpeed;
    node.x = Math.cos(node.angle) * node.dist;
    node.y = Math.sin(node.angle) * node.dist;

    // Check hit test
    const d = Math.hypot(mouseX - node.x, mouseY - node.y);
    if (d < node.radius + 6) {
      hoveredNode = node;
    }
  });

  galaxyNodes.forEach(node => {
    const isHovered = hoveredNode === node;
    const isSelected = selectedNode === node;
    const emphasised = isHovered || isSelected;

    // Draw ray to core
    ctx.strokeStyle = `hsla(${node.hue}, 70%, 60%, ${emphasised ? 0.3 : 0.08})`;
    ctx.lineWidth = emphasised ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();

    // Selection ring (persistent)
    if (isSelected) {
      ctx.strokeStyle = `hsla(${node.hue}, 90%, 80%, 0.85)`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Glow
    const glowMult = isSelected ? 4.5 : (isHovered ? 4 : 2.5);
    const glowAlpha = isSelected ? 0.8 : (isHovered ? 0.7 : 0.25);
    const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * glowMult);
    glowGrad.addColorStop(0, `hsla(${node.hue}, 85%, 70%, ${glowAlpha})`);
    glowGrad.addColorStop(1, `hsla(${node.hue}, 85%, 70%, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius * glowMult, 0, Math.PI * 2);
    ctx.fill();

    // Core Star
    const coreLightness = isSelected ? '95%' : (isHovered ? '90%' : '65%');
    const coreSize = isSelected ? node.radius * 1.55 : (isHovered ? node.radius * 1.4 : node.radius);
    ctx.fillStyle = `hsl(${node.hue}, 80%, ${coreLightness})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, coreSize, 0, Math.PI * 2);
    ctx.fill();

    // Star Label
    const labelAlpha = isSelected ? '1' : (isHovered ? '1' : '0.75');
    ctx.fillStyle = isSelected || isHovered ? '#ffffff' : `rgba(255, 255, 255, ${labelAlpha})`;
    ctx.font = `${emphasised ? 'bold 12px' : '10px'} "Inter", sans-serif`;
    ctx.fillText(node.project.name, node.x, node.y + node.radius + 14);
  });

  // Render Ripple Effects (on top of nodes)
  rippleEffects = rippleEffects.filter(r => r.life > 0);
  rippleEffects.forEach(r => {
    r.life -= r.decay;
    r.radius += r.speed;
    const alpha = Math.max(0, r.life);
    ctx.strokeStyle = `hsla(${r.hue}, 90%, 75%, ${alpha})`;
    ctx.lineWidth = 2 * alpha + 0.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.restore();

  // Cursor pointer change
  if (canvas) {
    canvas.style.cursor = hoveredNode ? 'pointer' : (isDragging ? 'grabbing' : 'default');
  }

  // Update tooltip
  const tooltipEl = document.getElementById('galaxy-tooltip');
  if (tooltipEl) {
    if (hoveredNode) {
      const p = hoveredNode.project;
      tooltipEl.innerHTML = `
        <div class="tt-head">
          <span class="tt-icon">${p.icon || '✨'}</span>
          <div>
            <div class="tt-name">${escapeHTML(p.name)}</div>
            <div class="tt-cat" style="color: hsl(${hoveredNode.hue}, 80%, 75%);">${escapeHTML(p.category)}</div>
          </div>
        </div>
        <div class="tt-desc">${escapeHTML(p.description || '')}</div>
        <div class="tt-foot">
          <span class="tt-files">${p.fileCount || 0} files</span>
          <span class="tt-action">${p.hasHtml ? '🚀 Click to launch' : '⚙️ Click to inspect'}</span>
        </div>
      `;
      tooltipEl.style.display = 'block';
      const ttRect = tooltipEl.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      let left = (window.lastMouseX / (canvas.width / canvasRect.width)) + canvasRect.left + 18;
      let top = (window.lastMouseY / (canvas.height / canvasRect.height)) + canvasRect.top + 18;
      if (left + ttRect.width + 10 > window.innerWidth) {
        left = (window.lastMouseX / (canvas.width / canvasRect.width)) + canvasRect.left - ttRect.width - 18;
      }
      if (top + ttRect.height + 10 > window.innerHeight) {
        top = (window.lastMouseY / (canvas.height / canvasRect.height)) + canvasRect.top - ttRect.height - 18;
      }
      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
    } else {
      tooltipEl.style.display = 'none';
    }
  }

  requestAnimationFrame(drawGalaxy);
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  initStarParticles();
  window.addEventListener('resize', resizeCanvas);

  fetchProjects();
  fetchStats();
  setInterval(fetchStats, 5000);

  // Keyboard Shortcuts (Ctrl+K focus search, Escape close modal)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    } else if (e.key === 'Escape') {
      closeInspector();
      closeLiveApp();
      closeTerminal();
    }
  });

  // Search input
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      if (btnClearSearch) btnClearSearch.classList.toggle('hidden', !searchQuery);
      applyFilters();
    };
  }

  if (btnClearSearch) {
    btnClearSearch.onclick = () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      btnClearSearch.classList.add('hidden');
      applyFilters();
    };
  }

  // Category Filter Chips
  document.querySelectorAll('.cat-chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat');
      applyFilters();
    };
  });

  // View Mode Switcher
  if (btnViewGalaxy && btnViewGrid) {
    btnViewGalaxy.onclick = () => {
      btnViewGalaxy.classList.add('active');
      btnViewGrid.classList.remove('active');
      galaxyView.classList.remove('hidden');
      gridView.classList.add('hidden');
    };

    btnViewGrid.onclick = () => {
      btnViewGrid.classList.add('active');
      btnViewGalaxy.classList.remove('active');
      gridView.classList.remove('hidden');
      galaxyView.classList.add('hidden');
    };
  }

  // Inspector Modal Controls
  const btnCloseModal = document.getElementById('btn-close-modal');
  if (btnCloseModal) btnCloseModal.onclick = closeInspector;
  const btnModalCloseAction = document.getElementById('btn-modal-close-action');
  if (btnModalCloseAction) btnModalCloseAction.onclick = closeInspector;

  // Live App Viewer Controls
  const btnViewerClose = document.getElementById('btn-viewer-close');
  if (btnViewerClose) btnViewerClose.onclick = closeLiveApp;

  // Terminal Modal Controls
  const btnTerminalClose = document.getElementById('btn-terminal-close');
  if (btnTerminalClose) btnTerminalClose.onclick = closeTerminal;
  const btnTerminalStop = document.getElementById('btn-terminal-stop');
  if (btnTerminalStop) btnTerminalStop.onclick = stopCurrentProcess;
  const btnTerminalClear = document.getElementById('btn-terminal-clear');
  if (btnTerminalClear) {
    btnTerminalClear.onclick = () => {
      if (terminalLogs) terminalLogs.innerHTML = '';
    };
  }

  // Mouse pan/zoom on Galaxy View
  if (canvas) {
    window.lastMouseX = canvas.width / 2;
    window.lastMouseY = canvas.height / 2;
    let lastTrailTime = 0;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);
      window.lastMouseX = (e.clientX - rect.left) * scaleX;
      window.lastMouseY = (e.clientY - rect.top) * scaleY;

      const now = performance.now();
      if (now - lastTrailTime > 16) {
        lastTrailTime = now;
        const tx = (window.lastMouseX - (W / 2 + viewX)) / viewZoom;
        const ty = (window.lastMouseY - (H / 2 + viewY)) / viewZoom;
        const hue = hoveredNode ? hoveredNode.hue : (Math.random() * 60 + 220);
        for (let i = 0; i < 2; i++) {
          mouseTrailParticles.push({
            x: tx + (Math.random() - 0.5) * 6,
            y: ty + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            size: Math.random() * 2.5 + 1,
            hue: hue + (Math.random() - 0.5) * 30,
            life: 1,
            decay: 0.025 + Math.random() * 0.02
          });
        }
        if (mouseTrailParticles.length > 200) {
          mouseTrailParticles.splice(0, mouseTrailParticles.length - 200);
        }
      }

      if (isDragging) {
        viewX += e.clientX - dragStartX;
        viewY += e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (hoveredNode) {
        selectedNode = hoveredNode;
        const nx = hoveredNode.x;
        const ny = hoveredNode.y;
        for (let i = 0; i < 2; i++) {
          rippleEffects.push({
            x: nx,
            y: ny,
            radius: hoveredNode.radius * 1.2,
            speed: 2.2 + i * 1.2,
            hue: hoveredNode.hue + (i * 15),
            life: 1,
            decay: 0.022 + i * 0.008
          });
        }
        const tx = (window.lastMouseX - (W / 2 + viewX)) / viewZoom;
        const ty = (window.lastMouseY - (H / 2 + viewY)) / viewZoom;
        for (let i = 0; i < 18; i++) {
          const ang = (i / 18) * Math.PI * 2;
          mouseTrailParticles.push({
            x: tx,
            y: ty,
            vx: Math.cos(ang) * (1.2 + Math.random() * 1.5),
            vy: Math.sin(ang) * (1.2 + Math.random() * 1.5),
            size: Math.random() * 3 + 1.5,
            hue: hoveredNode.hue + (Math.random() - 0.5) * 40,
            life: 1,
            decay: 0.018 + Math.random() * 0.02
          });
        }
        if (hoveredNode.project.hasHtml) {
          launchLiveApp(hoveredNode.project);
        } else {
          openInspector(hoveredNode.project);
        }
      } else {
        selectedNode = null;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      viewZoom = Math.max(0.4, Math.min(3, viewZoom * zoomFactor));
    }, { passive: false });
  }

  requestAnimationFrame(drawGalaxy);
});

