import React from 'react';
import { Sliders, Gauge, Shield, Zap, Sparkles } from 'lucide-react';

export default function ControlWorkbench({
  orbitalVelocity,
  setOrbitalVelocity,
  sensorGain,
  setSensorGain,
  particleDensity,
  setParticleDensity,
  signalAmplification,
  setSignalAmplification,
  onResetControls
}) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Sliders style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Telemetry Workbench</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live Simulation Tuning</p>
          </div>
        </div>

        <button
          onClick={onResetControls}
          className="btn-cosmo-outline"
          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
        >
          RESET ALL
        </button>
      </div>

      {/* Sliders Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
        
        {/* Orbital Velocity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Gauge style={{ width: '14px', height: '14px', color: 'var(--accent-cyan)' }} /> Orbital Velocity
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{orbitalVelocity}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={orbitalVelocity}
            onChange={(e) => setOrbitalVelocity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Sensor Gain Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield style={{ width: '14px', height: '14px', color: 'var(--accent-violet)' }} /> Sensor Gain Multiplier
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-violet)' }}>{sensorGain}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={sensorGain}
            onChange={(e) => setSensorGain(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
          />
        </div>

        {/* Particle Atmosphere Density Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: 'var(--accent-emerald)' }} /> Starfield Particle Density
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{particleDensity}</span>
          </div>
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={particleDensity}
            onChange={(e) => setParticleDensity(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
          />
        </div>

        {/* Signal Amplification Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap style={{ width: '14px', height: '14px', color: 'var(--accent-amber)' }} /> Signal Amplification
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>{signalAmplification}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={signalAmplification}
            onChange={(e) => setSignalAmplification(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
          />
        </div>

      </div>

    </div>
  );
}
