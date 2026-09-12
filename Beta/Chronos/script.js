// ====== CHRONOS — Focus Timer & Productivity Dashboard ======

// ====== DOM REFS ======
const timerDisplay   = document.getElementById("timerDisplay");
const ringProgress   = document.getElementById("ringProgress");
const ringDot        = document.getElementById("ringDot");
const startBtn       = document.getElementById("startBtn");
const pauseBtn       = document.getElementById("pauseBtn");
const resetBtn       = document.getElementById("resetBtn");
const modeBtns       = document.querySelectorAll(".mode-btn");
const customModeBtn  = document.getElementById("customModeBtn");
const customDuration = document.getElementById("customDuration");
const decMinBtn      = document.getElementById("decMinBtn");
const incMinBtn      = document.getElementById("incMinBtn");
const customMinutes  = document.getElementById("customMinutes");
const applyCustomBtn = document.getElementById("applyCustomBtn");
const sessionCountEl = document.getElementById("sessionCount");

const taskForm       = document.getElementById("taskForm");
const taskInput      = document.getElementById("taskInput");
const taskPriority   = document.getElementById("taskPriority");
const taskList       = document.getElementById("taskList");
const taskCountEl    = document.getElementById("taskCount");

const statSessions = document.getElementById("statSessions");
const statMinutes  = document.getElementById("statMinutes");
const statTasks    = document.getElementById("statTasks");
const statStreak   = document.getElementById("statStreak");
const weeklyBars   = document.getElementById("weeklyBars");

const historyList   = document.getElementById("historyList");
const clearHistBtn  = document.getElementById("clearHistoryBtn");

const bellSound      = document.getElementById("bellSound");
const confettiCanvas = document.getElementById("confettiCanvas");
const CIRCUMFERENCE  = 2 * Math.PI * 100; // 628.318...

// ====== STATE ======
const STATE = {
  minutes: 25,
  seconds: 0,
  totalSeconds: 25 * 60,
  originalTotal: 25 * 60,
  isRunning: false,
  isPaused: false,
  interval: null,
  isCustomMode: false,
  customMinutes: 25,
};

// ====== CONFETTI STATE ======
let confettiPieces = [];
let confettiRunning = false;
const CONFETTI_COLORS = ["#6c63ff", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ffffff"];

// ====== LOCALSTORAGE ======
function loadData() {
  try {
    const raw = localStorage.getItem("chronos_data");
    if (!raw) return defaultData();
    const data = JSON.parse(raw);
    // ensure all keys exist (version-safe)
    return { ...defaultData(), ...data };
  } catch {
    return defaultData();
  }
}

function defaultData() {
  return {
    sessions: [],       // { date, minutes, mode, timestamp }
    tasks: [],          // { id, text, done, createdAt, priority }
    streak: 0,
    lastActiveDate: null,
  };
}

function saveData() {
  localStorage.setItem("chronos_data", JSON.stringify(DATA));
}

let DATA = loadData();

// ====== SVG GRADIENT ======
(function injectGradient() {
  const svg = document.querySelector(".ring-svg");
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6c63ff" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  `;
  svg.prepend(defs);
})();

// ====== TIMER LOGIC ======
function setMode(minutes, custom = false) {
  if (STATE.isRunning) return;
  STATE.minutes = minutes;
  STATE.seconds = 0;
  STATE.totalSeconds = minutes * 60;
  STATE.originalTotal = STATE.totalSeconds;
  STATE.isCustomMode = custom;
  if (custom) STATE.customMinutes = minutes;
  updateDisplay();
  updateRing(1);
  modeBtns.forEach((btn) => {
    if (btn.id === "customModeBtn") {
      btn.classList.toggle("active", custom);
    } else {
      btn.classList.toggle("active", !custom && parseInt(btn.dataset.minutes) === minutes);
    }
  });
  if (customDuration) customDuration.hidden = !custom;
}

function updateDisplay() {
  const m = String(STATE.minutes).padStart(2, "0");
  const s = String(STATE.seconds).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
  document.title = `(${m}:${s}) Chronos`;
}

function updateRing(fraction) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const offset = CIRCUMFERENCE * (1 - clamped);
  ringProgress.style.strokeDashoffset = offset;
  const angle = (1 - clamped) * Math.PI * 2;
  const center = 110;
  const radius = 100;
  const dx = Math.sin(angle) * radius;
  const dy = -Math.cos(angle) * radius;
  ringDot.setAttribute("cx", center + dx);
  ringDot.setAttribute("cy", center + dy);
}

function tick() {
  if (STATE.isPaused) return;
  if (STATE.totalSeconds <= 0) {
    completeSession();
    return;
  }
  STATE.totalSeconds--;
  STATE.minutes = Math.floor(STATE.totalSeconds / 60);
  STATE.seconds = STATE.totalSeconds % 60;
  updateDisplay();
  updateRing(STATE.totalSeconds / STATE.originalTotal);
}

function completeSession() {
  // Capture the actual original minutes from the active mode before resetting
  const active = document.querySelector(".mode-btn.active:not(#customModeBtn)");
  const custom = STATE.isCustomMode;
  const sessionMinutes = custom ? STATE.customMinutes : (active ? parseInt(active.dataset.minutes) : 25);
  const modeLabel = custom ? `Custom ${sessionMinutes}m` : (active ? active.textContent.trim() : "Focus");

  stopTimer();
  playBell();
  launchConfetti();

  // Record session
  const session = {
    date: todayStr(),
    minutes: sessionMinutes,
    mode: modeLabel,
    timestamp: Date.now(),
  };
  DATA.sessions.push(session);

  // Track streak
  updateStreak();

  saveData();
  renderHistory();
  renderStats();

  // Update session count display
  const todaySessions = DATA.sessions.filter((s) => s.date === todayStr());
  sessionCountEl.textContent = todaySessions.length;

  // Auto-reset to current mode duration
  if (custom) {
    setMode(sessionMinutes, true);
  } else {
    setMode(sessionMinutes);
  }
}

function getModeLabel() {
  const active = document.querySelector(".mode-btn.active");
  return active ? active.textContent.trim() : "Focus";
}

function playBell() {
  try {
    bellSound.currentTime = 0;
    bellSound.play().catch(() => {});
  } catch {}
}

function startTimer() {
  if (STATE.totalSeconds <= 0) {
    if (STATE.isCustomMode) {
      setMode(STATE.customMinutes, true);
    } else {
      const active = document.querySelector(".mode-btn.active:not(#customModeBtn)");
      setMode(active ? parseInt(active.dataset.minutes) : 25);
    }
  }
  if (STATE.isRunning) return;
  STATE.isRunning = true;
  STATE.isPaused = false;
  STATE.interval = setInterval(tick, 1000);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
}

function pauseTimer() {
  if (!STATE.isRunning) return;
  STATE.isPaused = !STATE.isPaused;
  pauseBtn.textContent = STATE.isPaused ? "▶ Resume" : "⏸ Pause";
}

function stopTimer() {
  STATE.isRunning = false;
  STATE.isPaused = false;
  clearInterval(STATE.interval);
  STATE.interval = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = "⏸ Pause";
}

function resetTimer() {
  stopTimer();
  if (STATE.isCustomMode) {
    setMode(STATE.customMinutes, true);
  } else {
    const active = document.querySelector(".mode-btn.active:not(#customModeBtn)");
    setMode(active ? parseInt(active.dataset.minutes) : 25);
  }
}

// ====== STREAK ======
function updateStreak() {
  const today = todayStr();
  if (!DATA.lastActiveDate) {
    DATA.streak = 1;
    DATA.lastActiveDate = today;
    return;
  }

  const last = DATA.lastActiveDate;
  const yesterday = yesterdayStr();

  if (last === today) {
    // already logged today, keep streak
    return;
  }

  if (last === yesterday) {
    DATA.streak++;
  } else {
    // missed a day → reset
    DATA.streak = 1;
  }
  DATA.lastActiveDate = today;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ====== TASKS ======
const PRIO_ORDER = { high: 0, med: 1, low: 2 };

function addTask(text, priority = "med") {
  text = text.trim();
  if (!text) return;
  if (!["low", "med", "high"].includes(priority)) priority = "med";
  const task = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    done: false,
    createdAt: Date.now(),
    priority,
  };
  DATA.tasks.push(task);
  saveData();
  renderTasks();
  renderStats();
  taskInput.value = "";
  taskInput.focus();
}

function toggleTask(id) {
  const task = DATA.tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveData();
    renderTasks();
    renderStats();
  }
}

function cyclePriority(id) {
  const task = DATA.tasks.find((t) => t.id === id);
  if (!task) return;
  if (!task.priority) task.priority = "med";
  const next = { high: "med", med: "low", low: "high" };
  task.priority = next[task.priority];
  saveData();
  renderTasks();
}

function deleteTask(id) {
  DATA.tasks = DATA.tasks.filter((t) => t.id !== id);
  saveData();
  renderTasks();
  renderStats();
}

function renderTasks() {
  taskList.innerHTML = "";
  if (!DATA.tasks.length) {
    taskList.innerHTML = '<li class="empty-msg" style="padding:1rem 0;">No tasks yet. Add one above!</li>';
    taskCountEl.textContent = "0";
    return;
  }

  const done = DATA.tasks.filter((t) => t.done).length;
  taskCountEl.textContent = `${done}/${DATA.tasks.length}`;

  const sorted = [...DATA.tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done - b.done;
    const pa = PRIO_ORDER[a.priority] ?? 1;
    const pb = PRIO_ORDER[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    return b.createdAt - a.createdAt;
  });

  sorted.forEach((task) => {
    const prio = task.priority && ["low", "med", "high"].includes(task.priority) ? task.priority : "med";
    const li = document.createElement("li");
    li.className = `task-item prio-${prio}` + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const prioDot = document.createElement("span");
    prioDot.className = `prio-dot ${prio}`;
    prioDot.title = `Priority: ${prio.toUpperCase()} — click badge to cycle`;
    prioDot.addEventListener("click", (e) => { e.stopPropagation(); cyclePriority(task.id); });

    const check = document.createElement("span");
    check.className = "task-check";
    check.textContent = "✓";
    check.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    text.addEventListener("click", () => toggleTask(task.id));

    const badge = document.createElement("span");
    badge.className = `prio-badge ${prio}`;
    badge.textContent = prio.toUpperCase();
    badge.title = "Click to cycle priority";
    badge.style.cursor = "pointer";
    badge.addEventListener("click", (e) => { e.stopPropagation(); cyclePriority(task.id); });

    const del = document.createElement("button");
    del.className = "task-delete";
    del.textContent = "✕";
    del.title = "Delete task";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    li.appendChild(prioDot);
    li.appendChild(check);
    li.appendChild(text);
    li.appendChild(badge);
    li.appendChild(del);
    taskList.appendChild(li);
  });
}

// ====== STATS ======
function renderStats() {
  const today = todayStr();
  const todaySessions = DATA.sessions.filter((s) => s.date === today);
  const totalMinutes = todaySessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  const doneTasks = DATA.tasks.filter((t) => t.done).length;

  statSessions.textContent = todaySessions.length;
  statMinutes.textContent = Math.round(totalMinutes);
  statTasks.textContent = doneTasks;
  statStreak.textContent = DATA.streak || 0;

  sessionCountEl.textContent = todaySessions.length;

  renderWeeklyBars();
}

// ====== WEEKLY BARS ======
function dateNDaysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function shortDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
}

function renderWeeklyBars() {
  if (!weeklyBars) return;
  weeklyBars.innerHTML = "";
  const today = todayStr();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const ds = dateNDaysAgoStr(i);
    const daySessions = DATA.sessions.filter((s) => s.date === ds);
    const minutes = daySessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const count = daySessions.length;
    days.push({ dateStr: ds, minutes, count });
  }
  const maxMin = Math.max(1, ...days.map((d) => d.minutes));
  const maxHeight = 52;
  days.forEach((d) => {
    const isToday = d.dateStr === today;
    const wrap = document.createElement("div");
    wrap.className = "weekly-bar-item" + (isToday ? " today" : "");

    const bar = document.createElement("div");
    bar.className = "weekly-bar" + (isToday ? " today" : "");
    const h = Math.max(d.minutes > 0 ? 4 : 2, Math.round((d.minutes / maxMin) * maxHeight));
    bar.style.height = h + "px";
    bar.setAttribute(
      "data-tip",
      `${d.dateStr}: ${d.count} session${d.count === 1 ? "" : "s"} · ${Math.round(d.minutes)} min`
    );

    const label = document.createElement("span");
    label.className = "weekly-day-label";
    label.textContent = shortDayLabel(d.dateStr);

    wrap.appendChild(bar);
    wrap.appendChild(label);
    weeklyBars.appendChild(wrap);
  });
}

// ====== CONFETTI ENGINE ======
function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfettiCanvas();
window.addEventListener("resize", resizeConfettiCanvas);

function drawConfetti() {
  if (!confettiCanvas) return;
  const cctx = confettiCanvas.getContext("2d");
  cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach((p) => {
    p.life -= p.decay;
    if (p.life <= 0) return;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.vx *= 0.995;
    p.rot += p.vrot;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.globalAlpha = Math.max(0, p.life);
    cctx.fillStyle = p.color;
    if (p.shape === "rect") {
      cctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
    } else {
      cctx.beginPath();
      cctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      cctx.fill();
    }
    cctx.restore();
  });
  confettiPieces = confettiPieces.filter((p) => p.life > 0 && p.y < confettiCanvas.height + 40);
  if (confettiPieces.length > 0) {
    requestAnimationFrame(drawConfetti);
  } else {
    confettiRunning = false;
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

function launchConfetti() {
  if (!confettiCanvas) return;
  const W = confettiCanvas.width;
  const H = confettiCanvas.height;
  const centerX = W / 2;
  const centerY = H / 2.2;
  const pieces = [];
  for (let i = 0; i < 160; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 9;
    pieces.push({
      x: centerX + (Math.random() - 0.5) * 100,
      y: centerY + (Math.random() - 0.5) * 60,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 4 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      life: 1,
      decay: 0.005 + Math.random() * 0.009,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    });
  }
  confettiPieces = confettiPieces.concat(pieces);
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(drawConfetti);
  }
}

// ====== HISTORY ======
function renderHistory() {
  historyList.innerHTML = "";
  const recent = [...DATA.sessions].reverse().slice(0, 30);
  if (!recent.length) {
    historyList.innerHTML = '<p class="empty-msg">No sessions recorded yet. Start focusing!</p>';
    return;
  }

  recent.forEach((s) => {
    const div = document.createElement("div");
    div.className = "history-item";

    const label = document.createElement("span");
    label.className = "h-label";
    label.textContent = `${s.mode} · ${Math.round(s.minutes)} min`;

    const time = document.createElement("span");
    time.className = "h-time";
    time.textContent = formatTimestamp(s.timestamp);

    div.appendChild(label);
    div.appendChild(time);
    historyList.appendChild(div);
  });
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function clearHistory() {
  if (!DATA.sessions.length) return;
  if (!confirm("Clear all session history?")) return;
  DATA.sessions = [];
  DATA.streak = 0;
  DATA.lastActiveDate = null;
  saveData();
  renderHistory();
  renderStats();
}

// ====== MODE SWITCHING ======
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.id === "customModeBtn") {
      if (STATE.isRunning && !confirm("Stop current session and switch to custom mode?")) return;
      if (STATE.isRunning) stopTimer();
      modeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const val = parseInt(customMinutes.value) || 25;
      setMode(Math.max(1, Math.min(180, val)), true);
      return;
    }
    if (STATE.isRunning && !confirm("Stop current session and switch mode?")) return;
    if (STATE.isRunning) stopTimer();
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setMode(parseInt(btn.dataset.minutes));
  });
});

// ====== CUSTOM DURATION STEPPER ======
if (decMinBtn) {
  decMinBtn.addEventListener("click", () => {
    const cur = parseInt(customMinutes.value) || 25;
    customMinutes.value = Math.max(1, cur - 1);
  });
}
if (incMinBtn) {
  incMinBtn.addEventListener("click", () => {
    const cur = parseInt(customMinutes.value) || 25;
    customMinutes.value = Math.min(180, cur + 1);
  });
}
if (applyCustomBtn) {
  applyCustomBtn.addEventListener("click", () => {
    if (STATE.isRunning && !confirm("Stop current session and apply custom duration?")) return;
    if (STATE.isRunning) stopTimer();
    const val = parseInt(customMinutes.value);
    if (!isNaN(val) && val >= 1 && val <= 180) {
      setMode(val, true);
    }
  });
}

// ====== EVENT LISTENERS ======
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value, taskPriority ? taskPriority.value : "med");
  if (taskPriority) taskPriority.value = "med";
});

clearHistBtn.addEventListener("click", clearHistory);

// Keyboard shortcut: Enter to start/pause (when not focused on input)
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
  if (e.key === " " || e.key === "Space") {
    e.preventDefault();
    if (STATE.isRunning && !STATE.isPaused) {
      pauseTimer();
    } else {
      startTimer();
    }
  }
  if (e.key === "r" || e.key === "R") {
    resetTimer();
  }
});

// ====== INIT ======
setMode(25);
renderTasks();
renderHistory();
renderStats();