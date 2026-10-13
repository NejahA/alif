'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Terminal, 
  Cpu, 
  Layers, 
  Compass, 
  Calculator, 
  Mail, 
  Volume2, 
  Sparkles, 
  X,
  ExternalLink
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal: () => void;
}

export default function CommandPalette({ isOpen, onClose, onOpenTerminal }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    {
      id: 'lab',
      title: 'Launch Engineering Lab & Consensus Simulator',
      subtitle: 'Simulate 5-node Raft consensus cluster and cache tiers',
      icon: <Cpu size={16} color="var(--cyan-neon)" />,
      action: () => {
        window.location.hash = '#lab';
        onClose();
      },
    },
    {
      id: 'terminal',
      title: 'Open Interactive Virtual Terminal',
      subtitle: 'Access the embedded CLI emulator with custom shell commands',
      icon: <Terminal size={16} color="var(--violet-neon)" />,
      action: () => {
        onClose();
        onOpenTerminal();
      },
    },
    {
      id: 'projects',
      title: 'Navigate to Featured Engineering Works',
      subtitle: 'Review deep-dive case studies: AetherStream, Kiros, Synapse, Vesper',
      icon: <Layers size={16} color="var(--emerald-neon)" />,
      action: () => {
        window.location.hash = '#projects';
        onClose();
      },
    },
    {
      id: 'architecture',
      title: 'Inspect System Architecture Blueprint',
      subtitle: 'Explore high-throughput distributed mesh topology and latency budgets',
      icon: <Compass size={16} color="#38bdf8" />,
      action: () => {
        window.location.hash = '#architecture';
        onClose();
      },
    },
    {
      id: 'calculator',
      title: 'Calculate Engineering ROI & Latency Savings',
      subtitle: 'Interactive cost and performance gain projection model',
      icon: <Calculator size={16} color="var(--amber-neon)" />,
      action: () => {
        window.location.hash = '#calculator';
        onClose();
      },
    },
    {
      id: 'sound',
      title: 'Toggle Audio Synthesizer Engine',
      subtitle: 'Procedural Web Audio frequency feedback',
      icon: <Volume2 size={16} color="#f43f5e" />,
      action: () => {
        sound.toggle();
        onClose();
      },
    },
    {
      id: 'confetti',
      title: 'Trigger Celebration Particle Burst',
      subtitle: 'Fire celebratory canvas confetti',
      icon: <Sparkles size={16} color="#ec4899" />,
      action: () => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#a855f7', '#10b981', '#f59e0b'],
        });
        sound.playSuccess();
        onClose();
      },
    },
    {
      id: 'contact',
      title: 'Initiate Direct Inquiry / Contract Engagement',
      subtitle: 'Transmit message or copy encrypted PGP / Email channel',
      icon: <Mail size={16} color="var(--cyan-neon)" />,
      action: () => {
        window.location.hash = '#contact';
        onClose();
      },
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery('');
          setSelectedIndex(0);
        }
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
        sound.playChirp(800, 0.02);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
        sound.playChirp(800, 0.02);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          sound.playClick();
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onOpenTerminal]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'rgba(10, 15, 26, 0.95)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          animation: 'palette-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1.1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '0.85rem',
          }}
        >
          <Search size={20} color="var(--cyan-neon)" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, jump target, or action..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '0.3rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Command List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '0.5rem',
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
              }}
            >
              No matching commands found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const active = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    sound.playClick();
                    cmd.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: active ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    border: active
                      ? '1px solid rgba(0, 240, 255, 0.3)'
                      : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: active ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cmd.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: active ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      {cmd.title}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: active ? 'var(--text-secondary)' : 'var(--text-muted)',
                      }}
                    >
                      {cmd.subtitle}
                    </div>
                  </div>
                  {active && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--cyan-neon)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ↵ Exec
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Dismiss</span>
          </div>
          <span style={{ color: 'var(--cyan-neon)' }}>Hal::laH v2.4</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes palette-in {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
