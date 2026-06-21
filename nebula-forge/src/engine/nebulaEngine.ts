import { Particle, ColorPalette } from './particle';

export interface EngineConfig {
  particleCount: number;
  spawnRate: number;
  palette: ColorPalette;
  mouseInfluence: number;
  speed: number;
  sizeMultiplier: number;
}

export const DEFAULT_CONFIG: EngineConfig = {
  particleCount: 400,
  spawnRate: 3,
  palette: 'cosmic',
  mouseInfluence: 50,
  speed: 1,
  sizeMultiplier: 1,
};

export class NebulaEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private mouseX = -1000;
  private mouseY = -1000;
  private mouseInside = false;
  private config: EngineConfig;
  private frameCount = 0;

  constructor(canvas: HTMLCanvasElement, config?: Partial<EngineConfig>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupCanvas();
    this.initParticles();
    this.setupEventListeners();
  }

  private setupCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  private initParticles() {
    for (let i = 0; i < this.config.particleCount; i++) {
      this.spawnParticle(true);
    }
  }

  private spawnParticle(randomizePosition = false) {
    const x = randomizePosition
      ? Math.random() * this.canvas.width
      : Math.random() * this.canvas.width;
    const y = randomizePosition
      ? Math.random() * this.canvas.height
      : Math.random() * this.canvas.height;
    const group = Math.floor(Math.random() * 3);
    const particle = new Particle(x, y, this.config.palette, group);
    particle.maxLife = 200 + Math.random() * 400;
    particle.size *= this.config.sizeMultiplier;
    particle.vx *= this.config.speed;
    particle.vy *= this.config.speed;

    // Some particles orbit
    if (Math.random() < 0.2) {
      particle.orbiting = {
        cx: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        cy: this.canvas.height / 2 + (Math.random() - 0.5) * 200,
        speed: (Math.random() - 0.5) * 0.02,
        angle: Math.random() * Math.PI * 2,
      };
    }

    this.particles.push(particle);
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.mouseInside = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseInside = false;
      this.mouseX = -1000;
      this.mouseY = -1000;
    });

    this.canvas.addEventListener('click', (e) => {
      // Create burst on click
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      this.createBurst(cx, cy, 30);
    });

    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
  }

  createBurst(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const group = Math.floor(Math.random() * 3);
      const particle = new Particle(x, y, this.config.palette, group);
      particle.size *= this.config.sizeMultiplier;
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 4;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.maxLife = 100 + Math.random() * 100;
      particle.size = 1 + Math.random() * 2;
      this.particles.push(particle);
    }
  }

  updateConfig(config: Partial<EngineConfig>) {
    this.config = { ...this.config, ...config };
  }

  start() {
    const loop = () => {
      this.frameCount++;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw background
      this.ctx.fillStyle = '#0a0a1a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Spawn new particles
      if (this.particles.length < this.config.particleCount * 1.5) {
        for (let i = 0; i < this.config.spawnRate; i++) {
          if (Math.random() < 0.3) {
            this.spawnParticle(false);
          }
        }
      }

      // Update and draw particles
      const mouseX = this.mouseInside
        ? this.mouseX
        : -1000;
      const mouseY = this.mouseInside
        ? this.mouseY
        : -1000;

      // Draw connection lines between nearby particles
      this.drawConnections();

      // Update and draw particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update(
          this.canvas.width,
          this.canvas.height,
          mouseX,
          mouseY
        );
        p.draw(this.ctx);

        if (p.isDead()) {
          this.particles.splice(i, 1);
        }
      }

      this.animationId = requestAnimationFrame(loop);
    };

    loop();
  }

  private drawConnections() {
    const connectionDistance = 80;
    for (let i = 0; i < this.particles.length; i += 3) {
      for (let j = i + 1; j < this.particles.length; j += 3) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = this.particles[i].color;
          this.ctx.globalAlpha = alpha;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }
    }
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  destroy() {
    this.stop();
    this.particles = [];
  }
}