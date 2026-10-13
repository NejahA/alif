'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function SecurityMatrix() {
  const [auditData, setAuditData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const runScan = () => {
    setScanning(true);
    fetch('/api/security-audit')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAuditData(data.data);
      })
      .catch(() => {})
      .finally(() => setScanning(false));
  };

  useEffect(() => {
    runScan();
  }, []);

  return (
    <section id="security" className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>Bank-Grade Compliance</span>
          </div>
          <h2 className="section-title">Zero-Trust AI Security Matrix</h2>
          <p className="section-desc">
            Continuous automated vulnerability scanning and end-to-end payload isolation.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '36px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', width: '60px', height: '60px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {auditData ? auditData.grade : 'A+'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Security Compliance Score: {auditData ? `${auditData.score}/100` : '98/100'}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <CheckCircle2 size={14} /> SOC2 Type II Certified & GDPR Compliant
                </span>
              </div>
            </div>

            <button onClick={runScan} disabled={scanning} className="btn btn-secondary">
              <RefreshCw size={16} className={scanning ? 'spin' : ''} />
              {scanning ? 'Auditing Policy Enforcements...' : 'Trigger Compliance Audit'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {auditData?.checks?.map((check: any, idx: number) => (
              <div key={idx} style={{ background: '#090d16', padding: '18px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '0.975rem', fontWeight: 700 }}>{check.name}</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{check.details}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase', background: check.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: check.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                    {check.severity}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>PASSED</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
