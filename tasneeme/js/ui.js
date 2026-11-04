/* =========================================================
   Tasneeme — UI rendering
   ========================================================= */
(function () {
  "use strict";
  const TS = (window.TS = window.TS || {});
  const S = () => TS.Store;
  const t = (k) => TS.i18n.t(k);
  const $ = (id) => document.getElementById(id);

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  const ATTR_ICON = { body: "🏃", mind: "🧠", spirit: "🕊️", craft: "🛠️" };
  const MOOD_FACES = TS.MOOD_FACES;

  const UI = {
    currentView: "garden",
    moodDraft: { score: 0, tags: [] },
    habitDraft: null,
    editingHabit: null,

    /* ---------- shared bits ---------- */
    toast(o) {
      const box = $("toasts"); if (!box) return;
      const el = document.createElement("div");
      el.className = "toast";
      el.innerHTML = '<span class="t-ico">' + esc(o.icon || "✨") + "</span><span>" + esc(o.text || "") +
        (o.sub ? ' <b style="opacity:.65;font-weight:500">' + esc(o.sub) + "</b>" : "") + "</span>";
      box.appendChild(el);
      setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 3000);
    },

    levelUp(info) {
      const layer = $("levelup"); if (!layer) return;
      $("levelup-num").textContent = info.level;
      const rewards = [];
      rewards.push('<span class="pill">+' + info.level * 5 + " 💧</span>");
      if (info.level % 3 === 0) rewards.push('<span class="pill">🌳 new flora tier</span>');
      if (info.level % 5 === 0) rewards.push('<span class="pill">🎨 terrace skin</span>');
      $("levelup-rewards").innerHTML = rewards.join("");
      layer.hidden = false;
      TS.Audio.play("level");
    },

    go(view) {
      this.currentView = view;
      document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
      document.querySelectorAll(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === view));
      const side = document.querySelector(".sidebar"); if (side) side.classList.remove("open");
      if (view === "stats" || view === "habits") this.renderCharts();
      const canvas = $("garden"); if (canvas && view === "garden" && TS.Garden.resize) { TS.Garden.resize(); TS.Garden.rebuild(); }
    },

    /* ---------- top bar ---------- */
    renderTopbar(d) {
      const p = S().state.profile;
      const name = p.name ? p.name : t("top.hello");
      $("greeting").textContent = p.name ? name : t("top.hello");
      $("xp-now").textContent = d.into;
      $("xp-next").textContent = d.span;
      $("xp-fill").style.width = (d.pct * 100).toFixed(1) + "%";
      $("level-num").textContent = d.level;
      const circ = 2 * Math.PI * 19;
      const ring = $("ring-fg");
      ring.style.strokeDasharray = circ.toFixed(1);
      ring.style.strokeDashoffset = (circ * (1 - d.pct)).toFixed(1);
      $("side-streak").textContent = d.streak;
      $("side-coins").textContent = p.drops;
      $("lang-label").textContent = TS.i18n.lang === "ar" ? "AR" : TS.i18n.lang === "tn" ? "TN" : "EN";
      const sb = $("sound-btn"); if (sb) sb.textContent = S().state.settings.sound ? "🔊" : "🔇";

      $("attr-chips").innerHTML = TS.ATTRS.map((a) =>
        '<span class="attr-chip" data-a="' + a + '"><i class="attr-dot"></i>' + esc(t("attr." + a)) +
        " <b>" + Math.round(d.attrs[a]) + "</b></span>").join("");
    },

    renderGardenHud(d) {
      const gv = $("garden-vitality"), gs = $("garden-species");
      if (gv) gv.textContent = Math.max(0, Math.min(100, d.vitality)) + "%";
      if (gs) gs.textContent = d.speciesCount + " / 20";
    },

    /* ---------- habits ---------- */
    renderHabits() {
      const st = S();
      const today = TS.today();
      // ribbon : last 7 days
      const ribbon = $("habit-ribbon");
      let rb = "";
      for (let i = 6; i >= 0; i--) {
        const key = TS.addDays(today, -i);
        const d = st.state.daily[key] || {};
        const act = (d.checks || 0) > 0 || (d.focus || 0) > 0 || (d.xp || 0) > 0;
        rb += '<div class="ribbon-day ' + (act ? "done " : "") + (key === today ? "is-today" : "") + '">' +
          "<b>" + key.slice(8) + "</b>" +
          "<span>" + esc(TS.i18n.t("day." + TS.dayName(key))) + "</span></div>";
      }
      ribbon.innerHTML = rb;

      const list = $("habit-list");
      const habits = st.state.habits.filter((h) => !h.archived);
      if (!habits.length) {
        list.innerHTML = '<div class="panel muted">' + esc(t("habits.empty")) + "</div>";
      } else {
        list.innerHTML = habits.map((h) => {
          const checked = st.isChecked(h.id);
          const streak = st.streakOf(h.id);
          const allowedToday = !h.days || !h.days.length || h.days.indexOf(new Date().getDay()) >= 0;
          let dots = "";
          for (let i = 6; i >= 0; i--) {
            const key = TS.addDays(today, -i);
            const on = !h.days || !h.days.length || h.days.indexOf(TS.dayName(key)) >= 0;
            dots += '<i class="hdot ' + (st.isChecked(h.id, key) ? "done " : "") + (key === today ? "today" : "") + '" style="' + (on ? "" : "opacity:.28") + '"></i>';
          }
          return '<div class="card habit-card" data-a="' + h.attr + '"><i class="card-accent"></i>' +
            '<div class="habit-top"><span class="habit-emoji">' + esc(h.icon) + '</span>' +
            '<span class="habit-name">' + esc(h.name) + "</span>" +
            (streak > 1 ? '<span class="habit-streak">🔥 ' + streak + "</span>" : "") + "</div>" +
            '<div class="habit-meta"><span class="tag">' + esc(t("attr." + h.attr)) + "</span>" +
            '<span class="tag">' + "★".repeat(h.weight || 2) + "</span>" +
            (allowedToday ? "" : '<span class="tag" style="opacity:.6">' + esc(t("habitModal.days")) + "</span>") + "</div>" +
            '<div class="habit-dots">' + dots + "</div>" +
            '<div class="habit-actions">' +
            '<button class="check-btn ' + (checked ? "done" : "") + '" data-act="toggle" data-id="' + h.id + '">' +
            (checked ? "✓ " + esc(t("quests.done")) : esc(t("quests.claim"))) + "</button>" +
            '<button class="mini-btn" data-act="edit" data-id="' + h.id + '" title="edit">✎</button>' +
            '<button class="mini-btn" data-act="del" data-id="' + h.id + '" title="delete">✕</button>' +
            "</div></div>";
        }).join("");
      }
      this.renderCharts();
    },

    renderCharts() {
      const st = S(), today = TS.today();
      // heatmap
      const hm = $("habit-heatmap");
      if (hm) {
        const weeks = 12;
        const dow = new Date().getDay();
        const start = TS.addDays(today, -dow - (weeks - 1) * 7);
        const vals = new Array(weeks * 7).fill(0);
        for (let w = 0; w < weeks; w++) {
          for (let r = 0; r < 7; r++) {
            const key = TS.addDays(start, w * 7 + r);
            const d = st.state.daily[key];
            if (key > today) { vals[w * 7 + r] = -1; continue; }
            vals[w * 7 + r] = d ? Math.min(1, (d.xp || 0) / 120) : 0;
          }
        }
        TS.Charts.heatmap(hm, vals, weeks);
      }
    },

    /* ---------- focus ---------- */
    renderFocus() {
      const st = S(), today = TS.today();
      const list = $("focus-today");
      const todays = st.state.focus.sessions.filter((s) => s.date === today);
      list.innerHTML = todays.length
        ? todays.map((s) => '<div class="log-item"><span class="lo-title">' + esc(s.task || "—") + '</span><span class="lo-meta">' + s.minutes + " min</span></div>").join("")
        : '<div class="muted small">' + esc(t("focus.empty")) + "</div>";
      $("focus-total").textContent = st.state.stats.focusMinutes;

      const canvas = $("focus-chart");
      if (canvas) {
        const days = [];
        for (let i = 13; i >= 0; i--) {
          const key = TS.addDays(today, -i);
          const d = st.state.daily[key] || {};
          days.push({ x: key, y: d.focus || 0 });
        }
        TS.Charts.line(canvas, [{ data: days, color: TS.Charts.theme().mind }], { height: 120 });
      }
    },

    /* ---------- journal ---------- */
    renderJournal() {
      const st = S();
      const picker = $("mood-picker");
      const todayMood = st.state.moods[TS.today()];
      picker.innerHTML = MOOD_FACES.map((f, i) =>
        '<button class="mood-face ' + (todayMood && todayMood.score === i + 1 ? "is-active" : "") + '" data-act="mood" data-i="' + (i + 1) + '">' + f + "</button>").join("");
      $("mood-tags").innerHTML = TS.MOOD_TAGS.map((tg) => {
        const on = todayMood && todayMood.tags && todayMood.tags.indexOf(tg) >= 0;
        return '<button class="pill ' + (on ? "is-active" : "") + '" data-act="tag" data-tag="' + tg + '">' + esc(t("tag." + tg)) + "</button>";
      }).join("");
      if (todayMood && !$("mood-note").value) $("mood-note").value = todayMood.note || "";

      const list = $("journal-list");
      const entries = st.state.journal;
      list.innerHTML = entries.length
        ? entries.map((e) => {
          const body = e.body.length > 220 ? e.body.slice(0, 220) + "…" : e.body;
          return '<div class="entry"><h4>' + esc(e.title) + '</h4><div class="e-meta">📖 ' + e.date + "</div><p>" + esc(body) + "</p>" +
            (e.tags && e.tags.length ? '<div class="e-tags">' + e.tags.map((x) => '<span class="tag">#' + esc(x.trim()) + "</span>").join("") + "</div>" : "") +
            '<div class="e-actions"><button data-act="del-entry" data-id="' + e.id + '">' + esc(t("common.delete")) + "</button></div></div>";
        }).join("")
        : '<div class="muted small">' + esc(t("journal.empty")) + "</div>";
    },

    /* ---------- quests ---------- */
    renderQuests() {
      const st = S();
      const quests = st.questsToday();
      $("quest-list").innerHTML = quests.map((q) =>
        '<div class="card quest-card ' + (q.done ? "done" : "") + '" data-a="' + q.attr + '"><i class="card-accent"></i>' +
        '<span class="quest-xp">+' + q.xp + " XP</span>" +
        '<div class="habit-top"><span class="habit-emoji">' + ATTR_ICON[q.attr] + '</span>' +
        '<span class="habit-name">' + esc(t("quest." + q.id)) + "</span></div>" +
        '<div class="habit-meta"><span class="tag">' + esc(t("attr." + q.attr)) + "</span></div>" +
        '<div class="habit-actions"><button class="check-btn ' + (q.done ? "done" : "") + '" data-act="quest" data-id="' + q.id + '">' +
        (q.done ? "✓ " + esc(t("quests.done")) : esc(t("quests.claim"))) + "</button></div></div>").join("");

      $("contracts").innerHTML = st.contracts().map((c) =>
        '<div class="log-item"><span class="lo-title">' + c.icon + " " + esc(t("contract." + c.id)) + "</span>" +
        '<span class="lo-meta">' + c.cur + " / " + c.goal + (c.pct >= 1 ? " ✓" : "") + "</span></div>").join("");
    },

    /* ---------- stats ---------- */
    renderStats(d) {
      const st = S();
      const tiles = [
        { k: "stat.xp", v: st.state.profile.xp, sub: "+" + (((st.state.daily[TS.today()]) || {}).xp || 0) + " today" },
        { k: "stat.level", v: d.level, sub: d.into + "/" + d.span },
        { k: "stat.streak", v: d.streak, sub: t("stat.best") + " " + d.bestStreak },
        { k: "stat.checks", v: st.state.stats.habitChecks, sub: d.doneToday + "/" + d.todaysHabits + " today" },
        { k: "stat.focus", v: st.state.stats.focusMinutes + "m", sub: st.state.stats.focusSessions + " sessions" },
        { k: "stat.entries", v: st.state.stats.entries, sub: st.state.stats.moodLogs + " moods" },
        { k: "stat.drops", v: st.state.profile.drops, sub: "" },
        { k: "stat.days", v: d.daysActive, sub: "" },
        { k: "stat.species", v: d.speciesCount + "/20", sub: "" },
        { k: "stat.quests", v: st.state.stats.questsDone, sub: "" },
        { k: "stat.vitality", v: d.vitality + "%", sub: "" },
      ];
      $("stat-tiles").innerHTML = tiles.map((x) =>
        '<div class="stat-tile"><small>' + esc(t(x.k)) + "</small><b>" + esc(x.v) + "</b>" +
        (x.sub ? '<div class="sub">' + esc(x.sub) + "</div>" : "") + "</div>").join("");

      const maxAttr = Math.max.apply(null, TS.ATTRS.map((a) => d.attrs[a]).concat([100]));
      const rc = $("radar"); if (rc) TS.Charts.radar(rc, d.attrs, Math.round(maxAttr * 1.25));

      const today = TS.today();
      const xpData = [], moodData = [];
      for (let i = 29; i >= 0; i--) {
        const key = TS.addDays(today, -i);
        const dd = st.state.daily[key] || {};
        xpData.push({ x: key, y: dd.xp || 0 });
        moodData.push({ x: key, y: dd.mood || 0 });
      }
      const th = TS.Charts.theme();
      const xl = $("xp-line"); if (xl) TS.Charts.line(xl, [{ data: xpData, color: th.primary }], { height: 240 });
      const ml = $("mood-line"); if (ml) TS.Charts.line(ml, [{ data: moodData, color: th.accent || th.primary2 }], { height: 240, max: 5 });

      const maxA = Math.max(100, d.totalAttr / 4) * 1.2;
      $("attr-bars").innerHTML = TS.ATTRS.map((a) =>
        '<div class="attr-bar-row" data-a="' + a + '"><div class="abr-head"><span>' + esc(t("attr." + a)) +
        "</span><b>" + Math.round(d.attrs[a]) + '</b></div><div class="attr-bar"><span style="width:' +
        Math.min(100, (d.attrs[a] / maxA) * 100).toFixed(1) + '%"></span></div></div>').join("");
    },

    /* ---------- achievements ---------- */
    renderAchievements() {
      const st = S();
      const ach = TS.ACHIEVEMENTS;
      $("ach-count").textContent = Object.keys(st.state.achievements).length;
      $("ach-total").textContent = ach.length;
      $("ach-list").innerHTML = ach.map((a) => {
        const p = st.achievementProgress(a);
        return '<div class="card ach-card ' + (p.unlocked ? "unlocked" : "locked") + '">' +
          '<span class="ach-ico">' + a.icon + "</span>" +
          "<div style=\"flex:1\"><div class=\"ach-name\">" + esc(t("ach." + a.id + ".name")) + "</div>" +
          '<div class="ach-desc">' + esc(t("ach." + a.id + ".desc")) + "</div>" +
          '<div class="ach-bar"><span style="width:' + (p.pct * 100).toFixed(0) + '%"></span></div>' +
          '<div class="ach-desc" style="margin-top:4px">' + p.cur + " / " + p.goal + (p.unlocked ? " ✓" : "") + "</div></div></div>";
      }).join("");
    },

    /* ---------- settings ---------- */
    renderSettings() {
      const st = S();
      $("set-name").value = st.state.profile.name || "";
      $("set-lang").value = TS.i18n.lang;
      $("set-reduce").checked = !!st.state.settings.reduceMotion;
      $("set-bloom").checked = !!st.state.settings.particles;
      $("set-sound").checked = !!st.state.settings.sound;
      $("set-volume").value = st.state.settings.volume;
      this.renderThemes();
    },
    renderThemes(containerId) {
      const el = containerId ? $(containerId) : $("theme-row");
      if (!el) return;
      const active = S().state.settings.theme;
      el.innerHTML = TS.THEMES.map((th) =>
        '<button class="theme-swatch ' + (th.id === active ? "is-active" : "") + '" data-act="theme" data-id="' + th.id + '" ' +
        'style="background:linear-gradient(140deg,' + th.colors[0] + "," + th.colors[1] + ')" title="' + esc(t("theme." + th.id)) + '">' +
        "<span>" + esc(t("theme." + th.id)) + "</span></button>").join("");
    },

    /* ---------- modal : habit ---------- */
    openHabitModal(habit) {
      this.editingHabit = habit || null;
      this.habitDraft = habit
        ? { weight: habit.weight, days: habit.days.slice() }
        : { weight: 2, days: [] };
      $("habit-modal-title").textContent = habit ? t("habitModal.edit") : t("habitModal.new");
      $("hm-name").value = habit ? habit.name : "";
      $("hm-attr").value = habit ? habit.attr : "body";
      $("hm-icon").value = habit ? habit.icon : "🌿";
      this.paintHabitModal();
      $("habit-modal").hidden = false;
      $("hm-name").focus();
    },
    paintHabitModal() {
      const d = this.habitDraft;
      $("hm-weight").querySelectorAll(".pill").forEach((b) => b.classList.toggle("is-active", Number(b.dataset.w) === d.weight));
      if (!$("hm-days").children.length) {
        const names = TS.i18n.dayNames();
        $("hm-days").innerHTML = names.map((n, i) => '<button class="pill" data-act="day" data-d="' + i + '">' + esc(TS.i18n.t("day." + i)) + "</button>").join("");
      }
      $("hm-days").querySelectorAll(".pill").forEach((b) => b.classList.toggle("is-active", d.days.indexOf(Number(b.dataset.d)) >= 0));
    },
    saveHabitModal() {
      const name = $("hm-name").value.trim() || "Habit";
      const attr = $("hm-attr").value;
      const icon = $("hm-icon").value.trim() || "🌿";
      const weight = this.habitDraft.weight;
      const days = this.habitDraft.days.slice().sort();
      if (this.editingHabit) S().updateHabit(this.editingHabit.id, { name, attr, icon, weight, days });
      else S().addHabit({ name, attr, icon, weight, days });
      S().checkAchievements();
      if (!this.editingHabit) TS.Audio.play("check");
      $("habit-modal").hidden = true;
    },
  };

  TS.UI = UI;
})();
