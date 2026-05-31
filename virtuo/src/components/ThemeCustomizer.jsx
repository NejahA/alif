import React, { useState, useEffect } from 'react';
import { Palette, Type, Layout, Sparkles, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeCustomizer() {
  const [themeSettings, setThemeSettings] = useState(() => {
    const saved = localStorage.getItem('virtuo_advanced_theme');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#8a2be2',
      secondaryColor: '#1a1a1a',
      fontFamily: 'Inter',
      blurIntensity: 10,
      borderOpacity: 0.1,
      glowIntensity: 20
    };
  });

  const fonts = ['Inter', 'Roboto Mono', 'Outfit', 'Space Grotesk', 'Syncopate'];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', themeSettings.primaryColor);
    root.style.setProperty('--accent-glow', `${themeSettings.primaryColor}80`);
    root.style.setProperty('--glass-blur', `${themeSettings.blurIntensity}px`);
    root.style.setProperty('--glass-border', `rgba(255, 255, 255, ${themeSettings.borderOpacity})`);
    root.style.setProperty('--glow-amount', `${themeSettings.glowIntensity}px`);
    root.style.setProperty('--font-main', themeSettings.fontFamily);
    
    localStorage.setItem('virtuo_advanced_theme', JSON.stringify(themeSettings));
  }, [themeSettings]);

  const resetTheme = () => {
    setThemeSettings({
      primaryColor: '#8a2be2',
      secondaryColor: '#1a1a1a',
      fontFamily: 'Inter',
      blurIntensity: 10,
      borderOpacity: 0.1,
      glowIntensity: 20
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Palette size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Advanced Theme</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Accent Color</span>
            <input 
              type="color" 
              value={themeSettings.primaryColor} 
              onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
              style={{ border: 'none', background: 'none', width: '30px', height: '30px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Typography</span>
          <select 
            value={themeSettings.fontFamily}
            onChange={(e) => setThemeSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
            className="btn-glass"
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
          >
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.5 }}>
              <span>Glass Blur</span>
              <span>{themeSettings.blurIntensity}px</span>
            </div>
            <input 
              type="range" min="0" max="40" 
              value={themeSettings.blurIntensity}
              onChange={(e) => setThemeSettings(prev => ({ ...prev, blurIntensity: Number(e.target.value) }))}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.5 }}>
              <span>Glow Amount</span>
              <span>{themeSettings.glowIntensity}px</span>
            </div>
            <input 
              type="range" min="0" max="50" 
              value={themeSettings.glowIntensity}
              onChange={(e) => setThemeSettings(prev => ({ ...prev, glowIntensity: Number(e.target.value) }))}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-glass" onClick={resetTheme} style={{ flex: 1, justifyContent: 'center' }}>
          <RotateCcw size={14} /> Reset
        </button>
        <button className="btn-glass active" style={{ flex: 1, justifyContent: 'center' }}>
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
}
