/* =========================================================
   Tasneeme — Living Garden canvas engine
   Procedural flora grows from real attribute XP.
   ========================================================= */
(function () {
  "use strict";
  const TS = (window.TS = window.TS || {});

  /* ---------- colour helpers ---------- */
  function hex2rgb(h) {
    h = h.trim();
    if (h[0] === "#") h = h.slice(1);
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const css = (r) => "rgb(" + (r[0] | 0) + "," + (r[1] | 0) + "," + (r[2] | 0) + ")";
  const rgba = (r, a) => "rgba(" + (r[0] | 0) + "," + (r[1] | 0) + "," + (r[2] | 0) + "," + a + ")";
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- per-theme sky / water palettes ---------- */
  const PALETTES = {
    dawn: { day: ["#8ec9ff", "#ffe4bb"], night: ["#0b1533", "#243b63"], water: ["#3ea7c9", "#0b4f63"], star: 0.35, haze: "#fff2d8" },
    dusk: { day: ["#6f7bd4", "#ffc59b"], night: ["#150e2c", "#3a2350"], water: ["#6f6ad0", "#241a4a"], star: 0.85, haze: "#ffb894" },
    abyss: { day: ["#0b3a52", "#1d7a94"], night: ["#020810", "#062a3c"], water: ["#22d3ee", "#03202e"], star: 1.0, haze: "#7ff0ff" },
    grove: { day: ["#bfe6c7", "#f6f3cf"], night: ["#0d1f16", "#1e3a28"], water: ["#5bbf9d", "#12463a"], star: 0.3, haze: "#e8ffd9" },
    rose: { day: ["#ffc2dc", "#ffe7d1"], night: ["#2a0f22", "#4a1f3a"], water: ["#e86aa3", "#5b1740"], star: 0.5, haze: "#ffd9ea" },
    mono: { day: ["#3a3f4a", "#6b7280"], night: ["#0a0b0e", "#1b1d24"], water: ["#8b93a1", "#23262e"], star: 0.6, haze: "#cbd5e1" },
  };

  /* ---------- species → archetype + size ---------- */
  const ARCH = {
    reed: ["grass", 1.25], sage: ["grass", 0.9], fern: ["grass", 1.05], lavender: ["grass", 0.95],
    sunflower: ["flower", 1.15], iris: ["flower", 0.95], jasmine: ["flower", 0.85], orchid: ["flower", 1.0], lotus: ["flower", 1.25], tulip: ["flower", 0.9],
    banyan: ["tree", 1.3], willow: ["tree", 1.15], bonsai: ["tree", 0.9],
    mushroom: ["fungus", 0.85], glowcap: ["fungus", 1.0],
    moss: ["clump", 0.8], clover: ["clump", 0.75], berry: ["clump", 0.95],
    cactus: ["succulent", 0.95], crystal: ["crystal", 1.0],
  };

  const Garden = {
    canvas: null, ctx: null, w: 0, h: 0, dpr: 1,
    plants: [], parts: [], ripples: [],
    t: 0, last: 0, raf: 0, derived: null, attrColors: {}, palette: PALETTES.dawn,
    motion: 1, particles: true, hover: null, bloomPulse: 0,

    init(canvas, derived) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.derived = derived;
      this.resize();
      this.rebuild();
      window.addEventListener("resize", () => { this.resize(); this.rebuild(); });
      canvas.addEventListener("pointerdown", (e) => {
        const r = canvas.getBoundingClientRect();
        this.bloomAt(e.clientX - r.left, e.clientY - r.top);
      });
      canvas.addEventListener("pointermove", (e) => {
        const r = canvas.getBoundingClientRect();
        this.hover = { x: e.clientX - r.left, y: e.clientY - r.top };
      });
      canvas.addEventListener("pointerleave", () => (this.hover = null));
      this.last = performance.now();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
    },
    destroy() { cancelAnimationFrame(this.raf); },

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = rect.width || 800; this.h = rect.height || 500;
      this.canvas.width = Math.round(this.w * this.dpr);
      this.canvas.height = Math.round(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },

    readPalette(theme) {
      this.palette = PALETTES[theme] || PALETTES.dawn;
      const cs = getComputedStyle(document.documentElement);
      const get = (n, fb) => { const v = cs.getPropertyValue(n).trim(); return v ? hex2rgb(v) : hex2rgb(fb); };
      this.attrColors = {
        body: get("--body", "#f97316"), mind: get("--mind", "#3b82f6"),
        spirit: get("--spirit", "#a855f7"), craft: get("--craft", "#14b8a6"),
      };
      this.uiText = get("--text", "#fff");
    },

    setDerived(d) { this.derived = d; this.rebuild(); },
    setOptions(o) { this.motion = o.reduceMotion ? 0.15 : 1; this.particles = o.particles; },

    /* ---------- build plant list ---------- */
    rebuild() {
      if (!this.derived) return;
      if (!this.attrColors.body) this.readPalette(TS.Store.state.settings.theme);
      const list = this.derived.species;
      const cx = this.w / 2, cy = this.h * 0.84;
      const rx = this.w * 0.46, ry = this.h * 0.30;
      const n = Math.max(list.length, 1);
      // deterministic order around the basin
      const ordered = list.slice().sort((a, b) => (TS.hash(a.id) % 997) - (TS.hash(b.id) % 997));
      this.plants = ordered.map((sp, i) => {
        const seed = TS.hash(sp.id + ":" + sp.attr);
        const r = TS.rng(seed);
        const ang = Math.PI + ((i + 0.5 + (r() - 0.5) * 0.35) / n) * Math.PI;
        const rr = 0.92 + r() * 0.34;
        const x = cx + Math.cos(ang) * rx * rr;
        const y = cy + Math.sin(ang) * ry * rr;
        const depth = clamp((y - (cy - ry)) / (ry * 2.4), 0, 1); // 0 far · 1 near
        return {
          id: sp.id, attr: sp.attr, icon: sp.icon, tier: sp.tier,
          arch: (ARCH[sp.id] || ["flower", 1])[0],
          size: (ARCH[sp.id] || ["flower", 1])[1],
          x, y, seed, r, depth,
          scale: (0.55 + depth * 0.75) * (0.8 + r() * 0.4),
          phase: r() * Math.PI * 2,
          sortKey: y,
        };
      }).sort((a, b) => a.sortKey - b.sortKey);

      // foreground silhouettes for depth
      this.fore = [
        { x: this.w * 0.07, y: this.h * 0.99, s: 1.5, seed: 11, attr: "craft" },
        { x: this.w * 0.94, y: this.h * 1.0, s: 1.45, seed: 23, attr: "spirit" },
      ];
    },

    growth(sp) {
      const xp = TS.Store.state.attributes[sp.attr] || 0;
      const tiers = [0, 90, 220, 420, 700];
      const s0 = tiers[sp.tier] || 0, s1 = tiers[sp.tier + 1] || s0 + 700;
      return clamp(0.45 + 0.62 * ((xp - s0) / (s1 - s0)), 0.45, 1.12);
    },

    /* ---------- interaction ---------- */
    bloomAt(x, y) {
      if (!this.particles) return;
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 90;
        this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 1, max: 1.1 + Math.random(), r: 1.5 + Math.random() * 2.5, type: "burst" });
      }
      this.parts.push({ x, y, vx: 0, vy: 120, life: 1, max: 1.4, r: 3.4, type: "drop" });
      this.ripples.push({ x, y, r: 4, max: this.w * 0.12, life: 1 });
      this.bloomPulse = 1;
      TS.Audio.play("bloom");
      // reward is throttled so a droplet feels special, not farmable
      const now = Date.now();
      if (!this._lastAward || now - this._lastAward > 4000) { this._lastAward = now; TS.Store.bloom(); }
    },
    dropTick() {
      // slow ambient droplets from the spring
      if (!this.particles || Math.random() > 0.55) return;
      const cx = this.w / 2 + (Math.random() - 0.5) * 40;
      this.parts.push({ x: cx, y: this.h * 0.84, vx: (Math.random() - 0.5) * 14, vy: -60 - Math.random() * 60, life: 1, max: 1.6, r: 1.4 + Math.random() * 2, type: "rise" });
    },

    /* ---------- main loop ---------- */
    loop(now) {
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.t += dt * (0.35 + this.motion * 0.65);
      // pause rendering while the garden view is not visible
      if (this.canvas.offsetParent !== null) this.draw(dt);
      this.raf = requestAnimationFrame(this.loop);
    },

    skyFactor() {
      const d = new Date();
      const h = d.getHours() + d.getMinutes() / 60;
      if (h < 5 || h >= 21) return 0;
      if (h < 8) return (h - 5) / 3;
      if (h < 17) return 1;
      return 1 - (h - 17) / 4;
    },

    draw(dt) {
      const ctx = this.ctx, w = this.w, h = this.h, P = this.palette;
      ctx.clearRect(0, 0, w, h);
      const sun = this.skyFactor();
      const horizon = h * 0.66;

      /* sky */
      const top = mix(hex2rgb(P.night[0]), hex2rgb(P.day[0]), sun);
      const bot = mix(hex2rgb(P.night[1]), hex2rgb(P.day[1]), sun);
      const sky = ctx.createLinearGradient(0, 0, 0, horizon + 40);
      sky.addColorStop(0, css(top)); sky.addColorStop(1, css(bot));
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, horizon + 40);

      /* stars */
      if (sun < 0.75) {
        const alpha = (0.75 - sun) * P.star;
        const rnd = TS.rng(1234);
        ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
        for (let i = 0; i < 90; i++) {
          const sx = rnd() * w, sy = rnd() * horizon * 0.85, r = rnd() * 1.4 + 0.3;
          const tw = 0.6 + 0.4 * Math.sin(this.t * 2 + i);
          ctx.globalAlpha = alpha * tw; ctx.beginPath(); ctx.arc(sx, sy, r, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      /* sun / moon */
      const body = hex2rgb(P.haze);
      const orbX = w * (0.2 + 0.6 * (1 - Math.abs(sun - 0.6) * 1.2));
      const orbY = horizon * (0.72 - sun * 0.45);
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = rgba(body, 0.9); ctx.shadowBlur = 60;
      ctx.fillStyle = css(body);
      ctx.beginPath(); ctx.arc(orbX, orbY, 26 + sun * 8, 0, 7); ctx.fill();
      ctx.restore();

      /* distant ridges */
      this.ridge(horizon - h * 0.10, h * 0.07, "#000", 0.22 + (1 - sun) * 0.12, 3.1, 0.0012);
      this.ridge(horizon - h * 0.03, h * 0.05, "#000", 0.34 + (1 - sun) * 0.12, 5.3, 0.002);

      /* ground */
      const ground = ctx.createLinearGradient(0, horizon - 20, 0, h);
      ground.addColorStop(0, rgba(mix(hex2rgb("#1b2a1f"), hex2rgb("#2f5b3a"), sun), 0.95));
      ground.addColorStop(1, rgba(mix(hex2rgb("#080f0b"), hex2rgb("#0d2417"), sun), 1));
      ctx.fillStyle = ground;
      ctx.beginPath(); ctx.moveTo(0, horizon + 10);
      ctx.quadraticCurveTo(w / 2, horizon - 26, w, horizon + 10);
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

      /* water basin */
      this.water(sun, horizon);

      /* spring column of light */
      this.column(sun);

      /* flora */
      const wind = this.motion * (Math.sin(this.t * 0.6) * 0.5 + Math.sin(this.t * 1.7) * 0.25);
      this.plants.forEach((p) => this.drawPlant(p, wind));

      /* foreground silhouettes */
      const fg = mix(hex2rgb("#0a120c"), hex2rgb("#14251a"), sun);
      this.fore.forEach((f) => {
        const r = TS.rng(f.seed);
        const c = mix(fg, this.attrColors[f.attr] || fg, 0.28);
        this.archetypes.clump(ctx, { x: f.x, y: f.y, g: 1.15, scale: f.s * (this.w / 900), sway: wind * 0.5, phase: 0, rng: r, c1: rgba(c, 0.95), c2: rgba(mix(c, [0, 0, 0], 0.35), 0.95), color: c, t: this.t });
      });

      /* particles */
      this.updateParts(dt, wind);
      /* ripples */
      this.ripples = this.ripples.filter((rp) => {
        rp.r += (rp.max - rp.r) * 0.05; rp.life -= dt * 0.55;
        if (rp.life <= 0) return false;
        ctx.strokeStyle = rgba([220, 255, 255], rp.life * 0.5);
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.32, 0, 0, 7); ctx.stroke();
        return true;
      });

      /* bloom pulse vignette */
      if (this.bloomPulse > 0) {
        this.bloomPulse -= dt * 1.6;
        if (this.bloomPulse > 0) {
          ctx.save();
          const g2 = ctx.createRadialGradient(w / 2, h * 0.8, 0, w / 2, h * 0.8, w * 0.7);
          g2.addColorStop(0, rgba([180, 255, 240], this.bloomPulse * 0.16));
          g2.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
          ctx.restore();
        }
      }

      if (Math.random() < 0.02) this.dropTick();
    },

    ridge(baseY, amp, col, alpha, freq, speed) {
      const ctx = this.ctx, w = this.w;
      ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.moveTo(0, baseY + amp);
      for (let x = 0; x <= w; x += 12) {
        const y = baseY + Math.sin(x * speed * 1000 + this.t * 0.05) * amp * 0.5 + Math.sin(x * 0.006 * freq) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, baseY + amp * 3); ctx.lineTo(0, baseY + amp * 3); ctx.closePath(); ctx.fill();
      ctx.restore();
    },

    water(sun, horizon) {
      const ctx = this.ctx, w = this.w, h = this.h, P = this.palette;
      const cx = w / 2, cy = h * 0.86, rx = w * 0.40, ry = h * 0.11;
      const c1 = mix(hex2rgb(P.water[1]), hex2rgb(P.water[0]), sun * 0.7 + 0.15);
      const c2 = hex2rgb(P.water[1]);
      ctx.save();
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7);
      const g = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
      g.addColorStop(0, rgba(mix(c1, [255, 255, 255], 0.35), 0.95));
      g.addColorStop(0.5, rgba(c1, 0.95));
      g.addColorStop(1, rgba(c2, 0.98));
      ctx.fillStyle = g; ctx.fill();
      ctx.clip();
      // shimmer lines
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 7; i++) {
        const yy = cy - ry + (i / 7) * ry * 2;
        const amp = 3 + i * 0.6;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const y = yy + Math.sin(x * 0.02 + this.t * (1 + i * 0.2) + i) * amp * 0.3;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(mix(c1, [255, 255, 255], 0.6), 0.22); ctx.lineWidth = 1.2; ctx.stroke();
      }
      // central light reflection
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 0.5);
      rg.addColorStop(0, rgba([220, 255, 250], 0.28 * (0.4 + sun))); rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
      ctx.restore();
    },

    column(sun) {
      const ctx = this.ctx, w = this.w, h = this.h;
      const lvl = this.derived ? this.derived.level : 1;
      const strength = clamp(lvl / 20, 0.12, 1);
      const cx = w / 2, baseY = h * 0.86, topY = h * 0.14;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createLinearGradient(0, baseY, 0, topY);
      g.addColorStop(0, rgba([140, 255, 235], 0.35 * strength));
      g.addColorStop(0.5, rgba([160, 220, 255], 0.16 * strength));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      const wid = w * (0.02 + strength * 0.05);
      ctx.beginPath();
      ctx.moveTo(cx - wid, baseY);
      ctx.quadraticCurveTo(cx - wid * 0.6, baseY - (baseY - topY) * 0.5, cx - wid * 0.22, topY);
      ctx.lineTo(cx + wid * 0.22, topY);
      ctx.quadraticCurveTo(cx + wid * 0.6, baseY - (baseY - topY) * 0.5, cx + wid, baseY);
      ctx.closePath(); ctx.fill();
      // rising motes within the column
      ctx.globalAlpha = 0.7 * strength * (0.6 + sun * 0.4);
      for (let i = 0; i < 14; i++) {
        const ph = (this.t * (0.08 + i * 0.008) + i * 0.31) % 1;
        const y = baseY - ph * (baseY - topY);
        const x = cx + Math.sin(ph * 8 + i) * wid * 0.5;
        const r = 1 + (1 - ph) * 2.2;
        ctx.fillStyle = rgba([200, 255, 245], (1 - ph) * 0.8);
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      ctx.restore();
    },

    updateParts(dt, wind) {
      const ctx = this.ctx;
      this.parts = this.parts.filter((p) => {
        p.life -= dt / p.max;
        if (p.life <= 0) return false;
        if (p.type === "burst") { p.vy += 120 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
        else if (p.type === "drop") { p.vy += 260 * dt; p.y += p.vy * dt; p.x += p.vx * dt; if (p.y > this.h * 0.9 && !p.splashed) { p.splashed = true; this.ripples.push({ x: p.x, y: p.y, r: 3, max: this.w * 0.08, life: 1 }); } }
        else { p.x += (p.vx + wind * 20) * dt; p.y += p.vy * dt; p.vy += 8 * dt; }
        const a = clamp(p.life, 0, 1);
        ctx.beginPath();
        ctx.fillStyle = p.type === "burst" ? rgba([190, 255, 245], a * 0.9) : rgba([210, 255, 250], a * 0.75);
        ctx.arc(p.x, p.y, p.r * (0.4 + a * 0.6), 0, 7); ctx.fill();
        return true;
      });
      // ambient floating spores / fireflies
      if (this.particles && this.parts.length < 70) {
        const night = this.skyFactor() < 0.4;
        const drift = { x: Math.random() * this.w, y: this.h * 0.3 + Math.random() * this.h * 0.6, vx: (Math.random() - 0.5) * 12, vy: night ? -4 - Math.random() * 8 : -12 - Math.random() * 14, life: 1, max: 4 + Math.random() * 5, r: night ? 1.6 + Math.random() * 1.6 : 1 + Math.random() * 1.6, type: night ? "glow" : "spore" };
        this.parts.push(drift);
      }
      // glow rendering for fireflies
      const glow = this.parts.filter((p) => p.type === "glow");
      glow.forEach((p) => {
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        const a = clamp(p.life, 0, 1) * (0.6 + 0.4 * Math.sin(this.t * 4 + p.x));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
        g.addColorStop(0, rgba([255, 240, 170], a * 0.9)); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, 7); ctx.fill(); ctx.restore();
      });
    },

    drawPlant(p, wind) {
      const ctx = this.ctx;
      const g = this.growth(p);
      const rng = TS.rng(p.seed); // deterministic per frame → stable shape
      const base = this.attrColors[p.attr] || [120, 200, 160];
      const c1 = rgba(base, 0.95);
      const c2 = rgba(mix(base, [0, 0, 0], 0.35), 0.95);
      const sway = wind * (0.6 + p.depth * 0.5);
      const fn = this.archetypes[p.arch] || this.archetypes.flower;
      ctx.save();
      // soft shadow at base
      ctx.fillStyle = "rgba(0,0,0,.28)";
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 16 * p.scale, 4.5 * p.scale, 0, 0, 7); ctx.fill();
      fn(ctx, { x: p.x, y: p.y, g, scale: p.scale, sway, phase: p.phase, rng, c1, c2, color: base, t: this.t, done: false });
      ctx.restore();
    },

    /* ---------- archetypes ---------- */
    archetypes: {
      grass(ctx, o) {
        const n = 5 + Math.floor(o.rng() * 5);
        const H = 70 * o.g * o.scale * 1.5;
        for (let i = 0; i < n; i++) {
          const bx = o.x + (i - (n - 1) / 2) * 3.4 * o.scale;
          const bh = H * (0.55 + o.rng() * 0.7);
          const bend = (o.rng() * 2 - 1) * 0.6;
          const w = o.sway * bh * 0.5;
          const tipX = bx + bend * 26 * o.scale + w;
          const tipY = o.y - bh;
          ctx.beginPath(); ctx.moveTo(bx, o.y);
          ctx.quadraticCurveTo(bx + bend * 10 * o.scale + w * 0.4, o.y - bh * 0.55, tipX, tipY);
          ctx.strokeStyle = i % 2 ? o.c1 : o.c2;
          ctx.lineWidth = Math.max(1.1, 2.3 * o.scale); ctx.lineCap = "round"; ctx.stroke();
        }
      },
      flower(ctx, o) {
        const H = 62 * o.g * o.scale * 1.7;
        const bend = (o.rng() * 2 - 1) * 0.5;
        const lean = o.sway * H * 0.35 + bend * 14 * o.scale;
        const tipX = o.x + lean, tipY = o.y - H;
        // stem
        ctx.beginPath(); ctx.moveTo(o.x, o.y);
        ctx.quadraticCurveTo(o.x + lean * 0.4, o.y - H * 0.5, tipX, tipY);
        ctx.strokeStyle = o.c2; ctx.lineWidth = Math.max(1.4, 3 * o.scale); ctx.lineCap = "round"; ctx.stroke();
        // leaves
        const leaves = 2 + Math.floor(o.rng() * 2);
        for (let i = 0; i < leaves; i++) {
          const ly = o.y - H * (0.25 + i * 0.22), dir = i % 2 ? 1 : -1;
          ctx.beginPath(); ctx.moveTo(o.x + lean * 0.2, ly);
          ctx.quadraticCurveTo(o.x + dir * 18 * o.scale, ly - 4 * o.scale, o.x + dir * 26 * o.scale + o.sway * 6, ly - 12 * o.scale);
          ctx.quadraticCurveTo(o.x + dir * 12 * o.scale, ly + 5 * o.scale, o.x + lean * 0.2, ly);
          ctx.fillStyle = o.c1; ctx.fill();
        }
        // bloom
        const petals = 6 + Math.floor(o.rng() * 4);
        const bloomR = (5 + o.rng() * 4) * o.scale * (0.6 + 0.7 * o.g);
        const cx = tipX + o.sway * 3, cy = tipY - bloomR * 0.4;
        for (let i = 0; i < petals; i++) {
          const a = (i / petals) * Math.PI * 2 + this._spin(o);
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * bloomR, cy + Math.sin(a) * bloomR, bloomR * 0.72, bloomR * 0.42, a, 0, 7);
          ctx.fillStyle = rgba(mix(o.color, [255, 255, 255], 0.28), 0.95); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(cx, cy, bloomR * 0.5, 0, 7);
        ctx.fillStyle = rgba(mix(o.color, [255, 220, 90], 0.6), 1); ctx.fill();
      },
      tree(ctx, o) {
        const H = 78 * o.g * o.scale * 1.8;
        const trunkW = 7 * o.scale * (0.6 + o.g * 0.5);
        ctx.beginPath();
        ctx.moveTo(o.x - trunkW, o.y);
        ctx.quadraticCurveTo(o.x - trunkW * 0.5 + o.sway * H * 0.1, o.y - H * 0.5, o.x - trunkW * 0.35 + o.sway * H * 0.22, o.y - H);
        ctx.lineTo(o.x + trunkW * 0.35 + o.sway * H * 0.22, o.y - H);
        ctx.quadraticCurveTo(o.x + trunkW * 0.5 + o.sway * H * 0.1, o.y - H * 0.5, o.x + trunkW, o.y);
        ctx.closePath();
        ctx.fillStyle = rgba(mix(o.color, [60, 40, 20], 0.62), 1); ctx.fill();
        // canopy
        const blobs = 6 + Math.floor(o.rng() * 4);
        for (let i = 0; i < blobs; i++) {
          const bx = o.x + (o.rng() - 0.5) * 46 * o.scale + o.sway * H * 0.22;
          const by = o.y - H - (o.rng() * 22 - 6) * o.scale;
          const br = (14 + o.rng() * 14) * o.scale * (0.5 + o.g * 0.6);
          ctx.beginPath(); ctx.arc(bx, by, br, 0, 7);
          ctx.fillStyle = i % 2 ? rgba(mix(o.color, [255, 255, 255], 0.12), 0.92) : o.c2;
          ctx.fill();
        }
      },
      fungus(ctx, o) {
        const caps = 2 + Math.floor(o.rng() * 3);
        const glow = o.attr === "spirit";
        for (let i = 0; i < caps; i++) {
          const off = (i - (caps - 1) / 2) * 13 * o.scale;
          const H = (22 + o.rng() * 20) * o.scale * (0.6 + o.g * 0.7);
          const sx = o.x + off, sy = o.y;
          ctx.beginPath(); ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(sx - 2, sy - H * 0.6, sx + o.sway * 6, sy - H);
          ctx.strokeStyle = rgba(mix(o.color, [255, 255, 255], 0.5), 0.95);
          ctx.lineWidth = Math.max(1.6, 3.2 * o.scale); ctx.lineCap = "round"; ctx.stroke();
          const capR = (8 + o.rng() * 7) * o.scale * (0.7 + o.g * 0.5);
          const cx = sx + o.sway * 6, cy = sy - H;
          ctx.save();
          if (glow) { ctx.shadowColor = rgba(o.color, 0.9); ctx.shadowBlur = 18; }
          ctx.beginPath(); ctx.ellipse(cx, cy, capR, capR * 0.68, 0, Math.PI, 0); ctx.fill();
          ctx.fillStyle = rgba(mix(o.color, [255, 255, 255], 0.18), 0.97); ctx.fill();
          ctx.restore();
        }
      },
      clump(ctx, o) {
        const n = 8 + Math.floor(o.rng() * 6);
        const H = 34 * o.g * o.scale * 1.4;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + o.rng();
          const rr = (4 + o.rng() * 14) * o.scale;
          const bx = o.x + Math.cos(a) * rr, by = o.y - o.rng() * H * 0.5;
          const r = (5 + o.rng() * 6) * o.scale * (0.6 + o.g * 0.5);
          ctx.beginPath(); ctx.ellipse(bx + o.sway * 2, by, r, r * 0.7, a, 0, 7);
          ctx.fillStyle = i % 2 ? o.c2 : rgba(mix(o.color, [255, 255, 255], 0.1), 0.95); ctx.fill();
        }
        if (o.attr === "body") { // berry dots
          for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(o.x + (o.rng() - 0.5) * 22 * o.scale, o.y - 8 - o.rng() * 14, 2.4 * o.scale, 0, 7);
            ctx.fillStyle = "rgba(255,90,120,.95)"; ctx.fill();
          }
        }
      },
      succulent(ctx, o) {
        const H = 52 * o.g * o.scale * 1.5;
        const wdt = 9 * o.scale;
        ctx.beginPath();
        ctx.moveTo(o.x - wdt, o.y);
        ctx.lineTo(o.x - wdt * 0.8, o.y - H);
        ctx.quadraticCurveTo(o.x + o.sway * 8, o.y - H - wdt, o.x + wdt * 0.8, o.y - H);
        ctx.lineTo(o.x + wdt, o.y);
        ctx.closePath();
        ctx.fillStyle = rgba(mix(o.color, [20, 60, 40], 0.35), 1); ctx.fill();
        // arms
        for (let s = -1; s <= 1; s += 2) {
          const ay = o.y - H * (0.45 + Math.abs(s) * 0.1);
          ctx.beginPath();
          ctx.moveTo(o.x + s * wdt * 0.6, ay);
          ctx.quadraticCurveTo(o.x + s * wdt * 2.2, ay + 2, o.x + s * wdt * 2.4, ay - H * 0.28);
          ctx.lineTo(o.x + s * wdt * 3.2, ay - H * 0.28);
          ctx.quadraticCurveTo(o.x + s * wdt * 3.0, ay + 8, o.x + s * wdt * 0.6, ay + 8);
          ctx.closePath();
          ctx.fillStyle = rgba(mix(o.color, [20, 60, 40], 0.28), 1); ctx.fill();
        }
        // spines
        ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1;
        for (let i = 0; i < 7; i++) {
          const yy = o.y - (i / 7) * H;
          ctx.beginPath(); ctx.moveTo(o.x - wdt * 0.9, yy); ctx.lineTo(o.x - wdt * 1.5, yy - 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(o.x + wdt * 0.9, yy); ctx.lineTo(o.x + wdt * 1.5, yy - 2); ctx.stroke();
        }
      },
      crystal(ctx, o) {
        const H = 46 * o.g * o.scale * 1.7;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const n = 3 + Math.floor(o.rng() * 3);
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * 10 * o.scale;
          const hh = H * (0.6 + o.rng() * 0.7);
          const wdt = (4 + o.rng() * 4) * o.scale;
          const bx = o.x + off, tilt = o.sway * 6;
          ctx.beginPath();
          ctx.moveTo(bx, o.y);
          ctx.lineTo(bx - wdt + tilt * 0.3, o.y - hh * 0.55);
          ctx.lineTo(bx + tilt, o.y - hh);
          ctx.lineTo(bx + wdt + tilt * 0.3, o.y - hh * 0.55);
          ctx.closePath();
          ctx.fillStyle = rgba(mix(o.color, [255, 255, 255], 0.55), 0.5); ctx.fill();
          ctx.strokeStyle = rgba(mix(o.color, [255, 255, 255], 0.85), 0.8); ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.restore();
      },
    },

    _spin(o) { return Math.floor(o.rng() * 6.28 * 100) / 100; },
  };

  TS.Garden = Garden;
})();
