import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Activity, BarChart3, Maximize2 } from 'lucide-react';

export const Oscilloscope = ({ isOpen, onClose }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [mode, setMode] = useState('waveform');
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    audioEngine.init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const draw = () => {
      ctx.fillStyle = 'rgba(7, 9, 19, 0.35)';
      ctx.fillRect(0, 0, w, h);

      const gridColor = 'rgba(139, 92, 246, 0.12)';
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 8; i++) {
        const y = (h / 8) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        const x = (w / 8) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      if (mode === 'waveform') {
        const data = audioEngine.getWaveformData();
        if (data.length > 0) {
          const grad = ctx.createLinearGradient(0, 0, w, 0);
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.9)');
          grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.9)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0.9)');

          ctx.lineWidth = 2;
          ctx.strokeStyle = grad;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
          ctx.beginPath();

          const sliceWidth = w / data.length;
          let x = 0;
          for (let i = 0; i < data.length; i++) {
            const v = data[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.lineTo(w, h / 2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.beginPath();
          ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
        }
      } else {
        const data = audioEngine.getSpectrumDataHighRes();
        if (data.length > 0) {
          const bars = 96;
          const step = Math.floor(data.length / bars);
          const barWidth = (w - (bars + 2)) / bars;
          for (let i = 0; i < bars; i++) {
            const v = data[i * step] / 255;
            const barH = Math.max(2, v * h * 0.92);
            const x = i * (barWidth + 1) + 1;
            const y = h - barH;

            const hue = 280 - (i / bars) * 220;
            const grad = ctx.createLinearGradient(0, y, 0, h);
            grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.95)`);
            grad.addColorStop(1, `hsla(${hue + 40}, 90%, 50%, 0.6)`);
            ctx.fillStyle = grad;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.4)`;
            ctx.fillRect(x, y, barWidth, barH);
            ctx.shadowBlur = 0;
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: maximized ? '16px' : '80px',
      left: maximized ? '16px' : '50%',
      transform: maximized ? 'none' : 'translateX(-50%)',
      width: maximized ? 'calc(100vw - 32px)' : '780px',
      height: maximized ? 'calc(100vh - 32px)' : '380px',
      zIndex: maximized ? 60 : 47,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Audio Analyzer Pro</h2>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.35)', padding: '3px', borderRadius: '10px', gap: '3px' }}>
            <button onClick={() => setMode('waveform')}
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'waveform' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' : 'transparent',
                color: mode === 'waveform' ? '#fff' : 'var(--text-muted)',
                boxShadow: mode === 'waveform' ? '0 0 10px rgba(6,182,212,0.4)' : 'none'
              }}>
              <Activity size={13} /> Waveform
            </button>
            <button onClick={() => setMode('spectrum')}
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'spectrum' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' : 'transparent',
                color: mode === 'spectrum' ? '#fff' : 'var(--text-muted)',
                boxShadow: mode === 'spectrum' ? '0 0 10px rgba(139,92,246,0.4)' : 'none'
              }}>
              <BarChart3 size={13} /> Spectrum
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={() => setMaximized(!maximized)} className="btn-icon" style={{ width: '32px', height: '32px' }} title="Toggle Size">
            <Maximize2 size={14} />
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px 8px' }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)', background: '#05060d' }}>
        <canvas
          ref={canvasRef}
          width={maximized ? window.innerWidth - 80 : 740}
          height={maximized ? window.innerHeight - 140 : 300}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <StatBox label="Resolution" value={mode === 'waveform' ? '2048 pts' : '96 bins'} accent="var(--accent-cyan)" />
        <StatBox label="Sample Rate" value={audioEngine.ctx ? `${(audioEngine.ctx.sampleRate / 1000).toFixed(1)}k` : '—'} accent="var(--accent-purple)" />
        <StatBox label="FFT Size" value={mode === 'waveform' ? '2048' : '2048'} accent="var(--accent-pink)" />
        <StatBox label="Mode" value={mode === 'waveform' ? 'Time Domain' : 'Frequency'} accent="var(--accent-amber)" />
      </div>
    </div>
  );
};

const StatBox = ({ label, value, accent }) => (
  <div style={{
    padding: '8px 10px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  }}>
    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: accent }}>{value}</span>
  </div>
);
