/**
 * ParticleEngine - Dynamic HTML5 Canvas Visualizer + 3D Hyperspace Tunnel
 */

export class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.ripples = [];
    this.tunnelRings = [];
    this.theme = 'cosmic'; // cosmic | cyberpunk | zen | solar | matrix | tunnel
    this.width = canvas.width;
    this.height = canvas.height;
    this.animId = null;
    this.cameraZ = 0;

    // Mouse Interaction state
    this.mouse = { x: this.width / 2, y: this.height / 2, isPressed: false, radius: 150 };

    this.initParticles(160);
    this.initTunnelRings(16);
    this.bindEvents();
  }

  setTheme(newTheme) {
    this.theme = newTheme;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.initParticles(Math.min(220, Math.floor((w * h) / 7000)));
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 1000 + 1, // 3D z depth
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        baseRadius: Math.random() * 3 + 1.5,
        radius: Math.random() * 3 + 1.5,
        hue: Math.random() * 360,
        alpha: Math.random() * 0.7 + 0.3,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }

  initTunnelRings(count) {
    this.tunnelRings = [];
    for (let i = 0; i < count; i++) {
      this.tunnelRings.push({
        z: i * (1000 / count),
        rotation: (i * Math.PI) / 8,
        sides: 6 // Hexagonal 3D ring
      });
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.createRipple(x, y);
    });
  }

  createRipple(x, y, power = 1) {
    this.ripples.push({
      x,
      y,
      radius: 5,
      maxRadius: 200 * power,
      alpha: 1,
      speed: 4 * power
    });
  }

  // Main Render Loop
  render(audioFreqData = []) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Calculate Audio Energy
    let bass = 0, mid = 0, treble = 0;
    if (audioFreqData && audioFreqData.length > 0) {
      const len = audioFreqData.length;
      for (let i = 0; i < len / 3; i++) bass += audioFreqData[i];
      for (let i = Math.floor(len / 3); i < (2 * len) / 3; i++) mid += audioFreqData[i];
      for (let i = Math.floor((2 * len) / 3); i < len; i++) treble += audioFreqData[i];

      bass /= (len / 3 * 255);
      mid /= (len / 3 * 255);
      treble /= (len / 3 * 255);
    }

    // Background Trail
    ctx.fillStyle = this.getBackgroundFill(bass);
    ctx.fillRect(0, 0, w, h);

    // 3D Hyperspace Tunnel Render Mode
    if (this.theme === 'tunnel') {
      this.render3DTunnel(audioFreqData, bass, treble);
      return;
    }

    // 3D Outrun Synthwave Grid Render Mode
    if (this.theme === 'cyberGrid') {
      this.render3DCyberGrid(audioFreqData, bass, treble);
      return;
    }

    // 3D Laser Matrix Render Mode
    if (this.theme === 'laserMatrix') {
      this.renderLaserMatrix(audioFreqData, bass, treble);
      return;
    }

    // 3D Plasma Vortex Render Mode
    if (this.theme === 'plasmaVortex') {
      this.renderPlasmaVortex(audioFreqData, bass, treble);
      return;
    }

    // 3D Black Hole Singularity Render Mode
    if (this.theme === 'blackHole') {
      this.renderBlackHole(audioFreqData, bass, treble);
      return;
    }

    // 3D Aurora Borealis Render Mode
    if (this.theme === 'auroraBorealis') {
      this.renderAuroraBorealis(audioFreqData, bass, treble);
      return;
    }

    // Spectrum Bars in Cyberpunk, Solar & Pump HyperSpace modes
    if (this.theme === 'cyberpunk' || this.theme === 'solar' || this.theme === 'pumpHyperSpace') {
      this.drawSpectrumBars(audioFreqData, bass);
    }

    // Update and Draw Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed;
      r.alpha -= 0.015;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.getThemePrimaryRGB()}, ${r.alpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Render Particles
    const cx = w / 2;
    const cy = h / 2;

    this.particles.forEach((p, idx) => {
      const freqVal = audioFreqData[idx % (audioFreqData.length || 1)] || 0;
      const boost = (freqVal / 255) * 2.5;
      p.radius = p.baseRadius + boost * 4 + bass * 3;

      if (this.theme === 'cosmic') {
        p.orbitAngle += p.orbitSpeed + bass * 0.01;
        const dist = Math.sqrt(Math.pow(p.x - cx, 2) + Math.pow(p.y - cy, 2));
        p.x = cx + Math.cos(p.orbitAngle) * (dist + Math.sin(p.orbitAngle) * 5);
        p.y = cy + Math.sin(p.orbitAngle) * (dist + Math.cos(p.orbitAngle) * 5);
      } else {
        p.x += p.vx * (1 + bass * 1.5);
        p.y += p.vy * (1 + bass * 1.5);

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      // Mouse Force Field
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      if (distToMouse < this.mouse.radius) {
        const force = (1 - distToMouse / this.mouse.radius) * 1.5;
        p.x -= (dx / distToMouse) * force * 3;
        p.y -= (dy / distToMouse) * force * 3;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.getParticleColor(p, bass, treble);
      ctx.fill();

      // Constellation Lines
      for (let j = idx + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const pdx = p.x - p2.x;
        const pdy = p.y - p2.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        const maxDist = 110 + bass * 60;

        if (pdist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          const lineAlpha = (1 - pdist / maxDist) * 0.25 * (1 + bass);
          ctx.strokeStyle = `rgba(${this.getThemePrimaryRGB()}, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    });

    // Central Glowing Orb
    ctx.beginPath();
    ctx.arc(cx, cy, 30 + bass * 50, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 60 + bass * 70);
    grad.addColorStop(0, `rgba(${this.getThemePrimaryRGB()}, ${0.8 + bass * 0.2})`);
    grad.addColorStop(0.5, `rgba(${this.getThemeSecondaryRGB()}, ${0.3 + mid * 0.4})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // 3D Hyperspace Tunnel Render Mode
  render3DTunnel(freqData, bass, treble) {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const fov = 350;

    this.cameraZ += 8 + bass * 25; // Speed warp

    // Draw 3D Tunnel Geometric Concentric Rings
    this.tunnelRings.forEach((ring, idx) => {
      let z = (ring.z - this.cameraZ) % 1000;
      if (z < 1) z += 1000;

      const scale = fov / z;
      const radius = (200 + bass * 180) * scale;
      ring.rotation += 0.005 + bass * 0.02;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.rotation);

      ctx.beginPath();
      const sides = ring.sides;
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const alpha = Math.min(1, Math.max(0, 1 - z / 1000));
      ctx.strokeStyle = idx % 2 === 0 ? `rgba(6, 182, 212, ${alpha})` : `rgba(236, 72, 153, ${alpha})`;
      ctx.lineWidth = Math.max(1, scale * 3);
      ctx.stroke();
      ctx.restore();
    });

    // Draw 3D Warp Starfield Particles
    this.particles.forEach((p) => {
      let pz = (p.z - this.cameraZ) % 1000;
      if (pz < 1) pz += 1000;

      const scale = fov / pz;
      const px = (p.x - cx) * scale + cx;
      const py = (p.y - cy) * scale + cy;

      const size = Math.max(1, p.baseRadius * scale * (1 + bass));
      const alpha = Math.min(1, Math.max(0, 1 - pz / 1000));

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
      ctx.fill();
    });
  }

  drawSpectrumBars(freqData, bass) {
    if (!freqData || freqData.length === 0) return;
    const ctx = this.ctx;
    const bars = 64;
    const barWidth = this.width / bars;

    for (let i = 0; i < bars; i++) {
      const val = freqData[i * 2] || 0;
      const height = (val / 255) * (this.height * 0.35);

      const x = i * barWidth;
      const y = this.height - height;

      const grad = ctx.createLinearGradient(x, this.height, x, y);
      grad.addColorStop(0, `rgba(${this.getThemePrimaryRGB()}, 0.05)`);
      grad.addColorStop(1, `rgba(${this.getThemeSecondaryRGB()}, 0.6)`);

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth - 2, height);
    }
  }

  render3DCyberGrid(freqData = [], bass = 0, treble = 0) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const horizonY = h * 0.55;

    // Dark Synthwave Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0a0518');
    skyGrad.addColorStop(1, '#2d083b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Glowing Outrun Sun
    const sunRadius = 65 + bass * 25;
    const sunX = w / 2;
    const sunY = horizonY - 15;

    const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, sunRadius);
    sunGrad.addColorStop(0, '#ffff00');
    sunGrad.addColorStop(0.5, '#ff007f');
    sunGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Vector Sun Scanlines
    for (let y = sunY - sunRadius; y < sunY + sunRadius; y += 7) {
      if (y > sunY - sunRadius * 0.2) {
        ctx.fillStyle = '#2d083b';
        ctx.fillRect(sunX - sunRadius, y, sunRadius * 2, 2.5);
      }
    }

    // Audio-Reactive Synth Mountain Range
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    const mountainSegments = 40;
    const segWidth = w / mountainSegments;
    for (let i = 0; i <= mountainSegments; i++) {
      const freqVal = freqData[i * 3] || 0;
      const height = (freqVal / 255) * 80 + Math.sin(i * 0.4) * 35;
      const x = i * segWidth;
      const y = horizonY - Math.max(10, height);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, horizonY);
    ctx.closePath();
    ctx.fillStyle = '#170624';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ground Plane Dark Gradient
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, '#0d021a');
    groundGrad.addColorStop(1, '#1b002c');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Moving 3D Grid Perspective
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + bass * 0.4})`;
    ctx.lineWidth = 1.2;

    // Perspective Lines converging to sun center
    const numLines = 24;
    for (let i = -numLines / 2; i <= numLines / 2; i++) {
      const startX = w / 2 + i * (w / numLines) * 2.5;
      ctx.beginPath();
      ctx.moveTo(w / 2, horizonY);
      ctx.lineTo(startX, h);
      ctx.stroke();
    }

    // Horizontal Perspective Lines moving towards camera
    this.cameraZ = (this.cameraZ + 2.5 + bass * 4) % 40;
    for (let z = this.cameraZ; z < h - horizonY; z += 24) {
      const pY = horizonY + Math.pow(z / (h - horizonY), 1.8) * (h - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, pY);
      ctx.lineTo(w, pY);
      ctx.strokeStyle = `rgba(255, 0, 128, ${Math.min(1, (z / (h - horizonY)) * 0.9)})`;
      ctx.stroke();
    }
  }

  renderLaserMatrix(freqData = [], bass = 0, treble = 0) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // Dark Laser Space Background
    ctx.fillStyle = `rgba(5, 0, 16, ${0.3 - bass * 0.1})`;
    ctx.fillRect(0, 0, w, h);

    // Rotating RGB Laser Beams
    const numLasers = 16;
    const time = Date.now() * 0.0015;
    for (let i = 0; i < numLasers; i++) {
      const angle = (i * Math.PI * 2) / numLasers + time * (i % 2 === 0 ? 1 : -1);
      const endX = cx + Math.cos(angle) * (w * 0.8);
      const endY = cy + Math.sin(angle) * (h * 0.8);

      const grad = ctx.createLinearGradient(cx, cy, endX, endY);
      const color = i % 3 === 0 ? '#ff0080' : i % 3 === 1 ? '#00f0ff' : '#a855f7';
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 + bass * 4;
      ctx.stroke();
    }

    // Radial Spectrum Waves
    const numRings = 8;
    for (let r = 0; r < numRings; r++) {
      const freqVal = freqData[r * 4] || 0;
      const radius = (r + 1) * 35 + (freqVal / 255) * 60;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 - r * 0.04})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Supernova Bass Drop Explosion Center
    const centerRadius = 20 + bass * 50;
    ctx.beginPath();
    ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 0, 128, ${0.6 + bass * 0.4})`;
    ctx.fill();
  }

  renderPlasmaVortex(freqData = [], bass = 0, treble = 0) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // Dark Hypnotic Background
    ctx.fillStyle = `rgba(8, 2, 18, ${0.25 - bass * 0.1})`;
    ctx.fillRect(0, 0, w, h);

    // Swirling HSL Plasma Spirals
    const time = Date.now() * 0.001;
    const spirals = 12;
    for (let s = 0; s < spirals; s++) {
      const angle = (s * Math.PI * 2) / spirals + time * 0.8;
      const hue = (s * 30 + time * 50) % 360;

      ctx.beginPath();
      for (let r = 10; r < Math.max(w, h) * 0.6; r += 12) {
        const spiralAngle = angle + (r * 0.008);
        const freqVal = freqData[(r + s * 4) % (freqData.length || 1)] || 0;
        const radiusOffset = (freqVal / 255) * 30 * (1 + bass);
        const x = cx + Math.cos(spiralAngle) * (r + radiusOffset);
        const y = cy + Math.sin(spiralAngle) * (r + radiusOffset);

        if (r === 10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.5 + bass * 0.4})`;
      ctx.lineWidth = 2.5 + treble * 4;
      ctx.stroke();
    }

    // Expanding Bass Shockwaves
    const waveRadius = (time * 150) % (w * 0.5) + bass * 40;
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 1 - waveRadius / (w * 0.5))})`;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  renderBlackHole(freqData = [], bass = 0, treble = 0) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // Dark Gravity Void
    ctx.fillStyle = 'rgba(2, 2, 8, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Event Horizon Accretion Disk Ring
    const horizonRadius = 70 + bass * 40;
    const diskGrad = ctx.createRadialGradient(cx, cy, horizonRadius * 0.5, cx, cy, horizonRadius * 1.8);
    diskGrad.addColorStop(0, '#000');
    diskGrad.addColorStop(0.5, '#ec4899');
    diskGrad.addColorStop(0.8, '#8b5cf6');
    diskGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(cx, cy, horizonRadius * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = diskGrad;
    ctx.fill();

    // Swirling Stardust pulled into Black Hole
    this.particles.forEach((p) => {
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) + (0.05 + bass * 0.03);

      const targetDist = Math.max(horizonRadius * 0.6, dist - (1.5 + bass * 3));
      p.x = cx - Math.cos(angle) * targetDist;
      p.y = cy - Math.sin(angle) * targetDist;

      if (dist < horizonRadius * 0.7) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.baseRadius * (dist / (w * 0.5))), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${Math.min(1, dist / (w * 0.4))})`;
      ctx.fill();
    });

    // Singularity Core (Pitch Black Center)
    ctx.beginPath();
    ctx.arc(cx, cy, horizonRadius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.strokeStyle = `rgba(236, 72, 153, ${0.7 + bass * 0.3})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  getBackgroundFill(bass) {
    const alpha = 0.25 - bass * 0.1;
    switch (this.theme) {
      case 'blackHole': return `rgba(2, 2, 8, ${alpha})`;
      case 'plasmaVortex': return `rgba(8, 2, 18, ${alpha})`;
      case 'laserMatrix': return `rgba(5, 0, 16, ${alpha})`;
      case 'cyberGrid': return '#0a0518';
      case 'pumpHyperSpace': return `rgba(${Math.floor(25 + bass * 40)}, 4, 38, ${alpha})`;
      case 'tunnel': return `rgba(5, 5, 16, ${alpha})`;
      case 'cyberpunk': return `rgba(10, 8, 26, ${alpha})`;
      case 'zen': return `rgba(6, 20, 24, ${alpha})`;
      case 'solar': return `rgba(24, 10, 6, ${alpha})`;
      case 'matrix': return `rgba(4, 18, 10, ${alpha})`;
      default: return `rgba(7, 9, 19, ${alpha})`;
    }
  }

  getThemePrimaryRGB() {
    switch (this.theme) {
      case 'blackHole': return '236, 72, 153';
      case 'plasmaVortex': return '168, 85, 247';
      case 'laserMatrix': return '255, 0, 128';
      case 'cyberGrid': return '0, 240, 255';
      case 'pumpHyperSpace': return '255, 0, 128';
      case 'tunnel': return '6, 182, 212';
      case 'cyberpunk': return '236, 72, 153';
      case 'zen': return '16, 185, 129';
      case 'solar': return '245, 158, 11';
      case 'matrix': return '34, 197, 94';
      default: return '139, 92, 246';
    }
  }

  getThemeSecondaryRGB() {
    switch (this.theme) {
      case 'blackHole': return '0, 240, 255';
      case 'plasmaVortex': return '0, 240, 255';
      case 'laserMatrix': return '0, 240, 255';
      case 'cyberGrid': return '255, 0, 128';
      case 'pumpHyperSpace': return '0, 240, 255';
      case 'tunnel': return '236, 72, 153';
      case 'cyberpunk': return '6, 182, 212';
      case 'zen': return '6, 182, 212';
      case 'solar': return '239, 68, 68';
      case 'matrix': return '16, 185, 129';
      default: return '6, 182, 212';
    }
  }

  getParticleColor(p, bass, treble) {
    const primaryRGB = this.getThemePrimaryRGB();
    const alpha = Math.min(1, p.alpha + bass * 0.4);
    return `rgba(${primaryRGB}, ${alpha})`;
  }
}
