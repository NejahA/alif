/* =========================================================
   Tasneeme — core store
   State model, XP/level maths, achievements, quests, persistence
   ========================================================= */
(function () {
  "use strict";
  const TS = (window.TS = window.TS || {});

  /* ---------- constants ---------- */
  TS.ATTRS = ["body", "mind", "spirit", "craft"];
  TS.THEMES = [
    { id: "dawn", colors: ["#bfe0ff", "#ffe9c9", "#0f766e"] },
    { id: "dusk", colors: ["#3b2a63", "#ff9e7a", "#f472b6"] },
    { id: "abyss", colors: ["#03101f", "#0b3a52", "#22d3ee"] },
    { id: "grove", colors: ["#d9f0e0", "#fdf6d8", "#3f7d3f"] },
    { id: "rose", colors: ["#ffd9ea", "#ffe8cf", "#be185d"] },
    { id: "mono", colors: ["#1b1d24", "#2b2f3a", "#e5e7eb"] },
  ];

  TS.MOOD_FACES = ["😞", "😕", "😐", "🙂", "😄"];
  TS.MOOD_TAGS = ["calm", "anxious", "grateful", "tired", "inspired", "lonely", "proud", "restless", "hopeful", "foggy"];

  /* species unlocked per attribute by cumulative attribute XP */
  const SPECIES_TIERS = [0, 90, 220, 420, 700];
  TS.SPECIES = {
    body: [
      { id: "reed", icon: "🎋", tier: 0 }, { id: "sunflower", icon: "🌻", tier: 1 },
      { id: "berry", icon: "🫐", tier: 2 }, { id: "lotus", icon: "🪷", tier: 3 },
      { id: "banyan", icon: "🌳", tier: 4 },
    ],
    mind: [
      { id: "sage", icon: "🌿", tier: 0 }, { id: "iris", icon: "🌸", tier: 1 },
      { id: "mushroom", icon: "🍄", tier: 2 }, { id: "fern", icon: "🌾", tier: 3 },
      { id: "willow", icon: "🎍", tier: 4 },
    ],
    spirit: [
      { id: "moss", icon: "🍀", tier: 0 }, { id: "jasmine", icon: "🌼", tier: 1 },
      { id: "orchid", icon: "🌺", tier: 2 }, { id: "lavender", icon: "💐", tier: 3 },
      { id: "glowcap", icon: "✨", tier: 4 },
    ],
    craft: [
      { id: "clover", icon: "☘️", tier: 0 }, { id: "tulip", icon: "🌷", tier: 1 },
      { id: "cactus", icon: "🌵", tier: 2 }, { id: "bonsai", icon: "🪴", tier: 3 },
      { id: "crystal", icon: "🔮", tier: 4 },
    ],
  };

  const QUEST_POOL = [
    { id: "water", attr: "body", xp: 15, w: 2 },
    { id: "walk", attr: "body", xp: 20, w: 2 },
    { id: "stretch", attr: "body", xp: 12, w: 2 },
    { id: "sleep", attr: "body", xp: 20, w: 1 },
    { id: "read", attr: "mind", xp: 20, w: 2 },
    { id: "learn", attr: "mind", xp: 18, w: 2 },
    { id: "noPhone", attr: "mind", xp: 22, w: 1 },
    { id: "breathe", attr: "spirit", xp: 12, w: 2 },
    { id: "gratitude", attr: "spirit", xp: 15, w: 2 },
    { id: "kind", attr: "spirit", xp: 18, w: 1 },
    { id: "connect", attr: "spirit", xp: 16, w: 1 },
    { id: "create", attr: "craft", xp: 25, w: 2 },
    { id: "tidy", attr: "craft", xp: 14, w: 2 },
    { id: "practice", attr: "craft", xp: 22, w: 1 },
  ];

  const CONTRACTS = [
    { id: "streak7", icon: "🔥", goal: 7, metric: "streak" },
    { id: "streak30", icon: "🌋", goal: 30, metric: "streak" },
    { id: "checks100", icon: "✅", goal: 100, metric: "habitChecks" },
    { id: "focus600", icon: "⏱️", goal: 600, metric: "focusMinutes" },
    { id: "entries25", icon: "📓", goal: 25, metric: "entries" },
    { id: "days30", icon: "📅", goal: 30, metric: "daysActive" },
    { id: "level10", icon: "🌌", goal: 10, metric: "level" },
    { id: "quests50", icon: "🗺️", goal: 50, metric: "questsDone" },
  ];

  const ACHIEVEMENTS = [
    { id: "first_drop", icon: "💧", goal: 1, metric: "blooms" },
    { id: "first_habit", icon: "🌱", goal: 1, metric: "habitsCreated" },
    { id: "first_check", icon: "☑️", goal: 1, metric: "habitChecks" },
    { id: "first_focus", icon: "🎧", goal: 1, metric: "focusSessions" },
    { id: "first_mood", icon: "🌤️", goal: 1, metric: "moodLogs" },
    { id: "first_entry", icon: "📝", goal: 1, metric: "entries" },
    { id: "streak3", icon: "🔥", goal: 3, metric: "streak" },
    { id: "streak7", icon: "🔥", goal: 7, metric: "streak" },
    { id: "streak30", icon: "🌋", goal: 30, metric: "streak" },
    { id: "habits5", icon: "🌿", goal: 5, metric: "habitsCreated" },
    { id: "checks50", icon: "💪", goal: 50, metric: "habitChecks" },
    { id: "checks200", icon: "🏋️", goal: 200, metric: "habitChecks" },
    { id: "focus600", icon: "⏱️", goal: 600, metric: "focusMinutes" },
    { id: "focus3000", icon: "🕰️", goal: 3000, metric: "focusMinutes" },
    { id: "entries25", icon: "📚", goal: 25, metric: "entries" },
    { id: "quests25", icon: "🗺️", goal: 25, metric: "questsDone" },
    { id: "level5", icon: "⭐", goal: 5, metric: "level" },
    { id: "level10", icon: "🌟", goal: 10, metric: "level" },
    { id: "level20", icon: "🌌", goal: 20, metric: "level" },
    { id: "species10", icon: "🌳", goal: 10, metric: "species" },
    { id: "species20", icon: "🌴", goal: 20, metric: "species" },
    { id: "balanced", icon: "⚖️", goal: 150, metric: "minAttr" },
    { id: "blooms100", icon: "💦", goal: 100, metric: "blooms" },
    { id: "days30", icon: "📅", goal: 30, metric: "daysActive" },
  ];
  TS.ACHIEVEMENTS = ACHIEVEMENTS;
  TS.CONTRACTS = CONTRACTS;
  TS.QUEST_POOL = QUEST_POOL;

  /* ---------- level curve ---------- */
  const LEVELS = (function () {
    const a = [0];
    let need = 120;
    for (let i = 1; i < 200; i++) { a.push(a[i - 1] + need); need = Math.round(need * 1.16 + 45); }
    return a;
  })();
  function levelInfo(xp) {
    let lvl = 1;
    for (let i = LEVELS.length - 1; i >= 0; i--) { if (xp >= LEVELS[i]) { lvl = i + 1; break; } }
    const cur = LEVELS[lvl - 1] || 0;
    const next = LEVELS[lvl] != null ? LEVELS[lvl] : cur + 1;
    return { level: lvl, into: xp - cur, span: next - cur, pct: Math.max(0, Math.min(1, (xp - cur) / (next - cur))) };
  }
  TS.levelInfo = levelInfo;

  /* ---------- helpers ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  TS.dateKey = function (d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  TS.today = () => TS.dateKey(new Date());
  TS.addDays = function (key, n) { const [y, m, d] = key.split("-").map(Number); const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() + n); return TS.dateKey(dt); };
  TS.dayName = (key) => { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d).getDay(); };
  TS.uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  TS.rng = mulberry32;
  TS.hash = function (s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* ---------- default state ---------- */
  function defaultState() {
    return {
      version: 1,
      createdAt: Date.now(),
      profile: { name: "", onboarded: false, focus: "mind", xp: 0, drops: 20, streak: 0, bestStreak: 0, lastActive: null },
      attributes: { body: 0, mind: 0, spirit: 0, craft: 0 },
      habits: [],
      habitLog: {},
      focus: { sessions: [], totalMinutes: 0 },
      moods: {},
      journal: [],
      quests: {},
      settings: { lang: "en", theme: "dawn", sound: false, volume: 45, reduceMotion: false, particles: true },
      stats: { habitChecks: 0, focusMinutes: 0, focusSessions: 0, entries: 0, moodLogs: 0, blooms: 0, habitsCreated: 0, questsDone: 0 },
      daily: {},
      achievements: {},
      garden: { seed: Math.floor(Math.random() * 1e9) },
    };
  }
  TS.defaultState = defaultState;

  /* ---------- store ---------- */
  const KEY = "tasneeme.state.v1";
  const listeners = { change: [], toast: [], levelup: [], achievement: [] };

  const Store = {
    state: defaultState(),
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return () => this.off(ev, fn); },
    off(ev, fn) { listeners[ev] = (listeners[ev] || []).filter((f) => f !== fn); },
    emit(ev, payload) { (listeners[ev] || []).forEach((f) => { try { f(payload); } catch (e) { console.error(e); } }); },

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) { const parsed = JSON.parse(raw); this.state = this.migrate(parsed); }
      } catch (e) { console.warn("Tasneeme: could not read save, starting fresh.", e); }
      return this.state;
    },
    migrate(s) {
      const base = defaultState();
      const out = Object.assign(base, s || {});
      out.profile = Object.assign(base.profile, s && s.profile);
      out.settings = Object.assign(base.settings, s && s.settings);
      out.stats = Object.assign(base.stats, s && s.stats);
      out.attributes = Object.assign(base.attributes, s && s.attributes);
      out.focus = Object.assign(base.focus, s && s.focus);
      out.garden = Object.assign(base.garden, s && s.garden);
      out.daily = out.daily || {};
      out.habitLog = out.habitLog || {};
      out.moods = out.moods || {};
      return out;
    },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (e) { console.warn("Tasneeme: save failed", e); } },

    reset() { this.state = defaultState(); this.save(); this.emit("change"); },
    replace(raw) { this.state = this.migrate(raw); this.save(); this.emit("change"); },

    /* ----- daily bucket ----- */
    day(key) {
      key = key || TS.today();
      if (!this.state.daily[key]) this.state.daily[key] = { xp: 0, mood: 0, focus: 0, checks: 0 };
      return this.state.daily[key];
    },

    /* ----- core award ----- */
    addXp(attr, amount, opts) {
      opts = opts || {};
      if (amount <= 0) return;
      const before = levelInfo(this.state.profile.xp).level;
      this.state.profile.xp += amount;
      if (attr && this.state.attributes[attr] != null) this.state.attributes[attr] += amount;
      this.day().xp += amount;
      const drops = Math.max(1, Math.round(amount / 5));
      this.state.profile.drops += drops;
      const after = levelInfo(this.state.profile.xp).level;
      this.touchToday();
      if (after > before) {
        this.state.profile.drops += after * 5;
        this.emit("levelup", { level: after, from: before, attr });
      }
      if (!opts.silent) this.save();
      return { drops, level: after };
    },
    awardDrops(n) { this.state.profile.drops += n; this.save(); },

    touchToday() {
      const t = TS.today();
      const p = this.state.profile;
      if (p.lastActive !== t) {
        if (p.lastActive && TS.addDays(p.lastActive, 1) === t) p.streak += 1;
        else if (p.lastActive !== t) p.streak = 1;
        p.lastActive = t;
        p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
        const d = this.day();
        d.active = true;
      }
      this.recomputeStreak();
    },
    recomputeStreak() {
      const keys = Object.keys(this.state.daily).filter((k) => {
        const d = this.state.daily[k];
        return d && (d.xp > 0 || d.checks > 0 || d.focus > 0 || d.mood > 0);
      }).sort();
      if (!keys.length) { this.state.profile.streak = 0; return; }
      const set = new Set(keys);
      let cur = TS.today();
      if (!set.has(cur)) cur = TS.addDays(cur, -1); // streak survives if today not yet active
      let count = 0;
      while (set.has(cur)) { count++; cur = TS.addDays(cur, -1); }
      this.state.profile.streak = count;
      this.state.profile.bestStreak = Math.max(this.state.profile.bestStreak || 0, count);
    },

    /* ----- habits ----- */
    habitsForToday() {
      const dow = new Date().getDay();
      return this.state.habits.filter((h) => !h.archived && (!h.days || !h.days.length || h.days.indexOf(dow) >= 0));
    },
    isChecked(habitId, key) { const log = this.state.habitLog[habitId]; return !!(log && log[key || TS.today()]); },
    streakOf(habitId) {
      let cur = TS.today(), n = 0;
      const h = this.state.habits.find((x) => x.id === habitId);
      const allowed = (k) => !h || !h.days || !h.days.length || h.days.indexOf(TS.dayName(k)) >= 0;
      if (!this.isChecked(habitId, cur)) cur = TS.addDays(cur, -1);
      while (this.isChecked(habitId, cur)) { if (allowed(cur)) n++; cur = TS.addDays(cur, -1); }
      return n;
    },
    toggleHabit(habitId) {
      const key = TS.today();
      const log = (this.state.habitLog[habitId] = this.state.habitLog[habitId] || {});
      const h = this.state.habits.find((x) => x.id === habitId);
      if (log[key]) {
        delete log[key];
        this.day().checks = Math.max(0, this.day().checks - 1);
        this.save(); this.emit("change");
        return false;
      }
      log[key] = true;
      this.day().checks += 1;
      this.state.stats.habitChecks += 1;
      const gain = 10 * (h ? h.weight || 2 : 2);
      const res = this.addXp(h ? h.attr : null, gain, { silent: true });
      const streak = this.streakOf(habitId);
      this.save();
      this.emit("toast", { icon: h ? h.icon || "✅" : "✅", text: (h ? h.name : "Habit") + "  +" + gain + " XP", sub: "🔥 " + streak });
      if (streak === 7) this.emit("toast", { icon: "🔥", text: "7-day streak on " + (h ? h.name : "") });
      this.checkAchievements();
      this.emit("change");
      return res;
    },
    addHabit(data) {
      const habit = {
        id: TS.uid(), name: data.name || "Habit", icon: data.icon || "🌿",
        attr: data.attr || "body", weight: data.weight || 2, days: data.days || [],
        created: TS.today(), archived: false,
      };
      this.state.habits.push(habit);
      this.state.stats.habitsCreated += 1;
      this.save(); this.emit("change");
      return habit;
    },
    updateHabit(id, patch) {
      const h = this.state.habits.find((x) => x.id === id); if (!h) return;
      Object.assign(h, patch); this.save(); this.emit("change");
    },
    removeHabit(id) { this.state.habits = this.state.habits.filter((h) => h.id !== id); this.save(); this.emit("change"); },

    /* ----- focus ----- */
    logFocus(minutes, task) {
      const t = TS.today();
      this.state.focus.sessions.unshift({ id: TS.uid(), date: t, minutes, task: task || "" , ts: Date.now() });
      this.state.focus.totalMinutes += minutes;
      this.state.stats.focusMinutes += minutes;
      this.state.stats.focusSessions += 1;
      this.day().focus += minutes;
      const gain = Math.round(minutes * 1.6);
      this.addXp("mind", gain, { silent: true });
      this.save();
      this.emit("toast", { icon: "🎧", text: minutes + " min focused", sub: "+" + gain + " XP" });
      this.checkAchievements();
      this.emit("change");
    },

    /* ----- moods & journal ----- */
    setMood(score, tags, note) {
      const t = TS.today();
      this.state.moods[t] = { score, tags: tags || [], note: note || "" };
      this.day().mood = score;
      this.state.stats.moodLogs += 1;
      this.addXp("spirit", 12, { silent: true });
      this.save(); this.emit("toast", { icon: "🌤️", text: "Weather recorded", sub: "+12 XP" });
      this.checkAchievements(); this.emit("change");
    },
    addEntry(title, body, tags) {
      const e = { id: TS.uid(), date: TS.today(), ts: Date.now(), title: title || "Untitled", body: body || "", tags: tags || [] };
      this.state.journal.unshift(e);
      this.state.stats.entries += 1;
      this.addXp("mind", 15, { silent: true });
      this.save(); this.emit("toast", { icon: "📝", text: "Reflection saved", sub: "+15 XP" });
      this.checkAchievements(); this.emit("change");
      return e;
    },
    removeEntry(id) { this.state.journal = this.state.journal.filter((e) => e.id !== id); this.save(); this.emit("change"); },

    /* ----- quests ----- */
    questsToday() {
      const t = TS.today();
      if (!this.state.quests[t] || !this.state.quests[t].length) this.state.quests[t] = this.rollQuests(t);
      return this.state.quests[t];
    },
    rollQuests(seedKey) {
      const rnd = TS.rng(TS.hash(seedKey + ":" + this.state.garden.seed));
      const pool = QUEST_POOL.slice();
      const picked = [];
      while (picked.length < 3 && pool.length) {
        let total = pool.reduce((a, q) => a + q.w, 0), r = rnd() * total, i = 0;
        for (; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) break; }
        const q = pool[Math.min(i, pool.length - 1)];
        picked.push({ id: q.id, attr: q.attr, xp: q.xp, done: false });
        pool.splice(pool.indexOf(q), 1);
      }
      return picked;
    },
    rerollQuests() {
      if (this.state.profile.drops < 5) { this.emit("toast", { icon: "💧", text: "Not enough spring drops" }); return false; }
      this.state.profile.drops -= 5;
      const t = TS.today();
      this.state.quests[t] = this.rollQuests(t + ":r" + Date.now());
      this.save(); this.emit("change"); return true;
    },
    completeQuest(id) {
      const q = this.questsToday().find((x) => x.id === id); if (!q || q.done) return;
      q.done = true;
      this.state.stats.questsDone += 1;
      this.addXp(q.attr, q.xp, { silent: true });
      this.save();
      this.emit("toast", { icon: "🗺️", text: "Quest complete", sub: "+" + q.xp + " XP" });
      this.checkAchievements(); this.emit("change");
    },

    /* ----- garden ----- */
    bloom() {
      this.state.stats.blooms += 1;
      this.state.profile.drops += 1;
      this.save();
      this.emit("toast", { icon: "💧", text: "A droplet joins the spring", sub: "+1 drop" });
      this.checkAchievements(); this.emit("change");
    },

    /* ----- derived ----- */
    derived() {
      const s = this.state;
      const li = levelInfo(s.profile.xp);
      const attrs = s.attributes;
      const totalAttr = TS.ATTRS.reduce((a, k) => a + (attrs[k] || 0), 0);
      const species = this.unlockedSpecies();
      const today = TS.today();
      const todaysHabits = this.habitsForToday();
      const doneToday = todaysHabits.filter((h) => this.isChecked(h.id)).length;
      const habitRatio = todaysHabits.length ? doneToday / todaysHabits.length : 0;
      const streakFactor = Math.min(s.profile.streak, 30) / 30;
      const growthFactor = Math.min(totalAttr, 1500) / 1500;
      const vitality = Math.round((habitRatio * 45 + streakFactor * 25 + growthFactor * 30));
      const daysActive = Object.keys(s.daily).filter((k) => { const d = s.daily[k]; return d && (d.xp > 0 || d.checks > 0 || d.focus > 0 || d.mood > 0); }).length;
      const minAttr = Math.min(attrs.body, attrs.mind, attrs.spirit, attrs.craft);
      return {
        level: li.level, into: li.into, span: li.span, pct: li.pct,
        attrs, totalAttr, species, speciesCount: species.length,
        doneToday, todaysHabits: todaysHabits.length, habitRatio, vitality,
        daysActive, minAttr, streak: s.profile.streak, bestStreak: s.profile.bestStreak || 0,
        metrics: {
          streak: s.profile.streak, habitChecks: s.stats.habitChecks, focusMinutes: s.stats.focusMinutes,
          focusSessions: s.stats.focusSessions, entries: s.stats.entries, moodLogs: s.stats.moodLogs,
          blooms: s.stats.blooms, habitsCreated: s.stats.habitsCreated, questsDone: s.stats.questsDone,
          level: li.level, species: species.length, minAttr, daysActive,
        },
      };
    },
    unlockedSpecies() {
      const out = [];
      TS.ATTRS.forEach((a) => {
        const xp = this.state.attributes[a] || 0;
        TS.SPECIES[a].forEach((sp) => { if (xp >= SPECIES_TIERS[sp.tier]) out.push(Object.assign({ attr: a }, sp)); });
      });
      return out;
    },

    /* ----- achievements ----- */
    checkAchievements() {
      const m = this.derived().metrics;
      let changed = false;
      ACHIEVEMENTS.forEach((a) => {
        if (this.state.achievements[a.id]) return;
        if ((m[a.metric] || 0) >= a.goal) {
          this.state.achievements[a.id] = Date.now();
          changed = true;
          this.state.profile.drops += 10;
          this.emit("toast", { icon: a.icon, text: "Trophy: " + TS.t("ach." + a.id + ".name"), sub: "+10 💧" });
        }
      });
      if (changed) { this.save(); this.emit("achievement"); }
      return changed;
    },
    achievementProgress(a) {
      const m = this.derived().metrics;
      const cur = Math.min(m[a.metric] || 0, a.goal);
      return { cur, goal: a.goal, pct: a.goal ? Math.min(1, (m[a.metric] || 0) / a.goal) : 0, unlocked: !!this.state.achievements[a.id] };
    },
    contracts() {
      const m = this.derived().metrics;
      return CONTRACTS.map((c) => ({ ...c, cur: Math.min(m[c.metric] || 0, c.goal), pct: Math.min(1, (m[c.metric] || 0) / c.goal) }));
    },

    /* ----- settings ----- */
    set(key, val) { this.state.settings[key] = val; this.save(); this.emit("change"); },
    setProfile(patch) { Object.assign(this.state.profile, patch); this.save(); this.emit("change"); },
  };

  TS.Store = Store;
  TS.t = function (key) { return TS.i18n ? TS.i18n.t(key) : key; };
})();
