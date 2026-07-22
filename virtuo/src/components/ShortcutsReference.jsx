import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, Command, Search, Music, Activity, Disc, 
  Zap, Settings2, Layout, Palette, Book, HelpCircle, 
  Cloud, Volume2, Star, Target, BarChart3, Layers,
  Share2, Sparkles, Users, Crown, Compass, Shield,
  Sprout, Trophy, TrendingUp, Brain, Eye, EyeOff
} from 'lucide-react';

const SHORTCUT_CATEGORIES = {
  navigation: {
    name: 'Navigation',
    color: '#3b82f6',
    icon: <Command size={14} />,
    shortcuts: [
      { keys: ['1'], description: 'Open Piano' },
      { keys: ['2'], description: 'Open Violin' },
      { keys: ['3'], description: 'Open Guitar' },
      { keys: ['4'], description: 'Open Drum Sequencer' },
      { keys: ['5'], description: 'Open Drum Pads' },
      { keys: ['6'], description: 'Open Sampler' },
      { keys: ['7'], description: 'Open Synthesizer' },
      { keys: ['8'], description: 'Open Melodic Sequencer' },
      { keys: ['9'], description: 'Open Bass Synth' },
    ]
  },
  global: {
    name: 'Global',
    color: '#10b981',
    icon: <Zap size={14} />,
    shortcuts: [
      { keys: ['⌘/Ctrl', 'K'], description: 'Toggle Command Palette' },
      { keys: ['⌘/Ctrl', 'S'], description: 'Save Project' },
      { keys: ['Space'], description: 'Play/Pause Transport' },
      { keys: ['⌘/Ctrl', 'Z'], description: 'Undo' },
      { keys: ['⌘/Ctrl', 'Shift', 'Z'], description: 'Redo' },
    ]
  },
  instruments: {
    name: 'Instruments',
    color: '#f59e0b',
    icon: <Music size={14} />,
    shortcuts: [
      { keys: ['C'], description: 'Play Middle C (selected instrument)' },
      { keys: ['D'], description: 'Play D' },
      { keys: ['E'], description: 'Play E' },
      { keys: ['F'], description: 'Play F' },
      { keys: ['G'], description: 'Play G' },
      { keys: ['A'], description: 'Play A' },
      { keys: ['B'], description: 'Play B' },
      { keys: ['↑'], description: 'Octave Up' },
      { keys: ['↓'], description: 'Octave Down' },
    ]
  },
  editing: {
    name: 'Editing',
    color: '#ec4899',
    icon: <Settings2 size={14} />,
    shortcuts: [
      { keys: ['Delete/Backspace'], description: 'Delete selected automation points' },
      { keys: ['Shift', 'Click'], description: 'Multi-select automation points' },
      { keys: ['⌘/Ctrl', 'C'], description: 'Copy selected' },
      { keys: ['⌘/Ctrl', 'V'], description: 'Paste' },
      { keys: ['⌘/Ctrl', 'D'], description: 'Duplicate' },
    ]
  },
  recording: {
    name: 'Recording',
    color: '#ef4444',
    icon: <Activity size={14} />,
    shortcuts: [
      { keys: ['R'], description: 'Toggle Recording' },
      { keys: ['⌘/Ctrl', 'R'], description: 'Start/Stop Recording' },
      { keys: ['M'], description: 'Toggle Metronome' },
      { keys: ['T'], description: 'Tap Tempo' },
    ]
  },
  view: {
    name: 'View',
    color: '#8b5cf6',
    icon: <Eye size={14} />,
    shortcuts: [
      { keys: ['Z'], description: 'Toggle Zen Mode' },
      { keys: ['F11'], description: 'Fullscreen' },
      { keys: ['⌘/Ctrl', '+'], description: 'Zoom In' },
      { keys: ['⌘/Ctrl', '-'], description: 'Zoom Out' },
      { keys: ['⌘/Ctrl', '0'], description: 'Reset Zoom' },
    ]
  }
};

const ShortcutsReference = () => {
  const [activeCategory, setActiveCategory] = useState('navigation');
  const [searchQuery, setSearchQuery] = useState('');

  const allShortcuts = Object.entries(SHORTCUT_CATEGORIES).flatMap(([catId, cat]) =>
    cat.shortcuts.map(s => ({ ...s, category: catId, categoryName: cat.name, categoryColor: cat.color }))
  );

  const filteredShortcuts = searchQuery
    ? allShortcuts.filter(s => 
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keys.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : SHORTCUT_CATEGORIES[activeCategory]?.shortcuts || [];

  const renderKey = (key) => {
    const isModifier = ['⌘/Ctrl', 'Shift', 'Delete/Backspace', 'Space', 'F11'].includes(key);
    return (
      <kbd key={key} style={{
        padding: '3px 8px',
        background: isModifier ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: 'monospace',
        color: isModifier ? 'var(--accent-primary)' : 'var(--text-main)',
        minWidth: '24px',
        textAlign: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}>
        {key === 'Space' ? '␣' : key}
      </kbd>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel"
      style={{ 
        width: '100%', 
        maxWidth: '700px', 
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Keyboard size={16} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Keyboard Shortcuts</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Press ⌘/Ctrl+K to open command palette
          </span>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search shortcuts..."
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '0.85rem',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
      />

      {/* Category Tabs */}
      {!searchQuery && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries(SHORTCUT_CATEGORIES).map(([catId, cat]) => (
            <button
              key={catId}
              onClick={() => setActiveCategory(catId)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: `1px solid ${activeCategory === catId ? cat.color : 'var(--glass-border)'}`,
                background: activeCategory === catId ? `${cat.color}20` : 'transparent',
                color: activeCategory === catId ? cat.color : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Shortcuts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {searchQuery && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
            Found {filteredShortcuts.length} shortcut{filteredShortcuts.length !== 1 ? 's' : ''}
          </div>
        )}
        
        {filteredShortcuts.map((shortcut, idx) => (
          <motion.div
            key={`${shortcut.keys.join('-')}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = shortcut.categoryColor + '40';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {searchQuery && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: shortcut.categoryColor
                }} />
              )}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {shortcut.description}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {shortcut.keys.map((key, ki) => (
                <React.Fragment key={key}>
                  {ki > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>+</span>}
                  {renderKey(key)}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        ))}

        {filteredShortcuts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            No shortcuts found for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Tips */}
      <div style={{ 
        fontSize: '0.65rem', 
        color: 'var(--text-muted)', 
        background: 'rgba(255,255,255,0.02)', 
        padding: '10px 15px', 
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <span>⌘/Ctrl+K opens command palette</span>
        <span>Numbers 1-9 switch instruments</span>
        <span>Z toggles Zen Mode</span>
        <span>Space plays/pauses</span>
      </div>
    </motion.div>
  );
};

export default ShortcutsReference;