'use client';

import React, { useState } from 'react';
import { DollarSign, ShieldAlert, CheckCircle2, AlertTriangle, Play, Loader2 } from 'lucide-react';

export default function BudgetGuard() {
  const [budgetLimit, setBudgetLimit] = useState(2500);
  const [currentSpend, setCurrentSpend] = useState(2200);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestBudget = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/budget-guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetLimit, currentSpend }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: 'Test failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <DollarSign size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Infrastructure Cost Guard</span>
          </div>
          <h2 className="section-title">Automated Spending Anomaly Guard</h2>
          <p className="section-desc">
            Prevent unexpected cloud bill spikes with automated background worker throttling.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', marginBottom: '24px' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>Monthly Budget Cap</span>
                <span style={{ color: 'var(--accent-cyan)' }}>${budgetLimit.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="250"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>Simulated Current Spend</span>
                <span style={{ color: currentSpend > budgetLimit * 0.85 ? '#f59e0b' : 'var(--accent-emerald)' }}>
                  ${currentSpend.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={currentSpend}
                onChange={(e) => setCurrentSpend(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
              />
            </div>

          </div>

          <button onClick={handleTestBudget} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '24px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {loading ? 'Evaluating Spend Policy Rules...' : 'Test Spend Anomaly Guard Policy'}
          </button>

          {/* Results Output */}
          <div className="terminal-box">
            <div className="terminal-header">
              <ShieldAlert size={14} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Cost Guard Enforcement Telemetry
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!loading && !result && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Adjust spending sliders and click "Test Spend Anomaly Guard Policy" to verify automated capping.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Evaluating current spend against account budget rules...
                </span>
              )}

              {!loading && result && result.success && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: result.status === 'warning' ? '#f59e0b' : 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {result.status === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                      Budget Usage: {result.usagePercentage}% (${result.currentSpend} / ${result.budgetLimit})
                    </span>

                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', background: result.status === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: result.status === 'warning' ? '#f59e0b' : 'var(--accent-emerald)' }}>
                      STATUS: {result.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Enforcement Action: <strong>{result.actionTaken}</strong>
                  </div>

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Active Policy Rules:
                    <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                      {result.activeRules.map((rule: string, idx: number) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
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
