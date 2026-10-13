'use client';

import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, Server, Activity, ArrowRight } from 'lucide-react';

export default function DbReplicationMonitor() {
  const [repData, setRepData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReplication = () => {
    setLoading(true);
    fetch('/api/db-replication')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRepData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReplication();
  }, []);

  return (
    <section id="db-replication" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Database size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Streaming WAL Replication</span>
          </div>
          <h2 className="section-title">Multi-Region Database Replication Monitor</h2>
          <p className="section-desc">
            Monitor write-ahead log (WAL) streaming sync and sub-3ms replication lag across read replicas.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Database Node</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {repData ? repData.primaryNode : 'us-east-1 (N. Virginia)'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                WAL Sequence LSN: {repData ? repData.walLSN : '0/1F8A902C'}
              </span>
            </div>

            <button onClick={fetchReplication} disabled={loading} className="btn btn-secondary">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              {loading ? 'Polling Replicas...' : 'Refresh Sync Telemetry'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {repData?.replicas?.map((rep: any) => (
              <div key={rep.id} style={{ background: '#090d16', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> {rep.walStatus.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {rep.connections} active connections
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{rep.region}</h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  Replication Lag: {rep.lagMs}ms
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
