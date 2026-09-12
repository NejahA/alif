// ====== CHRONOS — Focus Timer & Productivity Dashboard ======

// ====== DOM REFS ======
const timerDisplay   = document.getElementById("timerDisplay");
const ringProgress   = document.getElementById("ringProgress");
const startBtn       = document.getElementById("startBtn");
const pauseBtn       = document.getElementById("pauseBtn");
const resetBtn       = document.getElementById("resetBtn");
const modeBtns       = document.querySelectorAll(".mode-btn");
const sessionCountEl = document.getElementById("sessionCount");

const taskForm    = document.getElementById("taskForm");
const taskInput   = document.getElementById("taskInput");
const taskList    = document.getElementById("taskList");
const taskCountEl = document.getElementById("taskCount");

const statSessions = document.getElementById("statSessions");
const statMinutes  = document.getElementById("statMinutes");
const statTasks    = document.getElementById("statTasks");
const statStreak   = document.getElementById("statStreak");

const historyList   = document.getElementById("historyList");
const clearHistBtn  = document.getElementById("clearHistoryBtn");

const bellSound = document.getElementById("bellSound");
const CIRCUMFERENCE = 2 * Math.PI * 100; // 628.318...

// ====== STATE ======
const STATE = {
  minutes: 25,
  seconds: 0,
  totalSeconds: 25 * 60,
  originalTotal: 25 * 60,  // snapshot when timer starts, for ring fraction
  isRunning: false,
  isPaused: false,
  interval: null,
};

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
    tasks: [],          // { id, text, done, createdAt }
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
function setMode(minutes) {
  if (STATE.isRunning) return;
  STATE.minutes = minutes;
  STATE.seconds = 0;
  STATE.totalSeconds = minutes * 60;
  STATE.originalTotal = STATE.totalSeconds;
  updateDisplay();
  updateRing(1);
  modeBtns.forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.minutes) === minutes);
  });
}

function updateDisplay() {
  const m = String(STATE.minutes).padStart(2, "0");
  const s = String(STATE.seconds).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
  document.title = `(${m}:${s}) Chronos`;
}

function updateRing(fraction) {
  const offset = CIRCUMFERENCE * (1 - fraction);
  ringProgress.style.strokeDashoffset = offset;
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
  const active = document.querySelector(".mode-btn.active");
  const sessionMinutes = active ? parseInt(active.dataset.minutes) : 25;
  const modeLabel = active ? active.textContent.trim() : "Focus";

  stopTimer();
  playBell();

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
  setMode(sessionMinutes);
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
    const active = document.querySelector(".mode-btn.active");
    setMode(active ? parseInt(active.dataset.minutes) : 25);
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
  const active = document.querySelector(".mode-btn.active");
  setMode(active ? parseInt(active.dataset.minutes) : 25);
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
function addTask(text) {
  text = text.trim();
  if (!text) return;
  const task = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    done: false,
    createdAt: Date.now(),
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

  // Show undone first, then done
  const sorted = [...DATA.tasks].sort((a, b) => a.done - b.done || b.createdAt - a.createdAt);

  sorted.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const check = document.createElement("span");
    check.className = "task-check";
    check.textContent = "✓";
    check.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    text.addEventListener("click", () => toggleTask(task.id));

    const del = document.createElement("button");
    del.className = "task-delete";
    del.textContent = "✕";
    del.title = "Delete task";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    li.appendChild(check);
    li.appendChild(text);
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
    if (STATE.isRunning && !confirm("Stop current session and switch mode?")) return;
    if (STATE.isRunning) stopTimer();
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setMode(parseInt(btn.dataset.minutes));
  });
});

// ====== EVENT LISTENERS ======
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value);
});

clearHistBtn.addEventListener("click", clearHistory);

// Keyboard shortcut: Enter to start/pause (when not focused on input)
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.key === " " || e.key === "Space") {
    e.preventDefault();
    if (STATE.isRunning && !STATE.isPaused) {
      pauseTimer();
    } else {
      startTimer();
    }
  }
});

// ====== INIT ======
setMode(25);
renderTasks();
renderHistory();
renderStats();