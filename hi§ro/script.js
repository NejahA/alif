// == hi§ro — synapse garden ==
// Click the void to sprout a synapse.
// Double-click a synapse to type a message directly on it.
// Click a synapse to control its volume + idea.
// Drag synapses to move them.
// Ctrl+Z / Ctrl+Shift+Z for undo/redo.
// Scroll to zoom, drag with touch/right-click to pan.
// Click the ⚡ button to enter connection mode.
// Ctrl+click to select multiple synapses for bulk actions.
// Shift+drag the void to box-select a group of synapses.
// Click the ◉ button for focus mode — light up a synapse's network.
// Tag synapses with the 🏷 button, then filter the garden.
// Switch between separate gardens with the 🗂 button.
// Press ? for all keyboard shortcuts.

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;

// --- Constants ---

const STORAGE_KEY = 'hi§ro_synapses';
const GARDENS_KEY = 'hi§ro_gardens_v2';
const CONNECTION_RANGE = 200;
const FIRE_PULSE_SPEED = 0.02;
const SPROUT_TIME = 120;     // frames to grow from seed to full
const MAX_HISTORY = 50;
const GRID_SIZE = 30;
const MAX_ACTIVITY = 1000;   // fire event log cap
const ACTIVITY_BUCKETS = 16; // sparkline bars
const ACTIVITY_BUCKET_MS = 15000;

// --- MongoDB Cloud sync ---

const SERVER_URL = 'http://localhost:3456';
const SERVER_ENDPOINT = SERVER_URL + '/api/hisro/data';
const HEALTH_ENDPOINT = SERVER_URL + '/api/hisro/health';
let serverConnected = false;
let serverSyncPending = null;
let serverSyncTimer = null;
let serverLoadDone = false;

async function checkServerHealth() {
  try {
    const res = await fetch(HEALTH_ENDPOINT, { cache: 'no-store' });
    const json = await res.json();
    serverConnected = !!(json && json.ok && json.connected);
  } catch {
    serverConnected = false;
  }
  return serverConnected;
}

function pushToServer(payload) {
  // Debounce server writes — the server push is async, so batch rapid changes.
  serverSyncPending = payload;
  clearTimeout(serverSyncTimer);
  serverSyncTimer = setTimeout(async () => {
    const data = serverSyncPending;
    serverSyncPending = null;
    if (!data) return;
    try {
      const res = await fetch(SERVER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      if (res.ok) {
        serverConnected = true;
      } else {
        serverConnected = false;
      }
    } catch {
      serverConnected = false; // Fall back to localStorage only
    }
  }, 800);
}

async function loadFromServer() {
  try {
    const res = await fetch(SERVER_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) {
      serverConnected = false;
      return false;
    }
    const json = await res.json();
    if (!json.ok || !json.data) {
      serverConnected = json.ok !== false;
      return false;
    }
    serverConnected = true;
    // Apply server gardens if they exist
    if (json.data.gardens) {
      gardens = {};
      for (const key of Object.keys(json.data.gardens)) {
        const g = json.data.gardens[key];
        gardens[key] = Object.assign(emptyGarden(key), g, { name: key });
      }
      if (Object.keys(gardens).length === 0) gardens = { main: emptyGarden('main') };
      activeGarden = json.data.active && gardens[json.data.active] ? json.data.active : 'main';
      if (!gardens[activeGarden]) activeGarden = 'main';
      restoreGarden(gardens[activeGarden]);
      if (autoConnect && synapses.length > 0) rebuildConnections();
    } else {
      // Legacy server data (single garden payload without `gardens` wrapper)
      const g = {
        name: 'main',
        synapses: json.data.synapses || [],
        sprouts: json.data.sprouts || [],
        connections: json.data.connections || [],
        autoConnect: json.data.autoConnect !== undefined ? json.data.autoConnect : true,
        gridSnap: json.data.gridSnap || false,
        viewX: 0, viewY: 0, viewZoom: 1,
        history: [], historyIndex: -1,
        activityLog: [], tagFilter: '', soundMuted: false,
      };
      gardens = { main: g };
      activeGarden = 'main';
      restoreGarden(g);
      if (autoConnect && synapses.length > 0) rebuildConnections();
    }
    return true;
  } catch {
    serverConnected = false;
    return false;
  }
}

// --- State ---

let synapses = [];
let sprouts = [];         // growing seeds
let connections = [];
let particles = [];
let animFrame;
let hoveredId = null;
let selectedSynapse = null;
let selectedSynapses = []; // bulk selection (Ctrl+click)
let searchTerm = '';
let activityLog = [];      // timestamps of every fire (global stats)
let tagFilter = '';        // active tag filter (empty = all)

// --- Zoom / Pan ---
let viewX = 0, viewY = 0;
let viewZoom = 1;
let isPanning = false;
let panStartX, panStartY, panStartViewX, panStartViewY;

// --- Drag ---
let isDragging = false;
let dragSynapse = null;
let dragOffsetX, dragOffsetY;
let dragMoved = false;
let dragStartX, dragStartY;
const DRAG_THRESHOLD = 4; // pixels before drag activates

// --- Box select (shift+drag) ---
let boxSelecting = false;
let boxStart = { x: 0, y: 0 };
let boxEnd = { x: 0, y: 0 };
let boxJustDone = false;

// --- Connection mode ---
let connectMode = false;
let connectFirst = null;
let autoConnect = true; // auto-connect synapses within range

// --- Focus mode ---
let focusMode = false;
let focusSynapse = null;

// --- Merge mode ---
let mergeMode = false;
let mergeFirst = null;

// --- Themes ---
const THEMES = [
  { name: 'void', bg0: '#0d0d16', bg1: '#06060a' },
  { name: 'abyss', bg0: '#0a1420', bg1: '#040a12' },
  { name: 'forest', bg0: '#0a1a12', bg1: '#040d08' },
  { name: 'ember', bg0: '#1a0f0a', bg1: '#0d0604' },
  { name: 'royal', bg0: '#120a1a', bg1: '#08040d' },
  { name: 'mint', bg0: '#0a1a1a', bg1: '#040d0d' },
];
let themeIndex = 0;

// --- Snap to grid ---
let gridSnap = false;

// --- Undo / Redo ---
let history = [];
let historyIndex = -1;

// --- Gardens (separate workspaces) ---
let gardens = {};
let activeGarden = 'main';

// --- Sound ---
let audioCtx = null;
let masterGain = null;
let soundMuted = false;

// --- Toast ---
let toastTimer = null;

// --- DOM ---
const $ = id => document.getElementById(id);
const panel = $('synapse-panel');
const messageInput = $('synapse-message');
const slider = $('growth-slider');
const sliderVal = $('growth-value');
const hueSlider = $('hue-slider');
const hueValue = $('hue-value');
const synapseId = $('synapse-id');
const synapseAge = $('synapse-age');
const synapseFired = $('synapse-fired');
const synapseLastFire = $('synapse-lastfire');
const exportPanel = $('export-panel');
const exportText = $('export-text');
const importPanel = $('import-panel');
const importText = $('import-text');
const importPreview = $('import-preview');
const zoomIndicator = $('zoom-indicator');
const connectIndicator = $('connect-indicator');
const focusIndicator = $('focus-indicator');
const autoFireToggle = $('auto-fire-toggle');
const autoFireRateGroup = $('auto-fire-rate-group');
const autoFireInterval = $('auto-fire-interval');
const connectionCount = $('connection-count');
const connectionList = $('connection-list');
const inlineEditor = $('inline-editor');
const searchBar = $('search-bar');
const searchInput = $('search-input');
const searchCount = $('search-count');
const minimapEl = $('minimap');
const minimapCanvas = $('minimap-canvas');
const bulkBar = $('bulk-bar');
const bulkCount = $('bulk-count');
const tagFilterBar = $('tag-filter-bar');
const tagFilterSelect = $('tag-filter-select');
const synapseTagsEl = $('synapse-tags');
const tagInput = $('tag-input');
const gardenListEl = $('garden-list');
const helpPanel = $('help-panel');
const mergeIndicator = $('merge-indicator');
const saveIndicator = $('save-indicator');
const contextMenu = $('context-menu');
let editingSynapse = null;
let contextSynapse = null;

// --- Resize ---

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (minimapCanvas) {
    minimapCanvas.width = 160;
    minimapCanvas.height = 120;
  }
}
resize();
window.addEventListener('resize', resize);

// --- Toast ---

function showToast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// --- Audio (Web Audio blips) ---

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(audioCtx.destination);
  } catch (e) {
    audioCtx = null;
  }
}

function playBlip(hue, intensity) {
  if (soundMuted || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const freq = 180 + (hue / 360) * 720;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.6, t + 0.08);
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.exponentialRampToValueAtTime(0.12 * Math.max(0.3, intensity), t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(t);
  osc.stop(t + 0.3);
}

function updateSoundButton() {
  const btn = $('btn-sound');
  btn.textContent = soundMuted ? '🔇' : '🔊';
  btn.classList.toggle('active', !soundMuted);
}

function toggleSound() {
  soundMuted = !soundMuted;
  updateSoundButton();
  showToast(soundMuted ? 'Sound muted' : 'Sound on');
  save();
}

// Init audio on first user gesture
function gestureInit() {
  initAudio();
  document.removeEventListener('pointerdown', gestureInit);
  document.removeEventListener('keydown', gestureInit);
}
document.addEventListener('pointerdown', gestureInit);
document.addEventListener('keydown', gestureInit);

// --- History (Undo/Redo) ---

function pushHistory() {
  const snapshot = {
    synapses: synapses.map(s => serializeSynapse(s)),
    sprouts: sprouts.map(sp => ({ x: sp.x, y: sp.y, age: sp.age, hue: sp.hue })),
    connections: connections.map(c => ({ aId: c.a.id, bId: c.b.id, manual: c.manual || false, weight: c.weight || 1 })),
    activityLog: [...activityLog],
    tagFilter: tagFilter,
  };
  // Remove any future history if we're in the middle
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot);
  if (history.length > MAX_HISTORY) history.shift();
  historyIndex = history.length - 1;
}

function serializeSynapse(s) {
  return {
    id: s.id, x: s.x, y: s.y, message: s.message,
    created: s.created, targetVolume: s.targetVolume, firedCount: s.firedCount,
    hue: s.hue, sproutProgress: s.sproutProgress,
    autoFire: s.autoFire || false, autoFireInterval: s.autoFireInterval || 5,
    autoFireTimer: s.autoFireTimer || 0, pinned: s.pinned || false,
    tags: s.tags || [],
    lastFiredAt: s.lastFiredAt || 0,
  };
}

function restoreSynapseFromData(d) {
  const s = new Synapse(d.x, d.y);
  s.id = d.id;
  s.message = d.message || '';
  s.created = d.created || Date.now();
  s.targetVolume = d.targetVolume || 0.3;
  s.volume = s.targetVolume;
  s.firedCount = d.firedCount || 0;
  s.hue = d.hue || 200 + Math.random() * 80;
  s.sproutProgress = d.sproutProgress || 1;
  s.autoFire = d.autoFire || false;
  s.autoFireInterval = d.autoFireInterval || 5;
  s.autoFireTimer = d.autoFireTimer || 0;
  s.pinned = d.pinned || false;
  s.tags = Array.isArray(d.tags) ? d.tags.filter(Boolean) : [];
  s.lastFiredAt = d.lastFiredAt || 0;
  return s;
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex--;
  restoreHistory(history[historyIndex]);
  showToast('Undo');
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  restoreHistory(history[historyIndex]);
  showToast('Redo');
}

function restoreHistory(snapshot) {
  synapses = snapshot.synapses.map(restoreSynapseFromData);

  sprouts = (snapshot.sprouts || []).map(d => {
    const sp = new Sprout(d.x, d.y);
    sp.age = d.age;
    sp.hue = d.hue;
    return sp;
  });

  // Rebuild connections (preserve manual flag + weight)
  connections = (snapshot.connections || []).map(c => {
    const a = synapses.find(s => s.id === c.aId);
    const b = synapses.find(s => s.id === c.bId);
    if (a && b) {
      return { a, b, dist: Math.hypot(a.x - b.x, a.y - b.y), pulse: 0, manual: c.manual || false, weight: c.weight || 1 };
    }
    return null;
  }).filter(Boolean);

  if (Array.isArray(snapshot.activityLog)) activityLog = [...snapshot.activityLog];
  if (snapshot.tagFilter !== undefined) tagFilter = snapshot.tagFilter;

  // Update UI
  if (selectedSynapse) {
    const stillExists = synapses.find(s => s.id === selectedSynapse.id);
    if (stillExists) selectSynapse(stillExists);
    else deselect();
  }
  selectedSynapses = [];
  updateBulkBar();
  updateTagFilterOptions();
  save();
}

// --- Synapse ---

class Synapse {
  constructor(x, y) {
    this.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    this.x = x;
    this.y = y;
    this.message = '';
    this.created = Date.now();
    this.volume = 0.3;          // 0-1, controls size + glow
    this.targetVolume = 0.3;
    this.firedCount = 0;
    this.hue = 200 + Math.random() * 80;
    this.radius = 6;
    this.glow = 0;
    this.firing = false;
    this.fireTimer = 0;
    this.sproutProgress = 1;    // 0 = just sprouted, 1 = fully grown
    // Auto-fire
    this.autoFire = false;
    this.autoFireInterval = 5;  // seconds
    this.autoFireTimer = 0;
    // Pin
    this.pinned = false;
    this.pinTimer = 0;
    // Tags
    this.tags = [];
    // Stats
    this.lastFiredAt = 0;
  }

  tick(dt) {
    this.volume += (this.targetVolume - this.volume) * 0.03;
    this.volume = Math.max(0.01, this.volume);
    this.glow += (this.volume - this.glow) * 0.03;

    if (this.firing) {
      this.fireTimer++;
      if (this.fireTimer > 30) {
        this.firing = false;
        this.fireTimer = 0;
      }
    }
    this.radius = 5 + this.volume * 18;

    // Auto-fire
    if (this.autoFire && this.isReady) {
      this.autoFireTimer += dt;
      if (this.autoFireTimer >= this.autoFireInterval) {
        this.autoFireTimer = 0;
        fireSynapse(this);
      }
    }

    // Pin animation
    if (this.pinned) {
      this.pinTimer++;
    } else {
      this.pinTimer = 0;
    }
  }

  get isReady() {
    return this.sproutProgress >= 1;
  }

  hasTag(tag) {
    return tag && this.tags.includes(tag);
  }

  fire() {
    this.firedCount++;
    this.lastFiredAt = Date.now();
    activityLog.push(this.lastFiredAt);
    if (activityLog.length > MAX_ACTIVITY) activityLog.shift();
    playBlip(this.hue, this.volume);
    this.targetVolume = Math.min(1, this.volume + 0.15);
    this.firing = true;
    this.fireTimer = 0;
    // Spawn fire particles
    spawnFireParticles(this);
  }

  setVolume(val) {
    this.targetVolume = Math.max(0, Math.min(1, val));
    if (val > this.volume) {
      this.firing = true;
      this.fireTimer = 0;
      spawnFireParticles(this);
    }
  }

  draw() {
    const h = this.hue;
    const r = this.radius * this.sproutProgress;

    if (this.glow > 0.05 && this.sproutProgress > 0.1) {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 5);
      grad.addColorStop(0, `hsla(${h}, 70%, 60%, ${0.08 * this.glow * this.sproutProgress})`);
      grad.addColorStop(1, `hsla(${h}, 70%, 60%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.firing) {
      const expand = this.fireTimer * 1.5;
      const alpha = Math.max(0, 0.3 - this.fireTimer * 0.01) * this.sproutProgress;
      ctx.strokeStyle = `hsla(${h}, 80%, 70%, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + expand, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Search highlight ring
    if (searchTerm && this.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      const pulse = Math.sin(performance.now() * 0.005) * 0.3 + 0.7;
      ctx.strokeStyle = `hsla(50, 100%, 70%, ${0.3 * pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.shadowColor = `hsla(${h}, 80%, 70%, ${0.3 * this.glow * this.sproutProgress})`;
    ctx.shadowBlur = 20 * this.glow * this.sproutProgress;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);

    const grad = ctx.createRadialGradient(this.x - r * 0.3, this.y - r * 0.3, 0, this.x, this.y, r);
    grad.addColorStop(0, `hsla(${h}, 80%, 80%, ${(0.6 + 0.4 * this.glow) * this.sproutProgress})`);
    grad.addColorStop(0.5, `hsla(${h}, 70%, 55%, ${(0.5 + 0.3 * this.glow) * this.sproutProgress})`);
    grad.addColorStop(1, `hsla(${h}, 60%, 35%, ${(0.3 + 0.2 * this.glow) * this.sproutProgress})`);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (this.sproutProgress > 0.3) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, 90%, 85%, ${0.5 * this.glow * this.sproutProgress})`;
      ctx.fill();
    }

    // Auto-fire indicator
    if (this.autoFire && this.isReady) {
      ctx.strokeStyle = `hsla(${h}, 80%, 70%, 0.25)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Pin indicator
    if (this.pinned && this.isReady) {
      const pinPulse = Math.sin(this.pinTimer * 0.04) * 0.15 + 0.35;
      ctx.strokeStyle = `rgba(255, 255, 255, ${pinPulse})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const pinSize = 4;
      const pinX = this.x + r + 4;
      const pinY = this.y - r - 2;
      ctx.moveTo(pinX, pinY);
      ctx.lineTo(pinX + pinSize, pinY + pinSize);
      ctx.lineTo(pinX - pinSize, pinY + pinSize);
      ctx.closePath();
      ctx.stroke();
    }

    // Sticky note label
    if (this.message && this.isReady) {
      const lines = this.message.split('\n').filter(l => l.trim());
      const displayText = lines[0].length > 30 ? lines[0].slice(0, 27) + '...' : lines[0];
      const fontSize = 10;
      ctx.font = `${fontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textMetrics = ctx.measureText(displayText);
      const textWidth = textMetrics.width;
      const padX = 8;
      const padY = 4;
      const noteW = textWidth + padX * 2;
      const noteH = fontSize + padY * 2;
      const noteX = this.x - noteW / 2;
      const noteY = this.y + r + 8;

      ctx.shadowColor = `hsla(${h}, 40%, 20%, 0.4)`;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = `hsla(${h}, 50%, 30%, 0.25)`;
      ctx.beginPath();
      ctx.roundRect(noteX, noteY, noteW, noteH, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = `hsla(${h}, 60%, 60%, 0.2)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.roundRect(noteX, noteY, noteW, noteH, 4);
      ctx.stroke();

      ctx.fillStyle = `hsla(${h}, 60%, 80%, 0.85)`;
      ctx.fillText(displayText, this.x, noteY + noteH / 2);

      // Tag chips below the note (max 2, then +N)
      if (this.tags.length > 0) {
        const chips = this.tags.slice(0, 2);
        const extra = this.tags.length - chips.length;
        const chipFont = 8;
        ctx.font = `${chipFont}px "Courier New", monospace`;
        let chipX = this.x;
        const chipY = noteY + noteH + 4;
        const chipPadX = 5;
        const chipPadY = 2;
        const totalExtra = extra > 0 ? ctx.measureText('+' + extra).width + chipPadX * 2 + 4 : 0;
        const totalWidth = chips.reduce((sum, t) => {
          return sum + ctx.measureText(t).width + chipPadX * 2 + 4;
        }, 0) + (totalExtra || 0) - 4;
        chipX = this.x - totalWidth / 2;

        for (const t of chips) {
          const tw = ctx.measureText(t).width;
          const cw = tw + chipPadX * 2;
          ctx.fillStyle = 'hsla(220, 60%, 50%, 0.25)';
          ctx.beginPath();
          ctx.roundRect(chipX, chipY, cw, chipFont + chipPadY * 2, 3);
          ctx.fill();
          ctx.strokeStyle = 'hsla(220, 60%, 70%, 0.25)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.roundRect(chipX, chipY, cw, chipFont + chipPadY * 2, 3);
          ctx.stroke();
          ctx.fillStyle = 'hsla(220, 70%, 75%, 0.8)';
          ctx.fillText(t, chipX + cw / 2, chipY + (chipFont + chipPadY * 2) / 2);
          chipX += cw + 4;
        }

        if (extra > 0) {
          const tw = ctx.measureText('+' + extra).width;
          const cw = tw + chipPadX * 2;
          ctx.fillStyle = 'hsla(220, 60%, 50%, 0.25)';
          ctx.beginPath();
          ctx.roundRect(chipX, chipY, cw, chipFont + chipPadY * 2, 3);
          ctx.fill();
          ctx.strokeStyle = 'hsla(220, 60%, 70%, 0.25)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.roundRect(chipX, chipY, cw, chipFont + chipPadY * 2, 3);
          ctx.stroke();
          ctx.fillStyle = 'hsla(220, 70%, 75%, 0.8)';
          ctx.fillText('+' + extra, chipX + cw / 2, chipY + (chipFont + chipPadY * 2) / 2);
        }
      }
    }
  }

  hitTest(px, py) {
    const r = this.radius * this.sproutProgress;
    return Math.hypot(px - this.x, py - this.y) < r + 8;
  }
}

// --- Sprout (seed growing into a synapse) ---

class Sprout {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.hue = 200 + Math.random() * 80;
    this.synapse = null; // will be set when fully grown
  }

  tick() {
    this.age++;
  }

  get progress() {
    return Math.min(1, this.age / SPROUT_TIME);
  }

  get isDone() {
    return this.age >= SPROUT_TIME;
  }

  draw() {
    const p = this.progress;
    const h = this.hue;

    if (p < 0.3) {
      // tiny seed pulsing
      const pulse = Math.sin(this.age * 0.12) * 0.3 + 0.7;
      const r = 2 + p * 3;
      ctx.shadowColor = `hsla(${h}, 80%, 70%, ${0.5 * pulse})`;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, 80%, 75%, ${0.5 * pulse})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // expanding glow
      const r = 3 + p * 5;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 3);
      grad.addColorStop(0, `hsla(${h}, 70%, 65%, ${0.3 * p})`);
      grad.addColorStop(1, `hsla(${h}, 70%, 65%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = `hsla(${h}, 80%, 70%, ${0.3 * p})`;
      ctx.shadowBlur = 12 * p;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, 70%, 60%, ${0.5 * p})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

// --- Particle System ---

class Particle {
  constructor(x, y, hue, type = 'fire') {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.type = type;
    this.life = 1;
    this.decay = 0.01 + Math.random() * 0.02;
    this.size = 1 + Math.random() * 3;

    if (type === 'fire') {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 0.5;
      this.decay = 0.015 + Math.random() * 0.025;
      this.size = 2 + Math.random() * 4;
    } else {
      // ambient
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = -0.1 - Math.random() * 0.2;
      this.decay = 0.002 + Math.random() * 0.005;
      this.size = 0.5 + Math.random() * 1.5;
    }
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= this.decay;
    this.size *= 0.995;
  }

  draw() {
    if (this.life <= 0) return;
    const alpha = this.life * (this.type === 'fire' ? 0.8 : 0.3);
    ctx.shadowColor = `hsla(${this.hue}, 80%, 70%, ${alpha * 0.5})`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 80%, 75%, ${alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function spawnFireParticles(syn) {
  const count = 5 + Math.floor(Math.random() * 8);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(syn.x, syn.y, syn.hue, 'fire'));
  }
}

function spawnAmbientParticles() {
  if (particles.length > 200) return;
  if (Math.random() > 0.05) return;
  const x = Math.random() * W;
  const y = Math.random() * H;
  const hue = 200 + Math.random() * 80;
  particles.push(new Particle(x, y, hue, 'ambient'));
}

// --- Connections ---

function rebuildConnections() {
  // Only rebuild if auto-connect is enabled
  if (!autoConnect) return;

  // Preserve manual connections (added via ⚡ connect mode)
  const manualConns = connections.filter(c => c.manual);
  const prevAuto = connections.filter(c => !c.manual);

  connections = [];
  const ready = synapses.filter(s => s.isReady);
  for (let i = 0; i < ready.length; i++) {
    for (let j = i + 1; j < ready.length; j++) {
      const a = ready[i];
      const b = ready[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < CONNECTION_RANGE) {
        // Only add if not already covered by a manual connection
        const alreadyManual = manualConns.some(c =>
          (c.a === a && c.b === b) || (c.a === b && c.b === a)
        );
        if (!alreadyManual) {
          // Preserve weight from previous auto connection if possible
          const prev = prevAuto.find(c =>
            (c.a === a && c.b === b) || (c.a === b && c.b === a)
          );
          const weight = prev ? (prev.weight || 1) : 1;
          connections.push({ a, b, dist, pulse: 0, manual: false, weight });
        }
      }
    }
  }

  // Add back manual connections (with updated distances)
  for (const mc of manualConns) {
    // Verify both synapses still exist
    if (!synapses.includes(mc.a) || !synapses.includes(mc.b)) continue;
    const dist = Math.hypot(mc.a.x - mc.b.x, mc.a.y - mc.b.y);
    // Check not already added by auto-connect (shouldn't happen due to check above, but be safe)
    const alreadyExists = connections.some(c =>
      (c.a === mc.a && c.b === mc.b) || (c.a === mc.b && c.b === mc.a)
    );
    if (!alreadyExists) {
      connections.push({ a: mc.a, b: mc.b, dist, pulse: mc.pulse || 0, manual: true, weight: mc.weight || 1 });
    }
  }
}

function addManualConnection(a, b) {
  // Check if a manual connection already exists for this pair
  const manualExists = connections.some(c =>
    c.manual && ((c.a === a && c.b === b) || (c.a === b && c.b === a))
  );
  if (manualExists) return false;
  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  if (dist > CONNECTION_RANGE * 2) return false; // allow longer manual connections
  // Remove any existing auto-connection for this pair (upgrade to manual)
  for (let i = connections.length - 1; i >= 0; i--) {
    const c = connections[i];
    if (!c.manual && ((c.a === a && c.b === b) || (c.a === b && c.b === a))) {
      connections.splice(i, 1);
    }
  }
  connections.push({ a, b, dist, pulse: 0, manual: true, weight: 1 });
  pushHistory();
  save();
  return true;
}

function connectionDimmed(c) {
  // Focus mode: dim if neither endpoint is in the focused network
  if (focusMode && focusSynapse) {
    return !(isInFocus(c.a) || isInFocus(c.b));
  }
  // Tag filter: dim if both endpoints lack the tag
  if (tagFilter) {
    return !(c.a.hasTag(tagFilter) || c.b.hasTag(tagFilter));
  }
  return false;
}

function drawConnections() {
  for (const c of connections) {
    // Safety check: skip invalid connections
    if (!c || !c.a || !c.b) continue;
    if (typeof c.a.hue !== 'number' || typeof c.b.hue !== 'number') continue;

    // Use larger range for manual connections (up to 400px) vs auto (up to 200px)
    const range = c.manual ? CONNECTION_RANGE * 2 : CONNECTION_RANGE;
    const distFactor = Math.max(0, 1 - c.dist / range);
    const vol = (c.a.volume + c.b.volume) / 2;
    const hue = (c.a.hue + c.b.hue) / 2;
    const weight = c.weight || 1;

    // Calculate alpha for visibility — brighter for closer connections
    let alpha = Math.max(0.3, 0.8 * distFactor * (0.5 + 0.5 * vol));
    if (connectionDimmed(c)) alpha *= 0.08;

    // Reset shadow state before drawing to avoid artifacts
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Colored glow line (behind)
    ctx.strokeStyle = `hsla(${hue}, 60%, 60%, ${alpha * 0.4})`;
    ctx.lineWidth = (2.5 + distFactor * 2.0) * weight;
    ctx.beginPath();
    ctx.moveTo(c.a.x, c.a.y);
    ctx.lineTo(c.b.x, c.b.y);
    ctx.stroke();

    // Main white connection line
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = (1.2 + distFactor * 1.5) * weight;
    ctx.beginPath();
    ctx.moveTo(c.a.x, c.a.y);
    ctx.lineTo(c.b.x, c.b.y);
    ctx.stroke();

    // Pulse effect (traveling dot when synapse fires)
    if (c.pulse > 0) {
      const t = c.pulse;
      const px = c.a.x + (c.b.x - c.a.x) * t;
      const py = c.a.y + (c.b.y - c.a.y) * t;
      const pa = Math.sin(t * Math.PI) * 0.8;

      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(px, py, (3 + pa * 4) * Math.min(1.5, weight), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 80%, ${pa})`;
      ctx.fill();

      c.pulse += FIRE_PULSE_SPEED;
      if (c.pulse >= 1) c.pulse = 0;
    }
  }
}

// --- Focus mode helpers ---

function isInFocus(s) {
  if (!focusSynapse) return false;
  if (s === focusSynapse) return true;
  return connections.some(c =>
    (c.a === focusSynapse && c.b === s) || (c.b === focusSynapse && c.a === s)
  );
}

function isDimmed(s) {
  // Immature synapses are never dimmed (they're growing)
  if (!s.isReady) return false;
  if (focusMode && focusSynapse) return !isInFocus(s);
  if (tagFilter) return !s.hasTag(tagFilter);
  return false;
}

function toggleFocusMode() {
  focusMode = !focusMode;
  focusSynapse = null;
  $('btn-focus').classList.toggle('active', focusMode);
  focusIndicator.classList.toggle('hidden', !focusMode);
  if (focusMode) {
    focusIndicator.textContent = 'Focus mode — click a synapse';
    canvas.style.cursor = 'crosshair';
  } else {
    canvas.style.cursor = 'default';
  }
}

function exitFocusMode() {
  if (!focusMode) return;
  focusMode = false;
  focusSynapse = null;
  $('btn-focus').classList.remove('active');
  focusIndicator.classList.add('hidden');
  canvas.style.cursor = 'default';
}

function focusOn(syn) {
  focusSynapse = syn;
  focusIndicator.textContent = 'Focus: #' + syn.id.slice(0, 6) + ' — click another or esc to exit';
}

// --- Merge mode ---

function toggleMergeMode() {
  mergeMode = !mergeMode;
  mergeFirst = null;
  mergeIndicator.classList.toggle('hidden', !mergeMode);
  if (mergeMode) {
    mergeIndicator.textContent = 'Merge mode — click two synapses to combine';
    canvas.style.cursor = 'crosshair';
  } else {
    canvas.style.cursor = 'default';
  }
}

function exitMergeMode() {
  if (!mergeMode) return;
  mergeMode = false;
  mergeFirst = null;
  mergeIndicator.classList.add('hidden');
  canvas.style.cursor = 'default';
}

function mergeSynapses(a, b) {
  if (a === b) return;
  // Combine into a: keep a's position, merge messages, tags, stats
  const combinedMessage = [a.message, b.message].filter(Boolean).join('\n');
  a.message = combinedMessage;
  a.targetVolume = Math.min(1, (a.targetVolume + b.targetVolume) / 2 + 0.1);
  a.volume = a.targetVolume;
  a.firedCount += b.firedCount;
  a.hue = (a.hue + b.hue) / 2;
  a.autoFire = a.autoFire || b.autoFire;
  a.autoFireInterval = Math.min(a.autoFireInterval, b.autoFireInterval);
  a.pinned = a.pinned || b.pinned;
  a.tags = [...new Set([...a.tags, ...b.tags])];
  a.lastFiredAt = Math.max(a.lastFiredAt, b.lastFiredAt);

  // Remove b
  synapses = synapses.filter(s => s.id !== b.id);
  selectedSynapses = selectedSynapses.filter(s => s.id !== b.id);
  if (selectedSynapse && selectedSynapse.id === b.id) deselect();

  // Rebuild connections (b's connections now point to a)
  for (const c of connections) {
    if (c.a === b) c.a = a;
    if (c.b === b) c.b = a;
  }
  // Remove self-connections and duplicates
  connections = connections.filter(c => c.a !== c.b);
  const seen = new Set();
  connections = connections.filter(c => {
    const key = [c.a.id, c.b.id].sort().join('-');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  for (const c of connections) c.dist = Math.hypot(c.a.x - c.b.x, c.a.y - c.b.y);

  rebuildConnections();
  save();
  pushHistory();
  updateTagFilterOptions();
  selectSynapse(a);
  showToast('Synapses merged');
}

// --- Context menu ---

function showContextMenu(syn, sx, sy) {
  contextSynapse = syn;
  contextMenu.classList.remove('hidden');
  // Position within viewport
  const menuW = 180;
  const menuH = 250;
  const x = Math.min(sx, window.innerWidth - menuW - 8);
  const y = Math.min(sy, window.innerHeight - menuH - 8);
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
}

function hideContextMenu() {
  contextMenu.classList.add('hidden');
  contextSynapse = null;
}

function handleContextAction(action) {
  const syn = contextSynapse;
  if (!syn) return;
  hideContextMenu();
  switch (action) {
    case 'edit':
      showInlineEditor(syn, syn.x * viewZoom + viewX, syn.y * viewZoom + viewY);
      break;
    case 'fire':
      fireSynapse(syn);
      save();
      pushHistory();
      break;
    case 'clone': {
      const clone = new Synapse(syn.x + 30, syn.y + 30);
      clone.message = syn.message;
      clone.hue = syn.hue;
      clone.targetVolume = syn.targetVolume;
      clone.volume = syn.volume;
      clone.autoFire = syn.autoFire;
      clone.autoFireInterval = syn.autoFireInterval;
      clone.sproutProgress = syn.sproutProgress;
      clone.tags = [...syn.tags];
      synapses.push(clone);
      rebuildConnections();
      save();
      pushHistory();
      updateTagFilterOptions();
      showToast('Synapse cloned');
      break;
    }
    case 'pin':
      syn.pinned = !syn.pinned;
      save();
      pushHistory();
      showToast(syn.pinned ? 'Synapse pinned' : 'Synapse unpinned');
      break;
    case 'focus':
      focusMode = true;
      focusSynapse = syn;
      $('btn-focus').classList.add('active');
      focusIndicator.classList.remove('hidden');
      focusIndicator.textContent = 'Focus: #' + syn.id.slice(0, 6) + ' — click another or esc to exit';
      break;
    case 'merge':
      toggleMergeMode();
      mergeFirst = syn;
      mergeIndicator.textContent = 'Now click the synapse to merge into #' + syn.id.slice(0, 6);
      break;
    case 'prune':
      synapses = synapses.filter(s => s.id !== syn.id);
      selectedSynapses = selectedSynapses.filter(s => s.id !== syn.id);
      if (selectedSynapse && selectedSynapse.id === syn.id) deselect();
      rebuildConnections();
      save();
      pushHistory();
      updateTagFilterOptions();
      showToast('Synapse pruned');
      break;
  }
}

// --- Save indicator ---

let saveIndicatorTimer = null;
function flashSaveIndicator() {
  if (!saveIndicator) return;
  saveIndicator.classList.remove('hidden');
  clearTimeout(saveIndicatorTimer);
  saveIndicatorTimer = setTimeout(() => {
    saveIndicator.classList.add('hidden');
  }, 1200);
}

// --- Zoom to selection ---

function zoomToSelection() {
  const targets = selectedSynapses.length > 0 ? selectedSynapses : (selectedSynapse ? [selectedSynapse] : []);
  if (targets.length === 0) {
    showToast('Nothing selected to zoom to');
    return;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of targets) {
    if (s.x < minX) minX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.x > maxX) maxX = s.x;
    if (s.y > maxY) maxY = s.y;
  }
  const pad = 80;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const worldW = maxX - minX;
  const worldH = maxY - minY;
  if (worldW <= 0 || worldH <= 0) return;
  const newZoom = Math.min(W / worldW, H / worldH, 3);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  viewX = W / 2 - centerX * newZoom;
  viewY = H / 2 - centerY * newZoom;
  viewZoom = newZoom;
  updateZoomIndicator();
}

// --- Random garden generator ---

function generateRandomGarden() {
  const count = 8 + Math.floor(Math.random() * 12);
  const cx = (W / 2 - viewX) / viewZoom;
  const cy = (H / 2 - viewY) / viewZoom;
  const radius = 60 + Math.random() * 120;
  const words = ['idea', 'spark', 'note', 'thought', 'seed', 'echo', 'pulse', 'drift', 'glow', 'muse', 'flux', 'orbit'];
  const tags = ['core', 'idea', 'note', 'spark', 'echo'];
  const newSynapses = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const s = new Synapse(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
    s.message = words[Math.floor(Math.random() * words.length)];
    s.hue = Math.random() * 360;
    s.targetVolume = 0.2 + Math.random() * 0.6;
    s.volume = s.targetVolume;
    if (Math.random() < 0.3) s.tags = [tags[Math.floor(Math.random() * tags.length)]];
    if (Math.random() < 0.15) s.autoFire = true;
    if (Math.random() < 0.1) s.pinned = true;
    newSynapses.push(s);
  }
  synapses.push(...newSynapses);
  rebuildConnections();
  save();
  pushHistory();
  updateTagFilterOptions();
  showToast('Generated ' + count + ' synapses');
}

// --- Fire propagation ---

function fireSynapse(syn) {
  syn.fire();
  for (const c of connections) {
    if (c.a === syn) {
      c.pulse = 0.01;
      c.b.setVolume(c.b.targetVolume + 0.08 * Math.min(2.5, c.weight || 1));
    } else if (c.b === syn) {
      c.pulse = 0.01;
      c.a.setVolume(c.a.targetVolume + 0.08 * Math.min(2.5, c.weight || 1));
    }
  }
}

// --- Storage (gardens-aware) ---

function captureGardenState() {
  return {
    name: activeGarden,
    synapses: synapses.map(s => serializeSynapse(s)),
    sprouts: sprouts.map(sp => ({ x: sp.x, y: sp.y, age: sp.age, hue: sp.hue })),
    connections: connections.map(c => ({ aId: c.a.id, bId: c.b.id, manual: c.manual || false, weight: c.weight || 1 })),
    autoConnect: autoConnect,
    gridSnap: gridSnap,
    viewX: viewX, viewY: viewY, viewZoom: viewZoom,
    history: history,
    historyIndex: historyIndex,
    activityLog: [...activityLog],
    tagFilter: tagFilter,
    soundMuted: soundMuted,
  };
}

function emptyGarden(name) {
  return {
    name: name,
    synapses: [],
    sprouts: [],
    connections: [],
    autoConnect: true,
    gridSnap: false,
    viewX: 0, viewY: 0, viewZoom: 1,
    history: [],
    historyIndex: -1,
    activityLog: [],
    tagFilter: '',
    soundMuted: false,
  };
}

function save() {
  gardens[activeGarden] = captureGardenState();
  const payload = { gardens: gardens, active: activeGarden };
  localStorage.setItem(GARDENS_KEY, JSON.stringify(payload));
  // Keep the legacy key in sync for the main garden (backwards compat)
  if (activeGarden === 'main') {
    const g = gardens.main;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      synapses: g.synapses,
      sprouts: g.sprouts,
      connections: g.connections,
      autoConnect: g.autoConnect,
      gridSnap: g.gridSnap,
    }));
  }
  // Sync to MongoDB (debounced)
  pushToServer(payload);
  flashSaveIndicator();
}

function restoreGarden(g) {
  synapses = (g.synapses || []).map(restoreSynapseFromData);

  sprouts = (g.sprouts || []).map(d => {
    const sp = new Sprout(d.x, d.y);
    sp.age = d.age;
    sp.hue = d.hue;
    return sp;
  });

  connections = (g.connections || []).map(c => {
    const a = synapses.find(s => s.id === c.aId);
    const b = synapses.find(s => s.id === c.bId);
    if (a && b) {
      return { a, b, dist: Math.hypot(a.x - b.x, a.y - b.y), pulse: 0, manual: c.manual || false, weight: c.weight || 1 };
    }
    return null;
  }).filter(Boolean);

  autoConnect = g.autoConnect !== undefined ? g.autoConnect : true;
  gridSnap = g.gridSnap || false;
  viewX = g.viewX || 0;
  viewY = g.viewY || 0;
  viewZoom = g.viewZoom || 1;
  history = g.history || [];
  historyIndex = g.historyIndex !== undefined ? g.historyIndex : -1;
  activityLog = g.activityLog ? [...g.activityLog] : [];
  tagFilter = g.tagFilter || '';
  if (g.soundMuted !== undefined) soundMuted = g.soundMuted;

  if (history.length === 0) pushHistory();

  // Sync UI state
  $('btn-grid').classList.toggle('active', gridSnap);
  $('btn-auto-connect').classList.toggle('active', autoConnect);
  updateSoundButton();
  updateTagFilterOptions();
  updateZoomIndicator();

  deselect();
  clearBulkSelection();
  closePanel();
}

function load() {
  try {
    const raw = localStorage.getItem(GARDENS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.gardens) {
        gardens = {};
        for (const key of Object.keys(data.gardens)) {
          const g = data.gardens[key];
          // Ensure every garden has the fields it needs
          gardens[key] = Object.assign(emptyGarden(key), g, { name: key });
        }
        if (Object.keys(gardens).length === 0) gardens = { main: emptyGarden('main') };
        activeGarden = data.active && gardens[data.active] ? data.active : 'main';
        if (!gardens[activeGarden]) activeGarden = 'main';
        restoreGarden(gardens[activeGarden]);
        if (autoConnect && synapses.length > 0) rebuildConnections();
        return;
      }
    }

    // Legacy single-garden data
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      const data = JSON.parse(legacy);
      if (!data.synapses) return;
      const g = {
        name: 'main',
        synapses: data.synapses,
        sprouts: data.sprouts || [],
        connections: data.connections || [],
        autoConnect: data.autoConnect !== undefined ? data.autoConnect : true,
        gridSnap: data.gridSnap || false,
        viewX: 0, viewY: 0, viewZoom: 1,
        history: [], historyIndex: -1,
        activityLog: [], tagFilter: '', soundMuted: false,
      };
      gardens = { main: g };
      activeGarden = 'main';
      restoreGarden(g);
      if (autoConnect && synapses.length > 0) rebuildConnections();
      return;
    }

    // Fresh start
    gardens = { main: emptyGarden('main') };
    activeGarden = 'main';
    restoreGarden(gardens.main);
  } catch (e) {
    console.warn('Failed to load data:', e);
    gardens = { main: emptyGarden('main') };
    activeGarden = 'main';
    restoreGarden(gardens.main);
  }
}

async function init() {
  load();
  renderGardenList();
  // Try to load from server (MongoDB) — server data wins if available
  try {
    const loaded = await loadFromServer();
    if (loaded) {
      renderGardenList();
      if (autoConnect && synapses.length > 0) rebuildConnections();
      showToast('🌐 Loaded from MongoDB');
    } else {
      // Still alive but no server data — fall back to local; push local up so server has a copy
      checkServerHealth().then(ok => {
        if (!ok) return;
        if (serverConnected || true) {
          // Push local data so that the cloud has a seed copy when available
          const payload = { gardens: gardens, active: activeGarden };
          pushToServer(payload);
        }
      });
    }
  } catch {
    // Server unreachable — keep working offline
  }
}

// --- Drawing ---

function drawBackground() {
  const theme = THEMES[themeIndex];
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
  grad.addColorStop(0, theme.bg0);
  grad.addColorStop(1, theme.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function cycleTheme() {
  themeIndex = (themeIndex + 1) % THEMES.length;
  showToast('Theme: ' + THEMES[themeIndex].name);
  save();
}

function drawGrid() {
  if (!gridSnap) return;
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  // World-space grid
  const startX = Math.floor(-viewX / viewZoom / GRID_SIZE) * GRID_SIZE;
  const startY = Math.floor(-viewY / viewZoom / GRID_SIZE) * GRID_SIZE;
  const endX = startX + W / viewZoom + GRID_SIZE * 2;
  const endY = startY + H / viewZoom + GRID_SIZE * 2;
  for (let x = startX; x < endX; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }
  for (let y = startY; y < endY; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
}

function drawAtmosphere() {
  ctx.fillStyle = 'rgba(255,255,255,0.005)';
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc((i * 137.5 + 50) % W, (i * 97.3 + 30) % H, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHoverRing(s) {
  if (!s || !s.isReady) return;
  ctx.strokeStyle = `hsla(${s.hue}, 70%, 70%, 0.12)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 6]);
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.radius + 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawSelectionRing(s) {
  if (!s || !s.isReady) return;
  const pulse = Math.sin(performance.now() * 0.003) * 0.3 + 0.7;
  ctx.shadowColor = `hsla(${s.hue}, 80%, 70%, ${0.15 * pulse})`;
  ctx.shadowBlur = 25;
  ctx.strokeStyle = `hsla(${s.hue}, 80%, 70%, ${0.2 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.radius + 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
}

function drawBulkSelectionRings() {
  for (const s of selectedSynapses) {
    if (s === selectedSynapse) continue; // already drawn
    if (!s.isReady) continue;
    ctx.strokeStyle = `hsla(${s.hue}, 70%, 70%, 0.2)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawConnectTarget() {
  if (!connectMode || !connectFirst) return;
  const pulse = Math.sin(performance.now() * 0.004) * 0.3 + 0.7;
  ctx.strokeStyle = `hsla(${connectFirst.hue}, 80%, 70%, ${0.3 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(connectFirst.x, connectFirst.y, connectFirst.radius + 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawFocusGlow() {
  if (!focusMode || !focusSynapse || !focusSynapse.isReady) return;
  const s = focusSynapse;
  const pulse = Math.sin(performance.now() * 0.004) * 0.3 + 0.7;
  // Outer glow for the focused synapse
  ctx.shadowColor = `hsla(${s.hue}, 90%, 70%, ${0.3 * pulse})`;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = `hsla(${s.hue}, 90%, 70%, ${0.5 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.radius + 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Light up neighbors
  for (const c of connections) {
    const neighbor = c.a === s ? c.b : (c.b === s ? c.a : null);
    if (!neighbor || !neighbor.isReady) continue;
    ctx.strokeStyle = `hsla(${neighbor.hue}, 80%, 70%, ${0.15 * pulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(neighbor.x, neighbor.y, neighbor.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBoxSelect() {
  if (!boxSelecting) return;
  const x = Math.min(boxStart.x, boxEnd.x);
  const y = Math.min(boxStart.y, boxEnd.y);
  const w = Math.abs(boxEnd.x - boxStart.x);
  const h = Math.abs(boxEnd.y - boxStart.y);
  ctx.fillStyle = 'rgba(124, 140, 255, 0.05)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(124, 140, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}

// --- Main Loop ---

let lastTime = 0;

function update(dt) {
  // tick sprouts
  for (let i = sprouts.length - 1; i >= 0; i--) {
    sprouts[i].tick();
    if (sprouts[i].isDone) {
      const sp = sprouts[i];
      const syn = new Synapse(sp.x, sp.y);
      syn.sproutProgress = 0;
      synapses.push(syn);
      sprouts.splice(i, 1);
      pushHistory();
      updateTagFilterOptions();
    }
  }

  // tick synapses (sprouting progress)
  for (const s of synapses) {
    if (s.sproutProgress < 1) {
      s.sproutProgress = Math.min(1, s.sproutProgress + 0.02);
      if (s.sproutProgress >= 1) {
        rebuildConnections();
        pushHistory();
      }
    }
    s.tick(dt);
  }

  // pulse connections
  for (const c of connections) {
    if (c.pulse > 0) {
      c.pulse += FIRE_PULSE_SPEED;
      if (c.pulse >= 1) c.pulse = 0;
    }
  }

  // tick particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].tick();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }

  // spawn ambient particles
  spawnAmbientParticles();
}

function render() {
  ctx.save();
  ctx.translate(viewX, viewY);
  ctx.scale(viewZoom, viewZoom);

  drawBackground();
  drawGrid();
  drawAtmosphere();

  // draw connections (behind)
  drawConnections();

  // draw particles (behind synapses)
  for (const p of particles) p.draw();

  // draw sprouts
  for (const sp of sprouts) sp.draw();

  // draw synapses (with dimming for focus mode / tag filter)
  for (const s of synapses) {
    ctx.globalAlpha = isDimmed(s) ? 0.12 : 1;
    s.draw();
  }
  ctx.globalAlpha = 1;

  // focus glow
  drawFocusGlow();

  // connect target ring
  drawConnectTarget();

  // bulk selection rings
  drawBulkSelectionRings();

  // selection ring
  if (selectedSynapse) drawSelectionRing(selectedSynapse);

  // hover ring
  if (hoveredId && (!selectedSynapse || hoveredId !== selectedSynapse.id) && !selectedSynapses.some(s => s.id === hoveredId)) {
    const found = synapses.find(s => s.id === hoveredId);
    if (found && found.isReady) drawHoverRing(found);
  }

  // box select rectangle
  drawBoxSelect();

  ctx.restore();

  if (synapses.length === 0 && sprouts.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('click the void to sprout a synapse', W / 2, H / 2);
  }

  // Render minimap
  renderMinimap();
}

function loop(time) {
  const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0.016;
  lastTime = time;
  update(dt);
  render();
  animFrame = requestAnimationFrame(loop);
}

// --- Coordinate transforms ---

function screenToWorld(sx, sy) {
  return {
    x: (sx - viewX) / viewZoom,
    y: (sy - viewY) / viewZoom,
  };
}

// --- Snap to grid ---

function snapToGrid(val) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

function toggleGridSnap() {
  gridSnap = !gridSnap;
  $('btn-grid').classList.toggle('active', gridSnap);
  save();
  showToast(gridSnap ? 'Grid snap ON' : 'Grid snap OFF');
}

// --- Hit Testing ---

function findSynapseAt(px, py) {
  for (let i = synapses.length - 1; i >= 0; i--) {
    if (synapses[i].isReady && synapses[i].hitTest(px, py)) return synapses[i];
  }
  return null;
}

// --- Selection ---

function selectSynapse(syn) {
  selectedSynapse = syn;
  if (syn) openPanel(syn);
  else closePanel();
}

function deselect() {
  closePanel();
  selectedSynapse = null;
}

// --- Bulk selection ---

function toggleBulkSelect(syn) {
  const idx = selectedSynapses.indexOf(syn);
  if (idx >= 0) {
    selectedSynapses.splice(idx, 1);
  } else {
    selectedSynapses.push(syn);
  }
  updateBulkBar();
}

function clearBulkSelection() {
  selectedSynapses = [];
  updateBulkBar();
}

function updateBulkBar() {
  const count = selectedSynapses.length;
  if (count > 0) {
    bulkBar.classList.remove('hidden');
    bulkCount.textContent = count + ' selected';
  } else {
    bulkBar.classList.add('hidden');
  }
}

function bulkFire() {
  for (const s of selectedSynapses) {
    s.message = messageInput.value;
    fireSynapse(s);
  }
  save();
  pushHistory();
  showToast('Fired ' + selectedSynapses.length + ' synapses');
}

function bulkPrune() {
  if (selectedSynapses.length === 0) return;
  const ids = new Set(selectedSynapses.map(s => s.id));
  synapses = synapses.filter(s => !ids.has(s.id));
  if (selectedSynapse && ids.has(selectedSynapse.id)) deselect();
  selectedSynapses = [];
  rebuildConnections();
  save();
  pushHistory();
  updateBulkBar();
  updateTagFilterOptions();
  showToast('Pruned ' + ids.size + ' synapses');
}

function bulkTogglePin() {
  for (const s of selectedSynapses) {
    s.pinned = !s.pinned;
  }
  save();
  pushHistory();
  showToast('Toggled pin for ' + selectedSynapses.length + ' synapses');
}

// --- Tags ---

function updateTagFilterOptions() {
  const tags = new Set();
  for (const s of synapses) {
    if (s.isReady && s.tags) {
      for (const t of s.tags) tags.add(t);
    }
  }
  const current = tagFilterSelect.value;
  tagFilterSelect.innerHTML = '<option value="">all tags</option>';
  for (const t of [...tags].sort()) {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    tagFilterSelect.appendChild(opt);
  }
  if (tagFilter && tags.has(tagFilter)) {
    tagFilterSelect.value = tagFilter;
  } else {
    tagFilter = '';
    tagFilterSelect.value = '';
  }
}

function currentTags() {
  return (selectedSynapse && Array.isArray(selectedSynapse.tags)) ? selectedSynapse.tags : [];
}

function renderTags() {
  if (!synapseTagsEl) return;
  const tags = currentTags();
  synapseTagsEl.innerHTML = '';
  if (tags.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'tag-empty';
    empty.textContent = 'no tags';
    synapseTagsEl.appendChild(empty);
    return;
  }
  for (const t of tags) {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.textContent = t;
    const rm = document.createElement('button');
    rm.className = 'tag-remove';
    rm.textContent = '✕';
    rm.title = 'Remove tag "' + t + '"';
    rm.addEventListener('click', () => {
      removeTagFromSelected(t);
    });
    chip.appendChild(rm);
    chip.addEventListener('click', (e) => {
      if (e.target !== rm) setTagFilter(t);
    });
    synapseTagsEl.appendChild(chip);
  }
}

function addTagToSelected(rawTag) {
  if (!selectedSynapse) return;
  const t = cleanTag(rawTag);
  if (!t) return;
  if (!selectedSynapse.tags.includes(t)) {
    selectedSynapse.tags.push(t);
    renderTags();
    updateTagFilterOptions();
    save();
    pushHistory();
    showToast('Tagged: ' + t);
  }
  tagInput.value = '';
  tagInput.focus();
}

function removeTagFromSelected(tag) {
  if (!selectedSynapse) return;
  selectedSynapse.tags = selectedSynapse.tags.filter(x => x !== tag);
  renderTags();
  updateTagFilterOptions();
  save();
  pushHistory();
}

function cleanTag(raw) {
  const t = raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
  return t.slice(0, 20);
}

function setTagFilter(tag) {
  tagFilter = tag;
  tagFilterSelect.value = tag;
  showToast(tag ? 'Filtering: ' + tag : 'Showing all');
  save();
}

function toggleTagFilter() {
  const show = tagFilterBar.classList.toggle('hidden');
  if (show) {
    updateTagFilterOptions();
    tagFilterSelect.focus();
  } else {
    tagFilter = '';
    tagFilterSelect.value = '';
    showToast('Showing all');
    save();
  }
}

function closeTagFilter() {
  tagFilterBar.classList.add('hidden');
  tagFilter = '';
  tagFilterSelect.value = '';
  save();
}

// --- Panel ---

function renderConnections(syn) {
  const conns = connections.filter(c => c.a === syn || c.b === syn);
  connectionCount.textContent = conns.length;
  connectionList.innerHTML = '';
  if (conns.length === 0) {
    connectionList.innerHTML = '<div class="connection-empty">no connections</div>';
    return;
  }
  for (const c of conns) {
    const other = c.a === syn ? c.b : c.a;
    const item = document.createElement('div');
    item.className = 'connection-item';
    item.innerHTML = `
      <div class="conn-head">
        <div class="conn-target">
          <span class="conn-dot" style="background:hsla(${other.hue},80%,70%,0.6)"></span>
          <span class="conn-id">#${other.id.slice(0, 6)}</span>
          <span>${Math.round(c.dist)}px</span>
          ${c.manual ? '<span style="font-size:9px;opacity:0.5">⚡</span>' : ''}
        </div>
        <button class="conn-delete" data-conn-id="${c.a.id}-${c.b.id}" title="Remove connection">✕</button>
      </div>
      <div class="conn-weight-row">
        <span class="conn-weight-label">strength</span>
        <input type="range" min="0.1" max="3" step="0.1" value="${c.weight || 1}" class="conn-weight" title="Connection strength">
        <span class="conn-weight-val">${(c.weight || 1).toFixed(1)}×</span>
      </div>
    `;
    const delBtn = item.querySelector('.conn-delete');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = connections.indexOf(c);
      if (idx !== -1) {
        connections.splice(idx, 1);
        renderConnections(syn);
        pushHistory();
        save();
        showToast('Connection removed');
      }
    });
    const weightInput = item.querySelector('.conn-weight');
    const weightVal = item.querySelector('.conn-weight-val');
    weightInput.addEventListener('input', () => {
      c.weight = parseFloat(weightInput.value) || 1;
      weightVal.textContent = c.weight.toFixed(1) + '×';
      save();
    });
    weightInput.addEventListener('change', () => {
      pushHistory();
    });
    connectionList.appendChild(item);
  }
}

function openPanel(syn) {
  messageInput.value = syn.message;
  const pct = Math.round(syn.targetVolume * 100);
  slider.value = pct;
  sliderVal.textContent = pct + '%';
  synapseId.textContent = '#' + syn.id.slice(0, 6);

  // Hue
  hueSlider.value = syn.hue;
  hueValue.textContent = Math.round(syn.hue) + '°';

  const d = new Date(syn.created);
  synapseAge.textContent = 'born ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  synapseFired.textContent = 'fired ' + syn.firedCount + ' time' + (syn.firedCount !== 1 ? 's' : '');
  synapseLastFire.textContent = timeAgo(syn.lastFiredAt);

  // Tags
  renderTags();

  // Auto-fire
  autoFireToggle.checked = syn.autoFire || false;
  autoFireInterval.value = syn.autoFireInterval || 5;
  autoFireRateGroup.classList.toggle('hidden', !syn.autoFire);

  // Pin button text
  $('btn-pin-synapse').textContent = syn.pinned ? '📌 unpin' : '📌 pin';

  // Connections
  renderConnections(syn);

  panel.classList.remove('hidden');
}

function closePanel() {
  if (selectedSynapse) {
    selectedSynapse.message = messageInput.value;
    selectedSynapse.autoFire = autoFireToggle.checked;
    selectedSynapse.autoFireInterval = parseInt(autoFireInterval.value) || 5;
    save();
  }
  panel.classList.add('hidden');
}

function timeAgo(ts) {
  if (!ts) return 'never fired';
  const diff = Date.now() - ts;
  if (diff < 60000) return 'fired ' + Math.max(0, Math.floor(diff / 1000)) + 's ago';
  if (diff < 3600000) return 'fired ' + Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return 'fired ' + Math.floor(diff / 3600000) + 'h ago';
  return 'fired ' + new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Actions ---

function addSprout(x, y) {
  const sx = gridSnap ? snapToGrid(x) : x;
  const sy = gridSnap ? snapToGrid(y) : y;
  const sp = new Sprout(sx, sy);
  sprouts.push(sp);
  pushHistory();
  save();
}

function onSlider() {
  if (!selectedSynapse) return;
  const val = parseInt(slider.value);
  sliderVal.textContent = val + '%';
  selectedSynapse.setVolume(val / 100);
  for (const c of connections) {
    if (c.a === selectedSynapse || c.b === selectedSynapse) {
      c.pulse = 0.01;
    }
  }
  save();
}

function onHueSlider() {
  if (!selectedSynapse) return;
  const val = parseInt(hueSlider.value);
  hueValue.textContent = val + '°';
  selectedSynapse.hue = val;
  save();
}

function onFire() {
  if (!selectedSynapse) return;
  selectedSynapse.message = messageInput.value;
  fireSynapse(selectedSynapse);
  save();
  pushHistory();

  const pct = Math.round(selectedSynapse.targetVolume * 100);
  slider.value = pct;
  sliderVal.textContent = pct + '%';
  synapseFired.textContent = 'fired ' + selectedSynapse.firedCount + ' time' + (selectedSynapse.firedCount !== 1 ? 's' : '');
  synapseLastFire.textContent = timeAgo(selectedSynapse.lastFiredAt);
}

function onPrune() {
  if (!selectedSynapse) return;
  synapses = synapses.filter(s => s.id !== selectedSynapse.id);
  selectedSynapses = selectedSynapses.filter(s => s.id !== selectedSynapse.id);
  updateBulkBar();
  rebuildConnections();
  save();
  pushHistory();
  updateTagFilterOptions();
  deselect();
}

function cloneSynapse() {
  if (!selectedSynapse) return;
  const s = selectedSynapse;
  const clone = new Synapse(s.x + 30, s.y + 30);
  clone.message = s.message;
  clone.hue = s.hue;
  clone.targetVolume = s.targetVolume;
  clone.volume = s.volume;
  clone.autoFire = s.autoFire;
  clone.autoFireInterval = s.autoFireInterval;
  clone.sproutProgress = s.sproutProgress;
  clone.tags = [...s.tags];
  synapses.push(clone);
  rebuildConnections();
  save();
  pushHistory();
  updateTagFilterOptions();
  selectSynapse(clone);
  showToast('Synapse cloned');
}

function togglePin() {
  if (!selectedSynapse) return;
  selectedSynapse.pinned = !selectedSynapse.pinned;
  $('btn-pin-synapse').textContent = selectedSynapse.pinned ? '📌 unpin' : '📌 pin';
  save();
  pushHistory();
  showToast(selectedSynapse.pinned ? 'Synapse pinned' : 'Synapse unpinned');
}

function onExport() {
  if (synapses.length === 0) {
    exportText.textContent = '(no synapses)';
  } else {
    const data = {
      name: activeGarden,
      synapses: synapses.map(s => serializeSynapse(s)),
      connections: connections.map(c => ({ aId: c.a.id, bId: c.b.id, manual: c.manual || false, weight: c.weight || 1 })),
    };
    exportText.textContent = JSON.stringify(data, null, 2);
  }
  exportPanel.classList.remove('hidden');
}

function closeExport() {
  exportPanel.classList.add('hidden');
}

function copyExport() {
  const text = exportText.textContent;
  if (!text || text === '(no synapses)') return;
  navigator.clipboard.writeText(text).catch(() => {});
  showToast('Copied to clipboard');
}

function onImport() {
  importText.value = '';
  importPreview.textContent = '';
  importPanel.classList.remove('hidden');
  importText.focus();
}

function closeImport() {
  importPanel.classList.add('hidden');
}

function doImport() {
  const raw = importText.value.trim();
  if (!raw) {
    showToast('Nothing to import');
    return;
  }
  try {
    const data = JSON.parse(raw);
    if (!data.synapses || !Array.isArray(data.synapses) || data.synapses.length === 0) {
      showToast('Invalid data: no synapses found');
      return;
    }
    // Import synapses
    for (const d of data.synapses) {
      const s = restoreSynapseFromData(d);
      // Offset slightly to avoid overlap
      s.x += Math.random() * 20 - 10;
      s.y += Math.random() * 20 - 10;
      synapses.push(s);
    }
    // Import connections (preserve manual flag + weight)
    if (data.connections) {
      for (const c of data.connections) {
        const a = synapses.find(s => s.id === c.aId);
        const b = synapses.find(s => s.id === c.bId);
        if (a && b) {
          const exists = connections.some(ex =>
            (ex.a === a && ex.b === b) || (ex.a === b && ex.b === a)
          );
          if (!exists) {
            connections.push({ a, b, dist: Math.hypot(a.x - b.x, a.y - b.y), pulse: 0, manual: c.manual || false, weight: c.weight || 1 });
          }
        }
      }
    }
    save();
    pushHistory();
    updateTagFilterOptions();
    closeImport();
    showToast('Imported ' + data.synapses.length + ' synapses');
  } catch (e) {
    showToast('Invalid JSON format');
  }
}

function clearAll() {
  if (synapses.length === 0 && sprouts.length === 0) return;
  if (!confirm('Clear all synapses?')) return;
  synapses = [];
  sprouts = [];
  connections = [];
  particles = [];
  selectedSynapse = null;
  selectedSynapses = [];
  updateBulkBar();
  closePanel();
  activityLog = [];
  save();
  pushHistory();
  updateTagFilterOptions();
}

function toggleAutoConnect() {
  autoConnect = !autoConnect;
  $('btn-auto-connect').classList.toggle('active', autoConnect);
  if (autoConnect) {
    rebuildConnections();
    showToast('Auto-connect ON');
  } else {
    // Keep manual connections when turning off auto-connect
    connections = connections.filter(c => c.manual);
    if (connections.length === 0) {
      connections = [];
    }
    showToast('Auto-connect OFF — use ⚡ to link manually');
  }
  save();
}

function toggleConnectMode() {
  connectMode = !connectMode;
  connectFirst = null;
  $('btn-connect-mode').classList.toggle('active', connectMode);
  connectIndicator.classList.toggle('hidden', !connectMode);
  if (connectMode) {
    connectIndicator.textContent = 'Click a synapse to start linking...';
    canvas.style.cursor = 'crosshair';
  } else {
    canvas.style.cursor = 'default';
  }
}

function resetView() {
  viewX = 0;
  viewY = 0;
  viewZoom = 1;
  updateZoomIndicator();
}

function updateZoomIndicator() {
  const pct = Math.round(viewZoom * 100);
  zoomIndicator.textContent = pct + '%';
  zoomIndicator.classList.remove('hidden');
  clearTimeout(zoomIndicator._hideTimer);
  zoomIndicator._hideTimer = setTimeout(() => {
    zoomIndicator.classList.add('hidden');
  }, 1500);
}

// --- Scope to All ---

function scopeToAll() {
  const all = synapses.filter(s => s.isReady);
  if (all.length === 0) {
    resetView();
    return;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of all) {
    const r = s.radius;
    if (s.x - r < minX) minX = s.x - r;
    if (s.y - r < minY) minY = s.y - r;
    if (s.x + r > maxX) maxX = s.x + r;
    if (s.y + r > maxY) maxY = s.y + r;
  }
  // Add padding
  const pad = 60;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;

  const worldW = maxX - minX;
  const worldH = maxY - minY;
  if (worldW <= 0 || worldH <= 0) return;

  const zoomX = W / worldW;
  const zoomY = H / worldH;
  const newZoom = Math.min(zoomX, zoomY, 2);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  viewX = W / 2 - centerX * newZoom;
  viewY = H / 2 - centerY * newZoom;
  viewZoom = newZoom;
  updateZoomIndicator();
}

// --- Auto Layout ---

function autoLayout() {
  const toArrange = synapses.filter(s => s.isReady && !s.pinned);
  if (toArrange.length === 0) return;

  // Simple force-directed layout
  const reps = 60;
  const repulsion = 8000;
  const attraction = 0.01;
  const damping = 0.85;
  const maxDist = 300;

  // Center around current view center
  const cx = (W / 2 - viewX) / viewZoom;
  const cy = (H / 2 - viewY) / viewZoom;

  // Initialize positions in a rough circle if no existing positions
  let hasLayout = false;
  for (const s of toArrange) {
    if (s.x !== 0 || s.y !== 0) { hasLayout = true; break; }
  }
  if (!hasLayout) {
    const angleStep = (Math.PI * 2) / toArrange.length;
    const radius = Math.min(200, toArrange.length * 15);
    toArrange.forEach((s, i) => {
      s.x = cx + Math.cos(angleStep * i) * radius;
      s.y = cy + Math.sin(angleStep * i) * radius;
    });
  }

  // Force simulation
  for (let iter = 0; iter < reps; iter++) {
    const forces = toArrange.map(() => ({ fx: 0, fy: 0 }));

    // Repulsion between all pairs
    for (let i = 0; i < toArrange.length; i++) {
      for (let j = i + 1; j < toArrange.length; j++) {
        const a = toArrange[i];
        const b = toArrange[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        if (dist > maxDist) continue;
        const force = repulsion / (dist * dist);
        const nx = dx / dist;
        const ny = dy / dist;
        forces[i].fx += nx * force;
        forces[i].fy += ny * force;
        forces[j].fx -= nx * force;
        forces[j].fy -= ny * force;
      }
    }

    // Attraction to connections
    for (const c of connections) {
      const idxA = toArrange.indexOf(c.a);
      const idxB = toArrange.indexOf(c.b);
      if (idxA >= 0 && idxB >= 0) {
        const dx = c.b.x - c.a.x;
        const dy = c.b.y - c.a.y;
        const dist = Math.max(1, c.dist);
        const force = dist * attraction * (c.weight || 1);
        const nx = dx / dist;
        const ny = dy / dist;
        forces[idxA].fx += nx * force;
        forces[idxA].fy += ny * force;
        forces[idxB].fx -= nx * force;
        forces[idxB].fy -= ny * force;
      }
    }

    // Attraction to center (gravity)
    for (let i = 0; i < toArrange.length; i++) {
      const s = toArrange[i];
      forces[i].fx += (cx - s.x) * 0.002;
      forces[i].fy += (cy - s.y) * 0.002;
    }

    // Apply forces with damping
    let maxForce = 0;
    for (let i = 0; i < toArrange.length; i++) {
      const s = toArrange[i];
      const f = Math.hypot(forces[i].fx, forces[i].fy);
      if (f > maxForce) maxForce = f;
      s.x += forces[i].fx * damping;
      s.y += forces[i].fy * damping;
    }

    if (maxForce < 0.5) break;
  }

  // Recalculate connection distances
  for (const c of connections) {
    c.dist = Math.hypot(c.a.x - c.b.x, c.a.y - c.b.y);
  }

  // If auto-connect is off, keep existing connections, just update distances
  if (autoConnect) {
    rebuildConnections();
  }

  save();
  pushHistory();
  showToast('Layout complete');
}

// --- Search ---

function toggleSearch() {
  searchBar.classList.toggle('hidden');
  if (!searchBar.classList.contains('hidden')) {
    searchInput.focus();
    searchInput.select();
  } else {
    searchTerm = '';
    searchCount.textContent = '';
  }
}

function onSearchInput() {
  searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    searchCount.textContent = '';
    return;
  }
  const matches = synapses.filter(s =>
    s.isReady && s.message && s.message.toLowerCase().includes(searchTerm.toLowerCase())
  );
  searchCount.textContent = matches.length + ' found';
}

function closeSearch() {
  searchBar.classList.add('hidden');
  searchTerm = '';
  searchCount.textContent = '';
  searchInput.value = '';
}

// --- Minimap ---

function renderMinimap() {
  if (!minimapEl || minimapEl.classList.contains('hidden')) return;
  const mc = minimapCanvas;
  const mctx = mc.getContext('2d');
  const mw = 160, mh = 120;

  mctx.clearRect(0, 0, mw, mh);

  // Find bounds
  const all = synapses.filter(s => s.isReady);
  if (all.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of all) {
    if (s.x < minX) minX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.x > maxX) maxX = s.x;
    if (s.y > maxY) maxY = s.y;
  }
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const pad = 10;
  const scaleX = (mw - pad * 2) / rangeX;
  const scaleY = (mh - pad * 2) / rangeY;
  const scale = Math.min(scaleX, scaleY);

  // Background
  mctx.fillStyle = 'rgba(10,10,18,0.6)';
  mctx.fillRect(0, 0, mw, mh);

  // Draw connections
  mctx.strokeStyle = 'rgba(255,255,255,0.1)';
  mctx.lineWidth = 0.5;
  for (const c of connections) {
    if (!c.a.isReady || !c.b.isReady) continue;
    const ax = pad + (c.a.x - minX) * scale;
    const ay = pad + (c.a.y - minY) * scale;
    const bx = pad + (c.b.x - minX) * scale;
    const by = pad + (c.b.y - minY) * scale;
    mctx.beginPath();
    mctx.moveTo(ax, ay);
    mctx.lineTo(bx, by);
    mctx.stroke();
  }

  // Draw synapses
  for (const s of all) {
    const x = pad + (s.x - minX) * scale;
    const y = pad + (s.y - minY) * scale;
    const r = Math.max(2, s.radius * scale * 0.3);
    mctx.beginPath();
    mctx.arc(x, y, r, 0, Math.PI * 2);
    mctx.fillStyle = `hsla(${s.hue}, 80%, 70%, 0.6)`;
    mctx.fill();
  }

  // Viewport rectangle
  const vx0 = pad + ((-viewX / viewZoom) - minX) * scale;
  const vy0 = pad + ((-viewY / viewZoom) - minY) * scale;
  const vw = (W / viewZoom) * scale;
  const vh = (H / viewZoom) * scale;
  mctx.strokeStyle = 'rgba(124, 140, 255, 0.5)';
  mctx.lineWidth = 1;
  mctx.strokeRect(vx0, vy0, vw, vh);
}

function toggleMinimap() {
  minimapEl.classList.toggle('hidden');
  if (!minimapEl.classList.contains('hidden')) {
    // Resize canvas
    minimapCanvas.width = 160;
    minimapCanvas.height = 120;
  }
}

// Minimap click to navigate
if (minimapEl) {
  minimapEl.addEventListener('click', (e) => {
    const rect = minimapEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const mc = minimapCanvas;
    const mw = 160, mh = 120;
    const all = synapses.filter(s => s.isReady);
    if (all.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of all) {
      if (s.x < minX) minX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.x > maxX) maxX = s.x;
      if (s.y > maxY) maxY = s.y;
    }
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const pad = 10;
    const scaleX = (mw - pad * 2) / rangeX;
    const scaleY = (mh - pad * 2) / rangeY;
    const scale = Math.min(scaleX, scaleY);

    const wx = minX + (mx - pad) / scale;
    const wy = minY + (my - pad) / scale;

    viewX = W / 2 - wx * viewZoom;
    viewY = H / 2 - wy * viewZoom;
    updateZoomIndicator();
  });
}

// --- Inline Editor (double-click to type on node) ---

function commitInlineEdit() {
  if (!editingSynapse) return;
  const val = inlineEditor.value.trim();
  editingSynapse.message = val;
  save();
  pushHistory();
  editingSynapse = null;
  inlineEditor.style.display = 'none';
  inlineEditor.value = '';
  // If panel is open for this synapse, sync the textarea
  if (selectedSynapse) {
    messageInput.value = selectedSynapse.message;
  }
}

function cancelInlineEdit() {
  if (!editingSynapse) return;
  editingSynapse = null;
  inlineEditor.style.display = 'none';
  inlineEditor.value = '';
}

function showInlineEditor(syn, sx, sy) {
  // Close any existing inline edit first
  if (editingSynapse) commitInlineEdit();

  // Close panel if open
  if (selectedSynapse) deselect();

  editingSynapse = syn;
  inlineEditor.value = syn.message || '';
  inlineEditor.style.display = 'block';

  // Position the editor above the synapse's screen position
  const r = syn.radius * syn.sproutProgress * viewZoom;
  const editorX = sx - 60;
  const editorY = sy - r - 40;

  inlineEditor.style.left = editorX + 'px';
  inlineEditor.style.top = editorY + 'px';

  // Focus and select all text
  inlineEditor.focus();
  inlineEditor.select();
}

// Inline editor events
inlineEditor.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') {
    e.preventDefault();
    commitInlineEdit();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelInlineEdit();
  }
});

inlineEditor.addEventListener('blur', () => {
  // Small delay to allow click on canvas to register before committing
  setTimeout(() => {
    if (editingSynapse) commitInlineEdit();
  }, 150);
});

// --- Gardens ---

function renderGardenList() {
  if (!gardenListEl) return;
  gardenListEl.innerHTML = '';
  const keys = Object.keys(gardens);
  for (const key of keys) {
    const g = gardens[key];
    const count = (g.synapses || []).length;
    const item = document.createElement('div');
    item.className = 'garden-item' + (key === activeGarden ? ' active' : '');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'garden-name';
    nameSpan.textContent = key;
    const countSpan = document.createElement('span');
    countSpan.className = 'garden-count';
    countSpan.textContent = count;
    item.appendChild(nameSpan);
    item.appendChild(countSpan);
    item.addEventListener('click', () => {
      if (key !== activeGarden) {
        activateGarden(key);
      }
    });
    gardenListEl.appendChild(item);
  }
}

function openGardenPanel() {
  renderGardenList();
  $('garden-panel').classList.remove('hidden');
}

function closeGardenPanel() {
  $('garden-panel').classList.add('hidden');
}

function toggleGardenPanel() {
  if ($('garden-panel').classList.contains('hidden')) openGardenPanel();
  else closeGardenPanel();
}

function activateGarden(name) {
  // Save current garden state
  gardens[activeGarden] = captureGardenState();
  activeGarden = name;
  restoreGarden(gardens[name]);
  save();
  renderGardenList();
  closeGardenPanel();
  updateTagFilterOptions();
  showToast('Garden: ' + name);
}

function newGarden() {
  const base = 'garden-' + (Object.keys(gardens).length + 1);
  const name = prompt('Garden name:', base);
  if (!name || !name.trim()) return;
  const key = cleanGardenName(name);
  if (!key) return;
  if (gardens[key]) {
    showToast('A garden named "' + key + '" already exists');
    return;
  }
  gardens[activeGarden] = captureGardenState();
  gardens[key] = emptyGarden(key);
  activeGarden = key;
  restoreGarden(gardens[key]);
  save();
  renderGardenList();
  closeGardenPanel();
  showToast('Created garden: ' + key);
}

function renameGarden() {
  const name = prompt('New name for "' + activeGarden + '":', activeGarden);
  if (!name || !name.trim()) return;
  const key = cleanGardenName(name);
  if (!key) return;
  if (key === activeGarden) {
    renderGardenList();
    return;
  }
  if (gardens[key]) {
    showToast('A garden named "' + key + '" already exists');
    return;
  }
  gardens[activeGarden] = captureGardenState();
  gardens[key] = gardens[activeGarden];
  gardens[key].name = key;
  delete gardens[activeGarden];
  activeGarden = key;
  save();
  renderGardenList();
  showToast('Renamed to: ' + key);
}

function deleteGarden() {
  const keys = Object.keys(gardens);
  if (keys.length <= 1) {
    showToast('Cannot delete the only garden');
    return;
  }
  if (!confirm('Delete garden "' + activeGarden + '"? This cannot be undone.')) return;
  delete gardens[activeGarden];
  activeGarden = keys.find(k => k !== activeGarden) || 'main';
  restoreGarden(gardens[activeGarden]);
  save();
  renderGardenList();
  closeGardenPanel();
  showToast('Deleted — now in: ' + activeGarden);
}

function cleanGardenName(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').slice(0, 24);
}

// --- Help ---

function toggleHelp() {
  helpPanel.classList.toggle('hidden');
}

function closeHelp() {
  helpPanel.classList.add('hidden');
}

// --- Comprehend ---

function openComprehend() {
  const content = $('comprehend-content');
  content.innerHTML = '';

  const ready = synapses.filter(s => s.isReady);
  const total = ready.length;
  const totalVolume = ready.reduce((sum, s) => sum + s.volume, 0);
  const avgVolume = total > 0 ? totalVolume / total : 0;
  const totalFired = ready.reduce((sum, s) => sum + s.firedCount, 0);
  const pinnedCount = ready.filter(s => s.pinned).length;
  const taggedCount = ready.filter(s => s.tags && s.tags.length > 0).length;

  // Stats
  const statsHTML = `
    <div class="comprehend-stat">
      <span class="stat-label">Synapses</span>
      <span class="stat-value">${total}</span>
    </div>
    <div class="comprehend-stat">
      <span class="stat-label">Connections</span>
      <span class="stat-value">${connections.length}</span>
    </div>
    <div class="comprehend-stat">
      <span class="stat-label">Avg Charge</span>
      <span class="stat-value ${avgVolume > 0.7 ? 'high-energy' : avgVolume > 0.4 ? 'medium-energy' : ''}">${Math.round(avgVolume * 100)}%</span>
    </div>
    <div class="comprehend-stat">
      <span class="stat-label">Total Fired</span>
      <span class="stat-value">${totalFired}</span>
    </div>
    <div class="comprehend-stat">
      <span class="stat-label">Pinned</span>
      <span class="stat-value">${pinnedCount}</span>
    </div>
    <div class="comprehend-stat">
      <span class="stat-label">Tagged</span>
      <span class="stat-value">${taggedCount}</span>
    </div>
  `;
  const statsDiv = document.createElement('div');
  statsDiv.innerHTML = statsHTML;
  content.appendChild(statsDiv);

  // Activity chart
  const actTitle = document.createElement('div');
  actTitle.className = 'comprehend-section-title';
  actTitle.textContent = 'Activity (last ' + ((ACTIVITY_BUCKETS * ACTIVITY_BUCKET_MS) / 60000).toFixed(1) + ' min)';
  content.appendChild(actTitle);
  content.appendChild(buildActivityChart());

  // Leaderboards
  const firedTitle = document.createElement('div');
  firedTitle.className = 'comprehend-section-title';
  firedTitle.textContent = 'Most Fired';
  content.appendChild(firedTitle);
  content.appendChild(buildLeaderboard(
    [...ready].sort((a, b) => b.firedCount - a.firedCount).slice(0, 5)
      .map((s, i) => ({ s, value: s.firedCount, rank: i + 1 }))
  ));

  const connTitle = document.createElement('div');
  connTitle.className = 'comprehend-section-title';
  connTitle.textContent = 'Most Connected';
  content.appendChild(connTitle);
  const connCounts = ready.map(s => ({
    s,
    count: connections.filter(c => c.a === s || c.b === s).length,
  }));
  content.appendChild(buildLeaderboard(
    connCounts.sort((a, b) => b.count - a.count).slice(0, 5)
      .map((x, i) => ({ s: x.s, value: x.count, rank: i + 1 }))
  ));

  if (total > 0) {
    const title = document.createElement('div');
    title.className = 'comprehend-section-title';
    title.textContent = 'All Synapses';
    content.appendChild(title);

    // Sort by volume (highest first)
    const sorted = [...ready].sort((a, b) => b.volume - a.volume);
    for (const s of sorted) {
      const item = document.createElement('div');
      item.className = 'comprehend-synapse-item';
      item.innerHTML = `
        <span class="cs-dot" style="background:hsla(${s.hue},80%,70%,0.6)"></span>
        <span class="cs-id">#${s.id.slice(0, 6)}</span>
        <span class="cs-message">${s.message || '(silent)'}${s.tags && s.tags.length > 0 ? ' [' + s.tags.join(', ') + ']' : ''}</span>
        <span class="cs-charge">${Math.round(s.volume * 100)}%</span>
        <span class="cs-fired">${s.firedCount > 0 ? 'x' + s.firedCount : ''}</span>
        ${s.pinned ? '<span style="font-size:9px;opacity:0.4">📌</span>' : ''}
      `;
      item.addEventListener('click', () => {
        selectSynapse(s);
        closeComprehend();
      });
      content.appendChild(item);
    }
  } else {
    const empty = document.createElement('div');
    empty.className = 'comprehend-empty';
    empty.textContent = 'the garden is empty — sprout something';
    content.appendChild(empty);
  }

  $('comprehend-panel').classList.remove('hidden');
}

function closeComprehend() {
  $('comprehend-panel').classList.add('hidden');
}

function buildActivityChart() {
  const wrap = document.createElement('div');
  wrap.className = 'activity-chart';
  const now = Date.now();
  const buckets = new Array(ACTIVITY_BUCKETS).fill(0);
  for (const ts of activityLog) {
    const age = now - ts;
    if (age < 0) continue;
    const idx = ACTIVITY_BUCKETS - 1 - Math.floor(age / ACTIVITY_BUCKET_MS);
    if (idx >= 0 && idx < ACTIVITY_BUCKETS) buckets[idx]++;
  }
  const max = Math.max(1, ...buckets);
  for (let i = 0; i < buckets.length; i++) {
    const bar = document.createElement('div');
    bar.className = 'activity-bar' + (buckets[i] > 0 ? ' fired' : '');
    bar.style.height = Math.max(4, (buckets[i] / max) * 100) + '%';
    bar.title = buckets[i] + ' fire' + (buckets[i] !== 1 ? 's' : '');
    wrap.appendChild(bar);
  }
  return wrap;
}

function buildLeaderboard(items) {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.gap = '4px';
  if (!items || items.length === 0 || items.every(x => x.value === 0)) {
    const empty = document.createElement('div');
    empty.className = 'leaderboard-item';
    empty.innerHTML = '<span class="lb-name" style="opacity:0.4">no data yet</span>';
    wrap.appendChild(empty);
    return wrap;
  }
  for (const { s, value, rank } of items) {
    if (value === 0) continue;
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    item.innerHTML = `
      <span class="lb-rank">${rank}</span>
      <span class="lb-name" style="background:hsla(${s.hue},80%,70%,0.15);border-radius:4px;padding:2px 6px">#${s.id.slice(0, 6)} ${s.message ? '— ' + s.message.slice(0, 24) : ''}</span>
      <span class="lb-val">${value}</span>
    `;
    item.addEventListener('click', () => {
      selectSynapse(s);
      closeComprehend();
    });
    wrap.appendChild(item);
  }
  return wrap;
}

// --- Canvas Events ---

canvas.addEventListener('dblclick', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  const syn = findSynapseAt(world.x, world.y);
  if (syn && syn.isReady) {
    showInlineEditor(syn, e.clientX, e.clientY);
  }
});

canvas.addEventListener('mousedown', (e) => {
  // If inline editor is open, clicking anywhere on canvas commits it
  if (editingSynapse) {
    commitInlineEdit();
  }

  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);

  // Middle mouse button or right mouse button for panning
  if (e.button === 1 || e.button === 2) {
    e.preventDefault();
    isPanning = true;
    panStartX = sx;
    panStartY = sy;
    panStartViewX = viewX;
    panStartViewY = viewY;
    canvas.style.cursor = 'grabbing';
    return;
  }

  // Left click
  if (e.button === 0) {
    const syn = findSynapseAt(world.x, world.y);

    // Shift+drag on void starts box select
    if (!syn && e.shiftKey && !connectMode && !focusMode) {
      boxSelecting = true;
      boxStart = { x: world.x, y: world.y };
      boxEnd = { x: world.x, y: world.y };
      return;
    }

    if (connectMode) {
      if (syn) {
        if (!connectFirst) {
          connectFirst = syn;
          connectIndicator.textContent = 'Now click another synapse to link...';
        } else if (syn.id !== connectFirst.id) {
          if (addManualConnection(connectFirst, syn)) {
            showToast('Connection created!');
          } else {
            // Check why it failed — distance or already manually connected
            const dist = Math.hypot(connectFirst.x - syn.x, connectFirst.y - syn.y);
            const alreadyManual = connections.some(c =>
              c.manual && ((c.a === connectFirst && c.b === syn) || (c.a === syn && c.b === connectFirst))
            );
            if (dist > CONNECTION_RANGE * 2) {
              showToast('Synapses are too far apart');
            } else if (alreadyManual) {
              showToast('Already manually connected');
            } else {
              showToast('Already connected (auto)');
            }
          }
          connectFirst = null;
          connectIndicator.textContent = 'Click a synapse to start linking...';
        } else {
          showToast('Click a different synapse to connect');
        }
      }
      return;
    }

    if (focusMode) {
      if (syn) {
        focusOn(syn);
      } else {
        focusSynapse = null;
        focusIndicator.textContent = 'Focus mode — click a synapse';
      }
      return;
    }

    if (mergeMode) {
      if (syn) {
        if (!mergeFirst) {
          mergeFirst = syn;
          mergeIndicator.textContent = 'Now click the synapse to merge into #' + syn.id.slice(0, 6);
        } else if (syn.id !== mergeFirst.id) {
          mergeSynapses(mergeFirst, syn);
          exitMergeMode();
        } else {
          showToast('Click a different synapse to merge');
        }
      }
      return;
    }

    if (syn) {
      // Ctrl/Cmd+click for bulk selection
      if (e.ctrlKey || e.metaKey) {
        toggleBulkSelect(syn);
        return;
      }

      // Start potential drag (only activates if mouse moves > threshold)
      isDragging = true;
      dragMoved = false;
      dragSynapse = syn;
      dragOffsetX = world.x - syn.x;
      dragOffsetY = world.y - syn.y;
      dragStartX = sx;
      dragStartY = sy;
      canvas.style.cursor = 'grabbing';
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);

  if (boxSelecting) {
    boxEnd = { x: world.x, y: world.y };
    return;
  }

  if (isPanning) {
    viewX = panStartViewX + (sx - panStartX) / viewZoom;
    viewY = panStartViewY + (sy - panStartY) / viewZoom;
    return;
  }

  if (isDragging && dragSynapse) {
    // Only activate drag if mouse has moved past threshold
    const dx = sx - dragStartX;
    const dy = sy - dragStartY;
    if (!dragMoved && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
      // Still within threshold, just show hover
      const syn = findSynapseAt(world.x, world.y);
      hoveredId = syn ? syn.id : null;
      return;
    }
    dragMoved = true;
    dragSynapse.x = world.x - dragOffsetX;
    dragSynapse.y = world.y - dragOffsetY;
    // Update connection distances
    for (const c of connections) {
      if (c.a === dragSynapse || c.b === dragSynapse) {
        c.dist = Math.hypot(c.a.x - c.b.x, c.a.y - c.b.y);
      }
    }
    return;
  }

  const syn = findSynapseAt(world.x, world.y);
  hoveredId = syn ? syn.id : null;
  canvas.style.cursor = syn ? 'pointer' : (connectMode ? 'crosshair' : (focusMode ? 'crosshair' : 'default'));
});

canvas.addEventListener('mouseup', (e) => {
  if (boxSelecting) {
    // Finalize box select
    const x1 = Math.min(boxStart.x, boxEnd.x);
    const x2 = Math.max(boxStart.x, boxEnd.x);
    const y1 = Math.min(boxStart.y, boxEnd.y);
    const y2 = Math.max(boxStart.y, boxEnd.y);
    let added = 0;
    for (const s of synapses) {
      if (!s.isReady) continue;
      if (s.x >= x1 && s.x <= x2 && s.y >= y1 && s.y <= y2) {
        if (!selectedSynapses.includes(s)) {
          selectedSynapses.push(s);
          added++;
        }
      }
    }
    boxSelecting = false;
    boxJustDone = true;
    if (added > 0) {
      updateBulkBar();
      showToast('Selected ' + added + ' synapse(s)');
    }
    return;
  }

  if (e.button === 1 || e.button === 2) {
    isPanning = false;
    canvas.style.cursor = 'default';
    return;
  }

  if (isDragging && dragSynapse) {
    isDragging = false;
    canvas.style.cursor = 'default';
    if (dragMoved) {
      // Snap to grid if enabled
      if (gridSnap) {
        dragSynapse.x = snapToGrid(dragSynapse.x);
        dragSynapse.y = snapToGrid(dragSynapse.y);
        for (const c of connections) {
          if (c.a === dragSynapse || c.b === dragSynapse) {
            c.dist = Math.hypot(c.a.x - c.b.x, c.a.y - c.b.y);
          }
        }
      }
      pushHistory();
      save();
    } else {
      // Click (no drag) — select the synapse
      const syn = dragSynapse;
      dragSynapse = null;
      if (selectedSynapse && selectedSynapse.id === syn.id) {
        deselect();
      } else {
        selectSynapse(syn);
      }
    }
    dragSynapse = null;
    return;
  }
});

canvas.addEventListener('click', (e) => {
  if (isPanning) return;

  // Consume box-select completion so we don't also sprout
  if (boxJustDone) {
    boxJustDone = false;
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  const syn = findSynapseAt(world.x, world.y);

  if (connectMode) {
    // In connect mode, clicking void cancels the first selection
    if (!syn && connectFirst) {
      connectFirst = null;
      connectIndicator.textContent = 'Click a synapse to start linking...';
      showToast('Selection cancelled');
    }
    return;
  }

  if (focusMode) {
    return; // handled in mousedown
  }

  // Only handle void clicks here (synapse clicks handled in mouseup)
  if (!syn) {
    // Clear bulk selection on void click (without Ctrl)
    if (selectedSynapses.length > 0 && !e.shiftKey) {
      clearBulkSelection();
    }
    if (!e.shiftKey) {
      addSprout(world.x, world.y);
    }
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  const syn = findSynapseAt(world.x, world.y);
  if (syn && syn.isReady) {
    showContextMenu(syn, e.clientX, e.clientY);
  } else {
    hideContextMenu();
  }
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  const delta = -e.deltaY * 0.001;
  const newZoom = Math.max(0.1, Math.min(5, viewZoom * (1 + delta)));

  // Zoom towards mouse position
  const world = screenToWorld(sx, sy);
  viewX = sx - world.x * newZoom;
  viewY = sy - world.y * newZoom;
  viewZoom = newZoom;

  updateZoomIndicator();
}, { passive: false });

canvas.addEventListener('mouseleave', () => {
  hoveredId = null;
  if (isDragging) {
    isDragging = false;
    dragSynapse = null;
    canvas.style.cursor = 'default';
  }
  if (isPanning) {
    isPanning = false;
    canvas.style.cursor = 'default';
  }
  if (boxSelecting) {
    boxSelecting = false;
  }
});

// Touch
let touchStartX, touchStartY;
let isTouchPanning = false;
let lastTouchDist = 0;
let touchMoved = false;
let touchTapSyn = null;
const TOUCH_PAN_THRESHOLD = 8; // pixels before touch becomes a pan

canvas.addEventListener('touchstart', (e) => {
  const rect = canvas.getBoundingClientRect();

  if (e.touches.length === 2) {
    // Pinch to zoom
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDist = Math.hypot(dx, dy);
    isTouchPanning = false;
    return;
  }

  const t = e.touches[0];
  const sx = t.clientX - rect.left;
  const sy = t.clientY - rect.top;
  const world = screenToWorld(sx, sy);

  touchStartX = sx;
  touchStartY = sy;
  touchMoved = false;
  isTouchPanning = true; // Start in potential pan mode
  touchTapSyn = findSynapseAt(world.x, world.y);
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    if (lastTouchDist > 0) {
      const scale = dist / lastTouchDist;
      const newZoom = Math.max(0.1, Math.min(5, viewZoom * scale));
      viewZoom = newZoom;
      updateZoomIndicator();
    }
    lastTouchDist = dist;
    return;
  }

  if (e.touches.length === 1 && isTouchPanning) {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const sx = t.clientX - rect.left;
    const sy = t.clientY - rect.top;

    const dx = sx - touchStartX;
    const dy = sy - touchStartY;

    // Only start panning once past threshold
    if (!touchMoved && Math.hypot(dx, dy) < TOUCH_PAN_THRESHOLD) {
      return;
    }

    touchMoved = true;
    viewX += dx / viewZoom;
    viewY += dy / viewZoom;
    touchStartX = sx;
    touchStartY = sy;
  }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  lastTouchDist = 0;

  if (e.touches.length === 0 && !touchMoved && isTouchPanning) {
    // It was a tap, not a pan — handle selection or sprout
    const rect = canvas.getBoundingClientRect();
    const t = e.changedTouches[0];
    const sx = t.clientX - rect.left;
    const sy = t.clientY - rect.top;
    const world = screenToWorld(sx, sy);

    if (touchTapSyn) {
      if (focusMode) {
        focusOn(touchTapSyn);
      } else if (selectedSynapse && selectedSynapse.id === touchTapSyn.id) {
        deselect();
      } else {
        selectSynapse(touchTapSyn);
      }
    } else {
      if (!focusMode) addSprout(world.x, world.y);
    }
  }

  isTouchPanning = false;
  touchTapSyn = null;
});

// --- UI Events ---

$('btn-close-synapse').addEventListener('click', (e) => { e.stopPropagation(); deselect(); });
$('btn-fire').addEventListener('click', (e) => { e.stopPropagation(); onFire(); });
$('btn-delete-synapse').addEventListener('click', (e) => { e.stopPropagation(); onPrune(); });
$('btn-export').addEventListener('click', (e) => { e.stopPropagation(); onExport(); });
$('btn-close-export').addEventListener('click', (e) => { e.stopPropagation(); closeExport(); });
$('btn-copy-export').addEventListener('click', (e) => { e.stopPropagation(); copyExport(); });
$('btn-import').addEventListener('click', (e) => { e.stopPropagation(); onImport(); });
$('btn-close-import').addEventListener('click', (e) => { e.stopPropagation(); closeImport(); });
$('btn-do-import').addEventListener('click', (e) => { e.stopPropagation(); doImport(); });
$('btn-clear').addEventListener('click', (e) => { e.stopPropagation(); clearAll(); });
$('btn-undo').addEventListener('click', (e) => { e.stopPropagation(); undo(); });
$('btn-redo').addEventListener('click', (e) => { e.stopPropagation(); redo(); });
$('btn-connect-mode').addEventListener('click', (e) => { e.stopPropagation(); toggleConnectMode(); });
$('btn-auto-connect').addEventListener('click', (e) => { e.stopPropagation(); toggleAutoConnect(); });
$('btn-grid').addEventListener('click', (e) => { e.stopPropagation(); toggleGridSnap(); });
$('btn-scope').addEventListener('click', (e) => { e.stopPropagation(); scopeToAll(); });
$('btn-auto-layout').addEventListener('click', (e) => { e.stopPropagation(); autoLayout(); });
$('btn-search').addEventListener('click', (e) => { e.stopPropagation(); toggleSearch(); });
$('btn-search-close').addEventListener('click', (e) => { e.stopPropagation(); closeSearch(); });
$('btn-clone-synapse').addEventListener('click', (e) => { e.stopPropagation(); cloneSynapse(); });
$('btn-pin-synapse').addEventListener('click', (e) => { e.stopPropagation(); togglePin(); });
$('btn-bulk-fire').addEventListener('click', (e) => { e.stopPropagation(); bulkFire(); });
$('btn-bulk-prune').addEventListener('click', (e) => { e.stopPropagation(); bulkPrune(); });
$('btn-bulk-pin').addEventListener('click', (e) => { e.stopPropagation(); bulkTogglePin(); });
$('btn-bulk-clear').addEventListener('click', (e) => { e.stopPropagation(); clearBulkSelection(); });
slider.addEventListener('input', onSlider);
hueSlider.addEventListener('input', onHueSlider);

// New feature buttons
$('btn-focus').addEventListener('click', (e) => { e.stopPropagation(); toggleFocusMode(); });
$('btn-tags').addEventListener('click', (e) => { e.stopPropagation(); toggleTagFilter(); });
$('btn-gardens').addEventListener('click', (e) => { e.stopPropagation(); toggleGardenPanel(); });
$('btn-sound').addEventListener('click', (e) => { e.stopPropagation(); toggleSound(); });
$('btn-help').addEventListener('click', (e) => { e.stopPropagation(); toggleHelp(); });
$('btn-close-help').addEventListener('click', (e) => { e.stopPropagation(); closeHelp(); });
$('btn-theme').addEventListener('click', (e) => { e.stopPropagation(); cycleTheme(); });
$('btn-generate').addEventListener('click', (e) => { e.stopPropagation(); generateRandomGarden(); });
$('btn-bulk-merge').addEventListener('click', (e) => {
  e.stopPropagation();
  if (selectedSynapses.length >= 2) {
    const target = selectedSynapses[0];
    for (let i = 1; i < selectedSynapses.length; i++) {
      mergeSynapses(target, selectedSynapses[i]);
    }
    clearBulkSelection();
  } else {
    showToast('Select at least 2 synapses to merge');
  }
});

// Context menu items
contextMenu.querySelectorAll('.context-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    handleContextAction(item.dataset.action);
  });
});

// Close context menu on outside click
document.addEventListener('click', (e) => {
  if (!contextMenu.classList.contains('hidden') && !contextMenu.contains(e.target)) {
    hideContextMenu();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !contextMenu.classList.contains('hidden')) {
    hideContextMenu();
  }
});

// Tag filter
tagFilterSelect.addEventListener('change', () => {
  setTagFilter(tagFilterSelect.value);
});
$('btn-tag-filter-clear').addEventListener('click', (e) => { e.stopPropagation(); closeTagFilter(); });

// Tag input (panel)
$('btn-add-tag').addEventListener('click', (e) => { e.stopPropagation(); addTagToSelected(tagInput.value); });
tagInput.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') {
    e.preventDefault();
    addTagToSelected(tagInput.value);
  } else if (e.key === 'Escape') {
    tagInput.blur();
  }
});

// Garden panel
$('btn-new-garden').addEventListener('click', (e) => { e.stopPropagation(); newGarden(); });
$('btn-rename-garden').addEventListener('click', (e) => { e.stopPropagation(); renameGarden(); });
$('btn-delete-garden').addEventListener('click', (e) => { e.stopPropagation(); deleteGarden(); });
$('btn-close-gardens').addEventListener('click', (e) => { e.stopPropagation(); closeGardenPanel(); });

// Auto-fire toggle
autoFireToggle.addEventListener('change', () => {
  autoFireRateGroup.classList.toggle('hidden', !autoFireToggle.checked);
  if (selectedSynapse) {
    selectedSynapse.autoFire = autoFireToggle.checked;
    selectedSynapse.autoFireInterval = parseInt(autoFireInterval.value) || 5;
    selectedSynapse.autoFireTimer = 0;
    save();
  }
});

autoFireInterval.addEventListener('change', () => {
  if (selectedSynapse) {
    selectedSynapse.autoFireInterval = parseInt(autoFireInterval.value) || 5;
    selectedSynapse.autoFireTimer = 0;
    save();
  }
});

// Auto-save message on input (real-time)
messageInput.addEventListener('input', () => {
  if (selectedSynapse) {
    selectedSynapse.message = messageInput.value;
    save();
  }
});

// Search input
searchInput.addEventListener('input', onSearchInput);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSearch();
  if (e.key === 'Enter') closeSearch();
});

// Comprehend
$('btn-comprehend').addEventListener('click', (e) => { e.stopPropagation(); openComprehend(); });
$('btn-close-comprehend').addEventListener('click', (e) => { e.stopPropagation(); closeComprehend(); });

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (editingSynapse) {
      cancelInlineEdit();
    } else if (mergeMode) {
      exitMergeMode();
    } else if (focusMode) {
      exitFocusMode();
    } else if (!panel.classList.contains('hidden')) {
      deselect();
    } else if (!exportPanel.classList.contains('hidden')) {
      closeExport();
    } else if (!importPanel.classList.contains('hidden')) {
      closeImport();
    } else if (!helpPanel.classList.contains('hidden')) {
      closeHelp();
    } else if (!$('garden-panel').classList.contains('hidden')) {
      closeGardenPanel();
    } else if (!$('comprehend-panel').classList.contains('hidden')) {
      closeComprehend();
    } else if (!tagFilterBar.classList.contains('hidden')) {
      closeTagFilter();
    } else if (connectMode) {
      toggleConnectMode();
    } else if (!searchBar.classList.contains('hidden')) {
      closeSearch();
    }
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSynapse && !e.ctrlKey && !e.metaKey) {
    if (panel.classList.contains('hidden')) return;
    onPrune();
  }

  // Search shortcut: Ctrl+F or /
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    toggleSearch();
  }
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !editingSynapse && searchBar.classList.contains('hidden')) {
    e.preventDefault();
    toggleSearch();
  }

  // Help: ? (shift + /)
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    toggleHelp();
  }

  // Gardens: g
  if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !editingSynapse) {
    toggleGardenPanel();
  }

  // Tag filter: t
  if (e.key === 't' && !e.ctrlKey && !e.metaKey && !editingSynapse) {
    toggleTagFilter();
  }

  // Sound: m
  if (e.key === 'm' && !e.ctrlKey && !e.metaKey && !editingSynapse) {
    toggleSound();
  }

  // Theme: c
  if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !editingSynapse) {
    cycleTheme();
  }

  // Random garden: r
  if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !editingSynapse) {
    generateRandomGarden();
  }

  // Zoom to selection: z
  if (e.key === 'z' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !editingSynapse) {
    zoomToSelection();
  }

  // Arrow-key panning (only when not typing in an input)
  if (!editingSynapse && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement && document.activeElement.tagName)) {
    const panStep = 40 / viewZoom;
    if (e.key === 'ArrowLeft') { viewX += panStep; updateZoomIndicator(); }
    else if (e.key === 'ArrowRight') { viewX -= panStep; updateZoomIndicator(); }
    else if (e.key === 'ArrowUp') { viewY += panStep; updateZoomIndicator(); }
    else if (e.key === 'ArrowDown') { viewY -= panStep; updateZoomIndicator(); }
  }

  // Undo/Redo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault();
    redo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    redo();
  }
});

// Import text preview
importText.addEventListener('input', () => {
  try {
    const data = JSON.parse(importText.value.trim());
    if (data.synapses && Array.isArray(data.synapses)) {
      importPreview.textContent = 'Found ' + data.synapses.length + ' synapse(s) to import';
    } else {
      importPreview.textContent = 'No synapses found in data';
    }
  } catch {
    importPreview.textContent = '';
  }
});

// --- Boot ---
init();
loop(0);