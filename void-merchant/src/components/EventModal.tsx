import React from 'react';
import { sound } from '../utils/audio';
import { ShieldAlert, Sparkles, Skull, ArrowRight } from 'lucide-react';

export interface SpaceEvent {
  title: string;
  type: 'customs' | 'salvage' | 'pirate';
  description: string;
  options: {
    label: string;
    action: () => void;
    variant?: 'sci-fi' | 'amber' | 'red';
  }[];
}

interface EventModalProps {
  event: SpaceEvent | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  const icon =
    event.type === 'customs' ? (
      <ShieldAlert size={32} color="var(--border-cyan)" />
    ) : event.type === 'salvage' ? (
      <Sparkles size={32} color="var(--accent-amber)" />
    ) : (
      <Skull size={32} color="var(--accent-red)" />
    );

  const borderCol =
    event.type === 'customs'
      ? 'var(--border-cyan)'
      : event.type === 'salvage'
      ? 'var(--accent-amber)'
      : 'var(--accent-red)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(5, 8, 17, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          border: `2px solid ${borderCol}`,
          boxShadow: `0 0 32px ${borderCol}44`,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: '12px' }}>{icon}</div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '2px', color: '#fff', marginBottom: '8px' }}>
          {event.title.toUpperCase()}
        </h2>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '24px' }}>
          {event.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {event.options.map((opt, i) => (
            <button
              key={i}
              className={`btn-sci-fi ${opt.variant ? `btn-${opt.variant}` : ''}`}
              onClick={() => {
                sound.playClick(800);
                opt.action();
                onClose();
              }}
              style={{ width: '100%', padding: '14px', fontSize: '0.88rem' }}
            >
              {opt.label} <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
