import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Search, Pause, Play, Trash2, Send } from 'lucide-react';

export default function LogConsole({ logs, onClearLogs, onSendPing, isStreaming }) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'ALL' || log.type === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || log.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'CRITICAL':
        return { bg: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.4)' };
      case 'WARN':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' };
      case 'SIGNAL':
        return { bg: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.4)' };
      default:
        return { bg: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)' };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
            <Terminal style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Telemetry Log Stream</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Real-Time Event Audit Log</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onSendPing}
            className="btn-cosmo"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <Send style={{ width: '12px', height: '12px' }} /> SEND TEST PING
          </button>
          
          <button
            onClick={onClearLogs}
            className="btn-cosmo-outline"
            style={{ padding: '4px 8px' }}
            title="Clear Log Console"
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search event logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '5px 8px 5px 30px',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Type Filters */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'INFO', 'SIGNAL', 'WARN', 'CRITICAL'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`btn-cosmo-outline ${filter === t ? 'active' : ''}`}
              style={{ padding: '3px 7px', fontSize: '0.65rem' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed Console Box */}
      <div
        style={{
          flex: 1,
          minHeight: '180px',
          maxHeight: '260px',
          background: 'rgba(5, 8, 20, 0.85)',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)',
          padding: '0.75rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
            No log events matching filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getBadgeStyle(log.type);
            return (
              <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                  [{log.timestamp}]
                </span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  background: badge.bg,
                  color: badge.color,
                  border: badge.border,
                  whiteSpace: 'nowrap'
                }}>
                  {log.type}
                </span>
                <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

    </div>
  );
}
