import React, { useState, useEffect } from 'react';
import { Crosshair, EyeOff, Maximize2, ShieldAlert, Zap } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function HUDModeOverlay({ isOpen, onClose, soundEnabled = true }) {
  const [hudAngle, setHudAngle] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setHudAngle((prev) => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(3, 7, 18, 0.92)',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'auto',
        color: '#06b6d4',
        fontFamily: 'var(--font-mono)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none'
      }}
    >
      {/* Top HUD Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(6, 182, 212, 0.3)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Crosshair className="spin" style={{ width: '28px', height: '28px', color: '#06b6d4' }} />
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '2px', color: '#ffffff' }}>
              TACTICAL HUD OVERLAY
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#06b6d4' }}>
              TARGET LOCK: SATELLITE ALPHA-01 [SECTOR 7]
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (soundEnabled) playBeep(500, 'sine', 0.08);
            onClose();
          }}
          className="btn-cosmo"
          style={{ padding: '0.6rem 1.2rem', background: 'rgba(244, 63, 94, 0.3)', borderColor: '#f43f5e', color: '#fff' }}
        >
          <EyeOff style={{ width: '16px', height: '16px' }} /> EXIT HUD MODE
        </button>
      </div>

      {/* Center Target Reticle Graphic */}
      <div style={{ position: 'relative', width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="420" height="420" viewBox="-210 -210 420 420" style={{ overflow: 'visible' }}>
          
          {/* Rotating Outer Ring */}
          <circle
            cx="0"
            cy="0"
            r="180"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="20 10 5 10"
            style={{
              transform: `rotate(${hudAngle}deg)`,
              transformOrigin: '0 0',
              opacity: 0.7
            }}
          />

          {/* Inner Counter-Rotating Ring */}
          <circle
            cx="0"
            cy="0"
            r="140"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeDasharray="40 15 10 15"
            style={{
              transform: `rotate(${-hudAngle * 1.5}deg)`,
              transformOrigin: '0 0',
              opacity: 0.8
            }}
          />

          {/* Center Crosshair Lines */}
          <line x1="-200" y1="0" x2="200" y2="0" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
          <line x1="0" y1="-200" x2="0" y2="200" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />

          {/* Target Box Corners */}
          <path d="M -60,-40 L -60,-60 L -40,-60" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <path d="M 60,-40 L 60,-60 L 40,-60" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <path d="M -60,40 L -60,60 L -40,60" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <path d="M 60,40 L 60,60 L 40,60" fill="none" stroke="#06b6d4" strokeWidth="2" />

          {/* Target Coordinates Text */}
          <text x="70" y="-70" fill="#06b6d4" fontSize="11">LAT: 14.28° N</text>
          <text x="70" y="-55" fill="#06b6d4" fontSize="11">LON: 88.42° W</text>
          <text x="70" y="-40" fill="#10b981" fontSize="11">SIGNAL: 99.8%</text>

        </svg>

        {/* Floating Side Data Telemetry */}
        <div style={{ position: 'absolute', left: '2rem', top: '30%', background: 'rgba(6, 182, 212, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)', width: '220px' }}>
          <div style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: '700', marginBottom: '0.4rem' }}>ORBITAL RADAR</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ALTITUDE: 420.8 km</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>VELOCITY: 7.66 km/s</div>
          <div style={{ fontSize: '0.7rem', color: '#10b981' }}>SYSTEMS: NOMINAL</div>
        </div>

        <div style={{ position: 'absolute', right: '2rem', top: '30%', background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', width: '220px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: '700', marginBottom: '0.4rem' }}>QUANTUM LINK</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ENCRYPTION: 256-BIT</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>HARMONIC: DELTA</div>
          <div style={{ fontSize: '0.7rem', color: '#c084fc' }}>FLUX: 98.4%</div>
        </div>
      </div>

      {/* Bottom HUD Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(6, 182, 212, 0.3)', paddingTop: '1rem', fontSize: '0.8rem' }}>
        <div>SYSTEM STATUS: <span style={{ color: '#10b981' }}>COMMAND READY</span></div>
        <div>PRESS ESC OR BUTTON TO RETURN</div>
      </div>

    </div>
  );
}
