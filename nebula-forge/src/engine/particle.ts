export interface Vector2 {
  x: number;
  y: number;
}

export type ColorPalette = 'cosmic' | 'aurora' | 'sunset' | 'ocean' | 'void';

const PALETTES: Record<ColorPalette, string[][]> = {
  cosmic: [
    ['#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'],
    ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
    ['#db2777', '#ec4899', '#f472b6', '#f9a8d4'],
  ],
  aurora: [
    ['#059669', '#10b981', '#34d399', '#6ee7b7'],
    ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'],
    ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'],
  ],
  sunset: [
    ['#ea580c', '#f97316', '#fb923c', '#fdba74'],
    ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
    ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
  ],
  ocean: [
    ['#0c4a6e', '#0369a1', '#0284c7', '#38bdf8'],
    ['#064e3b', '#047857', '#059669', '#34d399'],
    ['#1e3a5f', '#1e40af', '#2563eb', '#60a5fa'],
  ],
  void: [
    ['#1f2937', '#374151', '#4b5563', '#6b7280'],
    ['#111827', '#1f2937', '#374151', '#4b5563'],
    ['#0f172a', '#1e293b', '#334155', '#475569'],
  ],
};

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
  color: string;
  targetColor: string;
  colorProgress: number;
  trail: Vector2[];
  maxTrail: number;
  orbiting: { cx: number; cy: number; speed: number; angle: number } | null;

  constructor(
    x: number,
    y: number,
    palette: ColorPalette,
    paletteGroup: number
  ) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.life = 1;
    this.maxLife = 200 + Math.random() * 300;
    this.size = 1 + Math.random() * 3;
    this.alpha = 0;
    this.colorProgress = Math.random();
    this.trail = [];
    this.maxTrail = 8 + Math.floor(Math.random() * 12);
    this.orbiting = null;

    const colors = PALETTES[palette][paletteGroup % PALETTES[palette].length];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.targetColor = colors[Math.floor(Math.random() * colors.length)];
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    this.life++;

    // Fade in / out
    if (this.life < 30) {
      this.alpha = this.life / 30;
    } else if (this.life > this.maxLife - 30) {
      this.alpha = (this.maxLife - this.life) / 30;
    }

    // Smooth color transition
    this.colorProgress += 0.005;
    if (this.colorProgress >= 1) {
      this.colorProgress = 0;
      this.color = this.targetColor;
      const group = Math.floor(Math.random() * 3);
      const palette = this.getRandomPalette();
      const colors = PALETTES[palette][group];
      this.targetColor = colors[Math.floor(Math.random() * colors.length)];
    }

    // Orbiting behavior or free movement
    if (this.orbiting) {
      this.orbiting.angle += this.orbiting.speed;
      const dist = Math.sqrt(
        (this.x - this.orbiting.cx) ** 2 +
          (this.y - this.orbiting.cy) ** 2
      );
      const targetX =
        this.orbiting.cx + Math.cos(this.orbiting.angle) * dist;
      const targetY =
        this.orbiting.cy + Math.sin(this.orbiting.angle) * dist;
      this.vx += (targetX - this.x) * 0.02;
      this.vy += (targetY - this.y) * 0.02;
    } else {
      // Mouse gravity
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        this.vx -= (dx / dist) * 0.05;
        this.vy -= (dy / dist) * 0.05;
      }
    }

    // Damping
    this.vx *= 0.99;
    this.vy *= 0.99;

    this.x += this.vx;
    this.y += this.vy;

    // Trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    // Wrap around edges
    if (this.x < -50) this.x = width + 50;
    if (this.x > width + 50) this.x = -50;
    if (this.y < -50) this.y = height + 50;
    if (this.y > height + 50) this.y = -50;
  }

  private getRandomPalette(): ColorPalette {
    const palettes: ColorPalette[] = [
      'cosmic',
      'aurora',
      'sunset',
      'ocean',
      'void',
    ];
    return palettes[Math.floor(Math.random() * palettes.length)];
  }

  isDead(): boolean {
    return this.life > this.maxLife;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;

    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const trailAlpha = (i / this.trail.length) * this.alpha * 0.3;
      const trailSize =
        (i / this.trail.length) * this.size * 0.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, trailSize, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = trailAlpha;
      ctx.fill();
    }

    // Draw glow
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size * 8
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 8, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = this.alpha * 0.15;
    ctx.fill();

    // Draw particle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}