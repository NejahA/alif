import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { BarChart3, Waves, CircleDot, Sparkles } from 'lucide-react';

export default function AudioVisualizer() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const fftRef = useRef(null);
  const requestRef = useRef(null);
  const [mode, setMode] = useState('waveform'); // 'waveform' | 'bars' | 'circle' | 'particles'
  const particlesRef = useRef([]);

  useEffect(() => {
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

      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#8a2be2';
      ctx.strokeStyle = accentColor;
      ctx.fillStyle = accentColor;
      ctx.lineWidth = 3;

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
          const val = Math.max(0, values[i] + 100) * (height / 80);
          ctx.fillRect(i * barWidth, height - val, barWidth - 2, val);
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
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestRef.current);
      analyser.dispose();
      fft.dispose();
    };
  }, [mode]);

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
      </div>
      <canvas ref={canvasRef} width={800} height={100} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
