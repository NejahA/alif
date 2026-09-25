// --- SYNAPSE NEXUS — Interactive Neural Knowledge Graph App ---

let nodes = [];
let edges = [];
let selectedNode = null;
let hoveredNode = null;
let connectingSourceNode = null;

// Physics Simulation State
let physicsEnabled = true;
const DAMPING = 0.88;
const REPULSION = 1200;
const SPRING_STIFFNESS = 0.04;
const SPRING_LENGTH = 140;
const GRAVITY = 0.015;

// Camera Viewport State
let viewX = 0;
let viewY = 0;
let zoom = 1;
let isDraggingCamera = false;
let isDraggingNode = false;
let dragStartX = 0;
let dragStartY = 0;

// Search Query
let searchQuery = '';

// Web Audio Synth State
let audioEnabled = false;
let audioCtx = null;

// DOM Elements
const canvas = document.getElementById('neural-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const searchInput = document.getElementById('node-search');
const btnClearSearch = document.getElementById('btn-clear-search');
const btnAddNode = document.getElementById('btn-add-node');
const btnPresetToggle = document.getElementById('btn-preset-toggle');
const btnPhysicsToggle = document.getElementById('btn-physics-toggle');
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const btnResetCam = document.getElementById('btn-reset-cam');
const btnSnapshot = document.getElementById('btn-snapshot');

const statNodes = document.getElementById('stat-total-nodes');
const statEdges = document.getElementById('stat-total-edges');
const statClusters = document.getElementById('stat-total-clusters');
const statActiveNode = document.getElementById('stat-active-node');

const presetModal = document.getElementById('preset-modal');
const btnClosePresets = document.getElementById('btn-close-presets');

const inspectorPanel = document.getElementById('inspector-panel');
const btnCloseInspector = document.getElementById('btn-close-inspector');
const inpNodeLabel = document.getElementById('inp-node-label');
const inpNodeCategory = document.getElementById('inp-node-category');
const inpNodeTags = document.getElementById('inp-node-tags');
const inpNodeHue = document.getElementById('inp-node-hue');
const inpNodeNotes = document.getElementById('inp-node-notes');
const inspectorLinksList = document.getElementById('inspector-links-list');
const btnConnectMode = document.getElementById('btn-connect-mode');
const btnDeleteNode = document.getElementById('btn-delete-node');

// Presets Data
const PRESETS = {
  'ai-ecosystem': {
    nodes: [
      { id: '1', label: 'Artificial Intelligence', category: 'Core Concept', tags: ['ai', 'core'], hue: 260, notes: '# Artificial Intelligence\nThe master umbrella domain encompassing machine learning, neural networks, and agentic reasoning.', x: 0, y: 0 },
      { id: '2', label: 'Transformer Attention', category: 'Architecture', tags: ['transformer', 'nlp'], hue: 220, notes: 'Self-attention mechanism that allows sequence-to-sequence modeling with parallel compute.', x: -160, y: -120 },
      { id: '3', label: 'Large Language Models', category: 'Architecture', tags: ['llm', 'genai'], hue: 200, notes: 'Pretrained neural language representations capable of zero-shot reasoning and code synthesis.', x: 180, y: -100 },
      { id: '4', label: 'Agentic Workflows', category: 'Implementation', tags: ['agents', 'tools'], hue: 160, notes: 'Autonomous loop execution with tool calls, memory, subagent spawning, and iterative reflection.', x: 120, y: 150 },
      { id: '5', label: 'Retrieval Augmented Generation', category: 'Implementation', tags: ['rag', 'vector'], hue: 120, notes: 'Grounding generative models with real-time knowledge bases and vector search indices.', x: -180, y: 130 },
      { id: '6', label: 'Diffusion Models', category: 'Research & Theory', tags: ['vision', 'generative'], hue: 320, notes: 'Generative image and media synthesis using iterative noise reversal process.', x: 260, y: 40 },
      { id: '7', label: 'Artificial General Intelligence', category: 'Future Horizon', tags: ['agi', 'frontier'], hue: 45, notes: 'Human-equivalent adaptable cognitive architecture capable of autonomous multi-domain learning.', x: 0, y: -260 }
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '3', target: '4' },
      { source: '3', target: '5' },
      { source: '1', target: '6' },
      { source: '3', target: '7' },
      { source: '4', target: '7' }
    ]
  },
  'cosmic-physics': {
    nodes: [
      { id: '1', label: 'Cosmic Singularity', category: 'Core Concept', tags: ['astrophysics', 'core'], hue: 280, notes: '# Cosmic Singularity\nOrigin point of infinite density and curvature at the boundary of spacetime.', x: 0, y: 0 },
      { id: '2', label: 'Quantum Entanglement', category: 'Research & Theory', tags: ['quantum', 'nonlocal'], hue: 200, notes: 'Non-local state correlations binding spatial separations instantaneously.', x: -180, y: -110 },
      { id: '3', label: 'Spacetime Curvature', category: 'Architecture', tags: ['gravity', 'relativity'], hue: 240, notes: 'Einsteinian gravitational field dynamics distorted by stress-energy tensors.', x: 160, y: -120 },
      { id: '4', label: 'Dark Energy Resonance', category: 'Future Horizon', tags: ['dark-matter', 'cosmos'], hue: 340, notes: 'Accelerated cosmic expansion field driving universal scale expansion.', x: 190, y: 140 },
      { id: '5', label: 'Event Horizon', category: 'Implementation', tags: ['blackhole', 'gravity'], hue: 160, notes: 'The un-escape boundary beyond which escape velocity exceeds light.', x: -160, y: 150 }
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '3', target: '4' },
      { source: '1', target: '5' },
      { source: '2', target: '5' }
    ]
  },
  'mindweaver': {
    nodes: [
      { id: '1', label: 'Mindweaver Sanctuary', category: 'Core Concept', tags: ['mind', 'sanctuary'], hue: 270, notes: '# Mindweaver Sanctuary\nInner mental sanctuary for focus, ambient soundscapes, and meditation.', x: 0, y: 0 },
      { id: '2', label: 'Sacred Breathwork', category: 'Implementation', tags: ['breath', 'vitality'], hue: 160, notes: 'Box breathing and 4-7-8 rhythmic lung cycles regulating heart rate variability.', x: -150, y: -100 },
      { id: '3', label: 'Frequency Synthesizer', category: 'Architecture', tags: ['audio', 'binaural'], hue: 200, notes: 'Solffegio 432Hz and 528Hz theta-wave binaural beat generators.', x: 170, y: -90 },
      { id: '4', label: 'Orbital Dashboard', category: 'Implementation', tags: ['metrics', 'focus'], hue: 120, notes: 'Real-time telemetry of mental flow states and milestone stars.', x: 140, y: 130 }
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '1', target: '4' },
      { source: '2', target: '4' }
    ]
  },
  'empty': { nodes: [], edges: [] }
};

// Audio Synth Feedback (Web Audio API)
function initAudio() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  } catch (e) { }
}

function playNeuralPulse(freq = 440, duration = 0.25) {
  if (!audioEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) { }
}

// Canvas Initialization & Resizing
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}

// Load Preset Network
function loadPreset(presetKey) {
  const preset = PRESETS[presetKey] || PRESETS['ai-ecosystem'];
  nodes = preset.nodes.map(n => ({
    ...n,
    vx: 0,
    vy: 0,
    radius: 18 + Math.min(12, (n.notes || '').length * 0.05),
    pinned: false
  }));
  edges = preset.edges.map(e => ({ ...e }));
  selectedNode = null;
  closeInspector();
  updateHUDStats();
  playNeuralPulse(528, 0.4);
}

// Physics Step Simulation
function updatePhysics() {
  if (!physicsEnabled || !nodes.length) return;

  // 1. Repulsion between all node pairs
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const n1 = nodes[i];
      const n2 = nodes[j];
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.hypot(dx, dy) || 1;
      const force = REPULSION / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!n1.pinned) { n1.vx -= fx; n1.vy -= fy; }
      if (!n2.pinned) { n2.vx += fx; n2.vy += fy; }
    }
  }

  // 2. Spring forces along edges
  edges.forEach(edge => {
    const n1 = nodes.find(n => n.id === edge.source);
    const n2 = nodes.find(n => n.id === edge.target);
    if (!n1 || !n2) return;

    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.hypot(dx, dy) || 1;
    const force = (dist - SPRING_LENGTH) * SPRING_STIFFNESS;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!n1.pinned) { n1.vx += fx; n1.vy += fy; }
    if (!n2.pinned) { n2.vx -= fx; n2.vy -= fy; }
  });

  // 3. Center gravity & velocity damping
  nodes.forEach(n => {
    if (n.pinned) return;
    n.vx -= n.x * GRAVITY;
    n.vy -= n.y * GRAVITY;
    n.vx *= DAMPING;
    n.vy *= DAMPING;
    n.x += n.vx;
    n.y += n.vy;
  });
}

// Main Render Loop
function render() {
  if (!ctx || !canvas) return;

  updatePhysics();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Center camera origin
  ctx.translate(canvas.width / 2 + viewX, canvas.height / 2 + viewY);
  ctx.scale(zoom, zoom);

  // Render Background Grid Dots
  const gridStep = 80;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let gx = -1600; gx <= 1600; gx += gridStep) {
    for (let gy = -1200; gy <= 1200; gy += gridStep) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Render Edges
  edges.forEach(edge => {
    const n1 = nodes.find(n => n.id === edge.source);
    const n2 = nodes.find(n => n.id === edge.target);
    if (!n1 || !n2) return;

    const isConnectedToSelected = selectedNode && (selectedNode.id === n1.id || selectedNode.id === n2.id);
    ctx.strokeStyle = isConnectedToSelected
      ? `hsla(${n1.hue}, 90%, 75%, 0.8)`
      : `hsla(${n1.hue}, 60%, 65%, 0.25)`;
    ctx.lineWidth = isConnectedToSelected ? 2.5 : 1.2;

    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.stroke();

    // Pulse energy particle along edge
    const t = (performance.now() * 0.001 + n1.hue * 0.05) % 1;
    const px = n1.x + (n2.x - n1.x) * t;
    const py = n1.y + (n2.y - n1.y) * t;
    ctx.fillStyle = `hsla(${n1.hue}, 90%, 80%, ${isConnectedToSelected ? 0.9 : 0.4})`;
    ctx.beginPath();
    ctx.arc(px, py, isConnectedToSelected ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Render Connecting Line in Connect Mode
  if (connectingSourceNode && hoveredNode && connectingSourceNode !== hoveredNode) {
    ctx.strokeStyle = 'hsla(50, 100%, 70%, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(connectingSourceNode.x, connectingSourceNode.y);
    ctx.lineTo(hoveredNode.x, hoveredNode.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Render Nodes
  nodes.forEach(n => {
    const isSelected = selectedNode && selectedNode.id === n.id;
    const isHovered = hoveredNode && hoveredNode.id === n.id;
    const isConnecting = connectingSourceNode && connectingSourceNode.id === n.id;

    const matchesSearch = !searchQuery ||
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const alpha = matchesSearch ? 1 : 0.15;

    // Outer Glow Halo
    const glowRadius = n.radius * (isSelected ? 3.2 : (isHovered ? 2.5 : 1.8));
    const glow = ctx.createRadialGradient(n.x, n.y, n.radius * 0.4, n.x, n.y, glowRadius);
    glow.addColorStop(0, `hsla(${n.hue}, 85%, 65%, ${0.35 * alpha})`);
    glow.addColorStop(1, `hsla(${n.hue}, 85%, 65%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Node Core Circle
    ctx.fillStyle = isSelected
      ? `hsl(${n.hue}, 90%, 75%)`
      : `hsl(${n.hue}, 70%, 55%)`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fill();

    // Border Ring
    if (isSelected || isHovered || isConnecting) {
      ctx.strokeStyle = isConnecting ? '#f59e0b' : '#ffffff';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Node Label & Category
    ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * alpha})`;
    ctx.font = `${isSelected ? '700' : '600'} 12px "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(n.label, n.x, n.y + n.radius + 6);

    ctx.fillStyle = `hsla(${n.hue}, 80%, 75%, ${0.75 * alpha})`;
    ctx.font = '500 10px "Inter", sans-serif';
    ctx.fillText(n.category, n.x, n.y + n.radius + 22);
  });

  ctx.restore();

  requestAnimationFrame(render);
}

// Convert Screen Space Event to World Coordinates
function screenToWorld(screenX, screenY) {
  const rect = canvas.getBoundingClientRect();
  const relX = screenX - rect.left - canvas.width / 2 - viewX;
  const relY = screenY - rect.top - canvas.height / 2 - viewY;
  return { x: relX / zoom, y: relY / zoom };
}

// HUD Statistics Update
function updateHUDStats() {
  if (statNodes) statNodes.textContent = String(nodes.length);
  if (statEdges) statEdges.textContent = String(edges.length);
  const categories = new Set(nodes.map(n => n.category));
  if (statClusters) statClusters.textContent = String(categories.size);
  if (statActiveNode) {
    statActiveNode.textContent = selectedNode ? selectedNode.label : 'None Selected';
    statActiveNode.className = selectedNode ? 'stat-value text-accent' : 'stat-value text-dim';
  }
}

// Inspector Side Panel Management
function openInspector(node) {
  if (!node || !inspectorPanel) return;
  selectedNode = node;
  updateHUDStats();

  if (inpNodeLabel) inpNodeLabel.value = node.label || '';
  if (inpNodeCategory) inpNodeCategory.value = node.category || 'Core Concept';
  if (inpNodeTags) inpNodeTags.value = (node.tags || []).join(', ');
  if (inpNodeHue) inpNodeHue.value = node.hue || 220;
  if (inpNodeNotes) inpNodeNotes.value = node.notes || '';

  renderInspectorLinks(node);

  inspectorPanel.classList.remove('collapsed');
}

function closeInspector() {
  if (inspectorPanel) inspectorPanel.classList.add('collapsed');
  selectedNode = null;
  connectingSourceNode = null;
  updateHUDStats();
}

function renderInspectorLinks(node) {
  if (!inspectorLinksList) return;
  inspectorLinksList.innerHTML = '';

  const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  if (connectedEdges.length === 0) {
    inspectorLinksList.innerHTML = '<span style="font-size: 11px; color: var(--text-dim);">No active synapse links</span>';
    return;
  }

  connectedEdges.forEach(e => {
    const otherId = e.source === node.id ? e.target : e.source;
    const otherNode = nodes.find(n => n.id === otherId);
    if (!otherNode) return;

    const div = document.createElement('div');
    div.className = 'link-item';
    div.innerHTML = `
      <span>🔗 ${escapeHTML(otherNode.label)}</span>
      <button class="icon-btn btn-remove-link" title="Remove link">✕</button>
    `;

    div.querySelector('.btn-remove-link').onclick = () => {
      edges = edges.filter(edge => edge !== e);
      renderInspectorLinks(node);
      updateHUDStats();
    };

    inspectorLinksList.appendChild(div);
  });
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Event Setup
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  loadPreset('ai-ecosystem');

  // Toolbar Actions
  if (btnAddNode) {
    btnAddNode.onclick = () => {
      const newNode = {
        id: String(Date.now()),
        label: 'New Neural Node',
        category: 'Core Concept',
        tags: ['new'],
        hue: Math.floor(Math.random() * 360),
        notes: '# New Neural Node\nEnter your thoughts here...',
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        vx: 0, vy: 0,
        radius: 20,
        pinned: false
      };
      nodes.push(newNode);
      openInspector(newNode);
      playNeuralPulse(600, 0.3);
    };
  }

  if (btnPresetToggle) {
    btnPresetToggle.onclick = () => presetModal.classList.remove('hidden');
  }

  if (btnClosePresets) {
    btnClosePresets.onclick = () => presetModal.classList.add('hidden');
  }

  document.querySelectorAll('.preset-card').forEach(card => {
    card.onclick = () => {
      const presetKey = card.dataset.preset;
      loadPreset(presetKey);
      presetModal.classList.add('hidden');
    };
  });

  if (btnPhysicsToggle) {
    btnPhysicsToggle.onclick = () => {
      physicsEnabled = !physicsEnabled;
      btnPhysicsToggle.classList.toggle('active', physicsEnabled);
    };
  }

  if (btnAudioToggle) {
    btnAudioToggle.onclick = () => {
      initAudio();
      audioEnabled = !audioEnabled;
      btnAudioToggle.classList.toggle('active', audioEnabled);
      if (audioEnabled) playNeuralPulse(528, 0.3);
    };
  }

  if (btnResetCam) {
    btnResetCam.onclick = () => {
      viewX = 0; viewY = 0; zoom = 1;
    };
  }

  if (btnSnapshot) {
    btnSnapshot.onclick = () => {
      const link = document.createElement('a');
      link.download = `synapse-nexus-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }

  // Search Input
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value.trim();
      if (btnClearSearch) btnClearSearch.classList.toggle('hidden', !searchQuery);
    };
  }

  if (btnClearSearch) {
    btnClearSearch.onclick = () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      btnClearSearch.classList.add('hidden');
    };
  }

  // Canvas Mouse Interactions
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);

      // Check hovered node
      hoveredNode = nodes.find(n => Math.hypot(n.x - worldPos.x, n.y - worldPos.y) < n.radius + 6) || null;

      if (isDraggingNode && selectedNode) {
        selectedNode.x = worldPos.x;
        selectedNode.y = worldPos.y;
        selectedNode.vx = 0;
        selectedNode.vy = 0;
      } else if (isDraggingCamera) {
        viewX += e.clientX - dragStartX;
        viewY += e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const worldPos = screenToWorld(e.clientX, e.clientY);

      if (hoveredNode) {
        if (connectingSourceNode && connectingSourceNode !== hoveredNode) {
          // Link nodes
          const exists = edges.some(edge =>
            (edge.source === connectingSourceNode.id && edge.target === hoveredNode.id) ||
            (edge.source === hoveredNode.id && edge.target === connectingSourceNode.id)
          );
          if (!exists) {
            edges.push({ source: connectingSourceNode.id, target: hoveredNode.id });
            playNeuralPulse(720, 0.2);
          }
          connectingSourceNode = null;
        }

        selectedNode = hoveredNode;
        isDraggingNode = true;
        openInspector(hoveredNode);
        playNeuralPulse(440 + hoveredNode.hue, 0.2);
      } else {
        isDraggingCamera = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingCamera = false;
      isDraggingNode = false;
    });

    canvas.addEventListener('dblclick', (e) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const newNode = {
        id: String(Date.now()),
        label: 'Concept Note',
        category: 'Core Concept',
        tags: ['idea'],
        hue: Math.floor(Math.random() * 360),
        notes: '# Concept Note\nDetailed description...',
        x: worldPos.x,
        y: worldPos.y,
        vx: 0, vy: 0,
        radius: 18,
        pinned: false
      };
      nodes.push(newNode);
      openInspector(newNode);
      playNeuralPulse(600, 0.3);
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      zoom = Math.max(0.3, Math.min(3, zoom * zoomFactor));
    }, { passive: false });
  }

  // Inspector Field Event Listeners
  if (inpNodeLabel) {
    inpNodeLabel.oninput = (e) => {
      if (selectedNode) selectedNode.label = e.target.value;
    };
  }

  if (inpNodeCategory) {
    inpNodeCategory.onchange = (e) => {
      if (selectedNode) {
        selectedNode.category = e.target.value;
        updateHUDStats();
      }
    };
  }

  if (inpNodeTags) {
    inpNodeTags.oninput = (e) => {
      if (selectedNode) selectedNode.tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    };
  }

  if (inpNodeHue) {
    inpNodeHue.oninput = (e) => {
      if (selectedNode) selectedNode.hue = parseInt(e.target.value);
    };
  }

  if (inpNodeNotes) {
    inpNodeNotes.oninput = (e) => {
      if (selectedNode) selectedNode.notes = e.target.value;
    };
  }

  if (btnConnectMode) {
    btnConnectMode.onclick = () => {
      if (selectedNode) {
        connectingSourceNode = selectedNode;
        playNeuralPulse(500, 0.2);
      }
    };
  }

  if (btnDeleteNode) {
    btnDeleteNode.onclick = () => {
      if (selectedNode) {
        nodes = nodes.filter(n => n.id !== selectedNode.id);
        edges = edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id);
        closeInspector();
        updateHUDStats();
        playNeuralPulse(300, 0.3);
      }
    };
  }

  if (btnCloseInspector) btnCloseInspector.onclick = closeInspector;

  requestAnimationFrame(render);
});
