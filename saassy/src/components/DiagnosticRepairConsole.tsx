'use client';

import React, { useState } from 'react';
import { Activity, CheckCircle2, ShieldCheck, RefreshCw, Cpu, Server, Loader2 } from 'lucide-react';

export default function DiagnosticRepairConsole() {
  const [loading, setLoading] = useState(false);
  const [diagResult, setDiagResult] = useState<any>(null);

  const handleRunDiagnostics = async () => {
    setLoading(true);
    setDiagResult(null);

    try {
      const res = await fetch('/api/diagnostics', { method: 'POST' });
      const data = await res.json();
      setDiagResult(data);
    } catch (err) {
      setDiagResult({ success: false, error: 'Diagnostic failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="diagnostics" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Activity size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Infrastructure Health</span>
          </div>
          <h2 className="section-title">Automated System Diagnostic & Repair</h2>
          <p className="section-desc">
            Run automated cluster diagnostics, memory thread profiling, and SSL chain verification.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <button onClick={handleRunDiagnostics} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '24px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
            {loading ? 'Running Diagnostic Scripts...' : 'Run Infrastructure Diagnostic & Auto-Repair'}
          </button>

          <div className="terminal-box">
            <div className="terminal-header">
              <Server size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                System Self-Healing Telemetry
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '160px', fontSize: '0.825rem' }}>
              {!loading && !diagResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Run Infrastructure Diagnostic & Auto-Repair" to test cluster health scripts.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Analyzing thread pool, heap allocation, and DNS cache...
                </span>
              )}

              {!loading && diagResult && diagResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '12px', fontWeight: 600 }}>
                    ✔ Cluster Health: {diagResult.overallHealth} (Diagnostic ID: {diagResult.diagnosticId})
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {diagResult.diagnostics.map((d: any, idx: number) => (
                      <div key={idx} style={{ background: '#0d1322', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.component}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{d.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>✔ {d.action}</div>
                      </div>
                    ))}
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
