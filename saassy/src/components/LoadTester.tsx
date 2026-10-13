'use client';

import React, { useState } from 'react';
import { Zap, Play, CheckCircle2, BarChart2, Loader2, Server } from 'lucide-react';

export default function LoadTester() {
  const [virtualUsers, setVirtualUsers] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const userOptions = [50, 500, 1000, 5000];

  const handleRunLoadTest = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/load-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualUsers }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: 'Load test failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Synthetic Load Testing</span>
          </div>
          <h2 className="section-title">High-Concurrency API Stress Test Engine</h2>
          <p className="section-desc">
            Benchmark P50, P95, and P99 latency distributions under simulated burst concurrency.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Select Virtual Concurrent Users
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {userOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVirtualUsers(opt)}
                    className={`btn btn-sm ${virtualUsers === opt ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {opt.toLocaleString()} VUs
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleRunLoadTest} disabled={loading} className="btn btn-primary" style={{ padding: '0 24px' }}>
              {loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
              {loading ? 'Executing Load Test...' : 'Run Synthetic Stress Test'}
            </button>
          </div>

          <div className="terminal-box">
            <div className="terminal-header">
              <BarChart2 size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Latency Distribution Breakdown (Percentiles)
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '160px', fontSize: '0.825rem' }}>
              {!loading && !testResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Select concurrent virtual users and click "Run Synthetic Stress Test".
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Dispatching {virtualUsers.toLocaleString()} concurrent HTTP worker threads...
                </span>
              )}

              {!loading && testResult && testResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '12px', fontWeight: 600 }}>
                    ✔ Test ID {testResult.testId}: {testResult.successfulRequests.toLocaleString()} / {testResult.totalRequests.toLocaleString()} Requests Succeeded (0 Errors)
                  </div>

                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    Sustained Throughput: <span style={{ color: 'var(--accent-primary)' }}>{testResult.rps.toLocaleString()} RPS</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#0d1322', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>P50 (Median Latency)</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{testResult.latencyDistributionMs.p50}ms</div>
                    </div>

                    <div style={{ background: '#0d1322', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>P95 (95th Percentile)</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{testResult.latencyDistributionMs.p95}ms</div>
                    </div>

                    <div style={{ background: '#0d1322', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>P99 (Tail Latency)</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{testResult.latencyDistributionMs.p99}ms</div>
                    </div>
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
