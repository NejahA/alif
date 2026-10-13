import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Radio, Globe, Volume2, VolumeX, Crosshair } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function Header({
  currentTheme,
  setTheme,
  isStreaming,
  setIsStreaming,
  soundEnabled,
  setSoundEnabled,
  onOpenHUD
}) {
  const [time, setTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const themes = [
    { id: 'cosmic-violet', name: 'Cosmic Violet', color: '#8b5cf6' },
    { id: 'cyber-cyan', name: 'Cyber Cyan', color: '#06b6d4' },
    { id: 'solar-flare', name: 'Solar Flare', color: '#f97316' },
    { id: 'deep-nebula', name: 'Deep Nebula', color: '#ec4899' },
  ];

  const handleThemeChange = (id) => {
    setTheme(id);
    if (soundEnabled) playBeep(900, 'sine', 0.05);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) playBeep(1000, 'sine', 0.08);
  };

  return (
    <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem', position: 'relative', zIndex: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Brand & Mission Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)'
          }}>
            <Radio style={{ width: '24px', height: '24px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                COSMOPULSE
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#c084fc',
                letterSpacing: '1px'
              }}>
                v3.6 orbital
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="pulse-indicator"></span> Deep-Space Telemetry & Neural Command Network
            </p>
          </div>
        </div>

        {/* Live Clock & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right', display: 'none', minWidth: '180px', '@media (min-width: 768px)': { display: 'block' } }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: '600', color: 'var(--accent-cyan)' }}>
              {time}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
              <Globe style={{ width: '12px', height: '12px' }} /> LATENCY: <span style={{ color: 'var(--accent-emerald)' }}>11.4 ms</span>
            </div>
          </div>

          {/* HUD Mode Button */}
          <button
            onClick={() => {
              if (soundEnabled) playBeep(1200, 'sine', 0.08);
              onOpenHUD();
            }}
            className="btn-cosmo"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Crosshair style={{ width: '15px', height: '15px' }} /> HUD MODE
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`btn-cosmo-outline ${soundEnabled ? 'active' : ''}`}
            title="Toggle Synthesizer Sound FX"
          >
            {soundEnabled ? <Volume2 style={{ width: '16px', height: '16px', color: 'var(--accent-cyan)' }} /> : <VolumeX style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />}
            <span>{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          {/* Stream Toggle Button */}
          <button
            onClick={() => {
              setIsStreaming(!isStreaming);
              if (soundEnabled) playBeep(700, 'sine', 0.05);
            }}
            className={`btn-cosmo-outline ${isStreaming ? 'active' : ''}`}
            title="Toggle Live Telemetry Feed"
          >
            <Activity style={{ width: '16px', height: '16px', color: isStreaming ? 'var(--accent-emerald)' : 'var(--text-muted)' }} />
            <span>{isStreaming ? 'STREAMING' : 'PAUSED'}</span>
          </button>

          {/* Preset Theme Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: t.color,
                  border: currentTheme === t.id ? '2px solid #ffffff' : 'none',
                  boxShadow: currentTheme === t.id ? `0 0 10px ${t.color}` : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: currentTheme === t.id ? 'scale(1.15)' : 'scale(1)',
                }}
                title={`Switch Theme: ${t.name}`}
              />
            ))}
          </div>

        </div>

      </div>
    </header>
  );
}
