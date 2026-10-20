import React, { useState } from 'react';
import { LogMessage } from '../types/game';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface LogTerminalProps {
  logs: LogMessage[];
  onClearLogs: () => void;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs, onClearLogs }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div
      className="glass-panel"
      style={{
        margin: '0 16px 16px',
        padding: '12px 18px',
        borderTop: '2px solid rgba(0, 229, 255, 0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '10px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="var(--border-cyan)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--border-cyan)' }}>
            SHIPBOARD EVENT TELEMETRY LOG
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            ({logs.length} entries)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isExpanded && (
            <button
              onClick={onClearLogs}
              title="Clear Terminal Logs"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
              }}
            >
              <Trash2 size={13} /> CLEAR
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
            }}
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          style={{
            maxHeight: '120px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            paddingRight: '6px',
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              No telemetry events recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const color =
                log.type === 'alert'
                  ? 'var(--accent-red)'
                  : log.type === 'trade'
                  ? 'var(--border-cyan)'
                  : log.type === 'combat'
                  ? 'var(--accent-amber)'
                  : log.type === 'success'
                  ? 'var(--accent-green)'
                  : '#cbd5e1';

              return (
                <div key={log.id} style={{ display: 'flex', gap: '8px', lineHeight: 1.3 }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>[{log.timestamp}]</span>
                  <span style={{ color }}>{log.text}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
