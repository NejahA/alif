'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Bug, Activity } from 'lucide-react';

export default function AgentLogsDebugger() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => filterLevel === 'ALL' || log.level === filterLevel);

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Bug size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Autonomous Self-Healing</span>
          </div>
          <h2 className="section-title">Live System Logs & Auto-Remediation</h2>
          <p className="section-desc">
            Monitor background agent execution streams and self-healing error resolution logs.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`btn btn-sm ${filterLevel === lvl ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button onClick={fetchLogs} disabled={loading} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Stream
            </button>
          </div>

          <div className="terminal-box">
            <div className="terminal-header">
              <Activity size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                System Event Telemetry Log
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '180px', fontSize: '0.825rem' }}>
              {filteredLogs.map((log) => (
                <div key={log.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: log.level === 'ERROR' ? 'rgba(239, 68, 68, 0.2)' : log.level === 'WARN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: log.level === 'ERROR' ? '#ef4444' : log.level === 'WARN' ? '#f59e0b' : 'var(--accent-primary)'
                    }}>
                      {log.level}
                    </span>

                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      [{log.service}]
                    </span>

                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-primary)' }}>{log.message}</div>

                  {log.remediated && (
                    <div style={{ marginTop: '4px', color: 'var(--accent-emerald)', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Auto-Remediated: {log.fixAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
