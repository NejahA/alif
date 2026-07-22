// ── DOM Refs ──
const chompa = document.getElementById('chompa');
const mouth = document.getElementById('mouth');
const chompaBody = document.getElementById('chompaBody');
const happinessEl = document.getElementById('happiness');
const fullnessEl = document.getElementById('fullness');
const bouncesEl = document.getElementById('bounces');
const messageText = document.getElementById('messageText');
const currentFood = document.getElementById('currentFood');
const foodLabel = document.getElementById('foodLabel');
const foodBucket = document.getElementById('foodBucket');
const leftCheek = document.querySelector('.left-cheek');
const rightCheek = document.querySelector('.right-cheek');
const leftPupil = document.querySelector('.left-eye .pupil');
const rightPupil = document.querySelector('.right-eye .pupil');
const xpFill = document.getElementById('xpFill');
const xpText = document.getElementById('xpText');
const levelBadge = document.getElementById('levelBadge');
const moodText = document.getElementById('moodText');
const moodIcon = document.querySelector('#moodDisplay .stat-icon');
const sleepZ = document.getElementById('sleepZ');
const comboDisplay = document.getElementById('comboDisplay');
const comboCount = document.getElementById('comboCount');
const foodCount = document.getElementById('foodCount');
const inventoryGrid = document.getElementById('inventoryGrid');
const bgEffects = document.getElementById('bgEffects');
const rainCanvas = document.getElementById('rainCanvas');
const ctx = rainCanvas.getContext('2d');

// ── New DOM Refs ──
const nameTag = document.getElementById('nameTag');
const nameEditBtn = document.getElementById('nameEditBtn');
const nameModal = document.getElementById('nameModal');
const nameInput = document.getElementById('nameInput');
const nameSaveBtn = document.getElementById('nameSaveBtn');
const nameCancelBtn = document.getElementById('nameCancelBtn');
const treatsCount = document.getElementById('treatsCount');
const streakCount = document.getElementById('streakCount');
const streakDisplay = document.getElementById('streakDisplay');
const evoIndicator = document.getElementById('evoIndicator');
const accessorySlot = document.getElementById('accessorySlot');
const gameBtn = document.getElementById('gameBtn');
const gameSection = document.getElementById('gameSection');
const gameGrid = document.getElementById('gameGrid');
const gameScore = document.getElementById('gameScore');
const gameTurns = document.getElementById('gameTurns');
const closeGame = document.getElementById('closeGame');
const shopBtn = document.getElementById('shopBtn');
const shopSection = document.getElementById('shopSection');
const shopGrid = document.getElementById('shopGrid');
const shopTreats = document.getElementById('shopTreats');
const closeShop = document.getElementById('closeShop');
const toggleStats = document.getElementById('toggleStats');
const statsOverlay = document.getElementById('statsOverlay');
const sessionTime = document.getElementById('sessionTime');
const totalXpEarned = document.getElementById('totalXpEarned');
const totalTreatsEarned = document.getElementById('totalTreatsEarned');
const totalFeedsStat = document.getElementById('totalFeedsStat');
const totalPetsStat = document.getElementById('totalPetsStat');
const totalDancesStat = document.getElementById('totalDancesStat');
const maxComboStat = document.getElementById('maxComboStat');
const gamesWonStat = document.getElementById('gamesWonStat');
const streakStat = document.getElementById('streakStat');
const attentionBadge = document.getElementById('attentionBadge');
const achCount = document.getElementById('achCount');

// ── State ──
let happiness = 50;
let fullness = 50;
let bounces = 0;
let xp = 0;
let level = 1;
let combo = 0;
let isPetting = false;
let isSleeping = false;
let isRaining = false;
let petTimeout = null;
let decayInterval = null;
let idleInterval = null;
let rainAnimId = null;

let achievements = {};
let foodInventory = {};

// ── New State ──
let treats = 0;
let streak = 0;
let lastVisitDate = null;
let chompaName = 'chompa';
let ownedAccessories = [];
let equippedAccessory = null;
let gamesWon = 0;
let totalXpAllTime = 0;
let totalTreatsAllTime = 0;
let sessionStart = Date.now();
let sessionInterval = null;
let badgeInterval = null;

const XP_PER_LEVEL = 100;

const foodEmojis = [
  '🍪', '🍕', '🍔', '🍩', '🍎', '🍌', '🍇', '🍓',
  '🧁', '🍦', '🍫', '🍬', '🍭', '🥞', '🧇', '🥨',
  '🥗', '🍜', '🍣', '🥟', '🥐', '🌮', '🌯', '🍝'
];

const SAVE_KEY = 'chompa_save';

const messages = {
  hungry: ["chompa is hungry... feed me!", "my tummy is rumbling...", "got any snacks?", "chompa craves something yummy!"],
  happy: ["chompa is so happy! ❤️", "that was delicious!", "yummy yummy! chompa loves it!", "more please! 🥺"],
  full: ["chompa is stuffed! 🥴", "too full to move...", "maybe later... *burp*", "chompa can't eat another bite!"],
  playing: ["wheee! this is fun! 🎾", "chompa loves to play!", "again again!", "you can't catch me!"],
  pet: ["chompa feels loved 🥰", "that feels nice...", "don't stop... 🥺", "chompa is melting..."],
  dance: ["check out my moves! 💃", "chompa was born to dance!", "oh yeah, work it!", "dance dance revolution!"],
  sleepy: ["chompa is getting sleepy... 😴", "too full... need nap...", "zzzz... huh? what?", "goodnight... zzz"],
  bored: ["chompa is bored... play with me!", "hey! pay attention to me!", "chompa wants to play!"],
  bounce: ["BOING! 🦘", "weeeee!", "look how high i can go!", "chompa bounce!"],
  sleep: ["zzz... chompa is dreaming of cookies...", "shh... chompa sleeping...", "warm and cozy... zzz", "don't wake the monster!"],
  wake: ["huh? what time is it?", "yaaaawn... good morning!", "chompa is awake now!", "that was a good nap!"],
  rain: ["wow! rain! 🌧️", "chompa loves the rain!", "catch the drops!", "splash splash splash!"],
  levelUp: ["LEVEL UP! chompa grew stronger! ⭐", "CHOMPA EVOLVED! 💪", "NEW POWERS UNLOCKED! 🌟", "chompa is getting so big!"],
  name: ["that's my name! 🥰", "i love my name!", "call me that again!", "that's me! 😊"],
  game: ["fun game! let's play again!", "my memory is the best!", "i won! i won!", "brain power! 🧠"],
  treat: ["treats! yummy!", "i love treats! 🪙", "more treats please!", "treats make me happy!"],
  shop: ["ooh something shiny!", "can i have that?", "treats well spent!", "new accessory! yay!"],
  streak: ["back again! awesome!", "you didn't forget me! ❤️", "another day together!", "i missed you!"],
  evolution: ["i'm evolving! ✨", "look at me glow!", "feeling stronger!", "new powers awakening!"]
};

const moodIcons = { happy: '😄', sad: '😢', angry: '😡', excited: '🤩', sleepy: '😴', neutral: '😐' };

const ACHIEVEMENTS = {
  first_feed: { icon: '🍪', name: 'First Bite', desc: 'Feed chompa for the first time', check: s => s.totalFeeds >= 1 },
  five_feed: { icon: '🍕', name: 'Gourmet', desc: 'Feed chompa 5 times', check: s => s.totalFeeds >= 5 },
  ten_bounce: { icon: '🦘', name: 'Bouncy', desc: 'Bounce 10 times', check: s => s.bounces >= 10 },
  pet_lover: { icon: '❤️', name: 'Pet Lover', desc: 'Pet chompa 5 times', check: s => s.totalPets >= 5 },
  dance_master: { icon: '💃', name: 'Dance Master', desc: 'Dance 5 times', check: s => s.totalDances >= 5 },
  level_5: { icon: '⭐', name: 'Rising Star', desc: 'Reach level 5', check: s => s.level >= 5 },
  level_10: { icon: '👑', name: 'Chompa King', desc: 'Reach level 10', check: s => s.level >= 10 },
  combo_5: { icon: '🔥', name: 'On Fire!', desc: 'Get a 5x feeding combo', check: s => s.maxCombo >= 5 },
  happy_max: { icon: '🌈', name: 'Pure Joy', desc: 'Reach 100 happiness', check: s => s.happiness >= 100 },
  food_collector: { icon: '🍽️', name: 'Foodie', desc: 'Collect 10 different foods', check: s => Object.keys(s.foodInventory).length >= 10 },
  memory_win: { icon: '🧠', name: 'Memory Whiz', desc: 'Win the memory game', check: s => s.gamesWon >= 1 },
  streak_7: { icon: '🔥', name: 'Week Streak', desc: 'Maintain a 7-day streak', check: s => s.streak >= 7 },
  treat_hoarder: { icon: '🪙', name: 'Treat Hoarder', desc: 'Collect 50 treats', check: s => s.totalTreatsAllTime >= 50 },
  evo_2: { icon: '✨', name: 'Evolved', desc: 'Reach evolution stage 2', check: s => s.level >= 6 }
};

// ── Shop Items ──
const SHOP_ITEMS = [
  { id: 'crown', emoji: '👑', name: 'Crown', price: 20 },
  { id: 'bow', emoji: '🎀', name: 'Bow', price: 15 },
  { id: 'hat', emoji: '🎩', name: 'Top Hat', price: 25 },
  { id: 'sunglasses', emoji: '🕶️', name: 'Shades', price: 15 },
  { id: 'halo', emoji: '😇', name: 'Halo', price: 30 },
  { id: 'fire', emoji: '🔥', name: 'Fire Crown', price: 40 },
  { id: 'star', emoji: '⭐', name: 'Star', price: 10 },
  { id: 'heart', emoji: '💖', name: 'Heart', price: 12 }
];

// Tracking stats for achievements (persisted separately)
let totalFeeds = 0;
let totalPets = 0;
let totalDances = 0;
let maxCombo = 0;

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

function playChompSound() { playTone(200, 0.15, 'sawtooth', 0.1); setTimeout(() => playTone(300, 0.1, 'sawtooth', 0.08), 80); }
function playBounceSound() { playTone(400, 0.1, 'sine', 0.12); setTimeout(() => playTone(600, 0.08, 'sine', 0.1), 60); }
function playPetSound() { playTone(500, 0.2, 'triangle', 0.1); }
function playDanceSound() { playTone(300, 0.08, 'square', 0.06); setTimeout(() => playTone(500, 0.08, 'square', 0.06), 100); setTimeout(() => playTone(700, 0.08, 'square', 0.06), 200); }
function playLevelUpSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2, 'sine', 0.15), i * 120));
}
function playAchievementSound() {
  const notes = [784, 988, 1175, 1319];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.15, 'sine', 0.12), i * 100));
}
function playTreatSound() { playTone(800, 0.1, 'sine', 0.1); setTimeout(() => playTone(1000, 0.1, 'sine', 0.1), 80); }
function playGameSound() { playTone(400, 0.08, 'triangle', 0.08); setTimeout(() => playTone(600, 0.08, 'triangle', 0.08), 80); }
function playBuySound() { playTone(500, 0.1, 'sine', 0.1); setTimeout(() => playTone(700, 0.1, 'sine', 0.1), 100); setTimeout(() => playTone(900, 0.15, 'sine', 0.1), 200); }
function playEvoSound() {
  const notes = [262, 330, 392, 523, 659, 784];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.25, 'sine', 0.12), i * 150));
}

// ── Helpers ──
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function setMessage(text) { messageText.textContent = text; }
function updateStats() {
  happinessEl.textContent = Math.round(happiness);
  fullnessEl.textContent = Math.round(fullness);
}
function updateXP() {
  const pct = Math.min((xp / XP_PER_LEVEL) * 100, 100);
  xpFill.style.width = pct + '%';
  xpText.textContent = `${xp} / ${XP_PER_LEVEL} XP`;
}
function updateLevelBadge() { levelBadge.textContent = `Lv.${level}`; }

function addXP(amount) {
  xp += amount;
  totalXpAllTime += amount;
  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL;
    level++;
    updateLevelBadge();
    playLevelUpSound();
    showLevelUpFlash();
    setMessage(randomFrom(messages.levelUp));
    updateEvolution();
    checkAchievements();
  }
  updateXP();
  checkAchievements();
}

function addTreats(amount) {
  treats += amount;
  totalTreatsAllTime += amount;
  treatsCount.textContent = treats;
  shopTreats.textContent = treats;
  if (amount > 0) {
    playTreatSound();
    showTreatPopup(amount);
  }
  checkAchievements();
}

function showTreatPopup(amount) {
  const popup = document.createElement('div');
  popup.className = 'treat-popup';
  popup.textContent = `+${amount} 🪙`;
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

// ── Evolution System ──
function getEvolutionStage() {
  if (level >= 10) return 3;
  if (level >= 6) return 2;
  if (level >= 3) return 1;
  return 0;
}

function updateEvolution() {
  const stage = getEvolutionStage();
  chompaBody.classList.remove('evo-1', 'evo-2', 'evo-3');
  if (stage >= 1) chompaBody.classList.add('evo-1');
  if (stage >= 2) chompaBody.classList.add('evo-2');
  if (stage >= 3) chompaBody.classList.add('evo-3');

  if (stage > 0) {
    evoIndicator.classList.remove('hidden');
    evoIndicator.textContent = ['✨', '💫', '🌟'][stage - 1];
    if (stage === 2) evoIndicator.style.color = '#a855f7';
    if (stage === 3) evoIndicator.style.color = '#f59e0b';
  } else {
    evoIndicator.classList.add('hidden');
  }

  // Trigger evolution animation on stage change
  if (stage > 0) chompaBody.style.animation = 'evoPulse 1s ease';
  setTimeout(() => { if (chompaBody) chompaBody.style.animation = ''; }, 1000);
}

// ── Mood System ──
function getMood() {
  if (isSleeping) return 'sleepy';
  if (happiness >= 80) return 'excited';
  if (happiness >= 60) return 'happy';
  if (happiness <= 20) return 'angry';
  if (happiness <= 35) return 'sad';
  return 'neutral';
}

function updateMood() {
  const mood = getMood();
  const bodyClasses = ['mood-happy', 'mood-sad', 'mood-angry', 'mood-excited', 'mood-sleepy', 'mood-neutral'];
  bodyClasses.forEach(c => {
    document.body.classList.remove(c);
    chompaBody.classList.remove(c);
  });
  if (mood !== 'neutral') {
    document.body.classList.add('mood-' + mood);
    chompaBody.classList.add('mood-' + mood);
  }
  moodText.textContent = mood;
  moodIcon.textContent = moodIcons[mood] || '😐';

  if (isSleeping) {
    chompa.classList.add('sleeping');
    sleepZ.classList.add('visible');
  } else {
    chompa.classList.remove('sleeping');
    sleepZ.classList.remove('visible');
  }
}

// ── Combo ──
function incrementCombo() {
  combo++;
  if (combo > maxCombo) maxCombo = combo;
  comboDisplay.classList.remove('hidden');
  comboCount.textContent = combo;
}
function resetCombo() {
  combo = 0;
  comboDisplay.classList.add('hidden');
}

// ── Inventory ──
function addToInventory(food) {
  if (!foodInventory[food]) foodInventory[food] = 0;
  foodInventory[food]++;
  updateInventory();
  checkAchievements();
}

function updateInventory() {
  const count = Object.keys(foodInventory).length;
  foodCount.textContent = count;
  inventoryGrid.innerHTML = '';
  Object.entries(foodInventory).forEach(([food, cnt]) => {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.innerHTML = `${food}<span class="inv-count">x${cnt}</span>`;
    inventoryGrid.appendChild(div);
  });
}

// ── Achievements ──
function checkAchievements() {
  const state = { totalFeeds, totalPets, totalDances, bounces, level, maxCombo, happiness, foodInventory, gamesWon, streak, totalTreatsAllTime };
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
  addTreats(5);
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

// ── Eye Tracking ──
document.addEventListener('mousemove', (e) => {
  if (isSleeping) return;
  const rect = chompa.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);
  const moveX = clamp(dx * 5, -5, 5);
  const moveY = clamp(dy * 5, -5, 5);
  leftPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
  rightPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// ── Name System ──
function openNameModal() {
  nameInput.value = chompaName;
  nameModal.classList.remove('hidden');
  nameInput.focus();
  nameInput.select();
}

function saveName() {
  const newName = nameInput.value.trim() || 'chompa';
  chompaName = newName;
  nameTag.textContent = chompaName;
  nameModal.classList.add('hidden');
  setMessage(`"${chompaName}" ${randomFrom(messages.name)}`);
  autosave();
}

function cancelName() {
  nameModal.classList.add('hidden');
}

// ── Feed ──
function feedChompa() {
  if (isSleeping) return;
  const emoji = randomFrom(foodEmojis);
  currentFood.textContent = emoji;
  foodLabel.textContent = `${emoji} ? chompa chomps it!`;
  currentFood.classList.remove('bounce');
  void currentFood.offsetWidth;
  currentFood.classList.add('bounce');
  chompa.classList.remove('chomping');
  void chompa.offsetWidth;
  chompa.classList.add('chomping');
  mouth.classList.add('open');
  setTimeout(() => mouth.classList.remove('open'), 400);

  playChompSound();
  addTreats(1);

  if (fullness >= 90) {
    resetCombo();
    fullness = 100;
    setMessage(randomFrom(messages.full));
  } else {
    incrementCombo();
    const comboBonus = Math.min(combo, 5);
    fullness = clamp(fullness + 8 + comboBonus, 0, 100);
    happiness = clamp(happiness + 4 + comboBonus * 0.5, 0, 100);
    addXP(10 + comboBonus * 2);
    setMessage(randomFrom(messages.happy));
    showCheeks();
  }

  addToInventory(emoji);
  totalFeeds++;
  spawnParticles(emoji, 5);
  updateStats();
  checkSleepy();
  checkAchievements();
  updateAttentionBadge();
}

// ── Play ──
function playWithChompa() {
  if (isSleeping) return;
  chompa.classList.remove('bouncing');
  void chompa.offsetWidth;
  chompa.classList.add('bouncing');
  playBounceSound();
  bounces++;
  bouncesEl.textContent = bounces;
  const bounceGain = 8 - Math.min(bounces * 0.05, 3);
  happiness = clamp(happiness + bounceGain, 0, 100);
  fullness = clamp(fullness - 3, 0, 100);
  addXP(5);
  addTreats(1);
  setMessage(randomFrom(messages.playing));
  showCheeks();
  spawnParticles('🎾', 3);
  updateStats();
  checkBoredom();
  checkAchievements();
  updateAttentionBadge();
}

// ── Pet ──
function petChompa() {
  if (isSleeping) return;
  chompa.classList.remove('petting');
  void chompa.offsetWidth;
  chompa.classList.add('petting');
  playPetSound();
  isPetting = true;
  if (petTimeout) clearTimeout(petTimeout);
  petTimeout = setTimeout(() => { isPetting = false; }, 1500);
  happiness = clamp(happiness + 6, 0, 100);
  totalPets++;
  addXP(4);
  addTreats(1);
  setMessage(randomFrom(messages.pet));
  showCheeks();
  spawnParticles('❤️', 4);
  updateStats();
  checkAchievements();
  updateAttentionBadge();
}

// ── Dance ──
function danceChompa() {
  if (isSleeping) return;
  chompa.classList.remove('dancing');
  void chompa.offsetWidth;
  chompa.classList.add('dancing');
  playDanceSound();
  happiness = clamp(happiness + 4, 0, 100);
  fullness = clamp(fullness - 2, 0, 100);
  totalDances++;
  addXP(6);
  addTreats(1);
  setMessage(randomFrom(messages.dance));
  showCheeks();
  spawnParticles('💃', 5);
  updateStats();
  checkAchievements();
  updateAttentionBadge();
}

// ── Sleep Toggle ──
function toggleSleep() {
  isSleeping = !isSleeping;
  if (isSleeping) {
    document.getElementById('sleepBtn').textContent = '☀️ Wake';
    setMessage(randomFrom(messages.sleep));
    chompa.classList.add('sleeping');
    spawnParticles('💤', 4);
    if (idleInterval) clearInterval(idleInterval);
    idleInterval = null;
  } else {
    document.getElementById('sleepBtn').textContent = '😴 Sleep';
    setMessage(randomFrom(messages.wake));
    chompa.classList.remove('sleeping');
    idleInterval = setInterval(() => {
      if (Math.random() < 0.3 && !isSleeping) {
        mouth.classList.toggle('open');
        setTimeout(() => mouth.classList.remove('open'), 300);
      }
    }, 4000);
    happiness = clamp(happiness + 5, 0, 100);
    addTreats(2);
    updateStats();
  }
  updateMood();
  updateAttentionBadge();
}

// ── Rain Minigame ──
let rainDrops = [];
let rainCollected = 0;
let rainRunning = false;

function toggleRain() {
  isRaining = !isRaining;
  if (isRaining) {
    document.getElementById('rainBtn').textContent = '☀️ Stop Rain';
    rainCanvas.classList.remove('hidden');
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
    rainDrops = [];
    rainCollected = 0;
    rainRunning = true;
    setMessage('catch the raindrops! click on them! 🌧️');

    const spawnInterval = setInterval(() => {
      if (!rainRunning) { clearInterval(spawnInterval); return; }
      for (let i = 0; i < 3; i++) {
        rainDrops.push({
          x: Math.random() * rainCanvas.width,
          y: -10 - Math.random() * 50,
          speed: 3 + Math.random() * 4,
          size: 15 + Math.random() * 20,
          collected: false
        });
      }
    }, 100);

    rainCanvas.onclick = (e) => {
      if (!rainRunning) return;
      const rect = rainCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      rainDrops.forEach(d => {
        if (!d.collected && Math.hypot(d.x - mx, d.y - my) < d.size) {
          d.collected = true;
          rainCollected++;
          playTone(600 + rainCollected * 20, 0.1, 'sine', 0.08);
          spawnParticles('💧', 2);
          if (rainCollected % 5 === 0) {
            happiness = clamp(happiness + 2, 0, 100);
            addXP(3);
            addTreats(1);
            updateStats();
            setMessage(`collected ${rainCollected} drops! 🌧️`);
          }
        }
      });
    };

    function drawRain() {
      if (!rainRunning) { ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height); return; }
      ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, rainCanvas.height);
      gradient.addColorStop(0, 'rgba(148, 163, 184, 0.05)');
      gradient.addColorStop(1, 'rgba(148, 163, 184, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);

      rainDrops = rainDrops.filter(d => d.y < rainCanvas.height + 50);
      rainDrops.forEach(d => {
        if (d.collected) return;
        d.y += d.speed;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148, 203, 255, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 203, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(d.x - 2, d.y - 2, d.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      });
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 20px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`💧 ${rainCollected}`, rainCanvas.width / 2, 40);

      rainAnimId = requestAnimationFrame(drawRain);
    }
    drawRain();
    checkBoredom();
    spawnParticles('🌧️', 5);
  } else {
    document.getElementById('rainBtn').textContent = '🌧️ Rain';
    rainRunning = false;
    if (rainAnimId) cancelAnimationFrame(rainAnimId);
    rainCanvas.classList.add('hidden');
    ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    rainCanvas.onclick = null;
    setMessage('the rain stopped... 🌤️');
  }
  updateAttentionBadge();
}

// ── Memory Game ──
let gameCards = [];
let gameSelected = [];
let gameMatched = 0;
let gameTurnCount = 0;
let gameLocked = false;

const GAME_EMOJIS = ['🍪', '🍕', '🍔', '🍩', '🍎', '🍌', '🍇', '🍓'];

function startGame() {
  gameSection.classList.remove('hidden');
  gameMatched = 0;
  gameTurnCount = 0;
  gameSelected = [];
  gameLocked = false;
  gameScore.textContent = 'Pairs: 0';
  gameTurns.textContent = 'Turns: 0';

  // Create pairs and shuffle
  let cards = [...GAME_EMOJIS, ...GAME_EMOJIS];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  gameGrid.innerHTML = '';
  gameCards = cards;
  cards.forEach((emoji, index) => {
    const div = document.createElement('div');
    div.className = 'game-card';
    div.dataset.index = index;
    div.dataset.emoji = emoji;
    div.addEventListener('click', () => flipCard(div));
    gameGrid.appendChild(div);
  });
}

function flipCard(el) {
  if (gameLocked) return;
  if (el.classList.contains('matched') || el.classList.contains('selected')) return;
  if (gameSelected.length >= 2) return;

  el.classList.add('selected');
  el.textContent = el.dataset.emoji;
  gameSelected.push(el);
  playGameSound();

  if (gameSelected.length === 2) {
    gameLocked = true;
    gameTurnCount++;
    gameTurns.textContent = `Turns: ${gameTurnCount}`;

    if (gameSelected[0].dataset.emoji === gameSelected[1].dataset.emoji) {
      // Match!
      gameSelected[0].classList.add('matched');
      gameSelected[1].classList.add('matched');
      gameMatched++;
      gameScore.textContent = `Pairs: ${gameMatched}`;
      gameSelected = [];
      gameLocked = false;

      if (gameMatched === GAME_EMOJIS.length) {
        // Game won!
        setTimeout(() => {
          setMessage(randomFrom(messages.game));
          gamesWon++;
          addXP(20);
          addTreats(5);
          happiness = clamp(happiness + 10, 0, 100);
          updateStats();
          playLevelUpSound();
          spawnParticles('🎉', 10);
          checkAchievements();
          updateAttentionBadge();
        }, 300);
      }
    } else {
      // No match
      setTimeout(() => {
        gameSelected.forEach(c => {
          c.classList.remove('selected');
          c.textContent = '';
        });
        gameSelected = [];
        gameLocked = false;
      }, 800);
    }
  }
}

function closeGameSection() {
  gameSection.classList.add('hidden');
}

// ── Shop System ──
function openShop() {
  shopSection.classList.remove('hidden');
  shopTreats.textContent = treats;
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
      <span class="item-price">${ownedAccessories.includes(item.id) ? '✅ Owned' : `🪙 ${item.price}`}</span>
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

  if (treats < item.price) {
    setMessage(`not enough treats! need ${item.price} 🪙`);
    return;
  }

  treats -= item.price;
  treatsCount.textContent = treats;
  shopTreats.textContent = treats;
  ownedAccessories.push(item.id);
  equippedAccessory = item.id;
  accessorySlot.textContent = item.emoji;
  playBuySound();
  setMessage(`bought ${item.name}! ${randomFrom(messages.shop)}`);
  spawnParticles('🪙', 5);
  autosave();
  renderShop();
}

function closeShopSection() {
  shopSection.classList.add('hidden');
}

// ── Daily Streak System ──
function checkDailyStreak() {
  const today = new Date().toDateString();
  if (!lastVisitDate) {
    // First visit ever
    lastVisitDate = today;
    streak = 1;
    setMessage(`welcome! day ${streak}! ${randomFrom(messages.streak)}`);
    addTreats(3);
    addXP(10);
  } else if (lastVisitDate === today) {
    // Already visited today
    return;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastVisitDate === yesterdayStr) {
      // Consecutive day
      streak++;
      setMessage(`day ${streak} streak! ${randomFrom(messages.streak)}`);
      const bonus = Math.min(streak, 7);
      addTreats(2 + bonus);
      addXP(5 + bonus * 2);
      happiness = clamp(happiness + 3, 0, 100);
      spawnParticles('🔥', streak);
    } else {
      // Streak broken
      streak = 1;
      setMessage('streak reset... but you\'re back! ❤️');
      addTreats(2);
    }
    lastVisitDate = today;
  }

  streakCount.textContent = streak;
  if (streak >= 3) streakDisplay.style.color = '#f59e0b';
  if (streak >= 7) streakDisplay.style.color = '#a855f7';
  updateStats();
  checkAchievements();
  updateAttentionBadge();
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
    const rect = chompa.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 80;
    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 40;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

// ── Passive State Checks ──
function checkSleepy() {
  if (fullness >= 90) {
    setTimeout(() => setMessage(randomFrom(messages.sleepy)), 1500);
  }
}

let boredomTimer = null;
function checkBoredom() {
  if (boredomTimer) clearTimeout(boredomTimer);
  boredomTimer = setTimeout(() => {
    if (!isPetting && fullness < 90 && !isSleeping && !isRaining) {
      setMessage(randomFrom(messages.bored));
      spawnParticles('💤', 2);
    }
  }, 10000);
}

// ── Auto-depletion ──
let decayCount = 0;
function startDecay() {
  if (decayInterval) clearInterval(decayInterval);
  decayInterval = setInterval(() => {
    if (isSleeping) return;
    if (fullness > 10) fullness = clamp(fullness - 1, 0, 100);
    if (fullness < 30 && Math.random() < 0.3) setMessage(randomFrom(messages.hungry));
    if (happiness > 10 && Math.random() < 0.4) happiness = clamp(happiness - 0.5, 0, 100);
    decayCount++;
    if (decayCount % 6 === 0 && fullness < 30) setMessage(randomFrom(messages.hungry));
    updateStats();
    updateMood();
    updateAttentionBadge();
    autosave();
  }, 5000);
}

// ── Idle mouth ──
function startIdleAnimation() {
  if (idleInterval) clearInterval(idleInterval);
  idleInterval = setInterval(() => {
    if (Math.random() < 0.3 && !isSleeping) {
      mouth.classList.toggle('open');
      setTimeout(() => mouth.classList.remove('open'), 300);
    }
  }, 4000);
}

// ── Session Timer ──
function startSessionTimer() {
  if (sessionInterval) clearInterval(sessionInterval);
  sessionInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    sessionTime.textContent = `${mins}m ${secs}s`;
  }, 1000);
}

// ── Stats Overlay ──
function updateStatsOverlay() {
  totalXpEarned.textContent = totalXpAllTime;
  totalTreatsEarned.textContent = totalTreatsAllTime;
  totalFeedsStat.textContent = totalFeeds;
  totalPetsStat.textContent = totalPets;
  totalDancesStat.textContent = totalDances;
  maxComboStat.textContent = maxCombo;
  gamesWonStat.textContent = gamesWon;
  streakStat.textContent = `${streak} days`;
}

function toggleStatsOverlay() {
  statsOverlay.classList.toggle('hidden');
  updateStatsOverlay();
}

// ── Attention Badge ──
function updateAttentionBadge() {
  if (isSleeping) {
    attentionBadge.classList.add('hidden');
    return;
  }

  let needsAttention = false;
  if (fullness < 30) needsAttention = true;
  if (happiness < 30) needsAttention = true;

  if (needsAttention) {
    attentionBadge.classList.remove('hidden');
  } else {
    attentionBadge.classList.add('hidden');
  }
}

// ── Save / Load ──
function autosave() {
  const data = {
    happiness, fullness, bounces, xp, level, combo, totalFeeds, totalPets, totalDances, maxCombo,
    achievements, foodInventory, treats, streak, lastVisitDate, chompaName, ownedAccessories,
    equippedAccessory, gamesWon, totalXpAllTime, totalTreatsAllTime
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (_) {}
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    happiness = data.happiness ?? 50;
    fullness = data.fullness ?? 50;
    bounces = data.bounces ?? 0;
    xp = data.xp ?? 0;
    level = data.level ?? 1;
    combo = data.combo ?? 0;
    totalFeeds = data.totalFeeds ?? 0;
    totalPets = data.totalPets ?? 0;
    totalDances = data.totalDances ?? 0;
    maxCombo = data.maxCombo ?? 0;
    achievements = data.achievements ?? {};
    foodInventory = data.foodInventory ?? {};
    treats = data.treats ?? 0;
    streak = data.streak ?? 0;
    lastVisitDate = data.lastVisitDate ?? null;
    chompaName = data.chompaName ?? 'chompa';
    ownedAccessories = data.ownedAccessories ?? [];
    equippedAccessory = data.equippedAccessory ?? null;
    gamesWon = data.gamesWon ?? 0;
    totalXpAllTime = data.totalXpAllTime ?? 0;
    totalTreatsAllTime = data.totalTreatsAllTime ?? 0;

    // Restore UI
    nameTag.textContent = chompaName;
    treatsCount.textContent = treats;
    shopTreats.textContent = treats;
    streakCount.textContent = streak;
    if (streak >= 3) streakDisplay.style.color = '#f59e0b';
    if (streak >= 7) streakDisplay.style.color = '#a855f7';
    if (equippedAccessory) {
      const item = SHOP_ITEMS.find(i => i.id === equippedAccessory);
      if (item) accessorySlot.textContent = item.emoji;
    }

    updateStats();
    updateXP();
    updateLevelBadge();
    bouncesEl.textContent = bounces;
    updateInventory();
    updateAchievementUI();
    updateMood();
    updateEvolution();
    updateAttentionBadge();
  } catch (_) {}
}

// ── Toggle Sections ──
document.getElementById('toggleAchievements').addEventListener('click', () => {
  document.getElementById('achievementsGrid').classList.toggle('hidden');
});
document.getElementById('toggleInventory').addEventListener('click', () => {
  document.getElementById('inventoryGrid').classList.toggle('hidden');
});

// ── Event Listeners ──
document.getElementById('feedBtn').addEventListener('click', feedChompa);
document.getElementById('playBtn').addEventListener('click', playWithChompa);
document.getElementById('petBtn').addEventListener('click', petChompa);
document.getElementById('danceBtn').addEventListener('click', danceChompa);
document.getElementById('sleepBtn').addEventListener('click', toggleSleep);
document.getElementById('rainBtn').addEventListener('click', toggleRain);
chompa.addEventListener('click', () => { if (!isSleeping) feedChompa(); });
foodBucket.addEventListener('click', () => {
  if (isSleeping) return;
  const newFood = randomFrom(foodEmojis);
  currentFood.textContent = newFood;
  currentFood.classList.remove('bounce');
  void currentFood.offsetWidth;
  currentFood.classList.add('bounce');
  foodLabel.textContent = `maybe try ${newFood}?`;
});

// New event listeners
nameEditBtn.addEventListener('click', openNameModal);
nameSaveBtn.addEventListener('click', saveName);
nameCancelBtn.addEventListener('click', cancelName);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelName(); });

gameBtn.addEventListener('click', startGame);
closeGame.addEventListener('click', closeGameSection);

shopBtn.addEventListener('click', openShop);
closeShop.addEventListener('click', closeShopSection);

toggleStats.addEventListener('click', toggleStatsOverlay);

attentionBadge.addEventListener('click', () => {
  attentionBadge.classList.add('hidden');
  if (fullness < 30) setMessage('chompa is hungry! feed me! 🍪');
  else if (happiness < 30) setMessage('chompa is sad! play with me! 🎾');
});

// ── Window Resize ──
window.addEventListener('resize', () => {
  if (isRaining) {
    rainCanvas.width = window.innerWidth;
    rainCanvas.height = window.innerHeight;
  }
});

// ── Init ──
loadSave();
startDecay();
startIdleAnimation();
startSessionTimer();
setTimeout(() => {
  checkBoredom();
  checkDailyStreak();
}, 4000);
updateMood();
updateAttentionBadge();

console.log('🍪 CHOMPA v3 — with new features!');