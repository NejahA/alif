import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Music, Zap, Settings, Disc, Layout, AudioWaveform, Activity, ListMusic, Cloud, Book, Mic, Palette, RefreshCcw } from 'lucide-react';

const COMMANDS = [
  { id: 'piano', label: 'Switch to Piano', icon: Music, category: 'Instruments' },
  { id: 'violin', label: 'Switch to Violin', icon: Activity, category: 'Instruments' },
  { id: 'guitar', label: 'Switch to Guitar', icon: Music, category: 'Instruments' },
  { id: 'drums', label: 'Switch to Beats', icon: Disc, category: 'Instruments' },
  { id: 'pads', label: 'Switch to Pads', icon: Layout, category: 'Instruments' },
  { id: 'sampler', label: 'Switch to Sampler', icon: AudioWaveform, category: 'Instruments' },
  { id: 'synth', label: 'Switch to Synth', icon: Zap, category: 'Instruments' },
  { id: 'seq', label: 'Switch to Sequencer', icon: ListMusic, category: 'Instruments' },
  { id: 'bass', label: 'Switch to Bass', icon: Activity, category: 'Instruments' },
  { id: 'ambient', label: 'Switch to Ambient', icon: Cloud, category: 'Instruments' },
  { id: 'vocal', label: 'Switch to Vocal', icon: Mic, category: 'Instruments' },
  { id: 'scales', label: 'Switch to Scales', icon: Book, category: 'Instruments' },
  { id: 'studio', label: 'Switch to Studio', icon: Activity, category: 'Instruments' },
  { id: 'zen', label: 'Toggle Zen Mode', icon: Zap, category: 'Tools' },
  { id: 'theme_default', label: 'Theme: Cyberpunk', icon: Palette, category: 'Themes' },
  { id: 'theme_emerald', label: 'Theme: Emerald', icon: Palette, category: 'Themes' },
  { id: 'theme_ocean', label: 'Theme: Ocean', icon: Palette, category: 'Themes' },
  { id: 'theme_sunset', label: 'Theme: Sunset', icon: Palette, category: 'Themes' },
  { id: 'random_all', label: 'Randomize Everything', icon: RefreshCcw, category: 'Tools' },
];

export default function CommandPalette({ onCommand, isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        if (filteredCommands[selectedIndex]) {
          onCommand(filteredCommands[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onCommand, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -20, scale: 0.95 }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 20px var(--accent-glow)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Search size={20} color="var(--accent-primary)" />
              <input
                autoFocus
                placeholder="Type a command or search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.1rem',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                ESC to close
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
              {filteredCommands.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No commands found matching "{query}"
                </div>
              ) : (
                filteredCommands.map((cmd, i) => (
                  <div
                    key={cmd.id}
                    onClick={() => { onCommand(cmd.id); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    style={{
                      padding: '12px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      background: selectedIndex === i ? 'var(--accent-primary)' : 'transparent',
                      color: selectedIndex === i ? 'white' : 'var(--text-main)',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <cmd.icon size={18} style={{ opacity: selectedIndex === i ? 1 : 0.6 }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{cmd.label}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{cmd.category}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
