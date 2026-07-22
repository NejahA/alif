// ─── Aeris — wind particle simulation ───────────────────────────────

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ─── Color schemes ──────────────────────────────────────────────────

const COLOR_SCHEMES = {
  dawn: {
    bg: [10, 10, 20],
    particles: [
      [255, 200, 150, 0.6],
      [255, 160, 100, 0.5],
      [200, 140, 200, 0.4],
      [255, 220, 180, 0.3],
    ],
    trails: [255, 200, 150, 0.015],
  },
  dusk: {
    bg: [10, 10, 15],
    particles: [
      [180, 140, 255, 0.6],
      [140, 180, 255, 0.5],
      [200, 160, 255, 0.4],
      [120, 140, 240, 0.3],
    ],
    trails: [180, 140, 255, 0.012],
  },
  aurora: {
    bg: [5, 8, 20],
    particles: [
      [100, 255, 180, 0.5],
      [80, 220, 255, 0.4],
      [150, 255, 200, 0.3],
      [60, 200, 180, 0.3],
    ],
    trails: [100, 255, 180, 0.01],
  },
  ocean: {
    bg: [5, 10, 25],
    particles: [
      [80, 180, 255, 0.5],
      [60, 140, 220, 0.4],
      [120, 200, 255, 0.3],
      [40, 100, 200, 0.3],
    ],
    trails: [80, 180, 255, 0.012],
  },
  ember: {
    bg: [15, 8, 5],
    particles: [
      [255, 120, 50, 0.6],
      [255, 80, 30, 0.5],
      [255, 160, 80, 0.4],
      [200, 60, 20, 0.3],
    ],
    trails: [255, 120, 50, 0.015],
  },
};

// ─── Particle ───────────────────────────────────────────────────────

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 2.5 + 0.5;
    this.baseSize = this.size;
    this.opacity = Math.random() * 0.6 + 0.2;
    this.life = Math.random();
    this.speed = Math.random() * 0.5 + 0.2;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleAmp = Math.random() * 0.5 + 0.2;
    this.wobbleFreq = Math.random() * 0.003 + 0.001;
    this.colorIdx = Math.floor(Math.random() * 4);
    this.trail = [];
    this.maxTrail = Math.floor(Math.random() * 8) + 3;
    this.z = Math.random(); // depth layer for parallax
  }

  update(windField, time) {
    const ix = Math.floor((this.x / W) * windField.cols);
    const iy = Math.floor((this.y / H) * windField.rows);
    const idx = Math.min(iy * windField.cols + ix, windField.vectors.length - 1);

    let vx, vy;
    if (idx >= 0 && idx < windField.vectors.length) {
      vx = windField.vectors[idx].x;
      vy = windField.vectors[idx].y;
    } else {
      vx = 0;
      vy = 0;
    }

    // Add wobble
    this.wobblePhase += this.wobbleFreq;
    const wobbleX = Math.sin(this.wobblePhase) * this.wobbleAmp;
    const wobbleY = Math.cos(this.wobblePhase * 0.7) * this.wobbleAmp;

    // Depth affects speed
    const depthFactor = 0.5 + this.z * 0.5;

    this.x += (vx * this.speed + wobbleX) * depthFactor;
    this.y += (vy * this.speed + wobbleY) * depthFactor;

    // Life cycle
    this.life += 0.002 * depthFactor;
    if (this.life > 1) {
      this.life = 0;
      this.reset();
    }

    // Trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    // Wrap around edges
    if (this.x < -20) this.x = W + 20;
    if (this.x > W + 20) this.x = -20;
    if (this.y < -20) this.y = H + 20;
    if (this.y > H + 20) this.y = -20;
  }

  draw(ctx, scheme, time) {
    const colors = scheme.particles[this.colorIdx];
    const alpha = this.opacity * (1 - this.life) * 0.8;

    // Draw trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${alpha * 0.3})`;
      ctx.lineWidth = this.size * 0.5;
      ctx.stroke();
    }

    // Glow
    const glowSize = this.size * 4;
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, glowSize
    );
    gradient.addColorStop(0, `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${alpha * 0.4})`);
    gradient.addColorStop(1, `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${alpha})`;
    ctx.fill();

    // Bright center
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.fill();
  }
}

// ─── Wind Field ─────────────────────────────────────────────────────

class WindField {
  constructor() {
    this.cols = 40;
    this.rows = 30;
    this.vectors = [];
    this.baseSpeed = 0.8;
    this.turbulence = 0.3;
    this.time = 0;
    this.gusts = [];
    this.generate();
  }

  generate() {
    this.vectors = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5 + 0.5;
        this.vectors.push({
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        });
      }
    }
  }

  update(time, windSpeed, mouseX, mouseY) {
    this.time = time;
    const speedFactor = windSpeed / 80;

    for (let i = 0; i < this.vectors.length; i++) {
      const x = i % this.cols;
      const y = Math.floor(i / this.cols);
      const nx = x / this.cols;
      const ny = y / this.rows;

      // Simplex-like noise using layered sine waves
      const angle1 = Math.sin(nx * 3 + time * 0.0003) * Math.cos(ny * 2 + time * 0.0002);
      const angle2 = Math.sin(nx * 5 - time * 0.0004) * Math.cos(ny * 4 + time * 0.0003);
      const angle3 = Math.sin((nx + ny) * 4 + time * 0.0005);
      const angle = angle1 * 0.5 + angle2 * 0.3 + angle3 * 0.2;

      const baseAngle = angle * Math.PI;
      const speed = (0.5 + 0.5 * Math.sin(nx * 2 + ny * 3 + time * 0.0002)) * speedFactor;

      this.vectors[i].x = Math.cos(baseAngle) * speed + (Math.random() - 0.5) * this.turbulence * 0.1;
      this.vectors[i].y = Math.sin(baseAngle) * speed + (Math.random() - 0.5) * this.turbulence * 0.1;

      // Mouse influence
      if (mouseX !== null && mouseY !== null) {
        const dx = (mouseX / W) - nx;
        const dy = (mouseY / H) - ny;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.2) {
          const influence = (1 - dist / 0.2) * 0.5;
          this.vectors[i].x += dx * influence * 2;
          this.vectors[i].y += dy * influence * 2;
        }
      }
    }

    // Gusts
    for (let g = this.gusts.length - 1; g >= 0; g--) {
      const gust = this.gusts[g];
      gust.life -= 0.005;
      gust.x += gust.vx * 0.5;
      gust.y += gust.vy * 0.5;
      if (gust.life <= 0) {
        this.gusts.splice(g, 1);
        continue;
      }
      const gx = Math.floor((gust.x / W) * this.cols);
      const gy = Math.floor((gust.y / H) * this.rows);
      const radius = 3;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const cx = gx + dx;
          const cy = gy + dy;
          if (cx >= 0 && cx < this.cols && cy >= 0 && cy < this.rows) {
            const idx = cy * this.cols + cx;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
              const strength = (1 - dist / radius) * gust.life * 2;
              this.vectors[idx].x += gust.vx * strength;
              this.vectors[idx].y += gust.vy * strength;
            }
          }
        }
      }
    }
  }

  addGust(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    this.gusts.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
    });
  }

  setPreset(preset) {
    switch (preset) {
      case 'gentle':
        this.baseSpeed = 0.4;
        this.turbulence = 0.1;
        break;
      case 'gusty':
        this.baseSpeed = 1.2;
        this.turbulence = 0.5;
        break;
      case 'storm':
        this.baseSpeed = 2.5;
        this.turbulence = 1.0;
        break;
      case 'whirlwind':
        this.baseSpeed = 1.0;
        this.turbulence = 0.8;
        break;
    }
  }
}

// ─── State ──────────────────────────────────────────────────────────

const windField = new WindField();
let particles = [];
let targetParticleCount = 200;
let windSpeed = 80;
let currentScheme = 'dusk';
let mouseX = null;
let mouseY = null;
let time = 0;
let frameCount = 0;
let fpsTime = 0;
let fps = 0;

function initParticles(count) {
  while (particles.length < count) {
    particles.push(new Particle());
  }
  if (particles.length > count) {
    particles.length = count;
  }
}

initParticles(targetParticleCount);

// ─── DOM refs ───────────────────────────────────────────────────────

const windSlider = document.getElementById('windSpeed');
const particleSlider = document.getElementById('particleCount');
const colorSelect = document.getElementById('colorScheme');
const resetBtn = document.getElementById('resetBtn');
const particleStat = document.getElementById('particleStat');
const fpsStat = document.getElementById('fpsStat');
const flowStat = document.getElementById('flowStat');

// ─── Controls ───────────────────────────────────────────────────────

windSlider.addEventListener('input', () => {
  windSpeed = parseFloat(windSlider.value);
});

particleSlider.addEventListener('input', () => {
  targetParticleCount = parseInt(particleSlider.value);
  initParticles(targetParticleCount);
});

colorSelect.addEventListener('change', () => {
  currentScheme = colorSelect.value;
});

resetBtn.addEventListener('click', () => {
  windField.generate();
  particles = [];
  initParticles(targetParticleCount);
});

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset;
    windField.setPreset(preset);
    // Visual feedback
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
});

// ─── Mouse / Touch ──────────────────────────────────────────────────

canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

canvas.addEventListener('mouseleave', () => {
  mouseX = null;
  mouseY = null;
});

canvas.addEventListener('click', (e) => {
  windField.addGust(e.clientX, e.clientY);
});

canvas.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  mouseX = touch.clientX;
  mouseY = touch.clientY;
}, { passive: true });

canvas.addEventListener('touchend', () => {
  mouseX = null;
  mouseY = null;
});

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  windField.addGust(touch.clientX, touch.clientY);
}, { passive: true });

// ─── Render ─────────────────────────────────────────────────────────

function drawBackground(scheme) {
  const colors = COLOR_SCHEMES[scheme];
  ctx.fillStyle = `rgb(${colors.bg[0]}, ${colors.bg[1]}, ${colors.bg[2]})`;
  ctx.fillRect(0, 0, W, H);
}

function drawWindLines(windField, scheme) {
  const colors = COLOR_SCHEMES[scheme];
  ctx.lineWidth = 0.5;
  for (let y = 0; y < windField.rows; y += 2) {
    for (let x = 0; x < windField.cols; x += 2) {
      const idx = y * windField.cols + x;
      if (idx >= windField.vectors.length) continue;
      const v = windField.vectors[idx];
      const px = (x / windField.cols) * W;
      const py = (y / windField.rows) * H;
      const len = Math.sqrt(v.x * v.x + v.y * v.y);
      if (len > 0.05) {
        const alpha = Math.min(len * 0.3, 0.15);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + v.x * 20, py + v.y * 20);
        ctx.strokeStyle = `rgba(${colors.particles[0][0]}, ${colors.particles[0][1]}, ${colors.particles[0][2]}, ${alpha})`;
        ctx.stroke();
      }
    }
  }
}

function animate(timestamp) {
  time = timestamp;

  // FPS
  frameCount++;
  if (timestamp - fpsTime > 1000) {
    fps = frameCount;
    frameCount = 0;
    fpsTime = timestamp;
  }

  // Update wind
  windField.update(time, windSpeed, mouseX, mouseY);

  // Update particles
  for (const p of particles) {
    p.update(windField, time);
  }

  // Draw
  const scheme = COLOR_SCHEMES[currentScheme];

  // Fade effect (trails)
  ctx.fillStyle = `rgba(${scheme.bg[0]}, ${scheme.bg[1]}, ${scheme.bg[2]}, ${scheme.trails[3]})`;
  ctx.fillRect(0, 0, W, H);

  // Wind lines
  drawWindLines(windField, currentScheme);

  // Particles
  for (const p of particles) {
    p.draw(ctx, scheme, time);
  }

  // Stats
  particleStat.textContent = particles.length;
  fpsStat.textContent = fps;
  const totalSpeed = windField.vectors.reduce((sum, v) => sum + Math.sqrt(v.x * v.x + v.y * v.y), 0);
  const avgFlow = (totalSpeed / windField.vectors.length * 100).toFixed(0);
  flowStat.textContent = avgFlow;

  requestAnimationFrame(animate);
}

// ─── Start ──────────────────────────────────────────────────────────

animate(0);