import React, { useEffect } from 'react';
import { Keyboard, Music, Settings, Mic, Grid, Play, Maximize2, Volume2, Wand2, Activity } from 'lucide-react';

export const ShortcutsHelp = ({ isOpen, onClose, onTabChange }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groups = [
    {
      title: 'Main Navigation',
      accent: 'var(--accent-cyan)',
      items: [
        { keys: ['1'], label: 'Synth Controls', icon: Settings, tab: 'synth' },
        { keys: ['2'], label: 'Harmonizer', icon: Wand2, tab: 'chordgen' },
        { keys: ['3'], label: '7-Band EQ', icon: Activity, tab: 'eq' },
        { keys: ['4'], label: 'Harmony Pads', icon: Grid, tab: 'pads' },
        { keys: ['5'], label: 'Virtual Keyboard', icon: Music, tab: 'piano' },
        { keys: ['6'], label: 'Drum Machine', icon: Play, tab: 'drums' },
        { keys: ['7'], label: 'FX Rack', icon: Settings, tab: 'effects' },
        { keys: ['8'], label: 'Arpeggiator', icon: Music, tab: 'arp' },
        { keys: ['9'], label: 'Audio Analyzer', icon: Activity, tab: 'scope' },
        { keys: ['0'], label: 'Loop Recorder', icon: Mic, tab: 'loops' },
      ]
    },
    {
      title: 'Virtual Piano Keys',
      accent: 'var(--accent-purple)',
      items: [
        { keys: ['A', 'W', 'S', 'E', 'D'], label: 'White & Black Keys (C4–E4)' },
        { keys: ['F', 'T', 'G', 'Y', 'H'], label: 'Middle Register (F4–A4)' },
        { keys: ['U', 'J', 'K'], label: 'Upper Register (A♯4–C5)' },
      ]
    },
    {
      title: 'Global Actions',
      accent: 'var(--accent-pink)',
      items: [
        { keys: ['Space'], label: 'Toggle Drum Sequencer Play' },
        { keys: ['R'], label: 'Start / Stop Audio Recording' },
        { keys: ['M'], label: 'Mute / Unmute Master Output' },
        { keys: ['F'], label: 'Toggle Fullscreen View', icon: Maximize2 },
        { keys: ['←', '→'], label: 'Adjust Master Volume ±5%', icon: Volume2 },
        { keys: ['?'], label: 'Show / Hide This Help Panel', icon: Keyboard },
        { keys: ['Esc'], label: 'Close Active Panel / This Window' },
      ]
    }
  ];

  const handleShortcutClick = (tab) => {
    if (tab && onTabChange) {
      onTabChange(tab);
      onClose && onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(7, 9, 19, 0.75)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="glass-panel" style={{
        width: 'min(900px, 96vw)',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139,92,246,0.4)'
            }}>
              <Keyboard size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                Keyboard Shortcuts
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Master the AetherWave studio in seconds · Press any panel number to open it
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)', cursor: 'pointer', padding: '8px 14px',
            borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600
          }}>
            Close [Esc]
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          {groups.map((g, gi) => (
            <div key={gi} style={{
              padding: '18px', borderRadius: '14px',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${g.accent}33`,
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <h2 style={{
                fontSize: '0.8rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: g.accent,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: g.accent, boxShadow: `0 0 8px ${g.accent}` }} />
                {g.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {g.items.map((item, ii) => {
                  const Icon = item.icon;
                  const clickable = !!item.tab;
                  return (
                    <div key={ii} onClick={() => clickable && handleShortcutClick(item.tab)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px', borderRadius: '9px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-glass)',
                        transition: 'all 0.15s ease',
                        cursor: clickable ? 'pointer' : 'default'
                      }}
                      onMouseEnter={(e) => clickable && (e.currentTarget.style.background = 'rgba(139,92,246,0.12)')}
                      onMouseLeave={(e) => clickable && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {Icon && <Icon size={14} color={g.accent} />}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{item.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {item.keys.map((k, ki) => (
                          <kbd key={ki} style={{
                            minWidth: '28px', height: '24px', padding: '2px 8px',
                            fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                            fontWeight: 700, color: '#fff',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
                            border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: '6px',
                            boxShadow: '0 2px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(139,92,246,0.08))',
          border: '1px solid rgba(6,182,212,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Pro Tip 💡</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              Press <kbd style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-glass)', fontFamily: 'var(--font-mono)' }}>?</kbd> anytime to quickly recall this cheatsheet.
            </div>
          </div>
          <div style={{
            padding: '8px 14px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-glass)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {groups.reduce((a, g) => a + g.items.length, 0)} shortcuts total
          </div>
        </div>
      </div>
    </div>
  );
};
