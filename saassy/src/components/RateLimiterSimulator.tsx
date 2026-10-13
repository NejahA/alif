'use client';

import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, RefreshCw, Loader2, ShieldAlert } from 'lucide-react';

export default function RateLimiterSimulator() {
  const [burstLogs, setBurstLogs] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runBurstTest = async () => {
    setTesting(true);
    setBurstLogs([]);

    const newLogs: any[] = [];
    for (let i = 1; i <= 8; i++) {
      try {
        const res = await fetch('/api/rate-limit', { method: 'POST' });
        const data = await res.json();
        newLogs.push({
          reqNumber: i,
          status: res.status,
          success: res.ok,
          message: res.ok ? `Req #${i}: 200 OK (Remaining: ${data.remaining}/${data.limit})` : `Req #${i}: 429 Rate Limit Exceeded (Retry after ${data.retryAfterSec}s)`,
        });
      } catch (err) {
        newLogs.push({ reqNumber: i, status: 500, success: false, message: `Req #${i}: Request error` });
      }
      setBurstLogs([...newLogs]);
      await new Promise((r) => setTimeout(r, 120));
    }
    setTesting(false);
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Token Bucket Protection</span>
          </div>
          <h2 className="section-title">Sliding Window Rate Limiter Tester</h2>
          <p className="section-desc">
            Simulate high-concurrency API burst traffic and test DDoS mitigation threshold policies.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Burst Test Quota: 5 Requests / 10s Window</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Policy: Token Bucket Algorithm</span>
            </div>

            <button onClick={runBurstTest} disabled={testing} className="btn btn-primary">
              {testing ? <Loader2 size={16} className="spin" /> : <Zap size={16} />}
              {testing ? 'Firing 8 Burst Requests...' : 'Simulate Rapid Burst Traffic (8 Reqs)'}
            </button>
          </div>

          <div className="terminal-box">
            <div className="terminal-header">
              <ShieldAlert size={14} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Rate Limiter Event Stream
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '160px', fontSize: '0.825rem' }}>
              {burstLogs.length === 0 && !testing && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Simulate Rapid Burst Traffic" to dispatch 8 rapid calls and observe HTTP 429 throttling.
                </span>
              )}

              {burstLogs.map((log) => (
                <div key={log.reqNumber} style={{ marginBottom: '6px', color: log.success ? 'var(--accent-emerald)' : '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {log.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
