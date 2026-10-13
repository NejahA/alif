'use client';

import React, { useState } from 'react';
import { Zap, RefreshCw, CheckCircle2, Globe, Server, Loader2 } from 'lucide-react';

export default function CdnCacheManager() {
  const [selectedRoute, setSelectedRoute] = useState('/api/v1/analytics');
  const [loading, setLoading] = useState(false);
  const [purgeResult, setPurgeResult] = useState<any>(null);

  const routes = [
    '/api/v1/analytics',
    '/api/v1/users',
    '/static/assets/bundle.js',
    '/api/v1/products',
  ];

  const handlePurge = async () => {
    setLoading(true);
    setPurgeResult(null);

    try {
      const res = await fetch('/api/cdn-purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routePath: selectedRoute }),
      });
      const data = await res.json();
      setPurgeResult(data);
    } catch (err) {
      setPurgeResult({ success: false, error: 'Cache purge failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cdn-cache" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Zap size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Global CDN Management</span>
          </div>
          <h2 className="section-title">Edge Cache Purge & Route Warm-Up</h2>
          <p className="section-desc">
            Instantly invalidate cached edge routes worldwide in sub-30 milliseconds.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Select Edge Cache Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
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
                {routes.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handlePurge} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '46px' }}>
                {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                {loading ? 'Purging Edge PoPs...' : 'Purge Global CDN Cache'}
              </button>
            </div>
          </div>

          <div className="terminal-box">
            <div className="terminal-header">
              <Globe size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                32 Global Edge PoP Status
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!loading && !purgeResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Select a route and click "Purge Global CDN Cache" to test 32-PoP cache invalidation.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Invalidating edge cache headers across 32 PoPs...
                </span>
              )}

              {!loading && purgeResult && purgeResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ Invalidation Succeeded — Purge ID: {purgeResult.purgeId} ({purgeResult.purgeDurationMs}ms)
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Route: <span style={{ color: 'var(--accent-cyan)' }}>{purgeResult.routePath}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    PoPs Updated: {purgeResult.popsPurged} Edge Nodes | Cache Status: {purgeResult.cacheHitRatioReset}
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
