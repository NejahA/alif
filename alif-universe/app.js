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
let galaxyNodes = [];

// Category Domain Centers in Galaxy View
const DOMAIN_ANGLES = {
  'Canvas & Knowledge': 0,
  'RPG & Gaming': Math.PI / 3,
  'Audio & Soundscapes': (2 * Math.PI) / 3,
  'Tasks & Management': Math.PI,
  'Desktop Apps': (4 * Math.PI) / 3,
  'Experimental Engines': (5 * Math.PI) / 3
};

// Fetch Projects & Stats
async function fetchProjects() {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    if (data.ok) {
      projectsData = data.projects;
      const totalEl = document.getElementById('stat-total');
      if (totalEl) totalEl.textContent = `${data.total} Subprojects`;
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

// Filter projects
function applyFilters() {
  filteredProjects = projectsData.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
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
    projectsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px;">No projects found matching criteria.</div>`;
    return;
  }

  filteredProjects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
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
      <div class="card-bottom">
        <span class="tech-badge">${p.hasHtml ? '🌐 Web App' : '📦 Node Suite'}</span>
        ${p.hasHtml ? `<button class="card-launch-btn btn-card-launch">🚀 Launch</button>` : `<button class="card-launch-btn btn-card-inspect">⚙️ Inspect</button>`}
      </div>
    `;

    // Click handler for launch button specifically or card
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

  const btnLaunchModal = document.getElementById('btn-modal-launch-action');
  if (btnLaunchModal) {
    if (p.hasHtml) {
      btnLaunchModal.textContent = '🚀 Launch Live Project';
      btnLaunchModal.style.display = 'inline-block';
      btnLaunchModal.onclick = () => {
        closeInspector();
        launchLiveApp(p);
      };
    } else {
      btnLaunchModal.style.display = 'none';
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
function launchLiveApp(p) {
  if (!appViewerModal || !appIframe) return;

  const appUrl = `/apps/${encodeURIComponent(p.name)}/${p.entryHtml || 'index.html'}`;

  document.getElementById('viewer-icon').textContent = p.icon;
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

  filteredProjects.forEach((p, idx) => {
    const baseAngle = DOMAIN_ANGLES[p.category] || 0;
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

  // Render Central Sun (ALIF Core)
  const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
  sunGrad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
  sunGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
  sunGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ALIF CORE', 0, 0);

  // Render Orbit Rings & Nodes
  hoveredNode = null;

  galaxyNodes.forEach(node => {
    // Update orbit angle
    node.angle += node.orbitSpeed;
    node.x = Math.cos(node.angle) * node.dist;
    node.y = Math.sin(node.angle) * node.dist;

    // Draw ray to core
    ctx.strokeStyle = `hsla(${node.hue}, 70%, 60%, 0.08)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();

    // Check hit test
    const mouseX = (window.lastMouseX - (W / 2 + viewX)) / viewZoom;
    const mouseY = (window.lastMouseY - (H / 2 + viewY)) / viewZoom;
    const d = Math.hypot(mouseX - node.x, mouseY - node.y);
    if (d < node.radius + 6) {
      hoveredNode = node;
    }

    const isHovered = hoveredNode === node;

    // Glow
    const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
    glowGrad.addColorStop(0, `hsla(${node.hue}, 80%, 70%, ${isHovered ? 0.6 : 0.25})`);
    glowGrad.addColorStop(1, `hsla(${node.hue}, 80%, 70%, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core Star
    ctx.fillStyle = `hsl(${node.hue}, 80%, ${isHovered ? '85%' : '65%'})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, isHovered ? node.radius * 1.3 : node.radius, 0, Math.PI * 2);
    ctx.fill();

    // Star Label
    ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
    ctx.font = `${isHovered ? 'bold 11px' : '10px'} "Inter", sans-serif`;
    ctx.fillText(node.project.name, node.x, node.y + node.radius + 12);
  });

  ctx.restore();

  requestAnimationFrame(drawGalaxy);
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  fetchProjects();
  fetchStats();
  setInterval(fetchStats, 5000);

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
    canvas.addEventListener('mousemove', (e) => {
      window.lastMouseX = e.clientX;
      window.lastMouseY = e.clientY;

      if (isDragging) {
        viewX += e.clientX - dragStartX;
        viewY += e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (hoveredNode) {
        if (hoveredNode.project.hasHtml) {
          launchLiveApp(hoveredNode.project);
        } else {
          openInspector(hoveredNode.project);
        }
      } else {
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

