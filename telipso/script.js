/* ── telipso · bootable expansion ── */

"use strict";

// ─── Boot Sequence ──────────────────────────────────────────────
const bootLog     = document.getElementById('bootLog');
const bootFill    = document.getElementById('bootProgressFill');
const bootPct     = document.getElementById('bootProgressPct');
const bootBtn     = document.getElementById('bootBtn');
const bootOverlay = document.getElementById('bootOverlay');
const universe    = document.getElementById('universe');

const bootMessages = [
  { text: 'bootstrap init',         type: 'ok' },
  { text: 'kernel loaded',          type: 'ok' },
  { text: 'memory mapping ...',     type: 'ok' },
  { text: 'interrupt table init',   type: 'ok' },
  { text: 'scheduler started',      type: 'ok' },
  { text: 'PCI bus scan',           type: 'ok' },
  { text: 'enumerating devices...', type: 'info' },
  { text: '  └─ telipso core v0.1', type: 'ok' },
  { text: '  └─ expansion module',  type: 'ok' },
  { text: '  └─ canvas engine',     type: 'ok' },
  { text: '  └─ node network',      type: 'ok' },
  { text: 'filesystem mount /',     type: 'ok' },
  { text: '  └─ /boot',             type: 'ok' },
  { text: '  └─ /system',           type: 'ok' },
  { text: '  └─ /nodes',            type: 'ok' },
  { text: 'network interfaces up',  type: 'ok' },
  { text: '  └─ lo: 127.0.0.1',    type: 'ok' },
  { text: '  └─ eth0: 10.0.0.42',  type: 'ok' },
  { text: 'checking integrity...',  type: 'info' },
  { text: '  └─ checksum OK',       type: 'ok' },
  { text: '  └─ signature valid',   type: 'ok' },
  { text: 'expansion bay ready',    type: 'ok' },
  { text: 'all systems nominal',    type: 'ok' },
  { text: 'awaiting boot signal...',type: 'info' },
];

let bootIndex = 0;
let bootTimer = null;

function addBootLine(text, type) {
  const line = document.createElement('div');
  line.className = 'log-line';
  const ts = document.createElement('span');
  ts.className = 'log-ts';
  const sec = ((bootIndex * 0.042) + (Math.random() * 0.02)).toFixed(3);
  ts.textContent = `[00:${sec.padStart(6, '0')}]`;
  line.appendChild(ts);

  const icon = document.createElement('span');
  icon.className = `log-${type}`;
  icon.textContent = type === 'ok' ? '✓' : type === 'warn' ? '⚠' : type === 'err' ? '✗' : '→';
  line.appendChild(icon);

  const msg = document.createTextNode(' ' + text);
  line.appendChild(msg);

  bootLog.appendChild(line);
  bootLog.scrollTop = bootLog.scrollHeight;
}

function advanceBoot() {
  if (bootIndex >= bootMessages.length) {
    clearInterval(bootTimer);
    bootBtn.disabled = false;
    bootBtn.textContent = '▶ BOOT';
    return;
  }
  const msg = bootMessages[bootIndex];
  addBootLine(msg.text, msg.type);
  bootIndex++;

  const pct = Math.min(100, Math.round((bootIndex / bootMessages.length) * 100));
  bootFill.style.width = pct + '%';
  bootPct.textContent = pct + '%';
}

function startBootSequence() {
  bootTimer = setInterval(advanceBoot, 150 + Math.random() * 200);
}

function completeBoot() {
  bootOverlay.classList.add('hidden');
  universe.classList.add('visible');
  startUniverse();
}

startBootSequence();

bootBtn.addEventListener('click', completeBoot);

// ─── Canvas Universe ────────────────────────────────────────────
const canvas  = document.getElementById('telCanvas');
const ctx     = canvas.getContext('2d');
const expandBtn    = document.getElementById('expandBtn');
const autoBtn      = document.getElementById('autoBtn');
const pulseBtn     = document.getElementById('pulseBtn');
const resetUIBtn   = document.getElementById('resetBtn');
const fullBtn      = document.getElementById('fullscreenBtn');
const expansionEl  = document.getElementById('expansionLevel');
const nodeCountEl  = document.getElementById('nodeCount');
const uptimeEl     = document.getElementById('uptimeDisplay');
const hudAction    = document.getElementById('hudAction');
const hudMode      = document.getElementById('hudMode');
const statusLed    = document.getElementById('statusLed');
const statusText   = document.getElementById('statusText');
const memEl        = document.getElementById('statusMemory');
const fpsEl        = document.getElementById('statusFps');

let W, H;
let nodes       = [];
let connections = [];
let expansionLevel = 0;
let autoMode    = true;
let autoTimer   = null;
let startTime   = 0;
let frameCount  = 0;
let lastFpsTime = 0;
let uptimeSeconds = 0;

// Node class
class Node {
  constructor(x, y, generation) {
    this.x = x;
    this.y = y;
    this.generation = generation;
    this.radius = 2 + Math.random() * 4;
    this.baseRadius = this.radius;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.hue = 240 + Math.random() * 60; // purple-blue range
    this.saturation = 70 + Math.random() * 30;
    this.lightness = 50 + Math.random() * 30;
    this.alpha = 0.6 + Math.random() * 0.4;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.04;
    this.age = 0;
    this.maxAge = 300 + Math.random() * 700;
    this.alive = true;
  }

  update() {
    this.age++;
    if (this.age > this.maxAge) {
      this.alive = false;
      return;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.pulsePhase += this.pulseSpeed;

    // gentle drift towards center attraction
    const cx = W / 2;
    const cy = H / 2;
    const dx = cx - this.x;
    const dy = cy - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 10) {
      this.vx += (dx / dist) * 0.002;
      this.vy += (dy / dist) * 0.002;
    }

    // drag
    this.vx *= 0.995;
    this.vy *= 0.995;

    // clamp speed
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (spd > 2) {
      this.vx = (this.vx / spd) * 2;
      this.vy = (this.vy / spd) * 2;
    }
  }

  getPulseRadius() {
    return this.baseRadius + Math.sin(this.pulsePhase) * 1.5;
  }

  getAlpha() {
    const fadeIn = Math.min(1, this.age / 30);
    const fadeOut = Math.max(0, 1 - (this.age - this.maxAge + 100) / 100);
    return this.alpha * fadeIn * fadeOut;
  }
}

function resizeCanvas() {
  const wrap = canvas.parentElement;
  W = wrap.clientWidth;
  H = wrap.clientHeight;
  canvas.width = W;
  canvas.height = H;
}

window.addEventListener('resize', resizeCanvas);

function spawnInitialNodes() {
  const cx = W / 2;
  const cy = H / 2;
  // core node
  nodes.push(new Node(cx, cy, 0));
  nodes[0].baseRadius = 6;
  nodes[0].hue = 260;
  nodes[0].alpha = 1;
  // surrounding seed nodes
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const dist = 30 + Math.random() * 20;
    const n = new Node(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 1);
    n.baseRadius = 3 + Math.random() * 2;
    nodes.push(n);
    connections.push({ from: 0, to: nodes.length - 1, birth: 0, maxLife: 200, alpha: 0.5 });
  }
}

function expand(proliferation) {
  const count = proliferation || Math.floor(3 + expansionLevel * 1.5);
  const newNodes = [];

  const existing = nodes.filter(n => n.alive);
  if (existing.length === 0) return;

  for (let i = 0; i < count; i++) {
    const parent = existing[Math.floor(Math.random() * existing.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * (40 + expansionLevel * 8);
    const child = new Node(
      parent.x + Math.cos(angle) * dist,
      parent.y + Math.sin(angle) * dist,
      parent.generation + 1
    );
    child.hue = parent.hue + (Math.random() - 0.5) * 40;
    child.baseRadius = Math.max(1.5, parent.baseRadius * (0.6 + Math.random() * 0.4));
    newNodes.push(child);
    connections.push({
      from: nodes.indexOf(parent),
      to: nodes.length + newNodes.length - 1,
      birth: 0,
      maxLife: 150 + Math.random() * 200,
      alpha: 0.3 + Math.random() * 0.3,
    });
  }

  nodes.push(...newNodes);
  expansionLevel++;
  expansionEl.textContent = expansionLevel;

  hudAction.textContent = 'expanding';

  if (expansionLevel % 5 === 0) {
    pulse();
  }

  updateStats();
}

function pulse() {
  hudAction.textContent = 'pulse';
  // shockwave effect: temporarily boost all node radii
  const cx = W / 2;
  const cy = H / 2;
  for (const node of nodes) {
    if (!node.alive) continue;
    const dx = node.x - cx;
    const dy = node.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const boost = Math.max(1, 6 - dist / 100);
    node.baseRadius = (node.radius + boost * 4) * 0.8;
    // push outward
    if (dist > 5) {
      node.vx += (dx / dist) * 0.8;
      node.vy += (dy / dist) * 0.8;
    }
  }

  // spawn burst of new nodes
  const burst = Math.floor(8 + expansionLevel * 0.5);
  for (let i = 0; i < burst; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 100;
    const child = new Node(
      cx + Math.cos(angle) * dist,
      cy + Math.sin(angle) * dist,
      0
    );
    child.hue = 200 + Math.random() * 80;
    child.baseRadius = 2 + Math.random() * 3;
    child.vx = Math.cos(angle) * (1 + Math.random() * 2);
    child.vy = Math.sin(angle) * (1 + Math.random() * 2);
    nodes.push(child);
  }

  setTimeout(() => {
    hudAction.textContent = autoMode ? 'auto-expand' : 'idle';
  }, 800);
}

function resetUniverse() {
  nodes = [];
  connections = [];
  expansionLevel = 0;
  expansionEl.textContent = '0';
  hudAction.textContent = 'reset';
  startTime = performance.now();
  updateStats();
  spawnInitialNodes();
  setTimeout(() => {
    hudAction.textContent = autoMode ? 'auto-expand' : 'idle';
  }, 400);
}

function toggleAuto() {
  autoMode = !autoMode;
  autoBtn.classList.toggle('active', autoMode);
  hudMode.textContent = autoMode ? 'AUTO' : 'MANUAL';

  if (autoMode) {
    startAutoExpand();
  } else {
    stopAutoExpand();
  }
}

function startAutoExpand() {
  stopAutoExpand();
  autoTimer = setInterval(() => {
    if (autoMode) {
      expand(2 + Math.floor(expansionLevel * 0.3));
    }
  }, 800 + Math.random() * 1200);
}

function stopAutoExpand() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function updateStats() {
  const alive = nodes.filter(n => n.alive).length;
  nodeCountEl.textContent = alive;
  const mem = (alive * 0.128).toFixed(1);
  memEl.textContent = `mem: ${mem} kB`;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ─── Rendering ──────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H);

  // Background gradient
  const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.7);
  grad.addColorStop(0, '#141428');
  grad.addColorStop(0.5, '#0a0a14');
  grad.addColorStop(1, '#050508');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Draw connections
  for (let i = connections.length - 1; i >= 0; i--) {
    const c = connections[i];
    c.birth++;
    if (c.birth > c.maxLife) {
      connections.splice(i, 1);
      continue;
    }
    const fromNode = nodes[c.from];
    const toNode   = nodes[c.to];
    if (!fromNode || !toNode || !fromNode.alive || !toNode.alive) {
      connections.splice(i, 1);
      continue;
    }
    const lifeAlpha = Math.min(1, c.birth / 30) * Math.max(0, 1 - (c.birth - c.maxLife + 60) / 60);
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = `rgba(108, 92, 231, ${c.alpha * lifeAlpha * 0.5})`;
    ctx.lineWidth = 0.5 + (fromNode.radius * 0.2);
    ctx.stroke();
  }

  // Draw nodes
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    node.update();
    if (!node.alive) {
      nodes.splice(i, 1);
      continue;
    }

    const pr = node.getPulseRadius();
    const a = node.getAlpha();
    if (a <= 0) continue;

    // glow
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pr * 4);
    glow.addColorStop(0, `hsla(${node.hue}, ${node.saturation}%, ${node.lightness}%, ${a * 0.2})`);
    glow.addColorStop(1, `hsla(${node.hue}, ${node.saturation}%, ${node.lightness}%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.x, node.y, pr * 4, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.beginPath();
    ctx.arc(node.x, node.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${node.hue}, ${node.saturation}%, ${node.lightness}%, ${a})`;
    ctx.fill();

    // core highlight
    ctx.beginPath();
    ctx.arc(node.x - pr * 0.25, node.y - pr * 0.25, pr * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(255, 100%, 100%, ${a * 0.4})`;
    ctx.fill();
  }

  // Center glow
  const cx = W / 2;
  const cy = H / 2;
  const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 + expansionLevel * 3);
  centerGlow.addColorStop(0, 'rgba(108, 92, 231, 0.12)');
  centerGlow.addColorStop(0.5, 'rgba(108, 92, 231, 0.04)');
  centerGlow.addColorStop(1, 'rgba(108, 92, 231, 0)');
  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 80 + expansionLevel * 3, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Animation Loop ─────────────────────────────────────────────
let animId = null;

function loop(timestamp) {
  if (!startTime) startTime = timestamp;
  uptimeSeconds = Math.floor((timestamp - startTime) / 1000);
  const m = Math.floor(uptimeSeconds / 60);
  const s = uptimeSeconds % 60;
  uptimeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  // FPS
  frameCount++;
  if (timestamp - lastFpsTime >= 1000) {
    fpsEl.textContent = `${frameCount} fps`;
    frameCount = 0;
    lastFpsTime = timestamp;
    updateStats();
  }

  draw();
  animId = requestAnimationFrame(loop);
}

// ─── Init Universe ──────────────────────────────────────────────
function startUniverse() {
  resizeCanvas();
  spawnInitialNodes();
  startTime = performance.now();
  lastFpsTime = performance.now();
  updateStats();
  loop(performance.now());

  if (autoMode) {
    startAutoExpand();
    hudMode.textContent = 'AUTO';
    autoBtn.classList.add('active');
  }

  statusText.textContent = 'active';
}

// ─── Controls ───────────────────────────────────────────────────
expandBtn.addEventListener('click', () => {
  if (bootOverlay.classList.contains('hidden')) {
    expand(4 + Math.floor(expansionLevel * 0.5));
  }
});

autoBtn.addEventListener('click', toggleAuto);
pulseBtn.addEventListener('click', pulse);
resetUIBtn.addEventListener('click', resetUniverse);

fullBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('dblclick', toggleFullscreen);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (!universe.classList.contains('visible')) return;
  switch (e.key) {
    case 'e': case 'E': expand(4 + Math.floor(expansionLevel * 0.5)); break;
    case 'a': case 'A': toggleAuto(); break;
    case 'p': case 'P': pulse(); break;
    case 'r': case 'R': resetUniverse(); break;
    case 'f': case 'F': toggleFullscreen(); break;
  }
});

// ─── Handle tab visibility ──────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (animId) cancelAnimationFrame(animId);
    stopAutoExpand();
  } else {
    if (universe.classList.contains('visible')) {
      lastFpsTime = performance.now();
      frameCount = 0;
      loop(performance.now());
      if (autoMode) startAutoExpand();
    }
  }
});