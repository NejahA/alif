'use client';

import React, { useState } from 'react';
import { Database, Zap, CheckCircle2, Play, Search, Loader2 } from 'lucide-react';

export default function QueryProfiler() {
  const [query, setQuery] = useState('SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE orders.status = "completed"');
  const [loading, setLoading] = useState(false);
  const [profileResult, setProfileResult] = useState<any>(null);

  const presets = [
    'SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE orders.status = "completed"',
    'SELECT * FROM embeddings ORDER BY vector <=> \'[0.12, 0.45, ...]\' LIMIT 10',
    'UPDATE tenants SET status = "active" WHERE last_seen > NOW() - INTERVAL \'5m\'',
  ];

  const handleProfile = async (targetQuery?: string) => {
    const q = targetQuery || query;
    setLoading(true);
    setProfileResult(null);

    try {
      const res = await fetch('/api/query-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setProfileResult(data);
    } catch (err) {
      setProfileResult({ success: false, error: 'Profiling failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="query-profiler" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Zap size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Database Optimization</span>
          </div>
          <h2 className="section-title">EXPLAIN ANALYZE Query Profiler</h2>
          <p className="section-desc">
            Profile database query execution plans, index utilization, and cache hit ratios.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              SQL / Vector Query Statement
            </label>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#090d16',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: '#e2e8f0',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Preset:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleProfile(p);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Preset {idx + 1}
              </button>
            ))}
          </div>

          <button onClick={() => handleProfile()} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '24px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {loading ? 'Analyzing Query Execution Plan...' : 'Profile Query Execution'}
          </button>

          {/* Profile Results */}
          <div className="terminal-box">
            <div className="terminal-header">
              <Database size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Query Execution Plan Output
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!loading && !profileResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Profile Query Execution" to inspect B-Tree index scans and planning time.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Running EXPLAIN ANALYZE on query plan...
                </span>
              )}

              {!loading && profileResult && profileResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ Query Executed in {profileResult.executionTimeMs}ms (Planning: {profileResult.planningTimeMs}ms)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px', padding: '12px', background: '#0d1322', borderRadius: 'var(--radius-sm)' }}>
                    <div>Index Used: <strong style={{ color: 'var(--accent-cyan)' }}>{profileResult.indexUsed}</strong></div>
                    <div>Scan Method: <strong style={{ color: 'var(--text-primary)' }}>{profileResult.scanType}</strong></div>
                    <div>Rows Examined: <strong style={{ color: 'var(--text-primary)' }}>{profileResult.rowsExamined}</strong></div>
                  </div>
                  <div style={{ color: 'var(--accent-emerald)' }}>💡 {profileResult.recommendation}</div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
