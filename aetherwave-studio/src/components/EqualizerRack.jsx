import React, { useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Sliders, Activity, RefreshCw } from 'lucide-react';

export const EqualizerRack = ({ isOpen, onClose }) => {
  const bands = [
    { label: '60Hz', freq: 'Bass Sub' },
    { label: '150Hz', freq: 'Bass Punch' },
    { label: '400Hz', freq: 'Low Mid' },
    { label: '1kHz', freq: 'Mid Body' },
    { label: '2.4kHz', freq: 'Presence' },
    { label: '6kHz', freq: 'High Clarity' },
    { label: '15kHz', freq: 'Air Air' }
  ];

  const [gains, setGains] = useState([0, 0, 0, 0, 0, 0, 0]);

  const handleGainChange = (bandIdx, val) => {
    const nextGains = [...gains];
    nextGains[bandIdx] = val;
    setGains(nextGains);
    audioEngine.setEqBandGain(bandIdx, val);
  };

  const resetEq = () => {
    const flat = [0, 0, 0, 0, 0, 0, 0];
    setGains(flat);
    flat.forEach((_, i) => audioEngine.setEqBandGain(i, 0));
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '80px',
      left: '16px',
      width: '440px',
      zIndex: 46,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>7-Band Graphic Equalizer</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={resetEq} style={{ background: 'none', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Reset Flat
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
      </div>

      {/* 7 Vertical Fader Bands */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        background: 'rgba(0,0,0,0.3)',
        padding: '16px 10px',
        borderRadius: '14px',
        alignItems: 'center'
      }}>
        {bands.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {/* DB Value Label */}
            <span style={{ fontSize: '0.7rem', color: gains[i] > 0 ? 'var(--accent-pink)' : (gains[i] < 0 ? 'var(--accent-cyan)' : 'var(--text-muted)'), fontFamily: 'var(--font-mono)' }}>
              {gains[i] > 0 ? `+${gains[i]}` : gains[i]}dB
            </span>

            {/* Vertical Slider */}
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                step="1" 
                value={gains[i]}
                onChange={(e) => handleGainChange(i, parseFloat(e.target.value))}
                style={{
                  transform: 'rotate(-90deg)',
                  width: '130px',
                  cursor: 'pointer'
                }} 
              />
            </div>

            {/* Frequency Label */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{b.label}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{b.freq}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
