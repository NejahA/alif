import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Zap, Droplets, Flame } from 'lucide-react';

export default function ThemeEditor({ currentTheme, onThemeChange, customAccent, onAccentChange }) {
  const themes = [
    { id: 'default', name: 'Cyberpunk', icon: <Zap size={18} />, color: '#8a2be2' },
    { id: 'emerald', name: 'Emerald', icon: <Droplets size={18} />, color: '#10b981' },
    { id: 'ocean', name: 'Ocean', icon: <Moon size={18} />, color: '#3b82f6' },
    { id: 'sunset', name: 'Sunset', icon: <Flame size={18} />, color: '#f43f5e' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Palette size={24} color="var(--accent-primary)" />
        <h3 style={{ margin: 0 }}>Visual Theme Editor</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Core Presets</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {themes.map(t => (
            <button
              key={t.id}
              className={`btn-glass ${currentTheme === t.id ? 'active' : ''}`}
              onClick={() => onThemeChange(t.id)}
              style={{ padding: '15px', justifyContent: 'center', gap: '10px' }}
            >
              {t.icon}
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Custom Accent Color</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <input 
            type="color" 
            value={customAccent} 
            onChange={(e) => onAccentChange(e.target.value)}
            style={{ width: '60px', height: '60px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hex Code: {customAccent}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>This color will be used for buttons, glows, and active states.</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.8, lineHeight: 1.6 }}>
          Your visual settings are saved locally to your browser and will persist between sessions.
        </div>
      </div>
    </div>
  );
}
