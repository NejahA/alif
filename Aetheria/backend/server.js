const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-Memory Database Store for Aetheria Engine
const db = {
  userProfile: {
    name: "Aether Traveler",
    level: 5,
    xp: 720,
    nextLevelXp: 1000,
    title: "Vibe Alchemist",
    stats: {
      focus: 45,
      creativity: 38,
      intellect: 52,
      vitality: 30
    },
    badges: ["First Capsule", "Deep Focus Master", "Synthwave Voyager"],
    equippedRelic: "rel-1",
    activePetId: "pet-1",
    activeGuildId: "guild-1"
  },

  pets: [
    {
      id: "pet-1",
      name: "Cyber Kitsune",
      species: "Kitsune",
      icon: "🦊",
      level: 4,
      happiness: 85,
      auraBuff: "+20% Focus XP",
      stage: "Astral Form",
      isSelected: true
    },
    {
      id: "pet-2",
      name: "Stellar Dragon",
      species: "Dragon",
      icon: "🐉",
      level: 6,
      happiness: 92,
      auraBuff: "+15% All Stat XP",
      stage: "Mythic Elder",
      isSelected: false
    },
    {
      id: "pet-3",
      name: "Void Phoenix",
      species: "Phoenix",
      icon: "🦅",
      level: 2,
      happiness: 70,
      auraBuff: "+25% Creativity XP",
      stage: "Hatchling",
      isSelected: false
    }
  ],

  guilds: [
    {
      id: "guild-1",
      name: "Order of the Cyber Sun",
      tag: "[SUN]",
      membersCount: 48,
      totalFocusHours: 1420,
      guildLevel: 12,
      motto: "Illuminating the digital cosmos through deep focus.",
      isJoined: true
    },
    {
      id: "guild-2",
      name: "Void Synthesizers",
      tag: "[VOID]",
      membersCount: 35,
      totalFocusHours: 980,
      guildLevel: 9,
      motto: "Synthesizing harmony from cosmic noise.",
      isJoined: false
    },
    {
      id: "guild-3",
      name: "Chrono Guardians",
      tag: "[TIME]",
      membersCount: 62,
      totalFocusHours: 2150,
      guildLevel: 15,
      motto: "Guarding memory vaults across time dimensions.",
      isJoined: false
    }
  ],

  achievements: [
    { id: "ach-1", title: "Novice Alchemist", desc: "Initiate your journey into Aetheria.", rewardXp: 100, unlocked: true, icon: "🌟" },
    { id: "ach-2", title: "World Boss Crusher", desc: "Deal damage to The Burnout Titan.", rewardXp: 200, unlocked: true, icon: "⚔️" },
    { id: "ach-3", title: "Star Weaver", desc: "Anchor 3 mood stars in Aether Constellations.", rewardXp: 150, unlocked: true, icon: "🌌" },
    { id: "ach-4", title: "Master Transmuter", desc: "Forge a Mythic Relic in the Alchemy Lab.", rewardXp: 300, unlocked: false, icon: "🧪" },
    { id: "ach-5", title: "Cyber Arcade Champion", desc: "Score 100+ points in Cyber Deflector mini-game.", rewardXp: 250, unlocked: false, icon: "👾" }
  ],

  worldBoss: {
    id: "boss-1",
    name: "The Burnout Titan",
    maxHp: 1000,
    currentHp: 750,
    raidersCount: 24,
    rewardXp: 500,
    bossImage: "🌋"
  },

  constellations: [
    { id: "star-1", name: "Serenity Prime", mood: "Calm", color: "#00F5FF", x: 0.2, y: 0.3, date: "2026-09-24" },
    { id: "star-2", name: "Creative Pulse", mood: "Inspired", color: "#FF007F", x: 0.4, y: 0.6, date: "2026-09-25" },
    { id: "star-3", name: "Focus Beacon", mood: "Deep Focus", color: "#7000FF", x: 0.7, y: 0.4, date: "2026-09-26" }
  ],

  arcanaCards: [
    {
      id: "card-1",
      name: "The Synthesizer",
      icon: "🎹",
      buff: "+20% Creativity XP",
      lore: "Master of visual soundscapes and harmonic resonant frequencies."
    },
    {
      id: "card-2",
      name: "The Focus Monk",
      icon: "🧘",
      buff: "+15 Focus Stat",
      lore: "Unwavering attention that shatters all procrastination phantoms."
    },
    {
      id: "card-3",
      name: "The Star Voyager",
      icon: "🌌",
      buff: "+25% Quest XP",
      lore: "Charted uncharted celestial constellations in the Aether realm."
    }
  ],

  inventory: [
    {
      id: "rel-1",
      name: "Crown of Aether",
      description: "Boosts Focus XP gain by +15% and emits golden particle glow.",
      statBoost: "+15% Focus XP",
      rarity: "Legendary",
      icon: "👑",
      isEquipped: true
    },
    {
      id: "rel-2",
      name: "Lo-Fi Cyber Headphones",
      description: "Enhances Creativity during CyberLounge ambient sessions.",
      statBoost: "+10 Creativity",
      rarity: "Epic",
      icon: "🎧",
      isEquipped: false
    },
    {
      id: "rel-3",
      name: "Chrono Crystal Pendant",
      description: "Allows early decryption preview for locked Time Capsules.",
      statBoost: "Vault Insight",
      rarity: "Rare",
      icon: "🔮",
      isEquipped: false
    }
  ],

  leaderboard: [
    { rank: 1, name: "NeonValkyrie", level: 18, xp: 24500, title: "Grand Aether Archmage", badge: "🥇" },
    { rank: 2, name: "CipherPulse", level: 14, xp: 18200, title: "Lo-Fi Mastermind", badge: "🥈" },
    { rank: 3, name: "Aether Traveler (You)", level: 5, xp: 720, title: "Vibe Alchemist", badge: "🥉" },
    { rank: 4, name: "SolarDreamer", level: 4, xp: 540, title: "Ambient Apprentice", badge: "✨" },
    { rank: 5, name: "ChronoKeeper", level: 3, xp: 390, title: "Vault Guardian", badge: "✨" }
  ],

  quests: [
    {
      id: "q-101",
      title: "25-Min Deep Focus Raid",
      description: "Complete a Pomodoro focus session to defeat the Procrastination Phantom.",
      stat: "focus",
      xpReward: 150,
      completed: false,
      category: "Daily Quest",
      difficulty: "Medium"
    },
    {
      id: "q-102",
      title: "Paint a Synesthesia Canvas",
      description: "Draw 5 ambient glow strokes in the Synesthesia Audio Pad.",
      stat: "creativity",
      xpReward: 100,
      completed: false,
      category: "Creative Quest",
      difficulty: "Easy"
    },
    {
      id: "q-103",
      title: "Seal a Time Capsule",
      description: "Log your current mood, audio thought, or goals into ChronoVerse.",
      stat: "intellect",
      xpReward: 200,
      completed: false,
      category: "Vault Quest",
      difficulty: "Hard"
    }
  ],

  channels: [
    {
      id: "ch-1",
      name: "Cyber Neon Rain",
      genre: "Lo-Fi Synthwave",
      listeners: 142,
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
      color: "#00F5FF"
    },
    {
      id: "ch-2",
      name: "Starlight Solar Wind",
      genre: "Ambient Space",
      listeners: 89,
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73228.mp3?filename=ambient-piano-amp-strings-10711.mp3",
      color: "#FF007F"
    },
    {
      id: "ch-3",
      name: "Deep Tokyo Midnight",
      genre: "Chillstep",
      listeners: 215,
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-lofi-song-8444.mp3",
      color: "#7000FF"
    }
  ],

  timeCapsules: [
    {
      id: "cap-1",
      title: "Letter to Future Self 2027",
      content: "May your code run without bugs and your mind stay peaceful.",
      unlockDate: "2027-01-01",
      requiredLevel: 1,
      isUnlocked: true,
      createdAt: "2026-09-26"
    },
    {
      id: "cap-2",
      title: "Secret Level 10 Vault",
      content: "Congratulations on reaching Level 10! You unlocked the Master Synthesizer Title!",
      unlockDate: "2026-10-01",
      requiredLevel: 10,
      isUnlocked: false,
      createdAt: "2026-09-26"
    }
  ]
};

// REST API Endpoints

// Get User Profile
app.get('/api/user/profile', (req, res) => {
  res.json({ success: true, profile: db.userProfile });
});

// Get Pets
app.get('/api/pets', (req, res) => {
  res.json({ success: true, pets: db.pets });
});

// Feed Pet
app.post('/api/pets/feed', (req, res) => {
  const { petId } = req.body;
  const pet = db.pets.find(p => p.id === petId);
  if (pet) {
    pet.happiness = Math.min(100, pet.happiness + 15);
    pet.level += 1;
    if (pet.level >= 10) pet.stage = "Mythic Elder";
    else if (pet.level >= 5) pet.stage = "Astral Form";
    db.userProfile.xp += 40;
  }
  res.json({ success: true, pet, pets: db.pets });
});

// Select Active Pet
app.post('/api/pets/select', (req, res) => {
  const { petId } = req.body;
  db.pets.forEach(p => p.isSelected = (p.id === petId));
  db.userProfile.activePetId = petId;
  res.json({ success: true, pets: db.pets });
});

// Get Guilds
app.get('/api/guilds', (req, res) => {
  res.json({ success: true, guilds: db.guilds });
});

// Join Guild
app.post('/api/guilds/join', (req, res) => {
  const { guildId } = req.body;
  db.guilds.forEach(g => {
    if (g.isJoined) g.membersCount -= 1;
    g.isJoined = (g.id === guildId);
    if (g.isJoined) g.membersCount += 1;
  });
  db.userProfile.activeGuildId = guildId;
  res.json({ success: true, guilds: db.guilds });
});

// Get Achievements
app.get('/api/achievements', (req, res) => {
  res.json({ success: true, achievements: db.achievements });
});

// Alchemy Transmutation Craft
app.post('/api/alchemy/craft', (req, res) => {
  const { item1Id, item2Id } = req.body;
  const mythicRelic = {
    id: `mythic-${Date.now()}`,
    name: "Philosopher's Celestial Stone",
    description: "Ultra-rare transmuted relic giving +25% all stat XP gains!",
    statBoost: "+25% All Stats XP",
    rarity: "Mythic",
    icon: "💎",
    isEquipped: true
  };
  db.inventory.forEach(i => i.isEquipped = false);
  db.inventory.push(mythicRelic);
  db.userProfile.equippedRelic = mythicRelic.id;
  db.userProfile.xp += 300;

  const ach = db.achievements.find(a => a.id === "ach-4");
  if (ach) ach.unlocked = true;

  res.json({ success: true, relic: mythicRelic, xpGain: 300, inventory: db.inventory });
});

// Submit Mini-game Score
app.post('/api/minigame/score', (req, res) => {
  const { score } = req.body;
  const xpEarned = Math.floor((Number(score) || 0) * 1.5);
  db.userProfile.xp += xpEarned;

  if (score >= 100) {
    const ach = db.achievements.find(a => a.id === "ach-5");
    if (ach) ach.unlocked = true;
  }

  res.json({ success: true, xpEarned, profile: db.userProfile });
});

// Get World Boss
app.get('/api/bosses/active', (req, res) => {
  res.json({ success: true, boss: db.worldBoss });
});

// Attack World Boss
app.post('/api/bosses/attack', (req, res) => {
  const { damage } = req.body;
  const dmg = Number(damage) || 25;
  db.worldBoss.currentHp = Math.max(0, db.worldBoss.currentHp - dmg);
  db.userProfile.xp += 50;

  io.emit('boss_damaged', { boss: db.worldBoss, attacker: db.userProfile.name, damage: dmg });
  res.json({ success: true, boss: db.worldBoss, xpReward: 50 });
});

// Get Constellations
app.get('/api/constellations', (req, res) => {
  res.json({ success: true, constellations: db.constellations });
});

// Add Mood Star to Constellation
app.post('/api/constellations/add', (req, res) => {
  const { name, mood, color, x, y } = req.body;
  const newStar = {
    id: `star-${Date.now()}`,
    name: name || "Glowing Star",
    mood: mood || "Calm",
    color: color || "#00F5FF",
    x: Number(x) || 0.5,
    y: Number(y) || 0.5,
    date: new Date().toISOString().split('T')[0]
  };
  db.constellations.push(newStar);
  res.json({ success: true, star: newStar, constellations: db.constellations });
});

// Draw Arcana Card
app.get('/api/oracle/card', (req, res) => {
  const card = db.arcanaCards[Math.floor(Math.random() * db.arcanaCards.length)];
  res.json({ success: true, card });
});

// Get Quests
app.get('/api/quests', (req, res) => {
  res.json({ success: true, quests: db.quests });
});

// Complete Quest
app.post('/api/quests/complete', (req, res) => {
  const { questId } = req.body;
  const quest = db.quests.find(q => q.id === questId);
  if (!quest) return res.status(404).json({ success: false, message: "Quest not found" });

  if (!quest.completed) {
    quest.completed = true;
    db.userProfile.xp += quest.xpReward;
    if (quest.stat && db.userProfile.stats[quest.stat] !== undefined) {
      db.userProfile.stats[quest.stat] += 5;
    }

    if (db.userProfile.xp >= db.userProfile.nextLevelXp) {
      db.userProfile.level += 1;
      db.userProfile.xp -= db.userProfile.nextLevelXp;
      db.userProfile.nextLevelXp = Math.floor(db.userProfile.nextLevelXp * 1.25);
    }

    io.emit('quest_completed', { user: db.userProfile.name, quest });
  }

  res.json({ success: true, profile: db.userProfile, quest });
});

// Create New Quest
app.post('/api/quests/add', (req, res) => {
  const { title, description, stat, xpReward, category } = req.body;
  const newQuest = {
    id: `q-${Date.now()}`,
    title: title || "Custom Life Quest",
    description: description || "Achieve your objective.",
    stat: stat || "focus",
    xpReward: xpReward || 100,
    completed: false,
    category: category || "Personal Quest",
    difficulty: "Medium"
  };
  db.quests.push(newQuest);
  res.json({ success: true, quest: newQuest });
});

// Get Inventory Relics
app.get('/api/inventory', (req, res) => {
  res.json({ success: true, inventory: db.inventory });
});

// Equip Relic Item
app.post('/api/inventory/equip', (req, res) => {
  const { relicId } = req.body;
  db.inventory.forEach(item => {
    item.isEquipped = (item.id === relicId);
  });
  db.userProfile.equippedRelic = relicId;
  res.json({ success: true, inventory: db.inventory });
});

// Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const userEntry = db.leaderboard.find(l => l.name.includes("Aether Traveler"));
  if (userEntry) {
    userEntry.level = db.userProfile.level;
    userEntry.xp = db.userProfile.xp;
  }
  db.leaderboard.sort((a, b) => b.level - a.level || b.xp - a.xp);
  db.leaderboard.forEach((item, idx) => item.rank = idx + 1);

  res.json({ success: true, leaderboard: db.leaderboard });
});

// AI Companion Oracle Wisdom
app.get('/api/oracle/vibe', (req, res) => {
  const quotes = [
    { title: "Flow State Aligned", text: "Your Focus attribute is surging! Dive deep into your high-priority creative quests today.", Stat: "Focus" },
    { title: "Harmonic Equilibrium", text: "The ambient weather is perfectly tuned for reflective journaling in ChronoVerse.", Stat: "Intellect" },
    { title: "Creative Supernova", text: "Touch the Synesthesia canvas to release cognitive tension and synthesize new ideas.", Stat: "Creativity" }
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ success: true, oracle: randomQuote });
});

// Get Lounge Channels
app.get('/api/lounge/channels', (req, res) => {
  res.json({ success: true, channels: db.channels });
});

// Get Time Capsules
app.get('/api/capsules', (req, res) => {
  db.timeCapsules.forEach(cap => {
    if (!cap.isUnlocked && db.userProfile.level >= cap.requiredLevel) {
      cap.isUnlocked = true;
    }
  });
  res.json({ success: true, capsules: db.timeCapsules });
});

// Create Time Capsule
app.post('/api/capsules/create', (req, res) => {
  const { title, content, unlockDate, requiredLevel } = req.body;
  const newCap = {
    id: `cap-${Date.now()}`,
    title: title || "Memory Vault",
    content: content || "",
    unlockDate: unlockDate || new Date().toISOString().split('T')[0],
    requiredLevel: Number(requiredLevel) || 1,
    isUnlocked: false,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.timeCapsules.push(newCap);
  res.json({ success: true, capsule: newCap });
});

// Real-Time Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`[Aetheria Server] Client connected: ${socket.id}`);

  socket.on('join_lounge', (channelId) => {
    socket.join(channelId);
  });

  socket.on('synesthesia_stroke', (strokeData) => {
    socket.broadcast.emit('synesthesia_stroke_receive', strokeData);
  });

  socket.on('disconnect', () => {
    console.log(`[Aetheria Server] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✨ [Aetheria Backend] Server running on http://localhost:${PORT}`);
});
