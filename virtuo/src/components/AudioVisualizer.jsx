import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { BarChart3, Waves, CircleDot, Sparkles, Activity, LayoutGrid, BarChart, Orbit, ScrollText } from 'lucide-react';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function AudioVisualizer() {
  const isAudioReady = useAudioSafe();
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const fftRef = useRef(null);
  const requestRef = useRef(null);
  const [mode, setMode] = useState('waveform'); // 'waveform' | 'bars' | 'circle' | 'particles' | 'oscilloscope' | 'matrix' | '3dbars' | 'galaxy' | 'spectrogram'
  const particlesRef = useRef([]);
  const [virtueInfo, setVirtueInfo] = useState({ dominant: 'innovation', level: 0, color: '#8a2be2' });

  useEffect(() => {
    const updateVirtueData = () => {
      const saved = localStorage.getItem('virtuo_virtues');
      if (saved) {
        const virtues = JSON.parse(saved);
        const virtueColors = {
          harmony: '#3b82f6',
          rhythm: '#ef4444',
          timbre: '#f59e0b',
          expression: '#ec4899',
          innovation: '#8b5cf6',
          theory: '#10b981'
        };
        
        let maxXP = -1;
        let dominant = 'innovation';
        Object.entries(virtues).forEach(([v, data]) => {
          if (data.xp > maxXP) {
            maxXP = data.xp;
            dominant = v;
          }
        });

        setVirtueInfo({
          dominant,
          level: Math.floor(Math.sqrt(maxXP / 100)),
          color: virtueColors[dominant]
        });
      }
    };

    updateVirtueData();
    window.addEventListener('virtuo-gain-xp', updateVirtueData);
    return () => window.removeEventListener('virtuo-gain-xp', updateVirtueData);
  }, []);

  useEffect(() => {
    if (!isAudioReady) return;

    // Initialize particles
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2
    }));

    // Create Analyser nodes
    const analyser = new Tone.Analyser('waveform', 256);
    const fft = new Tone.Analyser('fft', 64);
    Tone.Destination.connect(analyser);
    Tone.Destination.connect(fft);
    analyserRef.current = analyser;
    fftRef.current = fft;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const accentColor = virtueInfo.color || getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#8a2be2';
      ctx.strokeStyle = accentColor;
      ctx.fillStyle = accentColor;
      ctx.lineWidth = 3 + (virtueInfo.level * 0.5);

      // Add virtue bloom effect
      if (virtueInfo.level >= 5) {
        ctx.shadowBlur = 10 + virtueInfo.level;
        ctx.shadowColor = accentColor;
      }

      if (mode === 'waveform' && analyserRef.current) {
        const values = analyserRef.current.getValue();
        ctx.beginPath();
        for (let i = 0; i < values.length; i++) {
          const x = (width * i) / values.length;
          const y = ((values[i] + 1) / 2) * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (mode === 'bars' && fftRef.current) {
        const values = fftRef.current.getValue();
        const barWidth = width / values.length;
        for (let i = 0; i < values.length; i++) {
          const barHeight = ((values[i] + 100) / 100) * height;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
      } else if (mode === 'circle' && fftRef.current) {
        const values = fftRef.current.getValue();
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = height / 4;
        ctx.beginPath();
        for (let i = 0; i < values.length; i++) {
          const val = Math.max(0, values[i] + 100) * 0.5;
          const angle = (i / values.length) * Math.PI * 2;
          const r = radius + val;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (mode === 'particles' && fftRef.current) {
        const values = fftRef.current.getValue();
        const energy = values.reduce((acc, v) => acc + Math.max(0, v + 100), 0) / values.length;
        
        particlesRef.current.forEach(p => {
          p.x += p.speedX * (energy / 20 + 1);
          p.y += p.speedY * (energy / 20 + 1);
          
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (energy / 30 + 0.5), 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (mode === 'oscilloscope' && analyserRef.current) {
        const values = analyserRef.current.getValue();
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Find a zero-crossing for stability (trigger simulation)
        let trigger = 0;
        for (let i = 0; i < values.length / 2; i++) {
          if (values[i] < 0 && values[i+1] > 0) {
            trigger = i;
            break;
          }
        }

        const step = width / (values.length / 2);
        for (let i = 0; i < values.length / 2; i++) {
          const val = values[trigger + i] || 0;
          const x = i * step;
          const y = height / 2 + (val * height * 0.8);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Add scanline effect
        ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
        for (let i = 0; i < height; i += 4) {
          ctx.fillRect(0, i, width, 1);
        }
      } else if (mode === 'matrix' && fftRef.current) {
        const values = fftRef.current.getValue();
        const rows = 10;
        const cols = values.length;
        const cellW = width / cols;
        const cellH = height / rows;
        
        for (let i = 0; i < cols; i++) {
          const val = Math.max(0, values[i] + 100) / 100;
          const activeRows = Math.floor(val * rows);
          for (let j = 0; j < rows; j++) {
            if (j < activeRows) {
              ctx.fillStyle = accentColor;
              ctx.globalAlpha = (j + 1) / rows;
            } else {
              ctx.fillStyle = 'rgba(255,255,255,0.05)';
              ctx.globalAlpha = 1;
            }
            ctx.fillRect(i * cellW + 1, (rows - 1 - j) * cellH + 1, cellW - 2, cellH - 2);
          }
        }
        ctx.globalAlpha = 1;
      } else if (mode === '3dbars' && fftRef.current) {
        const values = fftRef.current.getValue();
        const barWidth = width / values.length;
        for (let i = 0; i < values.length; i++) {
          const val = Math.max(0, values[i] + 100) * (height / 80);
          
          // Draw "3D" side
          ctx.fillStyle = `${accentColor}44`;
          ctx.beginPath();
          ctx.moveTo(i * barWidth, height - val);
          ctx.lineTo(i * barWidth + 5, height - val - 5);
          ctx.lineTo(i * barWidth + barWidth + 3, height - val - 5);
          ctx.lineTo(i * barWidth + barWidth - 2, height - val);
          ctx.fill();
          
          // Main bar
          ctx.fillStyle = accentColor;
          ctx.fillRect(i * barWidth, height - val, barWidth - 2, val);
        }
      } else if (mode === 'galaxy' && fftRef.current) {
        const values = fftRef.current.getValue();
        const centerX = width / 2;
        const centerY = height / 2;
        const energy = values.reduce((acc, v) => acc + Math.max(0, v + 100), 0) / values.length;
        
        // Dynamic number of stars based on energy
        const starCount = Math.floor(energy / 2);
        for (let i = 0; i < starCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (width / 2) * (energy / 50);
          const x = centerX + Math.cos(angle) * dist;
          const y = centerY + Math.sin(angle) * dist;
          const size = Math.random() * 2;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Central "black hole" core
        const coreSize = 10 + (energy / 10);
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize * 2);
        grad.addColorStop(0, accentColor);
        grad.addColorStop(0.5, `${accentColor}44`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Spiral arms
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          for (let i = 0; i < values.length; i++) {
            const val = Math.max(0, values[i] + 100) * 0.5;
            const angle = (i / values.length) * Math.PI * 4 + (Date.now() / 1000) + (j * Math.PI * 0.6);
            const r = (i * 2) + val;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (mode === 'spectrogram' && fftRef.current) {
        const values = fftRef.current.getValue();
        const imgData = ctx.getImageData(1, 0, width - 1, height);
        ctx.putImageData(imgData, 0, 0);
        
        for (let i = 0; i < values.length; i++) {
          const val = Math.max(0, values[i] + 100);
          const hue = (val / 100) * 360;
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${val / 100})`;
          const y = height - (i * (height / values.length));
          const h = height / values.length;
          ctx.fillRect(width - 1, y, 1, h);
        }
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestRef.current);
      analyserRef.current?.dispose();
      fftRef.current?.dispose();
    };
  }, [isAudioReady, mode, virtueInfo]);

  return (
    <div style={{
      width: '100%',
      height: '100px',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '8px',
      border: '1px solid var(--glass-border)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        display: 'flex', 
        gap: '5px',
        zIndex: 5
      }}>
        <button onClick={() => setMode('waveform')} className={`btn-glass ${mode === 'waveform' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <Waves size={14} />
        </button>
        <button onClick={() => setMode('bars')} className={`btn-glass ${mode === 'bars' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <BarChart3 size={14} />
        </button>
        <button onClick={() => setMode('circle')} className={`btn-glass ${mode === 'circle' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <CircleDot size={14} />
        </button>
        <button onClick={() => setMode('particles')} className={`btn-glass ${mode === 'particles' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <Sparkles size={14} />
        </button>
        <button onClick={() => setMode('oscilloscope')} className={`btn-glass ${mode === 'oscilloscope' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <Activity size={14} />
        </button>
        <button onClick={() => setMode('matrix')} className={`btn-glass ${mode === 'matrix' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <LayoutGrid size={14} />
        </button>
        <button onClick={() => setMode('3dbars')} className={`btn-glass ${mode === '3dbars' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <BarChart size={14} />
        </button>
        <button onClick={() => setMode('galaxy')} className={`btn-glass ${mode === 'galaxy' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <Orbit size={14} />
        </button>
        <button onClick={() => setMode('spectrogram')} className={`btn-glass ${mode === 'spectrogram' ? 'active' : ''}`} style={{ padding: '4px' }}>
          <ScrollText size={14} />
        </button>
      </div>
      <canvas ref={canvasRef} width={800} height={100} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
