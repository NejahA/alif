/**
 * NEURAL-PULSE // REAL-TIME FFT AUDIO VISUALIZER
 * Multi-mode Canvas renderer (Oscilloscope, FFT Frequency Bars, and Circular Cyber Hologram).
 */

export class AudioVisualizer {
  constructor(canvasId, synthEngine) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.synth = synthEngine;
    this.mode = 'wave'; // 'wave', 'bars', 'circular'

    this.dataTimeArray = null;
    this.dataFreqArray = null;
    this.bufferLength = 0;
    this.animId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  setMode(newMode) {
    this.mode = newMode;
  }

  start() {
    if (this.animId) return;
    const render = () => {
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    render();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear with dark trail fade
    this.ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
    this.ctx.fillRect(0, 0, w, h);

    if (!this.synth.analyser) {
      // Idle grid line when sound is uninitialized
      this.drawIdleGrid(w, h);
      return;
    }

    if (!this.dataTimeArray) {
      this.bufferLength = this.synth.analyser.frequencyBinCount;
      this.dataTimeArray = new Uint8Array(this.bufferLength);
      this.dataFreqArray = new Uint8Array(this.bufferLength);
    }

    this.synth.analyser.getByteTimeDomainData(this.dataTimeArray);
    this.synth.analyser.getByteFrequencyData(this.dataFreqArray);

    switch (this.mode) {
      case 'bars':
        this.drawFftBars(w, h);
        break;
      case 'circular':
        this.drawCircular(w, h);
        break;
      case 'wave':
      default:
        this.drawWaveform(w, h);
        break;
    }
  }

  drawIdleGrid(w, h) {
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    this.ctx.font = '10px "JetBrains Mono", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('[STANDBY // CLICK KEYS OR ARENA TO INITIALIZE AUDIO ENGINE]', w / 2, h / 2 - 8);
  }

  drawWaveform(w, h) {
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';

    this.ctx.beginPath();
    const sliceWidth = w / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataTimeArray[i] / 128.0;
      const y = (v * h) / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  drawFftBars(w, h) {
    const barsCount = 64;
    const barWidth = (w / barsCount) - 2;
    const step = Math.floor(this.bufferLength / barsCount);

    for (let i = 0; i < barsCount; i++) {
      const val = this.dataFreqArray[i * step] / 255.0;
      const barHeight = val * (h - 16);
      const x = i * (barWidth + 2);
      const y = h - barHeight - 4;

      // Dynamic color gradient based on frequency
      const gradient = this.ctx.createLinearGradient(0, y, 0, h);
      gradient.addColorStop(0, '#ff007f');
      gradient.addColorStop(0.5, '#9d4edd');
      gradient.addColorStop(1, '#00f0ff');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, barHeight);

      // Top glowing cap
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(x, y - 2, barWidth, 2);
    }
  }

  drawCircular(w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.28;

    // Outer cyber ring
    this.ctx.strokeStyle = 'rgba(157, 78, 221, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, baseRadius * 1.35, 0, Math.PI * 2);
    this.ctx.stroke();

    // Radial waveform
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.shadowBlur = 14;
    this.ctx.shadowColor = 'rgba(0, 240, 255, 0.7)';

    this.ctx.beginPath();
    const step = Math.floor(this.bufferLength / 128);
    for (let i = 0; i < 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const v = (this.dataTimeArray[i * step] - 128) / 128.0;
      const r = baseRadius + v * 35;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Center Core
    this.ctx.fillStyle = '#ff007f';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
