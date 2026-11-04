/* =========================================================
   Tasneeme — canvas charts (no dependencies)
   ========================================================= */
(function () {
  "use strict";
  const TS = (window.TS = window.TS || {});

  function hex2rgb(h) {
    h = (h || "").trim();
    if (h[0] !== "#") {
      const m = h.match(/rgba?\(([^)]+)\)/);
      if (m) { const p = m[1].split(",").map(Number); return [p[0], p[1], p[2]]; }
      return [120, 190, 220];
    }
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgba = (c, a) => "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a + ")";

  function theme() {
    const cs = getComputedStyle(document.documentElement);
    return {
      primary: hex2rgb(cs.getPropertyValue("--primary")),
      primary2: hex2rgb(cs.getPropertyValue("--primary-2")),
      text: hex2rgb(cs.getPropertyValue("--text")),
      dim: hex2rgb(cs.getPropertyValue("--text-dim")),
      border: cs.getPropertyValue("--border").trim() || "rgba(255,255,255,.15)",
      accent: hex2rgb(cs.getPropertyValue("--accent")),
      body: hex2rgb(cs.getPropertyValue("--body")),
      mind: hex2rgb(cs.getPropertyValue("--mind")),
      spirit: hex2rgb(cs.getPropertyValue("--spirit")),
      craft: hex2rgb(cs.getPropertyValue("--craft")),
    };
  }

  function setup(canvas, cssHeight) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width || 400;
    const h = cssHeight || canvas.getAttribute("height") || rect.height || 200;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h, dpr };
  }

  const Charts = {
    theme,

    /* ---------- heatmap : last N weeks ---------- */
    heatmap(canvas, values /* array of 0..1, length weeks*7, column-major */, weeks) {
      weeks = weeks || 12;
      const { ctx, w, h } = setup(canvas, canvas.getAttribute("height") || 150);
      const th = theme();
      const gap = 3;
      const cell = Math.max(6, Math.floor((w - gap * (weeks - 1)) / weeks));
      const totalW = cell * weeks + gap * (weeks - 1);
      const ox = (w - totalW) / 2, oy = 12;
      const r = Math.min(4, cell / 3);
      for (let c = 0; c < weeks; c++) {
        for (let row = 0; row < 7; row++) {
          const v = values[c * 7 + row] || 0;
          const x = ox + c * (cell + gap), y = oy + row * (cell + gap);
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(x, y, cell, cell, r) : ctx.rect(x, y, cell, cell);
          if (v <= 0) ctx.fillStyle = rgba(th.dim, 0.14);
          else ctx.fillStyle = rgba(th.primary, 0.22 + 0.78 * v);
          ctx.fill();
        }
      }
      // month legend line
      ctx.fillStyle = rgba(th.dim, 0.9);
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText(TS.t("habits.heatmap"), 2, 9);
    },

    /* ---------- line / area chart ---------- */
    line(canvas, series /* [{name,color,data:[{x:label,y}] }] */, opts) {
      opts = opts || {};
      const cssH = opts.height || canvas.getAttribute("height") || 220;
      const { ctx, w, h } = setup(canvas, cssH);
      const th = theme();
      const padL = 30, padR = 10, padT = 14, padB = 22;
      const iw = w - padL - padR, ih = h - padT - padB;
      const n = Math.max(1, series[0] ? series[0].data.length : 1);
      let max = opts.max || 0;
      series.forEach((s) => s.data.forEach((d) => { if (d.y > max) max = d.y; }));
      max = max || 1;

      // grid
      ctx.strokeStyle = rgba(th.dim, 0.16); ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padT + (ih * i) / 4;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
        ctx.fillStyle = rgba(th.dim, 0.9); ctx.font = "9px system-ui, sans-serif";
        ctx.fillText(Math.round(max * (1 - i / 4)), 4, y + 3);
      }

      series.forEach((s) => {
        const pts = s.data.map((d, i) => ({ x: padL + (n === 1 ? iw / 2 : (iw * i) / (n - 1)), y: padT + ih - (d.y / max) * ih }));
        if (!pts.length) return;
        // area
        const grad = ctx.createLinearGradient(0, padT, 0, padT + ih);
        grad.addColorStop(0, rgba(s.color || th.primary, 0.34));
        grad.addColorStop(1, rgba(s.color || th.primary, 0));
        ctx.beginPath(); ctx.moveTo(pts[0].x, padT + ih);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, padT + ih); ctx.closePath();
        ctx.fillStyle = grad; ctx.fill();
        // line
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.strokeStyle = rgba(s.color || th.primary, 0.95); ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
        // points
        pts.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 7); ctx.fillStyle = rgba(s.color || th.primary, 1); ctx.fill(); });
      });
      void padB;
    },

    /* ---------- radar : attribute constellation ---------- */
    radar(canvas, values /* {body,mind,spirit,craft} */, max) {
      const cssH = canvas.getAttribute("height") || 260;
      const { ctx, w, h } = setup(canvas, cssH);
      const th = theme();
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.34;
      const keys = TS.ATTRS;
      const colors = [th.body, th.mind, th.spirit, th.craft];
      max = Math.max(max || 0, 100);
      const ang = (i) => -Math.PI / 2 + (i / keys.length) * Math.PI * 2;

      // rings
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        keys.forEach((k, i) => {
          const a = ang(i), rr = (R * r) / 4;
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath(); ctx.strokeStyle = rgba(th.dim, 0.18); ctx.lineWidth = 1; ctx.stroke();
      }
      // spokes
      keys.forEach((k, i) => {
        const a = ang(i);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.strokeStyle = rgba(th.dim, 0.16); ctx.stroke();
      });
      // polygon
      ctx.beginPath();
      keys.forEach((k, i) => {
        const a = ang(i), v = Math.min(values[k] || 0, max) / max, rr = R * Math.max(0.04, v);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grad.addColorStop(0, rgba(th.primary, 0.45)); grad.addColorStop(1, rgba(th.primary2, 0.16));
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = rgba(th.primary, 0.95); ctx.lineWidth = 2; ctx.stroke();
      // vertices + labels
      ctx.font = "11px system-ui, sans-serif";
      keys.forEach((k, i) => {
        const a = ang(i), v = Math.min(values[k] || 0, max) / max, rr = R * Math.max(0.04, v);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fillStyle = rgba(colors[i], 1); ctx.fill();
        const lx = cx + Math.cos(a) * (R + 20), ly = cy + Math.sin(a) * (R + 16);
        ctx.fillStyle = rgba(th.text, 0.92);
        ctx.textAlign = Math.abs(Math.cos(a)) < 0.3 ? "center" : (Math.cos(a) > 0 ? "left" : "right");
        ctx.fillText(TS.t("attr." + k) + " " + Math.round(values[k] || 0), lx, ly + 3);
      });
      ctx.textAlign = "start";
    },
  };

  TS.Charts = Charts;
})();
