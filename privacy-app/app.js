const tasks = [
  'I use a password manager for every account.',
  'I enable two-factor authentication when available.',
  'I review app permissions on my phone and browser.',
  'I keep my operating system and apps updated.'
];

const tips = [
  'Use a password manager so every account gets a unique, hard-to-guess passphrase.',
  'Turn on recovery codes and store them somewhere safe in case you lose access.',
  'Review app permissions often and remove anything you no longer use.',
  'A private browser session can reduce tracking during sensitive searches.'
];

const missions = [
  'Today’s mission: review one app permission.',
  'Today’s mission: update one password to a stronger passphrase.',
  'Today’s mission: turn on 2FA for one important account.',
  'Today’s mission: clear one old browser session or cookie trail.'
];
const badges = [
  { id: 'first-step', name: 'First Step', description: 'Complete your first habit', icon: '🌱', condition: (state, streak) => state.length >= 1 },
  { id: 'half-way', name: 'Half Way There', description: 'Complete 2 habits', icon: '🔓', condition: (state, streak) => state.length >= 2 },
  { id: 'all-in', name: 'All-In', description: 'Complete all 4 daily habits', icon: '🛡️', condition: (state, streak) => state.length >= 4 },
  { id: 'on-fire', name: 'On Fire', description: 'Build a 7-day streak', icon: '🔥', condition: (state, streak) => streak >= 7 },
  { id: 'legend', name: 'Streak Legend', description: 'Reach a 30-day streak', icon: '⭐', condition: (state, streak) => streak >= 30 },
  { id: 'dedicated', name: 'Dedicated', description: 'Complete 50 total habits', icon: '💎', condition: (state, streak) => (Number(localStorage.getItem('total-completed') || 0) >= 50) }
];
const checklist = document.getElementById('checklist');
const scoreValue = document.getElementById('scoreValue');
const scoreFill = document.getElementById('scoreFill');
const habitCount = document.getElementById('habitCount');
const insightSummary = document.getElementById('insightSummary');
const insightHabits = document.getElementById('insightHabits');
const insightShield = document.getElementById('insightShield');
const tipText = document.getElementById('tipText');
const tipButton = document.getElementById('tipButton');
const actionStatus = document.getElementById('actionStatus');
const modeButton = document.getElementById('modeButton');
const themeButton = document.getElementById('themeButton');
const resetButton = document.getElementById('resetButton');
const ringProgress = document.getElementById('ringProgress');
const ringPercent = document.getElementById('ringPercent');
const activityLog = document.getElementById('activityLog');
const notificationBox = document.getElementById('notificationBox');
const historySegments = Array.from(document.querySelectorAll('.history-segment'));
const streakValue = document.getElementById('streakValue');
const streakButton = document.getElementById('streakButton');
const missionText = document.getElementById('missionText');
const missionButton = document.getElementById('missionButton');
const badgesContainer = document.getElementById('badgesContainer');

let savedState = JSON.parse(localStorage.getItem('privacy-checklist') || '[]');
let currentTip = 0;
let currentMission = 0;
let streakCount = Number(localStorage.getItem('juilous-streak') || 0);
let unlockedBadges = JSON.parse(localStorage.getItem('unlocked-badges') || '[]');

function updateInsights() {
  const completed = savedState.length;
  const percent = Math.round((completed / tasks.length) * 100);
  habitCount.textContent = `${completed} of ${tasks.length} completed`;
  insightHabits.textContent = `${completed} habits strengthened`;

  historySegments.forEach((segment, index) => {
    segment.classList.toggle('active', index < Math.max(1, Math.round(percent / 25)));
  });

  if (percent >= 75) {
    insightShield.textContent = 'Shield level: strong';
    insightSummary.textContent = 'Your digital shield is looking strong.';
  } else if (percent >= 50) {
    insightShield.textContent = 'Shield level: solid';
    insightSummary.textContent = 'Your protection is growing nicely.';
  } else {
    insightShield.textContent = 'Shield level: low';
    insightSummary.textContent = 'A steady start builds stronger protection.';
  }
}

function updateScore() {
  const completed = checklist.querySelectorAll('.completed').length;
  const percent = Math.round((completed / tasks.length) * 100);
  scoreValue.textContent = `${percent}%`;
  scoreFill.style.width = `${percent}%`;
  ringPercent.textContent = `${percent}%`;
  const offset = 301.59 - (301.59 * percent) / 100;
  ringProgress.style.strokeDashoffset = offset;
  updateInsights();
}

function render() {
  savedState = JSON.parse(localStorage.getItem('privacy-checklist') || '[]');
  checklist.innerHTML = '';

  tasks.forEach((task, index) => {
    const isCompleted = savedState.includes(index);
    const item = document.createElement('label');
    item.className = `check-item${isCompleted ? ' completed' : ''}`;

    item.innerHTML = `
      <input type="checkbox" ${isCompleted ? 'checked' : ''} data-index="${index}" />
      <span>${task}</span>
    `;

    item.querySelector('input').addEventListener('change', (event) => {
      const idx = Number(event.target.dataset.index);
      const nextState = event.target.checked
        ? [...new Set([...savedState, idx])]
        : savedState.filter((value) => value !== idx);

      localStorage.setItem('privacy-checklist', JSON.stringify(nextState));
      const totalCompleted = Number(localStorage.getItem('total-completed') || 0) + (event.target.checked ? 1 : -1);
      localStorage.setItem('total-completed', String(Math.max(0, totalCompleted)));
      savedState = nextState;
      render();
      checkBadges();
    });

    checklist.appendChild(item);
  });

  updateScore();
}

function showNextTip() {
  currentTip = (currentTip + 1) % tips.length;
  tipText.textContent = tips[currentTip];
}

function updateStreak() {
  streakValue.textContent = `${streakCount} day${streakCount === 1 ? '' : 's'}`;
}

function checkBadges() {
  const newlyUnlocked = [];
  badges.forEach((badge) => {
    const isUnlocked = unlockedBadges.includes(badge.id);
    const shouldUnlock = badge.condition(savedState, streakCount);
    
    if (shouldUnlock && !isUnlocked) {
      unlockedBadges.push(badge.id);
      localStorage.setItem('unlocked-badges', JSON.stringify(unlockedBadges));
      newlyUnlocked.push(badge);
    }
  });
  
  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach((badge) => {
      notificationBox.innerHTML = `🎉 <strong>Badge Unlocked!</strong> ${badge.icon} ${badge.name}: ${badge.description}`;
      const logEntry = document.createElement('div');
      logEntry.textContent = `• Earned badge: ${badge.name}`;
      activityLog.prepend(logEntry);
    });
  }
  
  renderBadges();
}

function renderBadges() {
  badgesContainer.innerHTML = '';
  badges.forEach((badge) => {
    const isUnlocked = unlockedBadges.includes(badge.id);
    const badgeEl = document.createElement('div');
    badgeEl.className = `badge${isUnlocked ? ' unlocked' : ' locked'}`;
    badgeEl.title = badge.description;
    badgeEl.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-desc">${badge.description}</div>
    `;
    badgesContainer.appendChild(badgeEl);
  });
}

function showNextMission() {
  currentMission = (currentMission + 1) % missions.length;
  missionText.textContent = missions[currentMission];
}

function toggleMode() {
  const isFocus = document.body.classList.toggle('focus-mode');
  localStorage.setItem('juilous-mode', isFocus ? 'focus' : 'calm');
  modeButton.textContent = isFocus ? 'Switch to calm mode' : 'Switch to focus mode';
}

function toggleTheme() {
  document.body.classList.toggle('glow-theme');
  const active = document.body.classList.contains('glow-theme');
  themeButton.textContent = active ? 'Switch to soft theme' : 'Toggle glow theme';
  notificationBox.textContent = active
    ? 'Glow mode enabled: your privacy dashboard feels brighter and more focused.'
    : 'Glow mode disabled: a calmer look is now active.';
}

function resetChecklist() {
  localStorage.removeItem('privacy-checklist');
  savedState = [];
  render();
  actionStatus.textContent = 'Checklist reset. You can start fresh again.';
  activityLog.innerHTML = '<strong>Reset complete.</strong> A fresh privacy routine begins now.';
}

function addStreak() {
  streakCount += 1;
  localStorage.setItem('juilous-streak', String(streakCount));
  updateStreak();
  notificationBox.textContent = `Streak updated: you are on a ${streakCount}-day privacy run.`;
  const logEntry = document.createElement('div');
  logEntry.textContent = `• Privacy streak increased to ${streakCount} days.`;
  activityLog.prepend(logEntry);
  checkBadges();
}

Array.from(document.querySelectorAll('.action-btn')).forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    let message = '';
    if (action === 'browser') {
      message = 'Browser privacy tightened: block third-party cookies and clear old sessions.';
    } else if (action === 'permissions') {
      message = 'Permission review started: remove unused access from apps and websites.';
    } else {
      message = 'Recovery codes backed up: keep them in a secure offline place.';
    }

    actionStatus.textContent = message;
    const logEntry = document.createElement('div');
    logEntry.textContent = `• ${message}`;
    activityLog.prepend(logEntry);
  });
});

tipButton.addEventListener('click', showNextTip);
modeButton.addEventListener('click', toggleMode);
themeButton.addEventListener('click', toggleTheme);
resetButton.addEventListener('click', resetChecklist);
streakButton.addEventListener('click', addStreak);
missionButton.addEventListener('click', showNextMission);

const savedMode = localStorage.getItem('juilous-mode');
if (savedMode === 'focus') {
  document.body.classList.add('focus-mode');
  modeButton.textContent = 'Switch to calm mode';
}

updateStreak();
render();
showNextTip();
showNextMission();
renderBadges();
