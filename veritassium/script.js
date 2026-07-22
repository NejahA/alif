const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const timezoneEl = document.getElementById('timezone');
const canvas = document.getElementById('analogClock');
const ctx = canvas.getContext('2d');
const toggleFormatBtn = document.getElementById('toggleFormat');
const toggleSecondsBtn = document.getElementById('toggleSeconds');
const toggleThemeBtn = document.getElementById('toggleTheme');
const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
const worldClockList = document.getElementById('worldClockList');
const addTimezone = document.getElementById('addTimezone');

let use24h = true;
let showSeconds = true;

const savedTimezones = JSON.parse(localStorage.getItem('veritassium_timezones') || '[]');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatTime(hours, minutes, seconds) {
  let h = hours;
  let suffix = '';
  if (!use24h) {
    suffix = h >= 12 ? ' PM' : ' AM';
    h = h % 12;
    if (h === 0) h = 12;
  }
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  return showSeconds ? `${hh}:${mm}:${ss}${suffix}` : `${hh}:${mm}${suffix}`;
}

function drawAnalogClock(hours, minutes, seconds) {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = cx - 12;
  const isDark = document.body.getAttribute('data-theme') !== 'light';

  ctx.clearRect(0, 0, w, h);

  // Used computed styles for colors
  const style = getComputedStyle(document.body);
  const tickColor = style.getPropertyValue('--tick-color').trim() || (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)');
  const handColor = style.getPropertyValue('--hand-color').trim() || (isDark ? '#fff' : '#1a1a2e');
  const accentColor = '#f5576c';

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = tickColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tick marks
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isHour = i % 5 === 0;
    const inner = r - (isHour ? 12 : 6);
    const outer = r - 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.strokeStyle = isHour ? handColor : tickColor;
    ctx.lineWidth = isHour ? 2.5 : 1;
    ctx.stroke();
  }

  // Hour numbers
  ctx.fillStyle = handColor;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const nr = r - 22;
    ctx.fillText(i, cx + Math.cos(angle) * nr, cy + Math.sin(angle) * nr);
  }

  // Hour hand
  const hrAngle = ((hours % 12) / 12 + minutes / 720) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hrAngle) * (r * 0.5), cy + Math.sin(hrAngle) * (r * 0.5));
  ctx.strokeStyle = handColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Minute hand
  const minAngle = (minutes / 60 + seconds / 3600) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(minAngle) * (r * 0.68), cy + Math.sin(minAngle) * (r * 0.68));
  ctx.strokeStyle = handColor;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Second hand
  const secAngle = (seconds / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(secAngle) * (r * 0.75), cy + Math.sin(secAngle) * (r * 0.75));
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();
}

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  timeEl.textContent = formatTime(hours, minutes, seconds);
  timezoneEl.textContent = `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;

  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  dateEl.textContent = `${dayName}, ${monthName} ${day}, ${year}`;

  drawAnalogClock(hours, minutes, seconds);
  renderWorldClocks();
}

// World Clocks
function renderWorldClocks() {
  worldClockList.innerHTML = '';
  savedTimezones.forEach((tz, idx) => {
    try {
      const now = new Date();
      const opts = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined, hour12: !use24h };
      const timeStr = new Intl.DateTimeFormat('en-US', opts).format(now);
      const city = tz.split('/').pop().replace(/_/g, ' ');
      const item = document.createElement('div');
      item.className = 'world-clock-item';
      item.innerHTML = `
        <span class="city">${city}</span>
        <span class="wtime">${timeStr}</span>
        <button class="remove-tz" data-index="${idx}">✕</button>
      `;
      item.querySelector('.remove-tz').addEventListener('click', () => {
        savedTimezones.splice(idx, 1);
        localStorage.setItem('veritassium_timezones', JSON.stringify(savedTimezones));
        renderWorldClocks();
      });
      worldClockList.appendChild(item);
    } catch (e) {
      // invalid timezone
    }
  });
}

addTimezone.addEventListener('change', () => {
  const tz = addTimezone.value;
  if (tz && !savedTimezones.includes(tz)) {
    savedTimezones.push(tz);
    localStorage.setItem('veritassium_timezones', JSON.stringify(savedTimezones));
    renderWorldClocks();
  }
  addTimezone.value = '';
});

// Theme toggle
toggleThemeBtn.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') !== 'light';
  document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  toggleThemeBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
});

// Fullscreen
toggleFullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    document.body.classList.add('fullscreen');
  } else {
    document.exitFullscreen();
    document.body.classList.remove('fullscreen');
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    document.body.classList.remove('fullscreen');
  }
});

// Toggle buttons
toggleFormatBtn.addEventListener('click', () => {
  use24h = !use24h;
  toggleFormatBtn.classList.toggle('active');
});

toggleSecondsBtn.addEventListener('click', () => {
  showSeconds = !showSeconds;
  toggleSecondsBtn.classList.toggle('active');
});

// Init
toggleFormatBtn.classList.add('active');
toggleSecondsBtn.classList.add('active');
updateClock();
setInterval(updateClock, 1000);