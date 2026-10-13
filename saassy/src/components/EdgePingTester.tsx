'use client';

import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Activity, CheckCircle, ShieldCheck } from 'lucide-react';

export default function EdgePingTester() {
  const [pingData, setPingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runBenchmark = () => {
    setLoading(true);
    fetch('/api/ping')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPingData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runBenchmark();
  }, []);

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Globe size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Global Latency Benchmark</span>
          </div>
          <h2 className="section-title">Worldwide Edge Response Time Monitor</h2>
          <p className="section-desc">
            Test sub-30ms global API response times across our distributed edge clusters.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average Global Latency</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {pingData ? `${pingData.avgLatencyMs}ms` : '15ms'}
              </div>
            </div>

            <button onClick={runBenchmark} disabled={loading} className="btn btn-secondary">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              {loading ? 'Measuring Global Ping...' : 'Run Benchmark Test'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {pingData?.regions?.map((reg: any) => (
              <div key={reg.code} style={{ background: '#090d16', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{reg.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Activity size={12} /> {reg.status}
                  </span>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {reg.latencyMs}ms
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
