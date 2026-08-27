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

const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
const minimapResetBtn = document.getElementById('minimapReset');
const ctxMenu = document.getElementById('galaxy-ctx-menu');
const ctxTitle = document.getElementById('ctx-title');

// Modals
const inspectorModal = document.getElementById('inspector-modal');
const appViewerModal = document.getElementById('app-viewer-modal');
const terminalModal = document.getElementById('terminal-modal');
const appIframe = document.getElementById('app-iframe');
const terminalLogs = document.getElementById('terminal-logs');

// Galaxy View State
let W = window.innerWidth, H = window.innerHeight;
let viewX = 0, viewY = 0, viewZoom = 1;
let targetViewX = 0, targetViewY = 0, targetViewZoom = 1;
let isTweeningCamera = false;
let isDragging = false, dragStartX = 0, dragStartY = 0;
let hoveredNode = null;
let selectedNode = null;
let ctxMenuNode = null;
let galaxyNodes = [];
let starParticles = [];
let mouseTrailParticles = [];
let rippleEffects = [];
let searchHighlightTime = 0;
let screenShakeX = 0, screenShakeY = 0, screenShakeT = 0;
let supernovaEffects = [];
let lastFrameT = performance.now();
let fpsAvg = 60;

// ====== DYNAMIC FAVICON (true mirror of current page viewport) ======
const FAVICON = {
  size: 64,
  canvas: null,
  ctx: null,
  linkEl: null,
  lastUpdate: 0,
  throttleMs: 50,
  enabled: true
};
function faviconInit() {
  FAVICON.canvas = document.createElement('canvas');
  FAVICON.canvas.width = FAVICON.size;
  FAVICON.canvas.height = FAVICON.size;
  FAVICON.ctx = FAVICON.canvas.getContext('2d');
  FAVICON.linkEl = document.getElementById('favicon-link');
}
function faviconUpdate() {
  if (!FAVICON.enabled || !FAVICON.ctx || !FAVICON.linkEl) return;
  const now = performance.now();
  if (now - FAVICON.lastUpdate < FAVICON.throttleMs) return;
  FAVICON.lastUpdate = now;
  const S = FAVICON.size;
  const fctx = FAVICON.ctx;
  fctx.clearRect(0, 0, S, S);
  const bgGrad = fctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  bgGrad.addColorStop(0, '#0a0b18');
  bgGrad.addColorStop(1, '#05060d');
  fctx.fillStyle = bgGrad;
  fctx.fillRect(0, 0, S, S);
  const k = Math.max(S / W, S / H);
  const favTx = S / 2 + (viewX + screenShakeX) * k;
  const favTy = S / 2 + (viewY + screenShakeY) * k;
  const favZoom = viewZoom * k;
  fctx.save();
  fctx.translate(favTx, favTy);
  fctx.scale(favZoom, favZoom);
  const viewLeftW = -(W / 2 + viewX) / viewZoom;
  const viewRightW = (W / 2 - viewX) / viewZoom;
  const viewTopW = -(H / 2 + viewY) / viewZoom;
  const viewBottomW = (H / 2 - viewY) / viewZoom;
  const pad = 60 / viewZoom;
  const visMinX = viewLeftW - pad, visMaxX = viewRightW + pad;
  const visMinY = viewTopW - pad, visMaxY = viewBottomW + pad;
  starParticles.forEach(star => {
    if (star.x < visMinX || star.x > visMaxX || star.y < visMinY || star.y > visMaxY) return;
    fctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, star.alpha * 0.7)})`;
    fctx.beginPath();
    fctx.arc(star.x, star.y, Math.max(0.4 / k, star.size * 0.6), 0, Math.PI * 2);
    fctx.fill();
  });
  Object.values(DOMAIN_CONFIG).forEach(cfg => {
    const dx = Math.cos(cfg.angle) * DOMAIN_RADIUS;
    const dy = Math.sin(cfg.angle) * DOMAIN_RADIUS;
    if (dx < visMinX - 160 || dx > visMaxX + 160 || dy < visMinY - 160 || dy > visMaxY + 160) return;
    fctx.strokeStyle = `hsla(${cfg.hue}, 70%, 60%, 0.14)`;
    fctx.lineWidth = 1 / favZoom;
    fctx.setLineDash([3 / favZoom, 10 / favZoom]);
    fctx.beginPath();
    fctx.arc(0, 0, DOMAIN_RADIUS, 0, Math.PI * 2);
    fctx.stroke();
    fctx.setLineDash([]);
    const halo = fctx.createRadialGradient(dx, dy, 0, dx, dy, 160);
    halo.addColorStop(0, `hsla(${cfg.hue}, 80%, 65%, 0.08)`);
    halo.addColorStop(1, `hsla(${cfg.hue}, 80%, 65%, 0)`);
    fctx.fillStyle = halo;
    fctx.beginPath();
    fctx.arc(dx, dy, 160, 0, Math.PI * 2);
    fctx.fill();
  });
  const coreInView = 0 > visMinX - 120 && 0 < visMaxX + 120 && 0 > visMinY - 120 && 0 < visMaxY + 120;
  if (coreInView) {
    const coreR = 90;
    const coreGrad = fctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
    coreGrad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
    coreGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.35)');
    coreGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    fctx.fillStyle = coreGrad;
    fctx.beginPath();
    fctx.arc(0, 0, coreR, 0, Math.PI * 2);
    fctx.fill();
    fctx.fillStyle = '#e9d5ff';
    fctx.beginPath();
    fctx.arc(0, 0, Math.max(2 / favZoom, 14), 0, Math.PI * 2);
    fctx.fill();
  }
  galaxyNodes.forEach(node => {
    const phase = {
      visible: true, alphaMult: 1, radiusMult: 1, coreLightnessAdd: 0,
      glowAlphaMult: 1, labelAlpha: 1, spawning: false, birthPulse: 0,
      dim: false, protostar: false
    };
    timelineAdjustNodeForPhase(node, phase);
    if (!phase.visible) return;
    const rEff = node.radius * phase.radiusMult;
    const cullPad = rEff * 6;
    if (node.x < visMinX - cullPad || node.x > visMaxX + cullPad ||
        node.y < visMinY - cullPad || node.y > visMaxY + cullPad) return;
    const rayAlpha = 0.08 * phase.alphaMult * (phase.dim ? 0.3 : 1);
    if (rayAlpha > 0.01) {
      fctx.strokeStyle = `hsla(${node.hue}, 70%, 60%, ${rayAlpha})`;
      fctx.lineWidth = (1 * phase.radiusMult) / favZoom;
      fctx.beginPath();
      fctx.moveTo(0, 0);
      fctx.lineTo(node.x, node.y);
      fctx.stroke();
    }
    if (phase.protostar) {
      const flick = 0.6 + 0.4 * Math.sin(now * 0.006 + node.hue * 0.13);
      fctx.strokeStyle = `hsla(${node.hue}, 70%, 50%, ${0.35 * phase.alphaMult * flick})`;
      fctx.lineWidth = 1.2 / favZoom;
      fctx.setLineDash([3 / favZoom, 5 / favZoom]);
      fctx.beginPath();
      fctx.arc(node.x, node.y, effRadiusSafe(rEff * 1.8), 0, Math.PI * 2);
      fctx.stroke();
      fctx.setLineDash([]);
      const dustGrad = fctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, effRadiusSafe(rEff * 2.5));
      dustGrad.addColorStop(0, `hsla(${node.hue}, 60%, 55%, ${0.2 * phase.alphaMult * flick})`);
      dustGrad.addColorStop(1, `hsla(${node.hue}, 60%, 55%, 0)`);
      fctx.fillStyle = dustGrad;
      fctx.beginPath();
      fctx.arc(node.x, node.y, effRadiusSafe(rEff * 2.5), 0, Math.PI * 2);
      fctx.fill();
    }
    if (phase.spawning && phase.birthP !== undefined) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.012);
      const coronaR = effRadiusSafe(rEff * (2.2 + phase.birthP * 1.4 + pulse * 0.25));
      const coronaGrad = fctx.createRadialGradient(node.x, node.y, effRadiusSafe(rEff * 0.6), node.x, node.y, coronaR);
      coronaGrad.addColorStop(0, `hsla(${node.hue}, 100%, 75%, ${0.5 * phase.alphaMult * (1 - phase.birthP)})`);
      coronaGrad.addColorStop(1, `hsla(${node.hue}, 100%, 75%, 0)`);
      fctx.fillStyle = coronaGrad;
      fctx.beginPath();
      fctx.arc(node.x, node.y, coronaR, 0, Math.PI * 2);
      fctx.fill();
    }
    const glowMult = 3 * phase.radiusMult * (phase.protostar ? 0.5 : 1);
    const glowAlpha = 0.28 * phase.alphaMult * phase.glowAlphaMult * (phase.dim ? 0.4 : 1);
    const glowOutR = effRadiusSafe(rEff * glowMult);
    const glowG = fctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowOutR);
    glowG.addColorStop(0, `hsla(${node.hue}, 85%, 70%, ${glowAlpha})`);
    glowG.addColorStop(1, `hsla(${node.hue}, 85%, 70%, 0)`);
    fctx.fillStyle = glowG;
    fctx.beginPath();
    fctx.arc(node.x, node.y, glowOutR, 0, Math.PI * 2);
    fctx.fill();
    const coreL = Math.max(25, Math.min(97, 65 + phase.coreLightnessAdd));
    const coreSize = Math.max(0.8 / favZoom, rEff * (phase.protostar ? 0.55 : 1));
    fctx.fillStyle = `hsl(${node.hue}, ${phase.protostar ? 50 : 80}%, ${coreL}%)`;
    fctx.beginPath();
    fctx.arc(node.x, node.y, coreSize, 0, Math.PI * 2);
    fctx.fill();
  });
  if (TIMELINE.showComets) {
    TIMELINE.activeCometEffects.forEach(c => {
      if (c.x < visMinX - 80 || c.x > visMaxX + 80 || c.y < visMinY - 80 || c.y > visMaxY + 80) return;
      if (c.trail.length > 1) {
        fctx.lineCap = 'round';
        for (let i = 1; i < c.trail.length; i++) {
          const alpha = (1 - i / c.trail.length) * c.life * 0.8;
          const w = (c.size * (1 - i / c.trail.length)) * 0.7;
          fctx.strokeStyle = `hsla(${c.hue}, 95%, 75%, ${alpha})`;
          fctx.lineWidth = Math.max(0.5 / favZoom, w);
          fctx.beginPath();
          fctx.moveTo(c.trail[i - 1].x, c.trail[i - 1].y);
          fctx.lineTo(c.trail[i].x, c.trail[i].y);
          fctx.stroke();
        }
      }
      const cg = fctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 4);
      cg.addColorStop(0, `hsla(${c.hue}, 95%, 80%, ${0.85 * c.life})`);
      cg.addColorStop(1, `hsla(${c.hue}, 95%, 70%, 0)`);
      fctx.fillStyle = cg;
      fctx.beginPath();
      fctx.arc(c.x, c.y, c.size * 4, 0, Math.PI * 2);
      fctx.fill();
    });
  }
  rippleEffects.forEach(r => {
    const alpha = Math.max(0, r.life);
    if (alpha <= 0.02) return;
    if (r.x < visMinX - r.radius || r.x > visMaxX + r.radius ||
        r.y < visMinY - r.radius || r.y > visMaxY + r.radius) return;
    fctx.strokeStyle = `hsla(${r.hue}, 90%, 75%, ${alpha * 0.75})`;
    fctx.lineWidth = Math.max(0.4 / favZoom, 2 * alpha + 0.4);
    fctx.beginPath();
    fctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    fctx.stroke();
  });
  fctx.restore();
  try {
    FAVICON.linkEl.href = FAVICON.canvas.toDataURL('image/png');
  } catch (e) { }
}
function effRadiusSafe(r) { return r > 0 ? r : 0.01; }
// =====================================================

// ====== COSMIC TIMELINE — STATE (SCAFFOLD)  ======
const TIMELINE = {
  enabled: true,
  open: false,
  playing: false,
  playbackSpeed: 1,
  showComets: true,
  showProtostars: true,

  // Date range (epoch ms)
  earliestDate: 0,
  presentDate: 0,

  // Current position 0..1 (0 = earliest, 1 = present)
  progress: 1,

  // Birth data per project
  births: [],

  // Commit comet events
  comets: [],
  activeCometEffects: [],

  // Stats tracks
  bornCount: 0,
  cometCount: 0,

  // Per-node activity streak data (draws streak trails around active nodes)
  streaksPerNode: new Map()
};
// ================================================

// ====== GALAXY CAMERA TOUR + NEW FEATURES STATE ====
const TOUR = {
  active: false,
  t: 0,
  baseZoom: 1,
  driftAngle: 0,
  driftRadius: 30,
  breathAmplitude: 0.12,
  breathSpeed: 0.00065,
  orbitSpeed: 0.00018,
  startedAt: 0
};
const ACTIVITY_STREAK = {
  enabled: true,
  maxTrails: 12,
  minOpacity: 0.15,
  fadePerFrame: 0.012
};
// ================================================
const hudFpsEl = document.getElementById('hudFps');
const hudZoomEl = document.getElementById('hudZoom');
const hudNodesEl = document.getElementById('hudNodes');
const hudKeyboardEl = document.getElementById('hudKeyboard');
if (hudKeyboardEl) {
  hudKeyboardEl.innerHTML = `<span class="kbd">←</span><span class="kbd">→</span><span class="kbd">↑</span><span class="kbd">↓</span><span class="kbd">Enter</span><span class="kbd">F</span>`;
}

// Category Domain Centers & Angles in Galaxy View
const DOMAIN_CONFIG = {
  'Canvas & Knowledge': { angle: 0, icon: '🧠', hue: 220 },
  'RPG & Gaming': { angle: Math.PI / 3, icon: '⚔️', hue: 25 },
  'Audio & Soundscapes': { angle: (2 * Math.PI) / 3, icon: '🎵', hue: 280 },
  'Tasks & Management': { angle: Math.PI, icon: '⚡', hue: 160 },
  'Desktop Apps': { angle: (4 * Math.PI) / 3, icon: '🖥️', hue: 200 },
  'Experimental Engines': { angle: (5 * Math.PI) / 3, icon: '🌌', hue: 320 }
};
const DOMAIN_RADIUS = 280;

function flyToNode(node, zoom = 1.9, durationMs = 900) {
  if (!node) return;
  // Start values
  const sx = viewX, sy = viewY, sz = viewZoom;
  // Target world coords: center the node (subtract so node is at origin)
  const tx = -node.x * zoom;
  const ty = -node.y * zoom;
  const tz = zoom;
  const start = performance.now();
  isTweeningCamera = true;
  function step(now) {
    const t = Math.min(1, (now - start) / durationMs);
    // easeInOutCubic
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    viewX = sx + (tx - sx) * e;
    viewY = sy + (ty - sy) * e;
    viewZoom = sz + (tz - sz) * e;
    targetViewX = viewX; targetViewY = viewY; targetViewZoom = viewZoom;
    if (t < 1) requestAnimationFrame(step);
    else isTweeningCamera = false;
  }
  requestAnimationFrame(step);
}

function resetView(durationMs = 700) {
  const sx = viewX, sy = viewY, sz = viewZoom;
  const tx = 0, ty = 0, tz = 1;
  const start = performance.now();
  isTweeningCamera = true;
  function step(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    viewX = sx + (tx - sx) * e;
    viewY = sy + (ty - sy) * e;
    viewZoom = sz + (tz - sz) * e;
    targetViewX = viewX; targetViewY = viewY; targetViewZoom = viewZoom;
    if (t < 1) requestAnimationFrame(step);
    else isTweeningCamera = false;
  }
  requestAnimationFrame(step);
}

function drawMinimap() {
  if (!minimapCtx || !minimapCanvas) return;
  const mW = minimapCanvas.width, mH = minimapCanvas.height;
  minimapCtx.clearRect(0, 0, mW, mH);

  // Bounds of world: use nodes + domain outer radius
  const pad = 120;
  let minX = -DOMAIN_RADIUS - pad, maxX = DOMAIN_RADIUS + pad;
  let minY = -DOMAIN_RADIUS - pad, maxY = DOMAIN_RADIUS + pad;
  galaxyNodes.forEach(n => {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  });
  const worldW = maxX - minX, worldH = maxY - minY;
  const scale = Math.min((mW - 16) / worldW, (mH - 16) / worldH);
  const offX = (mW - worldW * scale) / 2;
  const offY = (mH - worldH * scale) / 2;
  const toMap = (wx, wy) => ({
    x: offX + (wx - minX) * scale,
    y: offY + (wy - minY) * scale
  });

  // Domain rings (6 centers)
  Object.values(DOMAIN_CONFIG).forEach(cfg => {
    const cx = Math.cos(cfg.angle) * DOMAIN_RADIUS;
    const cy = Math.sin(cfg.angle) * DOMAIN_RADIUS;
    const p = toMap(cx, cy);
    minimapCtx.fillStyle = `hsla(${cfg.hue}, 80%, 70%, 0.14)`;
    minimapCtx.beginPath();
    minimapCtx.arc(p.x, p.y, 18, 0, Math.PI * 2);
    minimapCtx.fill();
    minimapCtx.fillStyle = `hsla(${cfg.hue}, 80%, 70%, 0.75)`;
    minimapCtx.beginPath();
    minimapCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    minimapCtx.fill();
  });

  // Core
  const core = toMap(0, 0);
  minimapCtx.fillStyle = 'rgba(168, 85, 247, 0.9)';
  minimapCtx.beginPath();
  minimapCtx.arc(core.x, core.y, 4, 0, Math.PI * 2);
  minimapCtx.fill();

  // Nodes
  galaxyNodes.forEach(n => {
    const p = toMap(n.x, n.y);
    minimapCtx.fillStyle = `hsl(${n.hue}, 75%, ${n === selectedNode ? 90 : 65}%)`;
    minimapCtx.beginPath();
    minimapCtx.arc(p.x, p.y, n === hoveredNode || n === selectedNode ? 3.2 : 1.8, 0, Math.PI * 2);
    minimapCtx.fill();
  });

  // Viewport rectangle
  const viewLeftW = -(W / 2 + viewX) / viewZoom;
  const viewRightW = (W / 2 - viewX) / viewZoom;
  const viewTopW = -(H / 2 + viewY) / viewZoom;
  const viewBottomW = (H / 2 - viewY) / viewZoom;
  const tl = toMap(viewLeftW, viewTopW);
  const br = toMap(viewRightW, viewBottomW);
  minimapCtx.strokeStyle = 'rgba(196, 181, 253, 0.85)';
  minimapCtx.lineWidth = 1.2;
  minimapCtx.strokeRect(
    Math.max(2, tl.x),
    Math.max(2, tl.y),
    Math.min(mW - 4, br.x - tl.x),
    Math.min(mH - 4, br.y - tl.y)
  );

  minimapCtx._lastMap = { minX, maxX, minY, maxY, offX, offY, scale };
}

function minimapClickToWorld(e) {
  if (!minimapCanvas || !minimapCtx || !minimapCtx._lastMap) return;
  const rect = minimapCanvas.getBoundingClientRect();
  const sx = (e.clientX - rect.left) * (minimapCanvas.width / rect.width);
  const sy = (e.clientY - rect.top) * (minimapCanvas.height / rect.height);
  const { minX, minY, offX, offY, scale } = minimapCtx._lastMap;
  const wx = (sx - offX) / scale + minX;
  const wy = (sy - offY) / scale + minY;
  // Pan so world (wx, wy) goes to center of view, with current zoom
  const newX = -wx * viewZoom;
  const newY = -wy * viewZoom;
  const sx0 = viewX, sy0 = viewY;
  const start = performance.now();
  isTweeningCamera = true;
  function step(now) {
    const t = Math.min(1, (now - start) / 450);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    viewX = sx0 + (newX - sx0) * e;
    viewY = sy0 + (newY - sy0) * e;
    targetViewX = viewX; targetViewY = viewY; targetViewZoom = viewZoom;
    if (t < 1) requestAnimationFrame(step);
    else isTweeningCamera = false;
  }
  requestAnimationFrame(step);
}

function hideContextMenu() {
  if (ctxMenu) ctxMenu.classList.add('hidden');
  ctxMenuNode = null;
}

function showContextMenu(node, clientX, clientY) {
  if (!ctxMenu || !ctxTitle) return;
  ctxMenuNode = node;
  ctxTitle.textContent = `${node.project.icon || '✨'} ${node.project.name}`;
  
  // Dynamic button label for launch/start
  const launchBtn = ctxMenu.querySelector('[data-action="launch"]');
  if (launchBtn) {
    if (node.project.hasHtml) {
      launchBtn.innerHTML = '<span class="ctx-icon">🚀</span>Launch Web App';
    } else {
      const serverScript = Object.keys(node.project.scripts || {}).find(k => ['dev', 'start', 'server', 'backend', 'dev:full'].includes(k.toLowerCase())) || Object.keys(node.project.scripts || {})[0];
      if (serverScript) {
        launchBtn.innerHTML = `<span class="ctx-icon">⚡</span>Start Server (${serverScript})`;
      } else {
        launchBtn.innerHTML = '<span class="ctx-icon">⚙️</span>Inspect Details';
      }
    }
  }

  const menuW = 230, menuH = 280;
  const left = Math.min(window.innerWidth - menuW, clientX + 6);
  const top = Math.min(window.innerHeight - menuH, clientY + 6);
  ctxMenu.style.left = left + 'px';
  ctxMenu.style.top = top + 'px';
  ctxMenu.classList.remove('hidden');
}

function handleContextAction(action) {
  const node = ctxMenuNode;
  hideContextMenu();
  if (!node) return;
  const p = node.project;
  switch (action) {
    case 'launch':
      selectedNode = node;
      if (p.hasHtml) {
        launchLiveApp(p);
      } else {
        const serverScript = Object.keys(p.scripts || {}).find(k => ['dev', 'start', 'server', 'backend', 'dev:full'].includes(k.toLowerCase())) || Object.keys(p.scripts || {})[0];
        if (serverScript) runProjectScript(p, serverScript);
        else openInspector(p);
      }
      break;
    case 'inspect':
      selectedNode = node;
      openInspector(p);
      break;
    case 'newwin':
      selectedNode = node;
      if (p.hasHtml) {
        const url = `/apps/${encodeURIComponent(p.name)}/${p.entryHtml || 'index.html'}`;
        window.open(url, '_blank');
      } else {
        openInspector(p);
      }
      break;
    case 'fly':
      selectedNode = node;
      flyToNode(node, 2);
      break;
    case 'grid':
      if (btnViewGrid) btnViewGrid.click();
      // scroll to card after it renders
      setTimeout(() => {
        const cards = projectsGrid ? projectsGrid.querySelectorAll('.project-card') : [];
        cards.forEach(card => {
          const title = card.querySelector('.card-title');
          if (title && title.textContent.trim() === p.name) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.7), 0 10px 30px rgba(0,0,0,0.5)';
            setTimeout(() => { card.style.boxShadow = ''; }, 1800);
          }
        });
      }, 120);
      break;
    case 'deselect':
      selectedNode = null;
      break;
  }
}

// ====== SCREEN SHAKE ======
function triggerShake(intensity = 8, duration = 320) {
  screenShakeT = duration;
  screenShakeX = intensity;
  screenShakeY = intensity;
}

function updateShake(dt) {
  if (screenShakeT > 0) {
    screenShakeT -= dt;
    if (screenShakeT < 0) {
      screenShakeX = 0;
      screenShakeY = 0;
      screenShakeT = 0;
    } else {
      const f = screenShakeT > 0 ? Math.min(1, screenShakeT / 320) : 0;
      const ix = screenShakeX * f;
      const iy = screenShakeY * f;
      screenShakeX = ix; screenShakeY = iy;
    }
  }
}

// ====== SUPERNOVA ======
function spawnSupernova(node) {
  const count = 60;
  const tx = node.x, ty = node.y, hue = node.hue;
  supernovaEffects.push({
    x: tx, y: ty, hue, t: 0, maxT: 900,
    maxR: node.radius * 8,
  });
  // Particle burst
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 1.8 + Math.random() * 5.5;
    mouseTrailParticles.push({
      x: tx, y: ty,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.6 + Math.random() * 4,
      hue: hue + (Math.random() - 0.5) * 70,
      life: 1,
      decay: 0.008 + Math.random() * 0.02
    });
  }
  // Ripples
  for (let i = 0; i < 3; i++) {
    rippleEffects.push({
      x: tx, y: ty,
      radius: node.radius * 0.8 + i * 6,
      speed: 2.5 + i * 1.1,
      hue: hue + i * 20,
      life: 1,
      decay: 0.016 + i * 0.005
    });
  }
}

// ====== CATEGORY FLY-TO ======
function flyToCategory(categoryName) {
  if (!galaxyNodes.length) return;
  if (categoryName === 'all' || categoryName === 'All Projects') {
    resetView(700);
    return;
  }
  // Find center of all nodes with this category, OR fall back to domain center
  const members = galaxyNodes.filter(n => n.project.category === categoryName);
  let targetX, targetY, targetZoom = 1.6;
  if (members.length) {
    const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
    const cy = members.reduce((s, n) => s + n.y, 0) / members.length;
    // If they're spread out, zoom slightly less
    const spreads = members.map(n => Math.hypot(n.x - cx, n.y - cy));
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
    targetZoom = Math.max(1.1, 1.9 - avgSpread / 180);
    targetX = cx; targetY = cy;
  } else if (DOMAIN_CONFIG[categoryName]) {
    const cfg = DOMAIN_CONFIG[categoryName];
    targetX = Math.cos(cfg.angle) * DOMAIN_RADIUS;
    targetY = Math.sin(cfg.angle) * DOMAIN_RADIUS;
    targetZoom = 1.55;
  } else {
    resetView(700);
    return;
  }
  // Tween camera
  const sx0 = viewX, sy0 = viewY, sz0 = viewZoom;
  const tx2 = -targetX * targetZoom;
  const ty2 = -targetY * targetZoom;
  const start = performance.now();
  isTweeningCamera = true;
  function step(now) {
    const t = Math.min(1, (now - start) / 900);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    viewX = sx0 + (tx2 - sx0) * e;
    viewY = sy0 + (ty2 - sy0) * e;
    viewZoom = sz0 + (targetZoom - sz0) * e;
    targetViewX = viewX; targetViewY = viewY; targetViewZoom = viewZoom;
    if (t < 1) requestAnimationFrame(step);
    else isTweeningCamera = false;
  }
  requestAnimationFrame(step);
  triggerShake(3, 260);
}

// ====== KEYBOARD NAVIGATION ======
function selectNearestNode(direction) {
  if (!galaxyNodes.length) return null;
  const origin = selectedNode ? { x: selectedNode.x, y: selectedNode.y } : { x: 0, y: 0 };
  let best = null, bestScore = Infinity;
  galaxyNodes.forEach(n => {
    if (n === selectedNode) return;
    const dx = n.x - origin.x;
    const dy = n.y - origin.y;
    const dist = Math.hypot(dx, dy);
    let inDir = false;
    switch (direction) {
      case 'up':    inDir = dy < -4 && Math.abs(dy) > Math.abs(dx) * 0.5; break;
      case 'down':  inDir = dy >  4 && Math.abs(dy) > Math.abs(dx) * 0.5; break;
      case 'left':  inDir = dx < -4 && Math.abs(dx) > Math.abs(dy) * 0.5; break;
      case 'right': inDir = dx >  4 && Math.abs(dx) > Math.abs(dy) * 0.5; break;
      case 'any':   inDir = true; break;
    }
    if (!inDir) return;
    // Prefer nodes roughly in the direction + close
    const score = dist + (dist === 0 ? 0 : 0);
    if (score < bestScore) { bestScore = score; best = n; }
  });
  // If nothing in-direction, fall back to closest overall
  if (!best) {
    galaxyNodes.forEach(n => {
      if (n === selectedNode) return;
      const d = Math.hypot(n.x - origin.x, n.y - origin.y);
      if (d < bestScore) { bestScore = d; best = n; }
    });
  }
  if (best) selectedNode = best;
  return best;
}

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
      timelineInitFromProjects();
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

// ====================================================
// ====== COSMIC TIMELINE — CORE FUNCTIONS (SCAFFOLD)
// ====================================================

function timelineInitFromProjects() {
  if (!projectsData.length) return;

  const present = Date.now();
  const TWO_YEARS_MS = 1000 * 60 * 60 * 24 * 365 * 2;
  const fallbackEarliest = present - TWO_YEARS_MS;

  TIMELINE.presentDate = present;

  TIMELINE.births = projectsData.map((p, i) => {
    // Use server-provided data when available
    let birthEpoch = p.birthDate || 0;
    let commits = (p.commits && Array.isArray(p.commits)) ? p.commits.slice() : null;

    // Fall back to deterministic pseudo-random generation
    if (!birthEpoch || birthEpoch < fallbackEarliest || birthEpoch > present) {
      const spread = TWO_YEARS_MS * 0.85;
      const jitter = spread * (0.1 + 0.9 * ((i * 2654435761 % 232) / 232));
      birthEpoch = fallbackEarliest + 30 * 86400000 + jitter;
    }
    if (!commits) {
      const commitCount = 3 + Math.floor(Math.random() * 22);
      commits = [];
      for (let c = 0; c < commitCount; c++) {
        commits.push({
          date: birthEpoch + (present - birthEpoch) * (0.05 + 0.9 * Math.random()),
          msg: ['Init scaffolding', 'Bug fixes', 'UI polish', 'New feature', 'Refactor', 'Optimization'][c % 6],
          hue: p.hue || 260
        });
      }
    }
    return {
      name: p.name,
      hue: p.hue || 260,
      icon: p.icon || '✨',
      birthEpoch,
      commits
    };
  }).sort((a, b) => a.birthEpoch - b.birthEpoch);

  // Clamp earliest date to min birth - 30 days
  const minBirth = TIMELINE.births.length ? TIMELINE.births[0].birthEpoch : fallbackEarliest;
  TIMELINE.earliestDate = minBirth - 30 * 86400000;

  TIMELINE.comets = TIMELINE.births.flatMap(b =>
    b.commits.map(c => ({ ...c, name: b.name, hue: b.hue }))
  ).sort((a, b) => a.date - b.date);

  timelineResetToPresent();
  timelineRebuildMarkers();
  timelineRebuildTicks();
}

function timelineCurrentDate() {
  return new Date(TIMELINE.earliestDate + (TIMELINE.presentDate - TIMELINE.earliestDate) * TIMELINE.progress);
}

function timelineSetProgress(p, { fromUser = false } = {}) {
  const prev = TIMELINE.progress;
  TIMELINE.progress = Math.max(0, Math.min(1, p));
  const changed = Math.abs(prev - TIMELINE.progress) > 0.0001;
  if (changed || fromUser) {
    timelineUpdateBirthState();
    timelineSpawnCrossedComets(prev, TIMELINE.progress);
    timelineSyncUI();
  }
}

function timelineResetToPresent() {
  TIMELINE.progress = 1;
  TIMELINE.playing = false;
  timelineUpdateBirthState();
  timelineSyncUI();
}

function timelineRewind() {
  timelineSetProgress(0, { fromUser: true });
  TIMELINE.playing = false;
  timelineSyncUI();
}

function timelineFastForward() {
  timelineSetProgress(1, { fromUser: true });
  TIMELINE.playing = false;
  timelineSyncUI();
}

function timelineTogglePlay() {
  if (TIMELINE.progress >= 1 && !TIMELINE.playing) {
    timelineSetProgress(0, { fromUser: true });
  }
  TIMELINE.playing = !TIMELINE.playing;
  timelineSyncUI();
}

function timelineSetSpeed(speed) {
  TIMELINE.playbackSpeed = speed;
  document.querySelectorAll('.speed-btn').forEach(b => {
    b.classList.toggle('active', parseFloat(b.dataset.speed) === speed);
  });
}

function timelineUpdate(dt) {
  if (!TIMELINE.enabled) return;

  if (TIMELINE.playing) {
    const TWO_YEARS_MS = TIMELINE.presentDate - TIMELINE.earliestDate;
    const ONE_DAY_MS = 86400000;
    const daysPerRealSec = 14 * TIMELINE.playbackSpeed;
    const advance = (daysPerRealSec * ONE_DAY_MS * dt) / 1000 / TWO_YEARS_MS;
    const next = TIMELINE.progress + advance;
    if (next >= 1) {
      timelineSetProgress(1);
      TIMELINE.playing = false;
      timelineSyncUI();
    } else {
      timelineSetProgress(next);
    }
  }

  if (TIMELINE.activeCometEffects.length) {
    const impacts = [];
    TIMELINE.activeCometEffects = TIMELINE.activeCometEffects.filter(c => {
      c.life -= dt / c.lifespan;
      c.x += c.vx * (dt / 16.67);
      c.y += c.vy * (dt / 16.67);
      c.trail.unshift({ x: c.x, y: c.y });
      if (c.trail.length > c.trailMax) c.trail.pop();
      if (c.life <= 0) {
        impacts.push(c);
        return false;
      }
      return true;
    });
    impacts.forEach(c => {
      // Ripples at impact point
      for (let i = 0; i < 2; i++) {
        rippleEffects.push({
          x: c.x, y: c.y,
          radius: 4 + i * 5,
          speed: 1.8 + i * 1.2,
          hue: c.hue + i * 18,
          life: 1,
          decay: 0.025 + i * 0.01
        });
      }
      // Mini particle burst
      for (let i = 0; i < 14; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 0.8 + Math.random() * 2.6;
        mouseTrailParticles.push({
          x: c.x, y: c.y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          size: 1.2 + Math.random() * 2.2,
          hue: c.hue + (Math.random() - 0.5) * 50,
          life: 1,
          decay: 0.02 + Math.random() * 0.025
        });
      }
      // Small screen shake on direct comet hit
      const targetNode = galaxyNodes.find(n => n.project.name === c.name);
      if (targetNode) {
        const d = Math.hypot(targetNode.x - c.x, targetNode.y - c.y);
        if (d < targetNode.radius * 3) {
          triggerShake(1.2, 120);
        }
      }
    });
  }
}

function timelineUpdateBirthState() {
  const cur = timelineCurrentDate().getTime();
  let born = 0;
  galaxyNodes.forEach(n => {
    const b = TIMELINE.births.find(b => b.name === n.project.name);
    if (b) {
      n._born = b.birthEpoch <= cur;
      if (n._born) born++;
      n._birthProgress = Math.max(0, Math.min(1, (cur - b.birthEpoch) / (14 * 86400000)));
    } else {
      n._born = true;
      n._birthProgress = 1;
      born++;
    }
  });
  TIMELINE.bornCount = born;
}

function timelineSpawnCrossedComets(prevProgress, curProgress) {
  if (!TIMELINE.showComets) return;
  if (prevProgress === curProgress) return;
  const prevT = TIMELINE.earliestDate + (TIMELINE.presentDate - TIMELINE.earliestDate) * prevProgress;
  const curT = TIMELINE.earliestDate + (TIMELINE.presentDate - TIMELINE.earliestDate) * curProgress;
  const lo = Math.min(prevT, curT);
  const hi = Math.max(prevT, curT);
  const isForward = curProgress > prevProgress;
  TIMELINE.comets.forEach(c => {
    if (c.date >= lo && c.date <= hi) {
      timelineSpawnCometForCommit(c, isForward);
    }
  });
}

function timelineSpawnCometForCommit(commit, forward) {
  const targetNode = galaxyNodes.find(n => n.project.name === commit.name);
  if (!targetNode) return;
  const originAngle = Math.random() * Math.PI * 2;
  const originDist = 180 + Math.random() * 120;
  const ox = targetNode.x + Math.cos(originAngle) * originDist;
  const oy = targetNode.y + Math.sin(originAngle) * originDist;
  const dx = targetNode.x - ox;
  const dy = targetNode.y - oy;
  const len = Math.hypot(dx, dy) || 1;
  const speed = 1.4 + Math.random() * 1.6;
  TIMELINE.activeCometEffects.push({
    x: ox, y: oy,
    vx: (dx / len) * speed * (forward ? 1 : -1),
    vy: (dy / len) * speed * (forward ? 1 : -1),
    hue: commit.hue,
    life: 1,
    lifespan: 900 + Math.random() * 500,
    size: 2.2 + Math.random() * 1.6,
    trail: [],
    trailMax: 16,
    msg: commit.msg,
    name: commit.name
  });
  TIMELINE.cometCount++;
}

function timelineSyncUI() {
  const range = document.getElementById('timeline-range');
  const trackFill = document.getElementById('timeline-track-fill');
  const thumb = document.getElementById('timeline-thumb');
  const badge = document.getElementById('timeline-badge');
  const curDateEl = document.getElementById('timeline-current-date');
  const presDateEl = document.getElementById('timeline-present-date');
  const btnPlay = document.getElementById('btn-timeline-play');
  const bornEl = document.getElementById('tl-stat-born');
  const totalEl = document.getElementById('tl-stat-total');
  const cometsEl = document.getElementById('tl-stat-comets');
  const epochEl = document.getElementById('tl-stat-epoch');
  const markersWrap = document.getElementById('timeline-markers');

  if (range) range.value = String(Math.round(TIMELINE.progress * 1000));
  if (trackFill) trackFill.style.width = (TIMELINE.progress * 100) + '%';
  if (thumb) thumb.style.left = (TIMELINE.progress * 100) + '%';
  if (badge) {
    if (TIMELINE.progress >= 1) {
      badge.textContent = 'NOW';
      badge.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
      badge.textContent = '⏳';
      badge.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
  }
  if (curDateEl) curDateEl.textContent = timelineFormatDate(timelineCurrentDate());
  if (presDateEl) presDateEl.textContent = timelineFormatDate(new Date(TIMELINE.presentDate));
  if (btnPlay) {
    btnPlay.classList.toggle('playing', TIMELINE.playing);
    btnPlay.innerHTML = TIMELINE.playing ? '⏸' : '▶';
  }
  if (bornEl) bornEl.textContent = TIMELINE.bornCount;
  if (totalEl) totalEl.textContent = projectsData.length;
  if (cometsEl) cometsEl.textContent = TIMELINE.cometCount;
  if (epochEl) {
    if (TIMELINE.progress >= 1) epochEl.textContent = 'Present';
    else if (TIMELINE.progress <= 0) epochEl.textContent = 'Genesis';
    else epochEl.textContent = timelineFormatDate(timelineCurrentDate(), true);
  }
  if (markersWrap) {
    markersWrap.querySelectorAll('.timeline-marker').forEach(m => {
      const t = parseFloat(m.dataset.progress);
      m.classList.toggle('past', t <= TIMELINE.progress);
      m.classList.toggle('future', t > TIMELINE.progress);
    });
  }
}

function timelineFormatDate(d, short) {
  if (!d || isNaN(d.getTime())) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (short) return `${y}.${m}.${day}`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${day}, ${y}`;
}

function timelineRebuildMarkers() {
  const wrap = document.getElementById('timeline-markers');
  if (!wrap) return;
  wrap.innerHTML = '';
  const span = TIMELINE.presentDate - TIMELINE.earliestDate;
  if (!span) return;
  TIMELINE.births.forEach(b => {
    const progress = (b.birthEpoch - TIMELINE.earliestDate) / span;
    const el = document.createElement('div');
    el.className = 'timeline-marker past';
    el.style.left = (progress * 100) + '%';
    el.style.setProperty('--marker-hue', `hsl(${b.hue}, 80%, 65%)`);
    el.dataset.progress = String(progress);
    el.dataset.projectName = b.name;
    el.title = `${b.icon || '✨'} ${b.name} — Born ${timelineFormatDate(new Date(b.birthEpoch))} (click to jump)`;
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      // Scrub to ~3 days before birth so user sees the spawn animation
      const preDays = 3 * 86400000;
      const target = Math.max(0, (b.birthEpoch - preDays - TIMELINE.earliestDate) / span);
      timelineSetProgress(target, { fromUser: true });
      // Auto-play to animate through the birth
      if (!TIMELINE.playing) {
        TIMELINE.playing = true;
        timelineSyncUI();
      }
      // Fly to the matching galaxy node if it exists
      const node = galaxyNodes.find(n => n.project.name === b.name);
      if (node) {
        selectedNode = node;
        // Zoom out a bit so we can see the comet field
        flyToNode(node, 1.85, 700);
      }
      // Ensure galaxy view is active
      if (btnViewGalaxy && btnViewGrid) {
        btnViewGalaxy.classList.add('active');
        btnViewGrid.classList.remove('active');
        if (galaxyView) galaxyView.classList.remove('hidden');
        if (gridView) gridView.classList.add('hidden');
      }
    });
    wrap.appendChild(el);
  });
}

function timelineRebuildTicks() {
  const wrap = document.getElementById('timeline-ticks');
  if (!wrap) return;
  wrap.innerHTML = '';
  const count = 5;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const d = new Date(TIMELINE.earliestDate + (TIMELINE.presentDate - TIMELINE.earliestDate) * t);
    const el = document.createElement('div');
    el.className = 'timeline-tick';
    el.textContent = timelineFormatDate(d, true);
    wrap.appendChild(el);
  }
}

function timelineTogglePanel() {
  const panel = document.getElementById('cosmic-timeline');
  if (!panel) return;
  TIMELINE.open = !TIMELINE.open;
  panel.classList.toggle('hidden', !TIMELINE.open);
  if (TIMELINE.open && !TIMELINE.births.length) {
    timelineInitFromProjects();
  }
}

function timelineDrawComets(ctx2d) {
  if (!TIMELINE.showComets || !TIMELINE.activeCometEffects.length) return;
  TIMELINE.activeCometEffects.forEach(c => {
    if (c.trail.length > 1) {
      ctx2d.lineCap = 'round';
      for (let i = 1; i < c.trail.length; i++) {
        const alpha = (1 - i / c.trail.length) * c.life * 0.8;
        const w = (c.size * (1 - i / c.trail.length)) * 0.8 + 0.5;
        ctx2d.strokeStyle = `hsla(${c.hue}, 95%, 75%, ${alpha})`;
        ctx2d.lineWidth = w;
        ctx2d.beginPath();
        ctx2d.moveTo(c.trail[i - 1].x, c.trail[i - 1].y);
        ctx2d.lineTo(c.trail[i].x, c.trail[i].y);
        ctx2d.stroke();
      }
    }
    const glowGrad = ctx2d.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 4);
    glowGrad.addColorStop(0, `hsla(${c.hue}, 95%, 80%, ${0.9 * c.life})`);
    glowGrad.addColorStop(1, `hsla(${c.hue}, 95%, 70%, 0)`);
    ctx2d.fillStyle = glowGrad;
    ctx2d.beginPath();
    ctx2d.arc(c.x, c.y, c.size * 4, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.fillStyle = `hsl(${c.hue}, 100%, 92%)`;
    ctx2d.beginPath();
    ctx2d.arc(c.x, c.y, c.size, 0, Math.PI * 2);
    ctx2d.fill();
  });
}

function timelineAdjustNodeForPhase(n, drawState) {
  if (!TIMELINE.enabled || TIMELINE.progress >= 1) return;
  if (n._born === undefined) return;

  if (!n._born) {
    if (!TIMELINE.showProtostars) {
      drawState.visible = false;
      return;
    }
    drawState.coreLightnessAdd = -25;
    drawState.alphaMult = 0.22;
    drawState.radiusMult = 0.55;
    drawState.labelAlpha = 0.2;
    drawState.dim = true;
    drawState.protostar = true;
  } else if (n._birthProgress < 1) {
    const p = n._birthProgress;
    drawState.alphaMult = 0.25 + 0.75 * p;
    drawState.radiusMult = 0.6 + 0.4 * p;
    drawState.spawning = true;
    drawState.birthP = p;
  }
}

// ====================================================
// ====== GALAXY CAMERA TOUR (Ctrl+G)
// ====================================================
function tourToggle() {
  TOUR.active = !TOUR.active;
  if (TOUR.active) {
    TOUR.t = 0;
    TOUR.startedAt = performance.now();
    TOUR.driftAngle = Math.atan2(-viewY / viewZoom, -viewX / viewZoom) || 0;
    TOUR.baseZoom = viewZoom;
  }
  isTweeningCamera = false;
  const hudTourEl = document.getElementById('hudTour');
  if (hudTourEl) hudTourEl.classList.toggle('tour-on', TOUR.active);
  // Button state
  document.querySelectorAll('.tour-btn, .btn-galaxy-tour').forEach(b => {
    b.classList.toggle('active', TOUR.active);
    if (b.querySelector('.tour-icon')) {
      b.querySelector('.tour-icon').innerHTML = TOUR.active ? '🛰️' : '🪐';
    }
  });
}

function tourUpdate(dt) {
  if (!TOUR.active) return;
  if (isTweeningCamera) return;
  TOUR.t += dt;
  // 360° drift around the origin at driftRadius
  TOUR.driftAngle += TOUR.orbitSpeed * dt;
  const cosA = Math.cos(TOUR.driftAngle);
  const sinA = Math.sin(TOUR.driftAngle);
  // Zoom breathing: sin wave around baseZoom
  const breath = TOUR.breathAmplitude * Math.sin(TOUR.t * TOUR.breathSpeed);
  const zoom = TOUR.baseZoom * (1 + breath);
  // Camera position: centered on origin, orbit offset perpendicular to angle
  const camX = cosA * TOUR.driftRadius;
  const camY = sinA * TOUR.driftRadius;
  viewZoom = zoom;
  viewX = -camX * zoom;
  viewY = -camY * zoom;
  targetViewX = viewX; targetViewY = viewY; targetViewZoom = viewZoom;
}

// ====================================================
// ====== ACTIVITY STREAK TRAILS (per-node comet wake)
// ====================================================
function streakHit(node, hue) {
  if (!ACTIVITY_STREAK.enabled) return;
  if (!node) return;
  let list = TIMELINE.streaksPerNode.get(node);
  if (!list) { list = []; TIMELINE.streaksPerNode.set(node, list); }
  list.push({
    x: node.x,
    y: node.y,
    hue: hue || node.hue,
    life: 1,
    radius: node.radius * (0.8 + Math.random() * 0.6)
  });
  if (list.length > ACTIVITY_STREAK.maxTrails) list.splice(0, list.length - ACTIVITY_STREAK.maxTrails);
}

function streakUpdateAndDraw(ctx2d, nodes) {
  if (!ACTIVITY_STREAK.enabled) return;
  // Register trails whenever a comet is active nearby — fire once per drawn frame
  TIMELINE.activeCometEffects.forEach(c => {
    let closest = null, bestD = Infinity;
    nodes.forEach(n => {
      if (!n._born) return;
      const d = Math.hypot(n.x - c.x, n.y - c.y);
      if (d < bestD && d < n.radius * 4) { bestD = d; closest = n; }
    });
    if (closest) streakHit(closest, c.hue);
  });
  // Draw & fade
  TIMELINE.streaksPerNode.forEach((list, node) => {
    if (!node._born && !TIMELINE.showProtostars) return;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      s.life -= ACTIVITY_STREAK.fadePerFrame;
      if (s.life <= 0) continue;
      const alpha = Math.max(ACTIVITY_STREAK.minOpacity, s.life) * (i / list.length) * 0.8;
      const r = s.radius * (0.4 + 0.6 * (i / list.length));
      ctx2d.strokeStyle = `hsla(${s.hue}, 95%, 72%, ${alpha})`;
      ctx2d.lineWidth = 1.4 * (i / list.length) + 0.5;
      ctx2d.beginPath();
      ctx2d.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx2d.stroke();
    }
    TIMELINE.streaksPerNode.set(node, list.filter(s => s.life > 0));
  });
}

// ====================================================
// ====== GALAXY SNAPSHOT (download PNG of canvas)
// ====================================================
function galaxySnapshot() {
  if (!canvas) return;
  // Compose an overlay banner at the bottom so the PNG carries metadata
  const meta = {
    zoom: viewZoom.toFixed(2) + '×',
    selected: selectedNode ? selectedNode.project.name : '(none)',
    date: timelineFormatDate(timelineCurrentDate()),
    present: timelineFormatDate(new Date(TIMELINE.presentDate)),
    epoch: TIMELINE.progress >= 1 ? 'Present' : (TIMELINE.progress <= 0 ? 'Genesis' : (Math.round(TIMELINE.progress * 100) + '% of timeline')),
    stars: galaxyNodes.length,
    tour: TOUR.active ? 'Tour ON' : 'Tour OFF',
    ts: new Date().toISOString()
  };
  // Composite to offscreen canvas so snapshot includes banner + metadata text
  const pad = 56;
  const off = document.createElement('canvas');
  off.width = canvas.width;
  off.height = canvas.height + pad;
  const octx = off.getContext('2d');
  // Starry background strip so banner doesn't look white
  const bgGrad = octx.createLinearGradient(0, canvas.height, 0, off.height);
  bgGrad.addColorStop(0, 'rgba(8, 9, 18, 0)');
  bgGrad.addColorStop(0.25, 'rgba(8, 9, 18, 0.85)');
  bgGrad.addColorStop(1, '#080912');
  octx.fillStyle = '#080912';
  octx.fillRect(0, 0, off.width, off.height);
  octx.drawImage(canvas, 0, 0);
  octx.fillStyle = bgGrad;
  octx.fillRect(0, canvas.height - 28, off.width, pad + 28);

  // Brand
  octx.fillStyle = '#c4b5fd';
  octx.font = '800 16px "Outfit", sans-serif';
  octx.textAlign = 'left';
  octx.textBaseline = 'alphabetic';
  octx.fillText('🌌 ALIVERSE · Galaxy Snapshot', 20, canvas.height + 24);

  // Meta pills
  const pills = [
    `⭐ ${meta.stars} stars`,
    `🔭 ${meta.zoom}`,
    `📅 ${meta.date}`,
    `💫 ${meta.epoch}`,
    meta.selected !== '(none)' ? `✨ ${meta.selected}` : null,
    meta.tour
  ].filter(Boolean);
  octx.font = '600 10px "Inter", sans-serif';
  let x = off.width - 20;
  pills.reverse().forEach(txt => {
    octx.font = '600 10px "Inter", sans-serif';
    const w = octx.measureText(txt).width + 18;
    const rx = x - w;
    const ry = canvas.height + 12;
    octx.fillStyle = 'rgba(129, 140, 248, 0.18)';
    octx.strokeStyle = 'rgba(129, 140, 248, 0.45)';
    octx.lineWidth = 1;
    octx.beginPath();
    octx.roundRect ? octx.roundRect(rx, ry, w, 26, 8) : (() => { octx.rect(rx, ry, w, 26); })();
    octx.fill();
    octx.stroke();
    octx.fillStyle = '#e0e7ff';
    octx.textAlign = 'left';
    octx.textBaseline = 'middle';
    octx.fillText(txt, rx + 9, ry + 13);
    x = rx - 8;
  });

  // Footer ISO timestamp
  octx.fillStyle = '#475569';
  octx.font = '9px "Fira Code", monospace';
  octx.textAlign = 'left';
  octx.textBaseline = 'alphabetic';
  octx.fillText(meta.ts, 20, canvas.height + 44);

  // Download
  try {
    const url = off.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const ts = meta.ts.replace(/[:.]/g, '-');
    a.download = `aliverse-galaxy-${ts}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 100);
    // Toast flash feedback
    triggerShake(1.5, 140);
  } catch (e) {
    console.warn('Snapshot failed:', e);
    alert('Snapshot failed. Canvas may be tainted.');
  }
}

// ====================================================
// ====== END COSMIC TIMELINE / TOURS / SNAPSHOTS
// ====================================================

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
    
    const serverScript = Object.keys(p.scripts || {}).find(k => ['dev', 'start', 'server', 'backend', 'dev:full'].includes(k.toLowerCase())) || Object.keys(p.scripts || {})[0];

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
          ${p.hasHtml ? `<button class="card-launch-btn btn-card-launch">🚀 Launch</button>` : (serverScript ? `<button class="card-launch-btn btn-card-start">⚡ Start</button>` : `<button class="card-launch-btn btn-card-inspect">⚙️ Inspect</button>`)}
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

    const startBtn = card.querySelector('.btn-card-start');
    if (startBtn) {
      startBtn.onclick = (e) => {
        e.stopPropagation();
        runProjectScript(p, serverScript);
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
  // Return focus to canvas for keyboard nav
  if (canvas) {
    canvas.setAttribute('tabindex', '-1');
    setTimeout(() => canvas.focus({ preventScroll: true }), 10);
  }
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

  // Try to keep focus on parent window so keyboard shortcuts work
  // (User can still click into iframe; we can't block that but ESC from parent works via capture)
  const modalCard = appViewerModal.querySelector('.modal-card');
  if (modalCard) {
    modalCard.setAttribute('tabindex', '-1');
    setTimeout(() => modalCard.focus({ preventScroll: true }), 50);
  }

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
  // Return focus to galaxy canvas area so keyboard nav works immediately
  if (canvas) {
    canvas.setAttribute('tabindex', '-1');
    setTimeout(() => canvas.focus({ preventScroll: true }), 10);
  }
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
  // Return focus to canvas for keyboard nav
  if (canvas) {
    canvas.setAttribute('tabindex', '-1');
    setTimeout(() => canvas.focus({ preventScroll: true }), 10);
  }
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
      orbitSpeed: -(0.0003 + Math.random() * 0.0004),
      angle: Math.atan2(y, x),
      dist: dist,
      trail: []
    });
  });
}

function drawGalaxy() {
  if (!ctx) return;

  // Frame timing
  const now = performance.now();
  const dt = Math.min(60, now - lastFrameT);
  lastFrameT = now;
  fpsAvg = fpsAvg * 0.92 + (1000 / Math.max(1, dt)) * 0.08;
  if (hudFpsEl) hudFpsEl.textContent = String(Math.round(fpsAvg));
  if (hudZoomEl) hudZoomEl.textContent = viewZoom.toFixed(2) + '×';
  if (hudNodesEl) hudNodesEl.textContent = String(galaxyNodes.length);

  updateShake(dt);

  // Cosmic Timeline update (SCAFFOLD)
  timelineUpdate(dt);

  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2 + viewX + screenShakeX, H / 2 + viewY + screenShakeY);
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

  // Render 6 Domain Orbit Rings + Labels
  Object.entries(DOMAIN_CONFIG).forEach(([cat, cfg]) => {
    const cx = Math.cos(cfg.angle) * DOMAIN_RADIUS;
    const cy = Math.sin(cfg.angle) * DOMAIN_RADIUS;
    // Outer cluster halo
    const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160);
    haloGrad.addColorStop(0, `hsla(${cfg.hue}, 80%, 65%, 0.06)`);
    haloGrad.addColorStop(1, `hsla(${cfg.hue}, 80%, 65%, 0)`);
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 160, 0, Math.PI * 2);
    ctx.fill();
    // Domain orbit ring (dashed)
    ctx.strokeStyle = `hsla(${cfg.hue}, 70%, 65%, 0.09)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, DOMAIN_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Cluster center dot + label
    ctx.fillStyle = `hsla(${cfg.hue}, 80%, 70%, 0.55)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsla(${cfg.hue}, 70%, 80%, 0.85)`;
    ctx.font = '600 10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cfg.icon} ${cat}`, cx, cy - 155);
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
  if (searchHighlightTime > 0) searchHighlightTime -= 1/60;

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
    const matchesSearch = (() => {
      if (!searchQuery) return false;
      const q = searchQuery.toLowerCase();
      const p = node.project;
      return (p.name && p.name.toLowerCase().includes(q)) ||
             (p.description && p.description.toLowerCase().includes(q)) ||
             (p.category && p.category.toLowerCase().includes(q));
    })();
    const searchBoost = matchesSearch ? (0.5 + 0.5 * Math.sin(searchHighlightTime * 6)) : 0;
    const emphasised = isHovered || isSelected;

    // ===== COSMIC TIMELINE: phase state computation =====
    const phase = {
      visible: true,
      alphaMult: 1,
      radiusMult: 1,
      coreLightnessAdd: 0,
      glowAlphaMult: 1,
      labelAlpha: 1,
      spawning: false,
      birthPulse: 0,
      dim: false,
      protostar: false
    };
    timelineAdjustNodeForPhase(node, phase);
    if (!phase.visible) return;
    // One-shot spawn effect: first frame when birthProgress crosses 0.5
    if (phase.spawning && phase.birthP !== undefined && !node._spawnFired && phase.birthP > 0.5) {
      node._spawnFired = true;
      // Birth ripples
      for (let i = 0; i < 3; i++) {
        rippleEffects.push({
          x: node.x, y: node.y,
          radius: node.radius * (0.5 + i * 0.4),
          speed: 2 + i * 0.9,
          hue: node.hue + i * 12,
          life: 1,
          decay: 0.012 + i * 0.006
        });
      }
      // Particle puff
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2 + Math.random() * 0.25;
        const sp = 0.9 + Math.random() * 3.2;
        mouseTrailParticles.push({
          x: node.x, y: node.y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          size: 1.5 + Math.random() * 3,
          hue: node.hue + (Math.random() - 0.5) * 40,
          life: 1,
          decay: 0.012 + Math.random() * 0.02
        });
      }
    }
    if (!phase.spawning) node._spawnFired = false;
    // =====================================================

    // Draw ray to core
    const rayAlpha = (emphasised ? 0.3 : (matchesSearch ? 0.22 : 0.08)) * phase.alphaMult * (phase.dim ? 0.3 : 1);
    ctx.strokeStyle = `hsla(${node.hue}, 70%, 60%, ${rayAlpha})`;
    ctx.lineWidth = (emphasised ? 1.5 : (matchesSearch ? 1.2 : 1)) * phase.radiusMult;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();

    const effRadius = node.radius * phase.radiusMult;

    // Protostar ring (flickering dust around unborn project)
    if (phase.protostar) {
      const flick = 0.6 + 0.4 * Math.sin(performance.now() * 0.006 + node.hue * 0.13);
      ctx.strokeStyle = `hsla(${node.hue}, 70%, 50%, ${0.35 * phase.alphaMult * flick})`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, effRadius * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Inner dust halo
      const dustGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, effRadius * 2.5);
      dustGrad.addColorStop(0, `hsla(${node.hue}, 60%, 55%, ${0.2 * phase.alphaMult * flick})`);
      dustGrad.addColorStop(1, `hsla(${node.hue}, 60%, 55%, 0)`);
      ctx.fillStyle = dustGrad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, effRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spawning corona (expanding pulse)
    if (phase.spawning && phase.birthP !== undefined) {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.012);
      const coronaR = effRadius * (2.2 + phase.birthP * 1.4 + pulse * 0.25);
      const coronaGrad = ctx.createRadialGradient(node.x, node.y, effRadius * 0.6, node.x, node.y, coronaR);
      coronaGrad.addColorStop(0, `hsla(${node.hue}, 100%, 75%, ${0.5 * phase.alphaMult * (1 - phase.birthP)})`);
      coronaGrad.addColorStop(1, `hsla(${node.hue}, 100%, 75%, 0)`);
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, coronaR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Selection ring (persistent)
    if (isSelected) {
      ctx.strokeStyle = `hsla(${node.hue}, 90%, 80%, ${0.85 * phase.alphaMult})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, effRadius * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Search match pulsing ring
    if (matchesSearch) {
      ctx.strokeStyle = `hsla(160, 90%, 75%, ${(0.4 + searchBoost * 0.5) * phase.alphaMult})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(node.x, node.y, effRadius * (2.6 + searchBoost * 1.3), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Glow
    const glowMultBase = isSelected ? 4.5 : (isHovered ? 4 : (matchesSearch ? 3.4 : 2.5));
    const glowMult = glowMultBase * phase.radiusMult * (phase.protostar ? 0.5 : 1);
    const glowAlphaBase = isSelected ? 0.8 : (isHovered ? 0.7 : (matchesSearch ? 0.45 + searchBoost * 0.25 : 0.25));
    const glowAlpha = glowAlphaBase * phase.alphaMult * phase.glowAlphaMult * (phase.dim ? 0.4 : 1);
    const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, effRadius * glowMult);
    glowGrad.addColorStop(0, `hsla(${node.hue}, 85%, 70%, ${glowAlpha})`);
    glowGrad.addColorStop(1, `hsla(${node.hue}, 85%, 70%, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(node.x, node.y, effRadius * glowMult, 0, Math.PI * 2);
    ctx.fill();

    // Core Star
    const baseLightness = isSelected ? 95 : (isHovered ? 90 : (matchesSearch ? 85 : 65));
    const coreLightnessVal = Math.max(20, Math.min(98, baseLightness + phase.coreLightnessAdd));
    const coreLightness = coreLightnessVal + '%';
    const coreSizeBase = isSelected ? node.radius * 1.55 : (isHovered ? node.radius * 1.4 : (matchesSearch ? node.radius * 1.22 : node.radius));
    const coreSize = coreSizeBase * phase.radiusMult * (phase.protostar ? 0.55 : 1);
    ctx.fillStyle = `hsl(${node.hue}, ${phase.protostar ? 50 : 80}%, ${coreLightness})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, coreSize, 0, Math.PI * 2);
    ctx.fill();
    // Protostar dot cross
    if (phase.protostar) {
      ctx.strokeStyle = `hsla(${node.hue}, 80%, 70%, ${0.6 * phase.alphaMult})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(node.x - coreSize * 1.3, node.y);
      ctx.lineTo(node.x + coreSize * 1.3, node.y);
      ctx.moveTo(node.x, node.y - coreSize * 1.3);
      ctx.lineTo(node.x, node.y + coreSize * 1.3);
      ctx.stroke();
    }

    // Star Label (hide for protostars dimmed)
    const labelAlphaBase = isSelected || isHovered ? 1 : (matchesSearch ? 0.95 : 0.75);
    const labelAlpha = labelAlphaBase * phase.labelAlpha * phase.alphaMult * (phase.dim || phase.protostar ? 0.35 : 1);
    const labelColor = isSelected || isHovered ? `rgba(255,255,255,${labelAlpha})` : `rgba(255, 255, 255, ${labelAlpha})`;
    ctx.fillStyle = labelColor;
    ctx.font = `${(emphasised || matchesSearch) ? 'bold 12px' : '10px'} "Inter", sans-serif`;
    ctx.fillText(node.project.name, node.x, node.y + effRadius + 14);
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

  // Cosmic Timeline: draw commit comets (SCAFFOLD)
  timelineDrawComets(ctx);

  ctx.restore();

  // Draw minimap
  drawMinimap();

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

  faviconUpdate();

  requestAnimationFrame(drawGalaxy);
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  initStarParticles();
  faviconInit();
  window.addEventListener('resize', resizeCanvas);

  // Initialize canvas to be focusable so keyboard events reliably reach it
  if (canvas) {
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('aria-label', 'ALIVERSE Galaxy Map — use arrow keys to navigate stars');
  }

  fetchProjects();
  fetchStats();
  setInterval(fetchStats, 5000);

  // Keyboard Shortcuts (Ctrl+K search, Ctrl+T timeline, Ctrl+G tour, Ctrl+Shift+S snapshot,
  // Space timeline play, Arrows: timeline scrub if open / node navigation otherwise,
  // Enter: launch selected, F: fly-to selected, Esc: dismiss)
  window.addEventListener('keydown', (e) => {
    // Skip if user is typing in a form field (unless it's a global shortcut like Esc or Ctrl combos)
    const inField = e.target && (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      e.target.isContentEditable
    );

    // ---- Global shortcuts that ALWAYS work (even in fields / inside modals) ----
    if (e.key === 'Escape') {
      e.preventDefault();
      // Stop propagation so iframes don't swallow it
      e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
      hideContextMenu();
      closeInspector();
      closeLiveApp();
      closeTerminal();
      tourExit(); // Added to ensure tour also closes
      return;
    }

    // View Switching Shortcuts
    if (!inField) {
      if (e.key === '1' || e.key.toLowerCase() === 'g') {
        if (btnViewGalaxy) btnViewGalaxy.click();
        return;
      }
      if (e.key === '2' || e.key.toLowerCase() === 'c') {
        if (btnViewGrid) btnViewGrid.click();
        return;
      }
      if (e.key === '3' || e.key.toLowerCase() === 't') {
        timelineTogglePanel();
        return;
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
      e.preventDefault();
      timelineTogglePanel();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      tourToggle();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 's')) {
      e.preventDefault();
      galaxySnapshot();
      return;
    }

    // ---- Field-gated shortcuts ----
    if (inField) return;  // All shortcuts below are disabled while typing

    if (e.key === ' ') {
      if (TIMELINE.open || TIMELINE.playing || TIMELINE.progress < 1) {
        e.preventDefault();
        timelineTogglePlay();
      }
      return;
    }

    // Arrow keys
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Timeline scrub with Left/Right (works whenever timeline is visible OR playing)
      const timelineIsActive = TIMELINE.open || TIMELINE.playing || TIMELINE.progress < 1;
      const useForTimeline = timelineIsActive && (e.key === 'ArrowLeft' || e.key === 'ArrowRight');

      if (useForTimeline) {
        e.preventDefault();
        const delta = (e.key === 'ArrowLeft' ? -0.01 : 0.01) * (e.shiftKey ? 5 : 1);
        timelineSetProgress(Math.max(0, Math.min(1, TIMELINE.progress + delta)), { fromUser: true });
      } else {
        // Galaxy node navigation
        e.preventDefault();
        // Ensure we're in galaxy view
        if (btnViewGalaxy && btnViewGrid && !btnViewGalaxy.classList.contains('active')) {
          btnViewGalaxy.classList.add('active');
          btnViewGrid.classList.remove('active');
          if (galaxyView) galaxyView.classList.remove('hidden');
          if (gridView) gridView.classList.add('hidden');
        }
        const dir = e.key === 'ArrowLeft' ? 'left'
                 : e.key === 'ArrowRight' ? 'right'
                 : e.key === 'ArrowUp' ? 'up' : 'down';
        const n = selectNearestNode(dir);
        if (n) {
          const isFar = viewZoom < 1.25 || Math.hypot(
            -n.x * viewZoom - viewX,
            -n.y * viewZoom - viewY
          ) > Math.min(W, H) * 0.35;
          if (isFar) flyToNode(n, 1.7, 550);
        }
      }
      return;
    }

    // Enter (launch/inspect) or F (fly-to) on selected node
    if (e.key === 'Enter' || e.key === 'f' || e.key === 'F') {
      if (btnViewGalaxy && btnViewGrid && !btnViewGalaxy.classList.contains('active')) {
        btnViewGalaxy.classList.add('active');
        btnViewGrid.classList.remove('active');
        if (galaxyView) galaxyView.classList.remove('hidden');
        if (gridView) gridView.classList.add('hidden');
      }
      if (!selectedNode && galaxyNodes.length) {
        selectNearestNode('any');
      }
      if (selectedNode) {
        e.preventDefault();
        if (e.key === 'f' || e.key === 'F') {
          flyToNode(selectedNode, 2.0, 850);
        } else {
          for (let i = 0; i < 2; i++) {
            rippleEffects.push({
              x: selectedNode.x, y: selectedNode.y,
              radius: selectedNode.radius * 1.2,
              speed: 2.2 + i * 1.2,
              hue: selectedNode.hue + (i * 15),
              life: 1, decay: 0.022 + i * 0.008
            });
          }
          if (selectedNode.project.hasHtml) launchLiveApp(selectedNode.project);
          else openInspector(selectedNode.project);
        }
      }
      return;
    }
  }, { capture: true });  // Use capture phase so we fire BEFORE iframe/embedded content swallows the event

  // ====== COSMIC TIMELINE EVENT LISTENERS (SCAFFOLD)  ======
  const btnTimelineToggle = document.getElementById('btn-timeline-toggle');
  if (btnTimelineToggle) btnTimelineToggle.addEventListener('click', timelineTogglePanel);

  const timelineRange = document.getElementById('timeline-range');
  if (timelineRange) {
    timelineRange.addEventListener('input', (e) => {
      timelineSetProgress(parseInt(e.target.value, 10) / 1000, { fromUser: true });
    });
  }

  const btnRewind = document.getElementById('btn-timeline-rewind');
  if (btnRewind) btnRewind.addEventListener('click', timelineRewind);
  const btnPlay = document.getElementById('btn-timeline-play');
  if (btnPlay) btnPlay.addEventListener('click', timelineTogglePlay);
  const btnFfwd = document.getElementById('btn-timeline-fastforward');
  if (btnFfwd) btnFfwd.addEventListener('click', timelineFastForward);

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseFloat(btn.dataset.speed);
      if (!isNaN(s)) timelineSetSpeed(s);
    });
  });

  const tlCometsToggle = document.getElementById('tl-toggle-comets');
  if (tlCometsToggle) {
    tlCometsToggle.addEventListener('change', () => {
      TIMELINE.showComets = tlCometsToggle.checked;
    });
  }
  const tlProtoToggle = document.getElementById('tl-toggle-protostars');
  if (tlProtoToggle) {
    tlProtoToggle.addEventListener('change', () => {
      TIMELINE.showProtostars = tlProtoToggle.checked;
    });
  }
  // =======================================================

  // Search input
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      if (searchQuery) searchHighlightTime = 3;
      if (btnClearSearch) btnClearSearch.classList.toggle('hidden', !searchQuery);
      applyFilters();
    };
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!galaxyNodes.length) return;
        const q = searchQuery.toLowerCase().trim();
        if (!q) return;
        let best = null; let bestMatch = -1;
        galaxyNodes.forEach(n => {
          const p = n.project;
          const name = (p.name || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          let score = -1;
          if (name === q) score = 100;
          else if (name.startsWith(q)) score = 80;
          else if (name.includes(q)) score = 60;
          else if (cat.includes(q)) score = 40;
          else if (desc.includes(q)) score = 20;
          if (score > bestMatch) { bestMatch = score; best = n; }
        });
        if (best) {
          if (btnViewGalaxy && btnViewGrid) {
            btnViewGalaxy.classList.add('active');
            btnViewGrid.classList.remove('active');
            if (galaxyView) galaxyView.classList.remove('hidden');
            if (gridView) gridView.classList.add('hidden');
          }
          searchHighlightTime = 5;
          selectedNode = best;
          flyToNode(best, 2.1, 900);
        }
      }
    });
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
      if (galaxyView) galaxyView.classList.remove('hidden');
      if (gridView) gridView.classList.add('hidden');
    };

    btnViewGrid.onclick = () => {
      btnViewGrid.classList.add('active');
      btnViewGalaxy.classList.remove('active');
      if (gridView) gridView.classList.remove('hidden');
      if (galaxyView) galaxyView.classList.add('hidden');
    };
  }

  // Inspector Modal Controls
  const btnCloseModal = document.getElementById('btn-close-modal');
  if (btnCloseModal) btnCloseModal.onclick = closeInspector;
  const btnModalCloseAction = document.getElementById('btn-modal-close-action');
  if (btnModalCloseAction) btnModalCloseAction.onclick = closeInspector;
  // Inspector: close on backdrop click
  if (inspectorModal) {
    const backdrop = inspectorModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeInspector);
    inspectorModal.addEventListener('click', (e) => {
      if (e.target === inspectorModal) closeInspector();
    });
  }

  // Live App Viewer Controls
  const btnViewerClose = document.getElementById('btn-viewer-close');
  if (btnViewerClose) btnViewerClose.onclick = closeLiveApp;
  // App viewer: close on backdrop click
  if (appViewerModal) {
    const backdrop = appViewerModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeLiveApp);
    appViewerModal.addEventListener('click', (e) => {
      if (e.target === appViewerModal) closeLiveApp();
    });
  }

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
  // Terminal: close on backdrop click
  if (terminalModal) {
    const backdrop = terminalModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeTerminal);
    terminalModal.addEventListener('click', (e) => {
      if (e.target === terminalModal) closeTerminal();
    });
  }

  // Mouse pan/zoom on Galaxy View
  if (canvas) {
    window.lastMouseX = canvas.width / 2;
    window.lastMouseY = canvas.height / 2;
    let lastTrailTime = 0;
    let lastClickTime = 0;
    let dblClickThreshold = 280;

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
        isTweeningCamera = false;
        viewX += e.clientX - dragStartX;
        viewY += e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (hoveredNode) {
        selectedNode = hoveredNode;
        showContextMenu(hoveredNode, e.clientX, e.clientY);
      } else {
        hideContextMenu();
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      hideContextMenu();
      if (hoveredNode) {
        const now = performance.now();
        const isDbl = now - lastClickTime < dblClickThreshold;
        lastClickTime = now;
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
        if (isDbl) {
          flyToNode(hoveredNode, 2.0, 850);
        } else {
          if (hoveredNode.project.hasHtml) {
            launchLiveApp(hoveredNode.project);
          } else {
            openInspector(hoveredNode.project);
          }
        }
      } else {
        const now = performance.now();
        const isDbl = now - lastClickTime < dblClickThreshold;
        lastClickTime = now;
        selectedNode = null;
        if (isDbl) {
          resetView(700);
        } else {
          isDragging = true;
          dragStartX = e.clientX;
          dragStartY = e.clientY;
        }
      }
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      isTweeningCamera = false;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      viewZoom = Math.max(0.4, Math.min(3, viewZoom * zoomFactor));
    }, { passive: false });
  }

  // Minimap interactions
  if (minimapCanvas) {
    minimapCanvas.addEventListener('click', minimapClickToWorld);
  }
  if (minimapResetBtn) {
    minimapResetBtn.addEventListener('click', () => resetView(700));
  }

  // Context menu item clicks
  if (ctxMenu) {
    ctxMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('.ctx-item');
      if (btn && btn.dataset.action) handleContextAction(btn.dataset.action);
    });
  }

  // Hide context menu when clicking outside or scrolling
  window.addEventListener('mousedown', (e) => {
    if (!ctxMenu) return;
    if (ctxMenu.classList.contains('hidden')) return;
    if (!ctxMenu.contains(e.target) && e.target !== canvas) hideContextMenu();
  });
  window.addEventListener('scroll', hideContextMenu, true);
  window.addEventListener('blur', hideContextMenu);

  requestAnimationFrame(drawGalaxy);
});

