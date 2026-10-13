'use client';

import React, { useState } from 'react';
import { Globe, ArrowRight, ShieldCheck, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

export default function FailoverSimulator() {
  const [loading, setLoading] = useState(false);
  const [failoverResult, setFailoverResult] = useState<any>(null);

  const handleSimulateFailover = async () => {
    setLoading(true);
    setFailoverResult(null);

    try {
      const res = await fetch('/api/failover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryRegion: 'us-east-1', backupRegion: 'us-west-2' }),
      });
      const data = await res.json();
      setFailoverResult(data);
    } catch (err) {
      setFailoverResult({ success: false, error: 'Failover failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Globe size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Multi-Region High Availability</span>
          </div>
          <h2 className="section-title">Zero-Downtime Cluster Failover Engine</h2>
          <p className="section-desc">
            Automatically reroute Anycast traffic to secondary edge nodes in sub-100 milliseconds during regional outages.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <button onClick={handleSimulateFailover} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '24px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : <Globe size={16} />}
            {loading ? 'Simulating Cluster Failover...' : 'Simulate Primary Node Outage & Auto-Failover'}
          </button>

          <div className="terminal-box">
            <div className="terminal-header">
              <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                DNS Anycast Failover Controller
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!loading && !failoverResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Simulate Primary Node Outage & Auto-Failover" to test automated traffic rerouting.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Detecting primary node timeout in us-east-1... Rerouting Anycast BGP routes to us-west-2...
                </span>
              )}

              {!loading && failoverResult && failoverResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ Failover Succeeded in {failoverResult.failoverTimeMs}ms (ID: {failoverResult.failoverId})
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Primary: <span style={{ color: '#ef4444' }}>{failoverResult.primaryRegion} (Simulated Outage)</span> ➔ Backup: <span style={{ color: 'var(--accent-emerald)' }}>{failoverResult.backupRegion} (Active)</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Traffic Rerouted: {failoverResult.trafficRoutedPercentage}% | Status: {failoverResult.status}
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
