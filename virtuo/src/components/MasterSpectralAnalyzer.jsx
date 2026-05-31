import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Activity, Maximize2, Minimize2 } from 'lucide-react';
import masterBus from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function MasterSpectralAnalyzer() {
  const isAudioReady = useAudioSafe();
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isAudioReady) return;

    // Create high-res FFT analyser
    analyserRef.current = new Tone.Analyser('fft', 2048);
    // Connect master bus to analyser without breaking the chain
    masterBus.connect(analyserRef.current);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!analyserRef.current) return;
      const width = canvas.width;
      const height = canvas.height;
      const values = analyserRef.current.getValue();

      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 10; i++) {
        const x = (i / 10) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw frequency spectrum
      const barWidth = width / (values.length / 2); // Only show up to Nyquist/2 for clarity
      
      // Gradient for the bars
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(138, 43, 226, 0.2)');
      gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');

      ctx.fillStyle = gradient;
      
      for (let i = 0; i < values.length / 2; i++) {
        // Logarithmic scaling for frequency representation (more detail in lows)
        const logIndex = Math.pow(i / (values.length / 2), 0.5) * (values.length / 2);
        const val = values[Math.floor(logIndex)];
        
        // Convert dB to height (assuming range -100 to 0)
        const barHeight = Math.max(0, (val + 100) * (height / 100));
        
        const x = (i / (values.length / 2)) * width;
        const y = height - barHeight;

        ctx.fillRect(x, y, barWidth + 1, barHeight);
      }

      // Peak line
      ctx.beginPath();
      ctx.strokeStyle = 'var(--accent-primary)';
      ctx.lineWidth = 2;
      for (let i = 0; i < values.length / 2; i++) {
        const logIndex = Math.pow(i / (values.length / 2), 0.5) * (values.length / 2);
        const val = values[Math.floor(logIndex)];
        const barHeight = Math.max(0, (val + 100) * (height / 100));
        const x = (i / (values.length / 2)) * width;
        const y = height - barHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      analyserRef.current?.dispose();
    };
  }, []);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '15px', 
        width: isExpanded ? '100%' : '400px',
        height: isExpanded ? '400px' : '150px',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>MASTER SPECTRUM</span>
        </div>
        <button 
          className="btn-glass" 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ padding: '4px' }}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.5 }}>
        <span>20Hz</span>
        <span>100Hz</span>
        <span>1kHz</span>
        <span>5kHz</span>
        <span>20kHz</span>
      </div>
    </div>
  );
}
