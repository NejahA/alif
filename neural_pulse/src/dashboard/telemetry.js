/**
 * NEURAL-PULSE // TELEMETRY & PERFORMANCE MONITOR
 * Real-time dynamic canvas chart plotting FPS, APM, and Audio Amplitude.
 */

export class TelemetryMonitor {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.maxPoints = 60;
    this.fpsHistory = new Array(this.maxPoints).fill(60);
    this.apmHistory = new Array(this.maxPoints).fill(0);
    this.audioHistory = new Array(this.maxPoints).fill(10);

    this.actionCount = 0;
    this.lastApmCheck = performance.now();
    this.currentApm = 0;

    this.frameCount = 0;
    this.lastFpsCheck = performance.now();
    this.currentFps = 60;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('keydown', () => this.recordAction());
    window.addEventListener('mousedown', () => this.recordAction());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  recordAction() {
    this.actionCount++;
  }

  update(audioAmplitude = 0) {
    const now = performance.now();

    // 1. Calculate FPS
    this.frameCount++;
    if (now - this.lastFpsCheck >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsCheck));
      this.frameCount = 0;
      this.lastFpsCheck = now;
      this.fpsHistory.push(this.currentFps);
      if (this.fpsHistory.length > this.maxPoints) this.fpsHistory.shift();
    }

    // 2. Calculate APM
    if (now - this.lastApmCheck >= 1000) {
      this.currentApm = Math.round(this.actionCount * 60);
      this.actionCount = 0;
      this.lastApmCheck = now;
      this.apmHistory.push(Math.min(300, this.currentApm));
      if (this.apmHistory.length > this.maxPoints) this.apmHistory.shift();
    }

    // 3. Audio Amplitude
    this.audioHistory.push(Math.min(100, audioAmplitude));
    if (this.audioHistory.length > this.maxPoints) this.audioHistory.shift();

    this.render();
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Plot Curves
    this.plotCurve(ctx, this.fpsHistory, '#00f0ff', 0, 120, w, h);
    this.plotCurve(ctx, this.apmHistory, '#ff007f', 0, 300, w, h);
    this.plotCurve(ctx, this.audioHistory, '#ffd600', 0, 100, w, h);

    // Chart Legends
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('● FPS: ' + this.currentFps, 14, 20);

    ctx.fillStyle = '#ff007f';
    ctx.fillText('● APM: ' + this.currentApm, 90, 20);

    ctx.fillStyle = '#ffd600';
    ctx.fillText('● AUDIO AMP', 165, 20);
  }

  plotCurve(ctx, data, color, minVal, maxVal, w, h) {
    if (data.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;

    ctx.beginPath();
    const step = w / (this.maxPoints - 1);

    for (let i = 0; i < data.length; i++) {
      const norm = (data[i] - minVal) / (maxVal - minVal);
      const y = h - norm * (h - 28) - 10;
      const x = i * step;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
