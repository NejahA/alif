// ─── Morphia: Fluid Particle Morphing ─────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const particleCountEl = document.getElementById('particleCount');

let W, H;
const resize = () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
};
resize();
window.addEventListener('resize', resize);

// ─── Simple hash noise (deterministic, no external lib) ──────────
class Simplex {
  constructor() {
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    this.p = [];
    for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
    this.perm = [];
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }
  dot(g, x, y) { return g[0] * x + g[1] * y; }
  noise(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = x - X0, y0 = y - Y0;
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const gi0 = this.perm[ii + this.perm[jj]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); }
    return 70 * (n0 + n1 + n2);
  }
}

const simplex = new Simplex();

// ─── Particle ─────────────────────────────────────────────────────
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = 0;
    this.vy = 0;
    this.prevX = this.x;
    this.prevY = this.y;
    this.age = Math.random() * 500;
    this.lifespan = 500 + Math.random() * 1500;
    this.size = 1.2 + Math.random() * 2.5;
    this.hue = Math.random() * 360;
    this.saturation = 60 + Math.random() * 40;
    this.lightness = 50 + Math.random() * 30;
    this.alpha = 0.3 + Math.random() * 0.5;
    this.noiseOffsetX = Math.random() * 1000;
    this.noiseOffsetY = Math.random() * 1000;
    this.trail = [];
    this.maxTrail = 3 + Math.floor(Math.random() * 5);
  }

  update(mouse, time) {
    this.prevX = this.x;
    this.prevY = this.y;

    // Flow field using simplex noise
    const nx = (this.x / W) * 2 - 1 + this.noiseOffsetX;
    const ny = (this.y / H) * 2 - 1 + this.noiseOffsetY;
    const angle = simplex.noise(nx * 2.5, ny * 2.5) * Math.PI * 3 +
                  Math.sin(time * 0.0002 + this.noiseOffsetX) * 0.5;

    const flowSpeed = 0.8 + Math.sin(time * 0.0005 + this.noiseOffsetY) * 0.3;
    const fx = Math.cos(angle) * flowSpeed;
    const fy = Math.sin(angle) * flowSpeed;

    // Mouse influence
    let mx = 0, my = 0;
    if (mouse.active) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 250;
      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 0.6;
        mx += (dx / (dist + 0.1)) * force;
        my += (dy / (dist + 0.1)) * force;
        // Color shift toward mouse
        this.hue += 0.8 + force * 2;
      }
    }

    // Apply forces
    this.vx += fx * 0.08 + mx * 0.12;
    this.vy += fy * 0.08 + my * 0.12;

    // Damping
    this.vx *= 0.94;
    this.vy *= 0.94;

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges with padding
    const pad = 40;
    if (this.x < -pad) this.x = W + pad;
    if (this.x > W + pad) this.x = -pad;
    if (this.y < -pad) this.y = H + pad;
    if (this.y > H + pad) this.y = -pad;

    // Age
    this.age++;
    if (this.age > this.lifespan) {
      this.reset();
      this.age = 0;
    }

    // Store trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    // Gentle hue drift
    this.hue += 0.15 + Math.sin(time * 0.001 + this.noiseOffsetX) * 0.1;
    if (this.hue > 360) this.hue -= 360;
  }

  draw(ctx) {
    // Draw trail
    for (let i = 1; i < this.trail.length; i++) {
      const p0 = this.trail[i - 1];
      const p1 = this.trail[i];
      const frac = i / this.trail.length;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `hsla(${this.hue + frac * 20}, ${this.saturation}%, ${this.lightness + frac * 10}%, ${this.alpha * frac * 0.5})`;
      ctx.lineWidth = this.size * frac * 0.8;
      ctx.stroke();
    }

    // Draw particle
    const lifeRatio = Math.min(this.age / 200, 1);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * lifeRatio, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha * lifeRatio})`;
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3 * lifeRatio, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.alpha * 0.08 * lifeRatio})`;
    ctx.fill();
  }
}

// ─── Mouse ────────────────────────────────────────────────────────
const mouse = { x: -9999, y: -9999, active: false };
canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
canvas.addEventListener('mouseleave', () => {
  mouse.active = false;
});
canvas.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
  mouse.active = true;
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', () => {
  mouse.active = false;
});

// ─── Scene ────────────────────────────────────────────────────────
let particles = [];
const PARTICLE_COUNT = Math.min(600, Math.floor((W * H) / 3000));

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle();
    // Stagger initial ages so they don't all reset at once
    p.age = Math.random() * p.lifespan;
    particles.push(p);
  }
  particleCountEl.textContent = particles.length;
}

initParticles();

// ─── Background texture (subtle noise overlay) ────────────────────
function createBgTexture() {
  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');
  offscreen.width = 256;
  offscreen.height = 256;
  const imgData = offCtx.createImageData(256, 256);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = Math.floor(Math.random() * 20);
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v + 5;
    imgData.data[i + 3] = 30;
  }
  offCtx.putImageData(imgData, 0, 0);
  return offscreen;
}
const bgTexture = createBgTexture();

// ─── Render loop ──────────────────────────────────────────────────
let frameCount = 0;

function render(time) {
  // Semi-transparent fill for trailing effect
  ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
  ctx.fillRect(0, 0, W, H);

  // Background texture (tiled, very subtle)
  ctx.globalAlpha = 0.04;
  ctx.drawImage(bgTexture, 0, 0, W, H);
  ctx.globalAlpha = 1;

  // Update & draw particles
  frameCount++;
  const updateInterval = 2; // Update every 2nd frame for performance at high count
  for (let i = 0; i < particles.length; i++) {
    if (frameCount % updateInterval === 0) {
      particles[i].update(mouse, time + i * 0.1);
    }
    particles[i].draw(ctx);
  }

  // Occasional ambient particle spawn (floating sparkles)
  if (Math.random() < 0.03) {
    const sx = Math.random() * W;
    const sy = Math.random() * H;
    const hue = (time * 0.02) % 360;
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6);
    grad.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.3)`);
    grad.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(sx - 6, sy - 6, 12, 12);
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

// ─── Reset ────────────────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', () => {
  initParticles();
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);
});

// ─── Handle resize ────────────────────────────────────────────────
window.addEventListener('resize', () => {
  resize();
  // Reinitialize particles for new dimensions
  const newCount = Math.min(600, Math.floor((W * H) / 3000));
  if (newCount !== particles.length) {
    initParticles();
  }
});