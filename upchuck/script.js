// ── DOM Refs ──
const creature = document.getElementById('creature');
const mouth = document.getElementById('mouth');
const creatureBody = document.getElementById('creatureBody');
const stomachEl = document.getElementById('stomach');
const pukeCountEl = document.getElementById('pukeCount');
const dizzyEl = document.getElementById('dizzy');
const messageText = document.getElementById('messageText');
const currentPuke = document.getElementById('currentPuke');
const bucketLabel = document.getElementById('bucketLabel');
const pukeBucket = document.getElementById('pukeBucket');
const bucketFill = document.getElementById('bucketFill');
const leftCheek = document.querySelector('.left-cheek');
const rightCheek = document.querySelector('.right-cheek');
const leftPupil = document.querySelector('.left-eye .pupil');
const rightPupil = document.querySelector('.right-eye .pupil');
const meterFill = document.getElementById('meterFill');
const meterText = document.getElementById('meterText');
const levelBadge = document.getElementById('levelBadge');
const moodText = document.getElementById('moodText');
const moodIcon = document.querySelector('#moodDisplay .stat-icon');
const sweat = document.getElementById('sweat');
const streakDisplay = document.getElementById('streakDisplay');
const streakCount = document.getElementById('streakCount');
const gooCount = document.getElementById('gooCount');
const dayCount = document.getElementById('dayCount');
const streakDay = document.getElementById('streakDay');
const accessorySlot = document.getElementById('accessorySlot');
const shopSection = document.getElementById('shopSection');
const shopGrid = document.getElementById('shopGrid');
const shopGoo = document.getElementById('shopGoo');
const closeShop = document.getElementById('closeShop');
const bgPuke = document.getElementById('bgPuke');
const rainCanvas = document.getElementById('rainCanvas');
const ctx = rainCanvas.getContext('2d');
const splatterCanvas = document.getElementById('splatterCanvas');
const splatterCtx = splatterCanvas.getContext('2d');
const achCount = document.getElementById('achCount');

// ── State ──
let stomach = 50;
let pukeCount = 0;
let dizzy = 50;
let xp = 0;
let level = 1;
let streak = 0;
let isSleeping = false;
let isRaining = false;
let isChaos = false;
let rainAnimId = null;
let chaosTimeout = null;
let decayInterval = null;
let idleInterval = null;
let boredomTimer = null;

let achievements = {};
let goo = 0;
let totalGooAllTime = 0;
let totalUpchucks = 0;
let totalFeeds = 0;
let totalSpins = 0;
let totalBurps = 0;
let lastVisitDate = null;
let ownedAccessories = [];
let equippedAccessory = null;

const XP_PER_LEVEL = 100;

const foodEmojis = [
  '🍔', '🍕', '🌮', '🌯', '🥪', '🥗', '🍜', '🍣',
  '🥟', '🥨', '🍩', '🧁', '🍦', '🍫', '🍬', '🥤',
  '🧃', '🍺', '🥃', '☕', '🧋', '🍝', '🥘', '🫕'
];

const pukeEmojis = [
  '🤮', '💚', '💛', '🧪', '🫧', '💀', '☠️', '🦠'
];

const SAVE_KEY = 'upchuck_save';

const messages = {
  hungry: ["upchuck is hungry... feed it something gross!", "the stomach is rumbling...", "feed me something nasty!", "upchuck craves foul things..."],
  feed: ["urp... that was disgusting! i love it!", "down the hatch! 🤢", "so gross... so good!", "more! give me more foul things!"],
  full: ["upchuck is gonna blow... 🥴", "too full... i'm gonna hurl...", "stomach is at max capacity!", "back off! i'm about to erupt!"],
  puke: ["BLEEEURGHHH! 🤮", "here it comes!!!", "PROJECTILE MODE!", "what a glorious upchuck!"],
  spin: ["the room is spinning... 🌀", "stop the world i want to get off!", "dizzy dizzy dizzy!", "everything is sideways..."],
  burp: ["BUUUURP! 💨", "excuse me! that one shook the room!", "the burp that shook the world!", "smells like... regret"],
  sleepy: ["upchuck needs a nap... 😴", "all that puking wore me out...", "gotta recharge... zzz", "shutting down for maintenance..."],
  sleep: ["zzz... dreaming of puke volcanoes...", "resting the stomach... zzz", "zzz... blllrrrgh... zzz...", "don't wake the chucker..."],
  wake: ["huh? what happened?", "yaaaawn... time to puke!", "i feel... renewed!", "good nap! now let's vomit!"],
  bored: ["upchuck is bored... feed me!", "i need to puke... it's been too long!", "stomach is getting settled... ew"],
  rain: ["acid rain! my favorite! 🌧️", "the sky is puking! i love it!", "catch the acid drops!", "burning! feels nice!"],
  levelUp: ["UPCHUCK LEVELED UP! 💪", "UPROOT POWERS INCREASED!", "THE STOMACH GROWS STRONGER!", "NEW PUKE RECORDS ACHIEVED!"],
  shop: ["oooh shiny goo!", "worth every drop of goo!", "equipped!", "goo well spent!"],
  streak: ["back for more puking! nice!", "another day of upchucking!", "you're dedicated! i respect that!", "day after day of glorious vomit!"],
  chaos: ["CHAOS MODE ACTIVATED! 💥", "EVERYTHING IS FALLING APART!", "I'M OUT OF CONTROL!", "THIS IS FINE 🔥"],
  calm: ["chaos has passed... for now", "back to normal puking... boring", "the calm after the storm..."],
  treat: ["goo! delicious goo!", "i love goo! 🧪", "more goo for my collection!", "goo goo goo!"]
};

const moodIcons = { queasy: '🤢', sick: '🤮', nuclear: '☢️', dizzy: '😵', sleepy: '😴', neutral: '🤨' };

const ACHIEVEMENTS = {
  first_feed: { icon: '🍔', name: 'First Meal', desc: 'Feed upchuck once', check: s => s.totalFeeds >= 1 },
  first_puke: { icon: '🤮', name: 'First Upchuck', desc: 'Puke for the first time', check: s => s.totalUpchucks >= 1 },
  five_puke: { icon: '💦', name: 'Puke Machine', desc: 'Puke 5 times', check: s => s.totalUpchucks >= 5 },
  spin_10: { icon: '🌀', name: 'Spinning Out', desc: 'Spin 10 times', check: s => s.totalSpins >= 10 },
  burp_5: { icon: '💨', name: 'Burp King', desc: 'Burp 5 times', check: s => s.totalBurps >= 5 },
  level_5: { icon: '⭐', name: 'Queasy Star', desc: 'Reach level 5', check: s => s.level >= 5 },
  level_10: { icon: '👑', name: 'Uproot Lord', desc: 'Reach level 10', check: s => s.level >= 10 },
  goo_50: { icon: '🧪', name: 'Goo Collector', desc: 'Collect 50 goo', check: s => s.totalGooAllTime >= 50 },
  stomach_100: { icon: '💚', name: 'Iron Gut', desc: 'Reach 100 stomach', check: s => s.stomach >= 100 },
  dizzy_max: { icon: '😵', name: 'Max Dizzy', desc: 'Reach 100 dizzy', check: s => s.dizzy >= 100 },
  chaos_3: { icon: '💥', name: 'Agent of Chaos', desc: 'Activate chaos 3 times', check: s => s.chaosCount >= 3 },
  rain_master: { icon: '🌧️', name: 'Acid Rain Master', desc: 'Collect 20 acid drops', check: s => s.rainCollected >= 20 }
};

// ── Shop Items ──
const SHOP_ITEMS = [
  { id: 'puke_crown', emoji: '🤮', name: 'Puke Crown', price: 20 },
  { id: 'biohazard', emoji: '☣️', name: 'Biohazard', price: 30 },
  { id: 'nuclear', emoji: '☢️', name: 'Nuclear Sign', price: 35 },
  { id: 'skull', emoji: '💀', name: 'Skull', price: 25 },
  { id: 'goo_drop', emoji: '🧪', name: 'Goo Drop', price: 15 },
  { id: 'toilet', emoji: '🚽', name: 'Toilet Crown', price: 40 },
  { id: 'poop', emoji: '💩', name: 'Golden Poop', price: 50 },
  { id: 'worm', emoji: '🪱', name: 'Worm', price: 12 }
];

// Tracking stats for achievements
let maxStomach = 0;
let maxDizzy = 0;
let chaosCount = 0;
let rainCollected = 0;

// ── Audio (Web Audio API) ──
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

function playChompSound() { playTone(150, 0.15, 'sawtooth', 0.1); setTimeout(() => playTone(250, 0.1, 'sawtooth', 0.08), 80); }
function playPukeSound() {
  playTone(100, 0.3, 'sawtooth', 0.12);
  setTimeout(() => playTone(80, 0.2, 'sawtooth', 0.1), 150);
  setTimeout(() => playTone(120, 0.3, 'sawtooth', 0.08), 300);
}
function playSpinSound() { playTone(300, 0.08, 'sine', 0.06); setTimeout(() => playTone(500, 0.08, 'sine', 0.06), 100); setTimeout(() => playTone(700, 0.08, 'sine', 0.06), 200); setTimeout(() => playTone(900, 0.08, 'sine', 0.06), 300); }
function playBurpSound() { playTone(80, 0.4, 'square', 0.08); setTimeout(() => playTone(120, 0.2, 'square', 0.06), 200); }
function playLevelUpSound() {
  const notes = [262, 330, 392, 523];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2, 'sine', 0.15), i * 120));
}
function playAchievementSound() {
  const notes = [392, 494, 587, 659];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.15, 'sine', 0.12), i * 100));
}
function playGooSound() { playTone(600, 0.1, 'sine', 0.1); setTimeout(() => playTone(800, 0.1, 'sine', 0.1), 80); }
function playBuySound() { playTone(400, 0.1, 'sine', 0.1); setTimeout(() => playTone(600, 0.1, 'sine', 0.1), 100); setTimeout(() => playTone(800, 0.15, 'sine', 0.1), 200); }
function playChaosSound() { playTone(200, 0.1, 'square', 0.1); setTimeout(() => playTone(400, 0.1, 'square', 0.1), 80); setTimeout(() => playTone(600, 0.1, 'square', 0.1), 160); setTimeout(() => playTone(800, 0.1, 'square', 0.1), 240); }
function playRainSound() { playTone(500, 0.05, 'sine', 0.03); }

// ── Helpers ──
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function setMessage(text) { messageText.textContent = text; }
function updateStats() {
  stomachEl.textContent = Math.round(stomach);
  dizzyEl.textContent = Math.round(dizzy);
}
function updateMeter() {
  const pct = Math.min((xp / XP_PER_LEVEL) * 100, 100);
  meterFill.style.width = pct + '%';
  meterText.textContent = `${xp} / ${XP_PER_LEVEL} 🤢`;
}
function updateLevelBadge() { levelBadge.textContent = `Lv.${level}`; }

function addXP(amount) {
  xp += amount;
  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL;
    level++;
    updateLevelBadge();
    playLevelUpSound();
    showLevelUpFlash();
    setMessage(randomFrom(messages.levelUp));
    checkAchievements();
    spawnParticles('💫', 8);
  }
  updateMeter();
  checkAchievements();
}

function addGoo(amount) {
  goo += amount;
  totalGooAllTime += amount;
  gooCount.textContent = goo;
  shopGoo.textContent = goo;
  if (amount > 0) {
    playGooSound();
    showGooPopup(amount);
  }
  checkAchievements();
}

function showGooPopup(amount) {
  const popup = document.createElement('div');
  popup.className = 'goo-popup';
  popup.textContent = `+${amount} 🧪`;
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translateX(-50%)';
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

function showLevelUpFlash() {
  const flash = document.createElement('div');
  flash.className = 'level-up-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
}

// ── Mood System ──
function getMood() {
  if (isSleeping) return 'sleepy';
  if (isChaos) return 'dizzy';
  if (dizzy >= 80) return 'dizzy';
  if (stomach >= 80) return 'nuclear';
  if (stomach <= 25) return 'sick';
  if (stomach >= 60) return 'queasy';
  return 'neutral';
}

function updateMood() {
  const mood = getMood();
  const bodyClasses = ['mood-queasy', 'mood-sick', 'mood-nuclear', 'mood-dizzy', 'mood-sleepy', 'mood-neutral'];
  bodyClasses.forEach(c => {
    document.body.classList.remove(c);
    creatureBody.classList.remove(c);
  });
  if (mood !== 'neutral') {
    document.body.classList.add('mood-' + mood);
    creatureBody.classList.add('mood-' + mood);
  }
  moodText.textContent = mood;
  moodIcon.textContent = moodIcons[mood] || '🤨';

  // Sweat when sick/queasy
  if (mood === 'sick' || mood === 'queasy') {
    sweat.classList.add('visible');
  } else {
    sweat.classList.remove('visible');
  }

  if (isSleeping) {
    creature.classList.add('sleeping');
  } else {
    creature.classList.remove('sleeping');
  }
}

// ── Feed ──
function feedCreature() {
  if (isSleeping) return;
  const emoji = randomFrom(foodEmojis);
  currentPuke.textContent = emoji;
  bucketLabel.textContent = `${emoji} ? chowed down!`;
  currentPuke.classList.remove('bounce');
  void currentPuke.offsetWidth;
  currentPuke.classList.add('bounce');
  creature.classList.remove('chomping');
  void creature.offsetWidth;
  creature.classList.add('chomping');
  mouth.classList.add('open');
  setTimeout(() => mouth.classList.remove('open'), 400);

  playChompSound();

  if (stomach >= 90) {
    stomach = 100;
    setMessage(randomFrom(messages.full));
    addXP(3);
    spawnParticles('💥', 3);
  } else {
    stomach = clamp(stomach + 12, 0, 100);
    dizzy = clamp(dizzy + 4, 0, 100);
    addXP(8);
    addGoo(1);
    setMessage(randomFrom(messages.feed));
    showCheeks();
  }

  totalFeeds++;
  if (stomach > maxStomach) maxStomach = stomach;
  updateStats();
  updateMood();
  checkSleepy();
  checkAchievements();
  updateBucketFill();
}

// ── Upchuck ──
function upchuck() {
  if (isSleeping) return;
  if (stomach < 15) {
    setMessage('stomach is empty! feed me first! 🍔');
    return;
  }

  creature.classList.remove('puking');
  void creature.offsetWidth;
  creature.classList.add('puking');
  mouth.classList.add('open');
  playPukeSound();

  const puke = randomFrom(pukeEmojis);
  currentPuke.textContent = puke;
  bucketLabel.textContent = `BLEEERGH! ${puke}`;
  currentPuke.classList.remove('bounce');
  void currentPuke.offsetWidth;
  currentPuke.classList.add('bounce');

  // Spawn splatter
  spawnSplatter();
  spawnParticles(puke, 8);

  stomach = clamp(stomach - 20, 0, 100);
  pukeCount++;
  totalUpchucks++;
  pukeCountEl.textContent = pukeCount;
  addXP(15);
  addGoo(2);

  setMessage(randomFrom(messages.puke));
  updateStats();
  updateMood();
  checkAchievements();
  updateBucketFill();
}

// ── Spin ──
function spinCreature() {
  if (isSleeping) return;
  creature.classList.remove('spinning');
  void creature.offsetWidth;
  creature.classList.add('spinning');
  playSpinSound();

  dizzy = clamp(dizzy + 15, 0, 100);
  stomach = clamp(stomach - 5, 0, 100);
  totalSpins++;
  addXP(5);
  if (dizzy >= 80) {
    setMessage(randomFrom(messages.spin));
    spawnParticles('🌀', 5);
  } else {
    setMessage(`spinning... dizzy level ${Math.round(dizzy)}%`);
  }
  if (dizzy > maxDizzy) maxDizzy = dizzy;
  updateStats();
  updateMood();
  checkAchievements();
  updateBucketFill();
}

// ── Burp ──
function burp() {
  if (isSleeping) return;
  creature.classList.remove('burping');
  void creature.offsetWidth;
  creature.classList.add('burping');
  mouth.classList.add('open');
  setTimeout(() => mouth.classList.remove('open'), 400);
  playBurpSound();

  stomach = clamp(stomach - 8, 0, 100);
  totalBurps++;
  addXP(4);
  addGoo(1);
  setMessage(randomFrom(messages.burp));
  spawnParticles('💨', 4);
  updateStats();
  updateMood();
  checkAchievements();
  updateBucketFill();
}

// ── Sleep ──
function toggleSleep() {
  isSleeping = !isSleeping;
  if (isSleeping) {
    document.getElementById('sleepBtn').textContent = '☀️ Wake';
    setMessage(randomFrom(messages.sleep));
    creature.classList.add('sleeping');
    spawnParticles('💤', 4);
    if (idleInterval) clearInterval(idleInterval);
    idleInterval = null;
    stomach = clamp(stomach + 5, 0, 100);
    dizzy = clamp(dizzy - 10, 0, 100);
    updateStats();
  } else {
    document.getElementById('sleepBtn').textContent = '😴 Sleep';
    setMessage(randomFrom(messages.wake));
    creature.classList.remove('sleeping');
    startIdleAnimation();
  }
  updateMood();
}

// ── Acid Rain Minigame ──
let rainDrops = [];
let collectedDrops = 0;
let rainRunning = false;

function toggleRain() {
  isRaining = !isRaining;
  if (isRaining) {
    document.getElementById('rainBtn').textContent = '☀️ Stop Rain';
    rainCanvas.classList.remove('hidden');
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    rainDrops = [];
    collectedDrops = 0;
    rainRunning = true;
    setMessage('catch the acid raindrops! click on them! 🌧️');

    const spawnInterval = setInterval(() => {
      if (!rainRunning) { clearInterval(spawnInterval); return; }
      for (let i = 0; i < 3; i++) {
        rainDrops.push({
          x: Math.random() * rainCanvas.width,
          y: -10 - Math.random() * 50,
          speed: 2.5 + Math.random() * 3.5,
          size: 14 + Math.random() * 18,
          collected: false
        });
      }
    }, 120);

    rainCanvas.onclick = (e) => {
      if (!rainRunning) return;
      const rect = rainCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      rainDrops.forEach(d => {
        if (!d.collected && Math.hypot(d.x - mx, d.y - my) < d.size) {
          d.collected = true;
          collectedDrops++;
          rainCollected++;
          playRainSound();
          spawnParticles('💚', 2);
          spawnSplatter();
          if (collectedDrops % 3 === 0) {
            addXP(3);
            addGoo(1);
            setMessage(`collected ${collectedDrops} acid drops! 🌧️`);
          }
          dizzy = clamp(dizzy + 2, 0, 100);
          updateStats();
          checkAchievements();
        }
      });
    };

    function drawRain() {
      if (!rainRunning) { ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height); return; }
      ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);

      // Acid green tint
      const gradient = ctx.createLinearGradient(0, 0, 0, rainCanvas.height);
      gradient.addColorStop(0, 'rgba(74, 222, 128, 0.03)');
      gradient.addColorStop(1, 'rgba(74, 222, 128, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);

      rainDrops = rainDrops.filter(d => d.y < rainCanvas.height + 60);
      rainDrops.forEach(d => {
        if (d.collected) return;
        d.y += d.speed;
        // Draw acid drop
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Inner glow
        ctx.beginPath();
        ctx.arc(d.x - 2, d.y - 2, d.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(163, 230, 53, 0.3)';
        ctx.fill();
      });

      ctx.fillStyle = '#a3e635';
      ctx.font = 'bold 20px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🧪 ${collectedDrops}`, rainCanvas.width / 2, 40);

      rainAnimId = requestAnimationFrame(drawRain);
    }
    drawRain();
    spawnParticles('🌧️', 5);
  } else {
    document.getElementById('rainBtn').textContent = '🌧️ Acid Rain';
    rainRunning = false;
    if (rainAnimId) cancelAnimationFrame(rainAnimId);
    rainCanvas.classList.add('hidden');
    ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    rainCanvas.onclick = null;
    setMessage('the acid rain stopped... for now 🌤️');
  }
}

// ── Chaos Mode ──
function toggleChaos() {
  isChaos = !isChaos;
  if (isChaos) {
    document.getElementById('chaosBtn').textContent = '😇 Calm';
    document.body.classList.add('chaos-active');
    playChaosSound();
    chaosCount++;
    setMessage(randomFrom(messages.chaos));
    spawnParticles('💥', 10);
    spawnParticles('🔥', 10);
    dizzy = clamp(dizzy + 20, 0, 100);
    updateStats();
    updateMood();
    checkAchievements();

    // Auto-stop after 5 seconds
    if (chaosTimeout) clearTimeout(chaosTimeout);
    chaosTimeout = setTimeout(() => {
      if (isChaos) toggleChaos();
    }, 5000);
  } else {
    document.getElementById('chaosBtn').textContent = '💥 Chaos';
    document.body.classList.remove('chaos-active');
    setMessage(randomFrom(messages.calm));
    if (chaosTimeout) clearTimeout(chaosTimeout);
    updateMood();
  }
}

// ── Shop System ──
function openShop() {
  shopSection.classList.remove('hidden');
  shopGoo.textContent = goo;
  renderShop();
}

function renderShop() {
  shopGrid.innerHTML = '';
  SHOP_ITEMS.forEach(item => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    if (ownedAccessories.includes(item.id)) div.classList.add('owned');

    div.innerHTML = `
      <span class="item-emoji">${item.emoji}</span>
      <span class="item-name">${item.name}</span>
      <span class="item-price">${ownedAccessories.includes(item.id) ? '✅ Owned' : `🧪 ${item.price}`}</span>
    `;

    div.addEventListener('click', () => buyItem(item));
    shopGrid.appendChild(div);
  });
}

function buyItem(item) {
  if (ownedAccessories.includes(item.id)) {
    // Equip/unequip
    if (equippedAccessory === item.id) {
      equippedAccessory = null;
      accessorySlot.textContent = '';
      setMessage(`${item.name} unequipped`);
    } else {
      equippedAccessory = item.id;
      accessorySlot.textContent = item.emoji;
      setMessage(`${item.name} equipped! ${randomFrom(messages.shop)}`);
    }
    autosave();
    renderShop();
    return;
  }

  if (goo < item.price) {
    setMessage(`not enough goo! need ${item.price} 🧪`);
    return;
  }

  goo -= item.price;
  gooCount.textContent = goo;
  shopGoo.textContent = goo;
  ownedAccessories.push(item.id);
  equippedAccessory = item.id;
  accessorySlot.textContent = item.emoji;
  playBuySound();
  setMessage(`bought ${item.name}! ${randomFrom(messages.shop)}`);
  spawnParticles('🧪', 5);
  autosave();
  renderShop();
}

function closeShopSection() {
  shopSection.classList.add('hidden');
}

// ── Daily Streak ──
function checkDailyStreak() {
  const today = new Date().toDateString();
  if (!lastVisitDate) {
    lastVisitDate = today;
    streak = 1;
    setMessage(`welcome! day ${streak}! ${randomFrom(messages.streak)}`);
    addGoo(3);
    addXP(10);
  } else if (lastVisitDate === today) {
    return;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastVisitDate === yesterdayStr) {
      streak++;
      setMessage(`day ${streak} streak! ${randomFrom(messages.streak)}`);
      const bonus = Math.min(streak, 7);
      addGoo(2 + bonus);
      addXP(5 + bonus * 2);
      spawnParticles('💫', streak);
    } else {
      streak = 1;
      setMessage('streak reset... but you came back! 💚');
      addGoo(2);
    }
    lastVisitDate = today;
  }

  dayCount.textContent = streak;
  if (streak >= 3) streakDay.style.color = '#84cc16';
  if (streak >= 7) streakDay.style.color = '#a855f7';
  updateStats();
  checkAchievements();
}

// ── Cheeks ──
function showCheeks() {
  leftCheek.classList.add('show');
  rightCheek.classList.add('show');
  setTimeout(() => {
    leftCheek.classList.remove('show');
    rightCheek.classList.remove('show');
  }, 2000);
}

// ── Particles ──
function spawnParticles(emoji, count) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji;
    const rect = creature.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 100;
    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 50;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

// ── Splatter Canvas Effect ──
function spawnSplatter() {
  splatterCanvas.width = window.innerWidth;
  splatterCanvas.height = window.innerHeight;
  const x = Math.random() * splatterCanvas.width;
  const y = Math.random() * splatterCanvas.height;
  const radius = 10 + Math.random() * 30;

  splatterCtx.beginPath();
  splatterCtx.arc(x, y, radius, 0, Math.PI * 2);
  const colors = ['rgba(74, 222, 128, 0.3)', 'rgba(163, 230, 53, 0.3)', 'rgba(250, 204, 21, 0.2)', 'rgba(113, 63, 18, 0.3)'];
  splatterCtx.fillStyle = randomFrom(colors);
  splatterCtx.fill();

  // Additional splatter drops
  for (let i = 0; i < 5; i++) {
    const dx = (Math.random() - 0.5) * radius * 3;
    const dy = (Math.random() - 0.5) * radius * 3;
    const sr = 3 + Math.random() * 8;
    splatterCtx.beginPath();
    splatterCtx.arc(x + dx, y + dy, sr, 0, Math.PI * 2);
    splatterCtx.fillStyle = randomFrom(colors);
    splatterCtx.fill();
  }

  // Fade out
  setTimeout(() => {
    splatterCtx.clearRect(0, 0, splatterCanvas.width, splatterCanvas.height);
  }, 3000);
}

// ── Bucket Fill ──
function updateBucketFill() {
  const pct = clamp(stomach, 0, 100);
  bucketFill.style.height = pct + '%';
}

// ── Eye Tracking ──
document.addEventListener('mousemove', (e) => {
  if (isSleeping) return;
  const rect = creature.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);
  const moveX = clamp(dx * 5, -5, 5);
  const moveY = clamp(dy * 5, -5, 5);
  leftPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
  rightPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// ── Passive State Checks ──
function checkSleepy() {
  if (stomach >= 85) {
    setTimeout(() => setMessage(randomFrom(messages.sleepy)), 1500);
  }
}

function checkBoredom() {
  if (boredomTimer) clearTimeout(boredomTimer);
  boredomTimer = setTimeout(() => {
    if (!isSleeping && !isChaos && stomach < 80) {
      setMessage(randomFrom(messages.bored));
      spawnParticles('💤', 2);
    }
  }, 12000);
}

// ── Auto-depletion ──
function startDecay() {
  if (decayInterval) clearInterval(decayInterval);
  decayInterval = setInterval(() => {
    if (isSleeping) return;
    if (stomach > 5) stomach = clamp(stomach - 0.8, 0, 100);
    if (dizzy > 5 && Math.random() < 0.3) dizzy = clamp(dizzy - 0.5, 0, 100);
    if (stomach < 20 && Math.random() < 0.3) setMessage(randomFrom(messages.hungry));
    updateStats();
    updateMood();
    updateBucketFill();
    autosave();
  }, 5000);
}

// ── Idle animation ──
function startIdleAnimation() {
  if (idleInterval) clearInterval(idleInterval);
  idleInterval = setInterval(() => {
    if (Math.random() < 0.3 && !isSleeping) {
      mouth.classList.toggle('open');
      setTimeout(() => mouth.classList.remove('open'), 300);
    }
  }, 4000);
}

// ── Achievements ──
function checkAchievements() {
  const state = { totalFeeds, totalUpchucks, totalSpins, totalBurps, level, maxStomach, maxDizzy, totalGooAllTime, chaosCount, rainCollected, stomach, dizzy };
  Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
    if (!achievements[id] && ach.check(state)) {
      unlockAchievement(id, ach);
    }
  });
  updateAchievementCount();
}

function updateAchievementCount() {
  const unlocked = Object.values(achievements).filter(v => v).length;
  achCount.textContent = unlocked;
}

function unlockAchievement(id, ach) {
  achievements[id] = true;
  playAchievementSound();
  const el = document.querySelector(`.achievement[data-id="${id}"]`);
  if (el) el.classList.add('unlocked');
  showAchievementPopup(ach);
  addXP(25);
  addGoo(5);
}

function showAchievementPopup(ach) {
  const popup = document.createElement('div');
  popup.className = 'ach-popup';
  popup.innerHTML = `<span class="ach-emoji">${ach.icon}</span><div class="ach-title">🏆 ${ach.name}</div><div class="ach-desc">${ach.desc}</div>`;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.style.animation = 'achPopIn 0.3s ease reverse forwards';
    setTimeout(() => popup.remove(), 300);
  }, 2500);
}

function updateAchievementUI() {
  Object.keys(ACHIEVEMENTS).forEach(id => {
    const el = document.querySelector(`.achievement[data-id="${id}"]`);
    if (el && achievements[id]) el.classList.add('unlocked');
  });
  updateAchievementCount();
}

// ── Save / Load ──
function autosave() {
  const data = {
    stomach, pukeCount, dizzy, xp, level, streak, totalFeeds, totalUpchucks,
    totalSpins, totalBurps, maxStomach, maxDizzy, achievements, goo, totalGooAllTime,
    lastVisitDate, ownedAccessories, equippedAccessory, chaosCount, rainCollected
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (_) {}
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    stomach = data.stomach ?? 50;
    pukeCount = data.pukeCount ?? 0;
    dizzy = data.dizzy ?? 50;
    xp = data.xp ?? 0;
    level = data.level ?? 1;
    streak = data.streak ?? 0;
    totalFeeds = data.totalFeeds ?? 0;
    totalUpchucks = data.totalUpchucks ?? 0;
    totalSpins = data.totalSpins ?? 0;
    totalBurps = data.totalBurps ?? 0;
    maxStomach = data.maxStomach ?? 0;
    maxDizzy = data.maxDizzy ?? 0;
    achievements = data.achievements ?? {};
    goo = data.goo ?? 0;
    totalGooAllTime = data.totalGooAllTime ?? 0;
    lastVisitDate = data.lastVisitDate ?? null;
    ownedAccessories = data.ownedAccessories ?? [];
    equippedAccessory = data.equippedAccessory ?? null;
    chaosCount = data.chaosCount ?? 0;
    rainCollected = data.rainCollected ?? 0;

    // Restore UI
    gooCount.textContent = goo;
    shopGoo.textContent = goo;
    dayCount.textContent = streak;
    pukeCountEl.textContent = pukeCount;
    if (streak >= 3) streakDay.style.color = '#84cc16';
    if (streak >= 7) streakDay.style.color = '#a855f7';
    if (equippedAccessory) {
      const item = SHOP_ITEMS.find(i => i.id === equippedAccessory);
      if (item) accessorySlot.textContent = item.emoji;
    }

    updateStats();
    updateMeter();
    updateLevelBadge();
    updateAchievementUI();
    updateMood();
    updateBucketFill();
  } catch (_) {}
}

// ── Window Resize ──
window.addEventListener('resize', () => {
  if (isRaining) {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
  }
});

// ── Event Listeners ──
document.getElementById('feedBtn').addEventListener('click', feedCreature);
document.getElementById('pukeBtn').addEventListener('click', upchuck);
document.getElementById('spinBtn').addEventListener('click', spinCreature);
document.getElementById('burpBtn').addEventListener('click', burp);
document.getElementById('sleepBtn').addEventListener('click', toggleSleep);
document.getElementById('rainBtn').addEventListener('click', toggleRain);
document.getElementById('chaosBtn').addEventListener('click', toggleChaos);
document.getElementById('shopBtn').addEventListener('click', openShop);
closeShop.addEventListener('click', closeShopSection);

document.getElementById('toggleAch').addEventListener('click', () => {
  document.getElementById('achGrid').classList.toggle('hidden');
});

creature.addEventListener('click', () => {
  if (!isSleeping) feedCreature();
});

pukeBucket.addEventListener('click', () => {
  if (isSleeping) return;
  const newPuke = randomFrom(pukeEmojis);
  currentPuke.textContent = newPuke;
  currentPuke.classList.remove('bounce');
  void currentPuke.offsetWidth;
  currentPuke.classList.add('bounce');
  bucketLabel.textContent = `maybe try ${newPuke}?`;
});

// ── Init ──
loadSave();
startDecay();
startIdleAnimation();
setTimeout(() => {
  checkBoredom();
  checkDailyStreak();
}, 3000);
updateMood();

console.log('🤮 UPCHUCK v1 — an uprooting experience!');