import React, { useState, useEffect } from 'react';
import { Cpu, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function QuantumFluxGauge({ isStreaming, gain = 1.0 }) {
  const [fluxLevel, setFluxLevel] = useState(74.2);
  const [stability, setStability] = useState(98.4);
  const [harmonicMode, setHarmonicMode] = useState('DELTA');

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setFluxLevel((prev) => {
        const delta = (Math.random() - 0.48) * 3.5 * gain;
        return Math.min(99.9, Math.max(20, parseFloat((prev + delta).toFixed(1))));
      });
      setStability((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Math.min(100, Math.max(90, parseFloat((prev + delta).toFixed(1))));
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming, gain]);

  // SVG Gauge math
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fluxLevel / 100) * circumference;

  const isWarning = fluxLevel > 88;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-violet)' }}>
            <Cpu style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Quantum Flux Density</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Harmonic Field Resonance</p>
          </div>
        </div>

        <span className={`pulse-indicator ${isWarning ? 'danger' : 'normal'}`} />
      </div>

      {/* Circular Gauge Center */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0', position: 'relative' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={isWarning ? 'var(--accent-rose)' : 'var(--accent-violet)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
              filter: isWarning ? 'drop-shadow(0 0 10px #f43f5e)' : 'drop-shadow(0 0 10px #8b5cf6)',
            }}
          />
        </svg>

        {/* Center Text Display */}
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: isWarning ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
            {fluxLevel}<span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            FLUX RESONANCE
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto' }}>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STABILITY INDEX</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
            {stability}%
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HARMONIC FREQ</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            14.28 GHz
          </div>
        </div>
      </div>

      {/* Harmonic Selector Buttons */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '0.85rem' }}>
        {['ALPHA', 'BETA', 'DELTA', 'GAMMA'].map((mode) => (
          <button
            key={mode}
            onClick={() => setHarmonicMode(mode)}
            className={`btn-cosmo-outline ${harmonicMode === mode ? 'active' : ''}`}
            style={{ flex: 1, padding: '4px', fontSize: '0.65rem', justifyContent: 'center' }}
          >
            {mode}
          </button>
        ))}
      </div>

    </div>
  );
}
