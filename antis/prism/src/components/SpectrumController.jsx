import React from 'react';
import { spectrumThemes } from '../data/themes';
import { motion } from 'framer-motion';

const SpectrumController = ({ activeThemeId, onThemeChange }) => {
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--s-primary', theme.primary);
    root.style.setProperty('--s-secondary', theme.secondary);
    root.style.setProperty('--s-accent', theme.accent);
    root.style.setProperty('--s-glow', theme.glow);
    onThemeChange(theme.id);
  };

  return (
    <div className="glass-card" style={{ padding: '15px 25px', display: 'flex', gap: '15px', alignItems: 'center', borderRadius: '50px', background: 'rgba(255,255,255,0.01)' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '1px' }}>SPECTRUM_PHASE</span>
      <div style={{ display: 'flex', gap: '10px' }}>
        {spectrumThemes.map((theme) => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => applyTheme(theme)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              cursor: 'pointer',
              border: activeThemeId === theme.id ? '2px solid white' : 'none',
              boxShadow: activeThemeId === theme.id ? `0 0 10px ${theme.primary}` : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SpectrumController;
