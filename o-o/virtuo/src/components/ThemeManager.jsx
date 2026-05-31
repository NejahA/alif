import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, PaintBucket } from 'lucide-react';

const themes = [
  {
    id: 'default',
    name: 'Midnight Glass',
    accent: '#8a2be2',
    bg: '#0f172a',
    glassBg: 'rgba(30, 41, 59, 0.7)'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    accent: '#facc15',
    bg: '#111827',
    glassBg: 'rgba(255, 0, 255, 0.1)'
  },
  {
    id: 'synthwave',
    name: 'Retro Synthwave',
    accent: '#f97316',
    bg: '#2e1065',
    glassBg: 'rgba(124, 58, 237, 0.2)'
  },
  {
    id: 'studio-light',
    name: 'Studio Light',
    accent: '#3b82f6',
    bg: '#f1f5f9',
    glassBg: 'rgba(255, 255, 255, 0.7)'
  }
];

const ThemeManager = ({ currentTheme, onThemeChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Palette size={24} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Theme Engine</h3>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
        Customize the global aesthetics of your Virtuo studio environment.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {themes.map(theme => (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onThemeChange(theme)}
            style={{
              padding: '15px',
              borderRadius: '12px',
              background: theme.glassBg,
              border: `2px solid ${currentTheme === theme.id ? theme.accent : 'transparent'}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Visual Preview */}
            <div style={{ 
              width: '100%', 
              height: '60px', 
              borderRadius: '8px', 
              background: theme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: theme.accent,
                boxShadow: `0 0 20px ${theme.accent}`
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {theme.name}
              </span>
              {currentTheme === theme.id && <Check size={16} color={theme.accent} />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ThemeManager;
