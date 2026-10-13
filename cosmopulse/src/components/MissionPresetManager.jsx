import React from 'react';
import { Rocket, Sun, Moon, Atom, Sparkles } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function MissionPresetManager({ onApplyPreset, soundEnabled = true }) {
  const presets = [
    {
      id: 'DEEP_SPACE',
      name: 'Deep Space Probe',
      icon: Rocket,
      theme: 'cyber-cyan',
      velocity: 2.2,
      gain: 1.4,
      density: 90,
      amp: 1.8,
      desc: 'High velocity & dense starfield'
    },
    {
      id: 'SOLAR_STORM',
      name: 'Solar Storm Monitor',
      icon: Sun,
      theme: 'solar-flare',
      velocity: 1.5,
      gain: 2.2,
      density: 110,
      amp: 2.5,
      desc: 'High gain & solar flare aesthetics'
    },
    {
      id: 'LUNAR_BASE',
      name: 'Lunar Baseline',
      icon: Moon,
      theme: 'cosmic-violet',
      velocity: 0.8,
      gain: 1.0,
      density: 45,
      amp: 1.0,
      desc: 'Nominal telemetry & calm orbit'
    },
    {
      id: 'QUANTUM_LAB',
      name: 'Quantum Lab Research',
      icon: Atom,
      theme: 'deep-nebula',
      velocity: 1.2,
      gain: 2.0,
      density: 75,
      amp: 1.5,
      desc: 'High flux resonance tuning'
    }
  ];

  const handleSelect = (p) => {
    if (soundEnabled) playBeep(1100, 'sine', 0.08);
    onApplyPreset(p);
  };

  return (
    <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Sparkles style={{ width: '16px', height: '16px', color: 'var(--accent-violet)' }} /> MISSION SCENARIO PRESETS:
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {presets.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="btn-cosmo-outline"
              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
              title={p.desc}
            >
              <Icon style={{ width: '14px', height: '14px', color: 'var(--accent-cyan)' }} />
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
