/* =========================================================
   Tasneeme — bootstrap & wiring
   ========================================================= */
(function () {
  "use strict";
  const TS = window.TS;
  const S = () => TS.Store;
  const UI = () => TS.UI;
  const t = (k) => TS.i18n.t(k);
  const $ = (id) => document.getElementById(id);

  /* ================= focus timer ================= */
  const FT_CIRC = 2 * Math.PI * 88;
  const focus = { workMin: 25, breakMin: 5, total: 1500, remaining: 1500, running: false, mode: "work", timer: null };

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
  }
  function paintFocus() {
    $("focus-time").textContent = fmt(focus.remaining);
    $("focus-mode").textContent = TS.i18n.t(focus.mode === "work" ? "focus.modeWork" : "focus.modeBreak");
    const p = 1 - focus.remaining / focus.total;
    const ring = $("focus-ring");
    ring.style.strokeDasharray = FT_CIRC.toFixed(1);
    ring.style.strokeDashoffset = (FT_CIRC * p).toFixed(1);
    $("focus-start").textContent = focus.running ? TS.i18n.t("focus.pause") : TS.i18n.t("focus.start");
  }
  function setPreset(min) {
    focus.workMin = min;
    if (focus.mode === "work" && !focus.running) { focus.total = min * 60; focus.remaining = focus.total; }
    paintFocus();
  }
  function startFocus() {
    if (focus.running) return pauseFocus();
    focus.running = true;
    TS.Audio.play("start");
    focus.timer = setInterval(() => {
      focus.remaining -= 1;
      if (focus.remaining % 60 === 0 && focus.remaining > 0) TS.Audio.play("tick");
      if (focus.remaining <= 0) completeFocus(); else paintFocus();
    }, 1000);
    paintFocus();
  }
  function pauseFocus() { focus.running = false; clearInterval(focus.timer); paintFocus(); }
  function resetFocus() { pauseFocus(); focus.mode = "work"; focus.total = focus.workMin * 60; focus.remaining = focus.total; paintFocus(); }
  function completeFocus() {
    clearInterval(focus.timer); focus.running = false;
    if (focus.mode === "work") {
      S().logFocus(focus.workMin, $("focus-task").value.trim());
      TS.Audio.play("chime");
      focus.mode = "break"; focus.total = focus.breakMin * 60; focus.remaining = focus.total;
    } else {
      TS.Audio.play("start");
      focus.mode = "work"; focus.total = focus.workMin * 60; focus.remaining = focus.total;
    }
    paintFocus();
  }

  /* ================= rendering ================= */
  function renderAll() {
    const d = S().derived();
    UI().renderTopbar(d);
    UI().renderGardenHud(d);
    UI().renderHabits();
    UI().renderFocus();
    UI().renderJournal();
    UI().renderQuests();
    UI().renderStats(d);
    UI().renderAchievements();
    UI().renderSettings();
    TS.Garden.setDerived(d);
    if (UI().currentView === "stats" || UI().currentView === "habits") UI().renderCharts();
    paintFocus();
  }

  /* ================= language / theme / sound ================= */
  function applyLang(lang) {
    TS.i18n.setLang(lang);
    S().state.settings.lang = lang; S().save();
    TS.i18n.apply(document);
    renderAll();
  }
  function applyTheme(id) {
    S().state.settings.theme = id; S().save();
    document.documentElement.setAttribute("data-theme", id);
    TS.Garden.readPalette(id);
    UI().renderThemes(); UI().renderThemes("onboard-themes");
    renderAll();
  }
  function toggleSound() {
    const on = !S().state.settings.sound;
    S().state.settings.sound = on; S().save();
    TS.Audio.setVolume(S().state.settings.volume / 100);
    TS.Audio.setEnabled(on);
    $("sound-btn").textContent = on ? "🔊" : "🔇";
    $("set-sound").checked = on;
  }

  /* ================= demo data ================= */
  function demoState() {
    const s = TS.defaultState();
    s.profile.onboarded = true; s.profile.name = "Nour"; s.profile.focus = "mind";
    s.profile.drops = 140; s.garden.seed = 4242;
    const defs = [
      { name: "Morning walk", icon: "🚶", attr: "body", weight: 2 },
      { name: "Read 10 pages", icon: "📖", attr: "mind", weight: 2 },
      { name: "Meditate", icon: "🧘", attr: "spirit", weight: 1 },
      { name: "Sketch", icon: "✏️", attr: "craft", weight: 2 },
      { name: "Drink water", icon: "💧", attr: "body", weight: 1 },
    ];
    defs.forEach((d) => s.habits.push({ id: TS.uid(), name: d.name, icon: d.icon, attr: d.attr, weight: d.weight, days: [], created: TS.addDays(TS.today(), -60), archived: false }));
    const today = TS.today();
    let xp = 0;
    for (let i = 45; i >= 0; i--) {
      const key = TS.addDays(today, -i);
      const act = Math.random() < 0.86;
      if (!act) continue;
      const d = { xp: 0, mood: 0, focus: 0, checks: 0 };
      s.habits.forEach((h) => {
        if (Math.random() < 0.62) { s.habitLog[h.id] = s.habitLog[h.id] || {}; s.habitLog[h.id][key] = true; d.checks++; s.stats.habitChecks++; xp += 10 * h.weight; s.attributes[h.attr] += 10 * h.weight; }
      });
      if (Math.random() < 0.5) { const m = 15 + Math.floor(Math.random() * 45); d.focus = m; s.stats.focusMinutes += m; s.stats.focusSessions++; s.focus.sessions.push({ id: TS.uid(), date: key, minutes: m, task: "Deep work", ts: Date.now() }); s.attributes.mind += Math.round(m * 1.6); xp += Math.round(m * 1.6); }
      if (Math.random() < 0.7) { const score = 2 + Math.floor(Math.random() * 4); d.mood = score; s.moods[key] = { score, tags: [], note: "" }; s.stats.moodLogs++; s.attributes.spirit += 12; xp += 12; }
      d.xp = (d.checks * 20) + ((d.focus * 1.6) | 0) + (d.mood ? 12 : 0);
      s.daily[key] = d;
    }
    s.profile.xp = xp;
    s.stats.entries = 0;
    ["On patience", "A quiet win", "What the rain taught me", "Small kindness"].forEach((title, i) => {
      s.journal.push({ id: TS.uid(), date: TS.addDays(today, -i * 5), ts: Date.now(), title, body: "I noticed that the small things I repeat quietly shape me more than the loud decisions I make rarely. Today I chose the quiet thing again.", tags: ["gratitude", "focus"] });
      s.stats.entries++;
    });
    s.profile.xp += s.stats.entries * 15;
    s.profile.streak = 6; s.profile.bestStreak = 11; s.profile.lastActive = today;
    s.stats.questsDone = 27; s.stats.blooms = 42; s.stats.habitsCreated = defs.length;
    s.focus.totalMinutes = s.stats.focusMinutes;
    s.settings.theme = "abyss";
    return s;
  }

  /* ================= onboarding ================= */
  function finishOnboard(name, focusAttr) {
    const st = S();
    st.setProfile({ name: name || "Traveler", focus: focusAttr || "mind", onboarded: true });
    st.addHabit({ name: "One honest deed", icon: "🌱", attr: focusAttr || "mind", weight: 2, days: [] });
    st.addXp(focusAttr || "mind", 30, { silent: true });
    st.save();
    $("onboard").hidden = true;
    UI().toast({ icon: "🌱", text: t("onb.start"), sub: "+30 XP" });
    renderAll();
  }

  /* ================= import / export ================= */
  function exportJson() {
    const blob = new Blob([JSON.stringify(S().state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tasneeme-" + TS.today() + ".json";
    a.click(); URL.revokeObjectURL(a.href);
    UI().toast({ icon: "📤", text: "Exported" });
  }
  function importJson(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const data = JSON.parse(fr.result);
        S().replace(data);
        TS.i18n.setLang(S().state.settings.lang);
        TS.i18n.apply(document);
        document.documentElement.setAttribute("data-theme", S().state.settings.theme);
        TS.Garden.readPalette(S().state.settings.theme);
        TS.Garden.setOptions(S().state.settings);
        renderAll();
        UI().toast({ icon: "📥", text: "Imported" });
      } catch (e) { UI().toast({ icon: "⚠️", text: "Invalid file" }); }
    };
    fr.readAsText(file);
  }

  /* ================= event wiring ================= */
  function wire() {
    document.addEventListener("click", (e) => {
      const nav = e.target.closest(".nav-item");
      if (nav) { UI().go(nav.dataset.view); return; }
      const goto = e.target.closest("[data-goto]");
      if (goto) { UI().go(goto.dataset.goto); return; }
      const closer = e.target.closest("[data-close]");
      if (closer) { $(closer.dataset.close).hidden = true; return; }
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const a = act.dataset.act;
      if (a === "toggle") { const on = S().toggleHabit(act.dataset.id); TS.Audio.play(on ? "check" : "uncheck"); }
      else if (a === "edit") { const h = S().state.habits.find((x) => x.id === act.dataset.id); if (h) UI().openHabitModal(h); }
      else if (a === "del") { if (window.confirm(t("common.delete") + "?")) S().removeHabit(act.dataset.id); }
      else if (a === "quest") { S().completeQuest(act.dataset.id); TS.Audio.play("quest"); }
      else if (a === "mood") { UI().moodDraft.score = Number(act.dataset.i); S().setMood(UI().moodDraft.score, UI().moodDraft.tags, $("mood-note").value); }
      else if (a === "tag") { const tg = act.dataset.tag, tags = UI().moodDraft.tags, i = tags.indexOf(tg); if (i >= 0) tags.splice(i, 1); else tags.push(tg); UI().renderJournal(); }
      else if (a === "del-entry") { S().removeEntry(act.dataset.id); }
      else if (a === "theme") { applyTheme(act.dataset.id); }
      else if (a === "day") { const dd = Number(act.dataset.d), days = UI().habitDraft.days, i = days.indexOf(dd); if (i >= 0) days.splice(i, 1); else days.push(dd); UI().paintHabitModal(); }
      else if (a === "weight") { UI().habitDraft.weight = Number(act.dataset.w); UI().paintHabitModal(); }
      else if (a === "preset") { setPreset(Number(act.dataset.min)); document.querySelectorAll("#focus-presets .pill").forEach((p) => p.classList.toggle("is-active", Number(p.dataset.min) === Number(act.dataset.min))); }
    });

    $("add-habit").addEventListener("click", () => UI().openHabitModal(null));
    $("hm-save").addEventListener("click", () => UI().saveHabitModal());
    $("new-entry").addEventListener("click", () => { $("em-title").value = ""; $("em-body").value = ""; $("em-tags").value = ""; $("entry-modal").hidden = false; $("em-title").focus(); });
    $("em-save").addEventListener("click", () => {
      const tags = $("em-tags").value.split(",").map((s) => s.trim()).filter(Boolean);
      S().addEntry($("em-title").value.trim(), $("em-body").value.trim(), tags);
      $("entry-modal").hidden = true;
    });
    $("mood-save").addEventListener("click", () => { S().setMood(UI().moodDraft.score || 3, UI().moodDraft.tags, $("mood-note").value); });
    $("reroll-quests").addEventListener("click", () => { if (S().rerollQuests()) TS.Audio.play("quest"); });

    $("focus-start").addEventListener("click", startFocus);
    $("focus-reset").addEventListener("click", resetFocus);
    $("focus-presets").querySelectorAll(".pill").forEach((p) => p.addEventListener("click", () => setPreset(Number(p.dataset.min))));

    $("menu-btn").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
    $("lang-btn").addEventListener("click", () => { const o = ["en", "ar", "tn"]; applyLang(o[(o.indexOf(TS.i18n.lang) + 1) % o.length]); });
    $("theme-btn").addEventListener("click", () => { const ids = TS.THEMES.map((x) => x.id); const i = ids.indexOf(S().state.settings.theme); applyTheme(ids[(i + 1) % ids.length]); });
    $("sound-btn").addEventListener("click", toggleSound);
    $("garden-bloom").addEventListener("click", () => TS.Garden.bloomAt(TS.Garden.w / 2, TS.Garden.h * 0.82));
    $("levelup-ok").addEventListener("click", () => { $("levelup").hidden = true; });

    // settings
    $("set-name").addEventListener("input", (e) => { S().state.profile.name = e.target.value; S().save(); UI().renderTopbar(S().derived()); });
    $("set-lang").addEventListener("change", (e) => applyLang(e.target.value));
    $("set-reduce").addEventListener("change", (e) => { S().state.settings.reduceMotion = e.target.checked; S().save(); document.body.classList.toggle("reduce-motion", e.target.checked); TS.Garden.setOptions(S().state.settings); UI().renderSettings(); });
    $("set-bloom").addEventListener("change", (e) => { S().state.settings.particles = e.target.checked; S().save(); TS.Garden.setOptions(S().state.settings); });
    $("set-sound").addEventListener("change", toggleSound);
    $("set-volume").addEventListener("input", (e) => { S().state.settings.volume = Number(e.target.value); S().save(); TS.Audio.setVolume(Number(e.target.value) / 100); });
    $("export-btn").addEventListener("click", exportJson);
    $("import-btn").addEventListener("click", () => $("import-file").click());
    $("import-file").addEventListener("change", (e) => { if (e.target.files[0]) importJson(e.target.files[0]); e.target.value = ""; });
    $("seed-demo").addEventListener("click", () => { S().replace(demoState()); document.documentElement.setAttribute("data-theme", S().state.settings.theme); TS.Garden.readPalette(S().state.settings.theme); TS.Garden.setOptions(S().state.settings); renderAll(); UI().toast({ icon: "✨", text: "Demo spring loaded" }); });
    $("wipe-btn").addEventListener("click", () => { if (window.confirm(t("set.wipe") + "?")) { S().reset(); applyTheme("dawn"); applyLang("en"); $("onboard").hidden = false; } });

    // onboarding
    $("onb-start").addEventListener("click", () => finishOnboard($("onb-name").value.trim(), $("onb-focus").value));
    $("onb-demo").addEventListener("click", () => { S().replace(demoState()); $("onboard").hidden = true; document.documentElement.setAttribute("data-theme", S().state.settings.theme); TS.Garden.readPalette(S().state.settings.theme); TS.Garden.setOptions(S().state.settings); renderAll(); });

    // keyboard shortcuts 1..8
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea, select")) return;
      const views = ["garden", "habits", "focus", "journal", "quests", "stats", "achievements", "settings"];
      const n = Number(e.key);
      if (n >= 1 && n <= 8) UI().go(views[n - 1]);
    });
  }

  /* ================= boot ================= */
  function boot() {
    S().load();
    const st = S().state;
    TS.i18n.setLang(st.settings.lang || "en");
    document.documentElement.setAttribute("data-theme", st.settings.theme || "dawn");
    document.body.classList.toggle("reduce-motion", !!st.settings.reduceMotion);
    TS.i18n.apply(document);

    $("app").hidden = false;
    UI().moodDraft = { score: (st.moods[TS.today()] || {}).score || 0, tags: ((st.moods[TS.today()] || {}).tags || []).slice() };

    TS.Garden.readPalette(st.settings.theme);
    TS.Garden.setOptions(st.settings);
    TS.Garden.init($("garden"), S().derived());

    S().on("change", renderAll);
    S().on("toast", (o) => UI().toast(o));
    S().on("levelup", (info) => UI().levelUp(info));

    wire();
    renderAll();
    UI().renderThemes("onboard-themes");

    if (!st.profile.onboarded) { $("onboard").hidden = false; $("onb-name").focus(); }

    setInterval(() => {
      const now = new Date();
      const el = $("garden-clock");
      if (el) el.textContent = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    }, 1000);
    window.addEventListener("resize", () => { if (UI().currentView === "stats" || UI().currentView === "habits") UI().renderCharts(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
