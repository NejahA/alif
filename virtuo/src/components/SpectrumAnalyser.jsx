import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Activity, BarChart2, Layers, Box } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function SpectrumAnalyser() {
  const canvasRef = useRef(null);
  const fftRef = useRef(null);
  const requestRef = useRef(null);
  const [mode, setMode] = useState('bars'); // 'bars' | 'continuous' | '3d'
  const historyRef = useRef([]);

  useEffect(() => {
    fftRef.current = new Tone.FFT(64);
    masterBus.connect(fftRef.current);

    const draw = () => {
      if (!canvasRef.current || !fftRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      const values = fftRef.current.getValue();

      ctx.clearRect(0, 0, width, height);
      
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#8a2be2';
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;

      if (mode === 'bars') {
        const barWidth = width / values.length;
        for (let i = 0; i < values.length; i++) {
          const val = values[i]; // in dB, approx -100 to 0
          const barHeight = Math.max(2, ((val + 100) / 100) * height);
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
      } else if (mode === '3d') {
        // Waterfall / 3D Spectrogram
        historyRef.current.unshift([...values]);
        if (historyRef.current.length > 20) historyRef.current.pop();

        historyRef.current.forEach((v, idx) => {
          const offset = idx * 3;
          const alpha = 1 - (idx / 20);
          ctx.strokeStyle = `${accent}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          for (let i = 0; i < v.length; i++) {
            const val = v[i];
            const x = (i / v.length) * width - offset;
            const y = height - (((val + 100) / 100) * height) - offset;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else {
        ctx.beginPath();
        ctx.lineWidth = 2;
        for (let i = 0; i < values.length; i++) {
          const val = values[i];
          const x = (i / values.length) * width;
          const y = height - (((val + 100) / 100) * height);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(requestRef.current);
      fftRef.current?.dispose();
    };
  }, [isAudioReady, mode]);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Spectrum</h4>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className={`btn-glass ${mode === 'bars' ? 'active' : ''}`}
            onClick={() => setMode('bars')}
            style={{ padding: '4px' }}
          >
            <BarChart2 size={12} />
          </button>
          <button 
            className={`btn-glass ${mode === 'continuous' ? 'active' : ''}`}
            onClick={() => setMode('continuous')}
            style={{ padding: '4px' }}
          >
            <Activity size={12} />
          </button>
          <button 
            className={`btn-glass ${mode === '3d' ? 'active' : ''}`}
            onClick={() => setMode('3d')}
            style={{ padding: '4px' }}
          >
            <Box size={12} />
          </button>
        </div>
      </div>
      <div style={{ height: '100px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={250} height={100} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
