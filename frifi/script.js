// ── frífi — project liess ──
// Unravel the fabric of deception — judge statements as truth or lie

// ── DOM Refs ──
const bgLayer = document.getElementById('bgLayer');
const statementCard = document.getElementById('statementCard');
const categoryEl = document.getElementById('statementCategory');
const textEl = document.getElementById('statementText');
const sourceEl = document.getElementById('statementSource');
const feedbackText = document.getElementById('feedbackText');
const feedbackBubble = document.getElementById('feedbackBubble');
const truthScoreEl = document.getElementById('truthScore');
const meterFill = document.getElementById('meterFill');
const truthCount = document.getElementById('truthCount');
const lieCount = document.getElementById('lieCount');
const unsureCount = document.getElementById('unsureCount');
const streakCount = document.getElementById('streakCount');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const skipBtn = document.getElementById('skipBtn');
const resetBtn = document.getElementById('resetBtn');
const confidenceSlider = document.getElementById('confidenceSlider');
const confidenceValue = document.getElementById('confidenceValue');
const shadowCanvas = document.getElementById('shadowCanvas');
const ctx = shadowCanvas.getContext('2d');

// ── Statement Database ──
const STATEMENTS = [
  // Truths
  { text: "The Eiffel Tower can be 15 cm taller during summer due to thermal expansion of the iron.", source: "Scientific America", isTruth: true, category: "science", explanation: "Iron expands when heated — the tower grows up to 15cm in summer heat." },
  { text: "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.", source: "Smithsonian Magazine", isTruth: true, category: "history", explanation: "Honey's low moisture and acidic pH create an environment that kills bacteria." },
  { text: "Octopuses have three hearts, and two stop beating when they swim.", source: "National Geographic", isTruth: true, category: "nature", explanation: "Two branchial hearts pump blood to the gills; the systemic heart stops during swimming." },
  { text: "Bananas are technically berries, while strawberries are not.", source: "Botanical Journal", isTruth: true, category: "science", explanation: "Botanically, berries have seeds inside — bananas qualify, strawberries don't." },
  { text: "A day on Venus is longer than a year on Venus.", source: "NASA Solar System", isTruth: true, category: "space", explanation: "Venus rotates once every 243 Earth days but orbits the sun in 225 days." },
  { text: "Wombat poop is cube-shaped to prevent it from rolling away.", source: "Australian Wildlife", isTruth: true, category: "nature", explanation: "Wombat intestines have varying elasticity, forming cubes that stay put on rocks." },
  { text: "The inventor of the Pringles can is buried in one.", source: "Funeral Registry", isTruth: true, category: "history", explanation: "Fredric Baur requested partial burial in a Pringles can. His family honored it." },
  { text: "There is a species of jellyfish (Turritopsis dohrnii) that is biologically immortal.", source: "Marine Biology", isTruth: true, category: "nature", explanation: "It can revert to its polyp stage after maturity, potentially living forever." },
  { text: "The shortest war in history lasted only 38 minutes (Anglo-Zanzibar War, 1896).", source: "History Today", isTruth: true, category: "history", explanation: "Zanzibar surrendered after 38 minutes of British bombardment." },
  { text: "Clouds can weigh over a million pounds.", source: "NOAA", isTruth: true, category: "science", explanation: "A cumulus cloud's water droplets add up — about 1.1 million pounds for a 1km³ cloud." },
  { text: "The Mona Lisa has no eyebrows because it was fashionable in Renaissance Florence to shave them off.", source: "Art History Journal", isTruth: true, category: "art", explanation: "Renaissance women often removed facial hair, including eyebrows." },
  { text: "Koalas have fingerprints almost identical to human ones.", source: "Forensic Science", isTruth: true, category: "nature", explanation: "Koala fingerprints are so close to human that they could confuse crime scene investigators." },
  { text: "A bolt of lightning contains enough energy to toast 100,000 slices of bread.", source: "Physics Today", isTruth: true, category: "science", explanation: "A typical lightning bolt carries about 5 billion joules of energy." },
  { text: "The first computer virus was created in 1983 and was called 'Elk Cloner'.", source: "Computer History Museum", isTruth: true, category: "technology", explanation: "Rich Skrenta wrote Elk Cloner as a prank, spreading via floppy disks." },
  { text: "Cleopatra lived closer in time to the moon landing than to the construction of the Great Pyramid.", source: "Timeline Analysis", isTruth: true, category: "history", explanation: "Pyramid: ~2560 BCE, Cleopatra: 69 BCE, Moon: 1969 CE. Gap: 2491 vs 2038 years." },

  // Lies
  { text: "The Great Wall of China is visible from space with the naked eye.", source: "Common Myth", isTruth: false, category: "myth", explanation: "It's too narrow — about 5 meters wide. Astronauts can't see it without aid." },
  { text: "Humans only use 10% of their brains.", source: "Pop Science", isTruth: false, category: "myth", explanation: "Brain scans show we use virtually all parts of the brain over a day." },
  { text: "Chameleons change color primarily to camouflage with their surroundings.", source: "Misconception", isTruth: false, category: "myth", explanation: "They change color for communication, temperature regulation, and mood — not camouflage." },
  { text: "Bats are blind.", source: "Misconception", isTruth: false, category: "myth", explanation: "All bats can see. Fruit bats have excellent vision; microbats use echolocation too." },
  { text: "Mount Everest is the tallest mountain on Earth from base to summit.", source: "Geography Myth", isTruth: false, category: "myth", explanation: "Mauna Kea in Hawaii is taller from base (underwater) — 10,210m vs Everest's 8,848m." },
  { text: "Vitamin C prevents the common cold.", source: "Medical Myth", isTruth: false, category: "health", explanation: "It may slightly reduce duration but cannot prevent colds. Large trials show no prevention." },
  { text: "The tongue has different taste zones for sweet, sour, salty, and bitter.", source: "Misconception", isTruth: false, category: "myth", explanation: "All areas detect all tastes. The 'tongue map' was a mistranslation of a 1901 German paper." },
  { text: "Napoleon Bonaparte was extremely short.", source: "Historical Myth", isTruth: false, category: "history", explanation: "He was 5'7\" (170cm) — average for his time. The myth came from British propaganda." },
  { text: "Daddy longlegs spiders are the most venomous in the world but can't bite humans.", source: "Urban Legend", isTruth: false, category: "myth", explanation: "They have very weak venom and small fangs, but are not the most venomous." },
  { text: "Cracking your knuckles causes arthritis.", source: "Health Myth", isTruth: false, category: "health", explanation: "Multiple studies show no correlation between knuckle cracking and arthritis." },
  { text: "Dogs can only see in black and white.", source: "Animal Myth", isTruth: false, category: "myth", explanation: "Dogs see blue and yellow — they have dichromatic vision, not full color blindness." },
  { text: "The 'dark side' of the moon is permanently dark.", source: "Space Myth", isTruth: false, category: "space", explanation: "The far side gets sunlight too — 'dark' just means unseen from Earth, not unlit." },
  { text: "Swallowed gum stays in your stomach for 7 years.", source: "Parental Myth", isTruth: false, category: "health", explanation: "Gum passes through the digestive system like most foods, just not fully digested." },
  { text: "Different parts of your hair grow at different rates.", source: "Hair Myth", isTruth: false, category: "myth", explanation: "Hair grows at about 15cm/year everywhere. Some areas just have longer anagen phases." },
  { text: "Shaving makes your hair grow back thicker and darker.", source: "Beauty Myth", isTruth: false, category: "myth", explanation: "Shaving cuts hair at a blunt tip, making it appear thicker temporarily. It doesn't change growth." },
];

let currentStatement = null;
let stats = { truths: 0, lies: 0, unsure: 0, streak: 0, bestStreak: 0 };
let history = [];
let totalJudged = 0;
let correctJudgments = 0;
let isLocked = false; // true while showing feedback after a judgment
let usedIndices = [];
let feedbackTimeout = null;
let shadowParticles = [];
let animFrame = null;

const CATEGORY_ICONS = {
  science: '🔬', history: '📜', nature: '🌿', space: '🚀',
  art: '🎨', technology: '💻', health: '🏥', myth: '🌀',
  '': '⚖️'
};

const FEEDBACK_MESSAGES = {
  truth_correct: [
    "✓ Correct! The evidence supports truth.",
    "You have a sharp eye for truth!",
    "The facts are on your side. ✓",
    "Truth prevails! You spotted it.",
    "Accurate! This one is real."
  ],
  truth_incorrect: [
    "✗ Actually, this is a lie. Deception was clever here.",
    "They got you! This one is false.",
    "Not so fast — this is a lie.",
    "Wrong! Misinformation detected.",
    "A clever lie, and you fell for it."
  ],
  lie_correct: [
    "✓ Correct! Deception detected.",
    "You saw through the lie!",
    "Lie exposed! Well done.",
    "Deception uncovered. ✗✓",
    "Sharp instincts — that was false."
  ],
  lie_incorrect: [
    "✗ Actually, this one is true!",
    "Surprise — that was a fact!",
    "Wrong call! The truth was stranger.",
    "You doubted the truth. It happens.",
    "That was actually true, believe it or not."
  ],
  unsure: [
    "Honesty is wisdom. It's tricky.",
    "Being uncertain is part of the process.",
    "Not all statements are clear-cut.",
    "Wisdom knows when to pause.",
    "Uncertainty is a sign of critical thinking.",
    "Some things are hard to judge.",
    "It's okay to be unsure."
  ],
  skip: [
    "Skipped. On to the next one.",
    "Some mysteries remain...",
    "Curious. What would you have chosen?",
    "Another statement awaits."
  ]
};

// ── Initialize ──
function init() {
  loadSave();
  setConfidence();
  loadNextStatement();
  setupEventListeners();
  resizeCanvas();
  animateShadows();
}

// ── Statement Loading ──
function loadNextStatement() {
  isLocked = false;

  // Pick a random un-used statement, or reset pool
  if (usedIndices.length >= STATEMENTS.length) {
    usedIndices = [];
  }

  let idx;
  do {
    idx = Math.floor(Math.random() * STATEMENTS.length);
  } while (usedIndices.includes(idx));
  usedIndices.push(idx);

  currentStatement = STATEMENTS[idx];

  // Clear card styling and set new content
  statementCard.classList.remove('judged-truth', 'judged-lie', 'judged-unsure');
  categoryEl.textContent = `${CATEGORY_ICONS[currentStatement.category] || '⚖️'} ${currentStatement.category || 'general'}`;
  textEl.textContent = currentStatement.text;
  sourceEl.textContent = `— ${currentStatement.source}`;

  // Enable verdict buttons
  document.querySelectorAll('.verdict-btn').forEach(b => b.disabled = false);

  // Reset confidence slider
  confidenceSlider.value = 50;
  setConfidence();
}

function setConfidence() {
  confidenceValue.textContent = `${confidenceSlider.value}%`;
}

// ── Verdict ──
function judge(verdict) {
  if (isLocked || !currentStatement) return;
  isLocked = true;

  document.querySelectorAll('.verdict-btn').forEach(b => b.disabled = true);

  const isCorrect = (verdict === 'truth' && currentStatement.isTruth) ||
                    (verdict === 'lie' && !currentStatement.isTruth);

  // Update stats
  stats[verdict + 's']++;
  totalJudged++;

  if (isCorrect) {
    correctJudgments++;
    stats.streak++;
    if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
  } else {
    stats.streak = 0;
  }

  streakCount.textContent = stats.streak;

  // Apply card styling
  statementCard.classList.add(`judged-${verdict}`);

  // Build feedback message
  let msg;
  if (isCorrect) {
    msg = randomFrom(FEEDBACK_MESSAGES[`${verdict}_correct`]);
    if (currentStatement.explanation) {
      msg += ` ${currentStatement.explanation}`;
    }
  } else {
    if (verdict === 'unsure') {
      // When unsure & wrong: just say the correct answer simply
      msg = randomFrom(FEEDBACK_MESSAGES.unsure);
    } else {
      msg = randomFrom(FEEDBACK_MESSAGES[`${verdict}_incorrect`]);
      if (currentStatement.explanation) {
        msg += ` ${currentStatement.explanation}`;
      }
    }
  }

  showFeedback(msg, verdict, isCorrect);

  // Background effect
  bgLayer.className = 'bg-layer';
  if (verdict === 'truth' && isCorrect) {
    bgLayer.classList.add('truth-mode');
  } else if (verdict === 'lie' && isCorrect) {
    bgLayer.classList.add('lie-mode');
  }

  // Add to history
  addToHistory(currentStatement.text, verdict, isCorrect);

  // Update UI
  updateStats();
  updateMeter();
  autosave();

  // Spawn shadows
  spawnShadowBurst(verdict === 'truth' ? '#22c55e' : verdict === 'lie' ? '#ef4444' : '#eab308');
}

function showFeedback(msg, verdict, isCorrect) {
  if (feedbackTimeout) clearTimeout(feedbackTimeout);

  feedbackBubble.className = 'feedback-bubble';
  feedbackText.textContent = msg;

  if (isCorrect) {
    feedbackBubble.classList.add(`feedback-${verdict}`);
  } else if (verdict === 'truth') {
    feedbackBubble.classList.add('feedback-lie');
  } else if (verdict === 'lie') {
    feedbackBubble.classList.add('feedback-truth');
  } else {
    feedbackBubble.classList.add('feedback-unsure');
  }

  feedbackTimeout = setTimeout(() => {
    feedbackText.textContent = 'judge another statement or click skip →';
    feedbackBubble.className = 'feedback-bubble';
  }, 3000);
}

// ── Skip — manual only, no auto-advance ──
function skipStatement() {
  // Cancel feedback timeout
  if (feedbackTimeout) clearTimeout(feedbackTimeout);

  // Reset UI
  feedbackBubble.className = 'feedback-bubble';
  feedbackText.textContent = randomFrom(FEEDBACK_MESSAGES.skip);
  bgLayer.className = 'bg-layer';
  statementCard.classList.remove('judged-truth', 'judged-lie', 'judged-unsure');

  // Force load next statement immediately
  isLocked = false;
  loadNextStatement();
}

// ── History ──
function addToHistory(text, verdict, isCorrect) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  history.unshift({ text: text.slice(0, 50) + (text.length > 50 ? '...' : ''), verdict, isCorrect, time });
  if (history.length > 50) history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">no judgments yet</div>';
    return;
  }

  history.forEach(h => {
    const div = document.createElement('div');
    div.className = `history-item h-${h.verdict}`;
    const verdictIcon = h.verdict === 'truth' ? (h.isCorrect ? '✓' : '✗') :
                        h.verdict === 'lie' ? (h.isCorrect ? '✓' : '✗') : '?';
    div.innerHTML = `
      <span class="h-verdict" style="color: ${h.isCorrect ? 'var(--truth)' : 'var(--lie)'}">${verdictIcon}</span>
      <span class="h-text">${escapeHtml(h.text)}</span>
      <span class="h-time">${h.time}</span>
    `;
    historyList.appendChild(div);
  });
}

function clearHistory() {
  history = [];
  renderHistory();
  autosave();
}

// ── Stats & Meter ──
function updateStats() {
  truthCount.textContent = stats.truths;
  lieCount.textContent = stats.lies;
  unsureCount.textContent = stats.unsure;
  streakCount.textContent = stats.streak;
}

function updateMeter() {
  const pct = totalJudged > 0 ? Math.round((correctJudgments / totalJudged) * 100) : 0;
  meterFill.style.width = `${pct}%`;
  truthScoreEl.textContent = `${pct}%`;

  truthScoreEl.className = 'truth-score';
  if (pct >= 70) truthScoreEl.classList.add('high');
  else if (pct <= 40) truthScoreEl.classList.add('low');
  else truthScoreEl.classList.add('mid');
}

// ── Shadow Particles Canvas ──
function resizeCanvas() {
  shadowCanvas.width = window.innerWidth;
  shadowCanvas.height = window.innerHeight;
}

function spawnShadowBurst(color) {
  const cx = shadowCanvas.width / 2;
  const cy = shadowCanvas.height / 2;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
    const speed = 1 + Math.random() * 2;
    shadowParticles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color: color,
      size: 2 + Math.random() * 3
    });
  }
}

function animateShadows() {
  ctx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  for (let i = shadowParticles.length - 1; i >= 0; i--) {
    const p = shadowParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.01;

    if (p.life <= 0) {
      shadowParticles.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.round(p.life * 40).toString(16).padStart(2, '0');
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, (p.size * 3) * p.life, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.round(p.life * 10).toString(16).padStart(2, '0');
    ctx.fill();
  }

  if (shadowParticles.length < 20 && Math.random() < 0.05) {
    shadowParticles.push({
      x: Math.random() * shadowCanvas.width,
      y: Math.random() * shadowCanvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 1,
      color: '#6a82fb',
      size: 1 + Math.random() * 2
    });
  }

  animFrame = requestAnimationFrame(animateShadows);
}

// ── Reset ──
function resetAll() {
  if (!confirm('Reset all progress? This cannot be undone.')) return;

  stats = { truths: 0, lies: 0, unsure: 0, streak: 0, bestStreak: 0 };
  totalJudged = 0;
  correctJudgments = 0;
  history = [];
  usedIndices = [];

  updateStats();
  updateMeter();
  renderHistory();
  autosave();
  isLocked = false;
  loadNextStatement();
  showFeedback('Progress reset. Starting fresh.', 'unsure', true);
  bgLayer.className = 'bg-layer';
}

// ── Save / Load ──
function autosave() {
  try {
    localStorage.setItem('frifi_save', JSON.stringify({
      stats, totalJudged, correctJudgments, history, usedIndices
    }));
  } catch (_) {}
}

function loadSave() {
  try {
    const raw = localStorage.getItem('frifi_save');
    if (!raw) return;
    const data = JSON.parse(raw);
    stats = data.stats || { truths: 0, lies: 0, unsure: 0, streak: 0, bestStreak: 0 };
    totalJudged = data.totalJudged || 0;
    correctJudgments = data.correctJudgments || 0;
    history = data.history || [];
    usedIndices = data.usedIndices || [];
    updateStats();
    updateMeter();
    renderHistory();
  } catch (_) {}
}

// ── Helpers ──
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ── Event Listeners ──
function setupEventListeners() {
  document.getElementById('truthBtn').addEventListener('click', () => judge('truth'));
  document.getElementById('lieBtn').addEventListener('click', () => judge('lie'));
  document.getElementById('unsureBtn').addEventListener('click', () => judge('unsure'));

  skipBtn.addEventListener('click', skipStatement);
  resetBtn.addEventListener('click', resetAll);
  clearHistoryBtn.addEventListener('click', clearHistory);

  confidenceSlider.addEventListener('input', setConfidence);
  window.addEventListener('resize', resizeCanvas);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === '1') judge('truth');
  else if (e.key === '2') judge('lie');
  else if (e.key === '3') judge('unsure');
  else if (e.key === ' ' || e.key === 's') { e.preventDefault(); skipStatement(); }
});

// ── Start ──
init();