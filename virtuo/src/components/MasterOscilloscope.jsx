import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Activity, Maximize2, Minimize2, Settings2 } from 'lucide-react';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function MasterOscilloscope() {
  const isAudioReady = useAudioSafe();
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);

  useEffect(() => {
    if (!isAudioReady) return;

    // Create waveform analyser
    analyserRef.current = new Tone.Analyser('waveform', 1024);
    // Connect to the master channel
    Tone.getDestination().connect(analyserRef.current);

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
      
      // Horizontal center line
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Vertical lines
      for (let i = 1; i < 4; i++) {
        const x = (i / 4) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Waveform
      ctx.beginPath();
      ctx.strokeStyle = 'var(--accent-primary)';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';

      const sliceWidth = width / values.length;
      let x = 0;

      for (let i = 0; i < values.length; i++) {
        const v = values[i] * sensitivity;
        const y = (v + 1) / 2 * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Add a slight glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'var(--accent-glow)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      analyserRef.current?.dispose();
    };
  }, [isAudioReady, sensitivity]);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '15px', 
        width: isExpanded ? '100%' : '350px',
        height: isExpanded ? '300px' : '120px',
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
          <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>MASTER OSCILLOSCOPE</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Settings2 size={12} color="var(--text-muted)" />
            <input 
              type="range" min="0.5" max="5" step="0.1" 
              value={sensitivity} 
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              style={{ width: '60px', accentColor: 'var(--accent-primary)', height: '4px' }}
              title="Sensitivity"
            />
          </div>
          <button 
            className="btn-glass" 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '4px' }}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}
