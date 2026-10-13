import React, { useState, useEffect } from 'react';
import { Flame, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { playPurgeSound, playBeep } from '../utils/soundEngine';

export default function ThermalCore({ isStreaming, onLogMessage, soundEnabled = true }) {
  const [temps, setTemps] = useState(() =>
    Array.from({ length: 16 }, () => Math.floor(320 + Math.random() * 80))
  );
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    if (!isStreaming || isPurging) return;
    const interval = setInterval(() => {
      setTemps((prev) =>
        prev.map((t) => Math.min(520, Math.max(280, Math.floor(t + (Math.random() - 0.47) * 8))))
      );
    }, 600);

    return () => clearInterval(interval);
  }, [isStreaming, isPurging]);

  const maxTemp = Math.max(...temps);
  const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  const isHot = maxTemp > 450;

  const triggerPurge = () => {
    setIsPurging(true);
    if (soundEnabled) playPurgeSound();

    if (onLogMessage) {
      onLogMessage('CRITICAL', 'EMERGENCY COOLANT PURGE INITIATED — Plasma Core Temperature Venting');
    }
    setTimeout(() => {
      setTemps((prev) => prev.map(() => Math.floor(290 + Math.random() * 25)));
      setIsPurging(false);
      if (soundEnabled) playBeep(1200, 'sine', 0.1);
      if (onLogMessage) {
        onLogMessage('INFO', 'Coolant purge complete. Core temperatures normalized.');
      }
    }, 1500);
  };

  const getCellColor = (t) => {
    if (t > 440) return '#f43f5e'; // Rose hot
    if (t > 380) return '#f59e0b'; // Amber warm
    if (t > 330) return '#8b5cf6'; // Violet normal
    return '#06b6d4'; // Cyan cool
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
            <Flame style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Reactor Thermal Core</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>16-Zone Plasma Heat Distribution</p>
          </div>
        </div>

        <button
          onClick={triggerPurge}
          disabled={isPurging}
          className="btn-cosmo"
          style={{
            padding: '4px 10px',
            fontSize: '0.75rem',
            background: isHot ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : undefined,
          }}
        >
          {isPurging ? <RefreshCw className="spin" style={{ width: '14px', height: '14px' }} /> : <Flame style={{ width: '14px', height: '14px' }} />}
          {isPurging ? 'PURGING...' : 'COOLANT PURGE'}
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
        <div>
          AVG TEMP: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{avgTemp} K</strong>
        </div>
        <div>
          HOTSPOT: <strong style={{ fontFamily: 'var(--font-mono)', color: isHot ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>{maxTemp} K</strong>
        </div>
      </div>

      {/* 4x4 Thermal Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '1rem' }}>
        {temps.map((temp, idx) => {
          const color = getCellColor(temp);
          return (
            <div
              key={idx}
              style={{
                height: '48px',
                borderRadius: '8px',
                background: `rgba(15, 23, 42, 0.8)`,
                border: `1px solid ${color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: temp > 430 ? `0 0 12px ${color}` : 'none'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: color,
                  opacity: Math.min(0.35, (temp - 250) / 400),
                  transition: 'opacity 0.4s ease',
                }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', zIndex: 1 }}>Z-{idx + 1}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#ffffff', zIndex: 1 }}>
                {temp}K
              </span>
            </div>
          );
        })}
      </div>

      {/* Thermal Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} /> &lt;330K Optimal
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} /> Nominal
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Elevated
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} /> Critical
        </span>
      </div>

    </div>
  );
}
