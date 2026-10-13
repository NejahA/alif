import React, { useState, useEffect } from 'react';
import { Compass, RotateCw, Orbit, ShieldCheck } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function OrbitalSystemTracker({ speedMultiplier = 1, soundEnabled = true }) {
  const [angle, setAngle] = useState(0);
  const [selectedBody, setSelectedBody] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 0.5 * speedMultiplier) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [speedMultiplier]);

  const bodies = [
    { name: 'CosmoPulse Core', radius: 0, color: '#8b5cf6', size: 16, dist: 0 },
    { name: 'Alpha Station', radius: 45, color: '#06b6d4', size: 8, speed: 1.5, type: 'Satellite' },
    { name: 'Titan Beacon', radius: 75, color: '#f59e0b', size: 10, speed: 0.9, type: 'Relay' },
    { name: 'Sector 12 Array', radius: 105, color: '#10b981', size: 7, speed: 0.6, type: 'Sensor' },
    { name: 'Deep Space Probe', radius: 135, color: '#f43f5e', size: 6, speed: 0.35, type: 'Probe' },
  ];

  const handleSelect = (b) => {
    setSelectedBody(b);
    if (soundEnabled) playBeep(600, 'sine', 0.05);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <Compass style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Orbital System Tracker</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live Trajectory Mesh Radar</p>
          </div>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
          RADAR 360°
        </span>
      </div>

      {/* Canvas SVG Orbital System */}
      <div style={{ position: 'relative', width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="280" height="240" viewBox="-150 -120 300 240">
          
          {/* Concentric Orbit Rings */}
          {bodies.filter(b => b.dist !== 0).map((b) => (
            <circle
              key={b.name}
              cx="0"
              cy="0"
              r={b.radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="3 3"
            />
          ))}

          {/* Core Center */}
          <circle cx="0" cy="0" r="12" fill="url(#coreGlow)" />
          <circle cx="0" cy="0" r="16" fill="none" stroke="var(--accent-violet)" strokeWidth="1.5" opacity="0.6" />

          <defs>
            <radialGradient id="coreGlow">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </radialGradient>
          </defs>

          {/* Orbiting Bodies */}
          {bodies.filter(b => b.dist !== 0).map((b, idx) => {
            const currentAngle = ((angle * (b.speed || 1)) + idx * 72) * (Math.PI / 180);
            const x = Math.cos(currentAngle) * b.radius;
            const y = Math.sin(currentAngle) * b.radius;

            const isSelected = selectedBody?.name === b.name;

            return (
              <g key={b.name} onClick={() => handleSelect(b)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={x}
                  cy={y}
                  r={b.size}
                  fill={b.color}
                  style={{ filter: `drop-shadow(0 0 6px ${b.color})` }}
                />
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={b.size + 6}
                    fill="none"
                    stroke={b.color}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
                <text
                  x={x}
                  y={y - b.size - 4}
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                  opacity="0.85"
                >
                  {b.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Body Info Footer */}
      <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-glass)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>SELECTED: </span>
          <strong style={{ color: 'var(--accent-cyan)' }}>{selectedBody ? selectedBody.name : 'CosmoPulse Central'}</strong>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {selectedBody ? `RAD: ${selectedBody.radius} AU` : 'STATION PRIME'}
        </div>
      </div>

    </div>
  );
}
