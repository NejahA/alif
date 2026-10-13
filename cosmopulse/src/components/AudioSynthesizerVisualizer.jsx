import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Square, Sliders, Music, Radio } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function AudioSynthesizerVisualizer({ soundEnabled = true }) {
  const [isPlayingDrone, setIsPlayingDrone] = useState(false);
  const [oscType, setOscType] = useState('sine');
  const [frequency, setFrequency] = useState(140);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 300);
    let height = (canvas.height = 100);

    const bars = Array.from({ length: 32 }, () => Math.random() * 80);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bars.length) - 2;

      bars.forEach((b, i) => {
        const val = isPlayingDrone
          ? Math.min(95, Math.max(10, b + (Math.random() - 0.5) * 20))
          : Math.min(25, Math.max(2, b * 0.9));
        bars[i] = val;

        const h = (val / 100) * height;
        const x = i * (barWidth + 2);
        const y = height - h;

        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, h);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlayingDrone]);

  const toggleDrone = () => {
    if (isPlayingDrone) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      setIsPlayingDrone(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = oscType;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
        setIsPlayingDrone(true);
      } catch (e) {}
    }
  };

  const handleFreqChange = (newFreq) => {
    setFrequency(newFreq);
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(newFreq, audioCtxRef.current.currentTime);
    }
  };

  const handleTypeChange = (t) => {
    setOscType(t);
    if (oscRef.current) {
      oscRef.current.type = t;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
            <Music style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Cosmic Soundscape Synth</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ambient Space Frequency Generator</p>
          </div>
        </div>

        <button
          onClick={toggleDrone}
          className="btn-cosmo"
          style={{
            padding: '4px 10px',
            fontSize: '0.75rem',
            background: isPlayingDrone ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : undefined,
          }}
        >
          {isPlayingDrone ? <Square style={{ width: '12px', height: '12px' }} /> : <Play style={{ width: '12px', height: '12px' }} />}
          {isPlayingDrone ? 'STOP DRONE' : 'PLAY AMBIENT DRONE'}
        </button>
      </div>

      {/* Wave Visualizer Canvas */}
      <div style={{ position: 'relative', width: '100%', height: '100px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(5, 8, 20, 0.85)', border: '1px solid var(--border-glass)', marginBottom: '0.85rem' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Waveform Controls */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
        {/* Wave Types */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['sine', 'sawtooth', 'square', 'triangle'].map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`btn-cosmo-outline ${oscType === t ? 'active' : ''}`}
              style={{ flex: 1, padding: '3px', fontSize: '0.65rem', justifyContent: 'center', textTransform: 'uppercase' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Frequency Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <span>OSCILLATOR FREQUENCY</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{frequency} Hz</span>
          </div>
          <input
            type="range"
            min="60"
            max="440"
            step="5"
            value={frequency}
            onChange={(e) => handleFreqChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
          />
        </div>

      </div>

    </div>
  );
}
