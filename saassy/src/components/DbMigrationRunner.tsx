'use client';

import React, { useState } from 'react';
import { Database, Play, CheckCircle2, FileCode, Loader2, GitCommit } from 'lucide-react';

export default function DbMigrationRunner() {
  const [migrationName, setMigrationName] = useState('2026100401_add_vector_index.sql');
  const [loading, setLoading] = useState(false);
  const [migResult, setMigResult] = useState<any>(null);

  const migrations = [
    '2026100401_add_vector_index.sql',
    '2026100402_enable_mtls_rbac.sql',
    '2026100403_partition_logs_by_tenant.sql',
  ];

  const handleApplyMigration = async () => {
    setLoading(true);
    setMigResult(null);

    try {
      const res = await fetch('/api/db-migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migrationName }),
      });
      const data = await res.json();
      setMigResult(data);
    } catch (err) {
      setMigResult({ success: false, error: 'Migration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="db-migrations" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <FileCode size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Schema Version Control</span>
          </div>
          <h2 className="section-title">Database Schema Migration Runner</h2>
          <p className="section-desc">
            Execute zero-downtime SQL schema migrations and verify SHA-256 migration checksums.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Select Pending SQL Migration File
              </label>
              <select
                value={migrationName}
                onChange={(e) => setMigrationName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              >
                {migrations.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handleApplyMigration} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '46px' }}>
                {loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
                {loading ? 'Applying SQL DDL...' : 'Apply Migration Batch'}
              </button>
            </div>
          </div>

          <div className="terminal-box">
            <div className="terminal-header">
              <GitCommit size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Migration Execution Log
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!loading && !migResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Select a migration and click "Apply Migration Batch".
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Applying DDL statements to database cluster...
                </span>
              )}

              {!loading && migResult && migResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ Migration Succeeded in {migResult.executedInMs}ms (ID: {migResult.migrationId})
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Altered Tables: <strong style={{ color: 'var(--accent-cyan)' }}>{migResult.tablesAltered.join(', ')}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    Checksum: {migResult.checksum}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
