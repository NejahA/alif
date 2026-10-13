'use client';

import React, { useState } from 'react';
import { Globe, Server, CheckCircle2, Play, Radio, Loader2, ArrowRight } from 'lucide-react';

export default function EdgeRegionDeployer() {
  const [selectedRegion, setSelectedRegion] = useState('us-east-1');
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);

  const regionList = [
    { code: 'us-east-1', name: 'N. Virginia (us-east-1)', location: 'North America' },
    { code: 'eu-central-1', name: 'Frankfurt (eu-central-1)', location: 'Europe' },
    { code: 'ap-northeast-1', name: 'Tokyo (ap-northeast-1)', location: 'Asia Pacific' },
    { code: 'sa-east-1', name: 'São Paulo (sa-east-1)', location: 'South America' },
    { code: 'ap-southeast-1', name: 'Singapore (ap-southeast-1)', location: 'Southeast Asia' },
  ];

  const handleDeployRegion = async () => {
    setDeploying(true);
    setDeployResult(null);

    try {
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionCode: selectedRegion, action: 'deploy' }),
      });
      const data = await res.json();
      setDeployResult(data);
    } catch (err) {
      setDeployResult({ success: false, error: 'Deployment failed.' });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <section id="regions" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Server size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Edge Cluster Distribution</span>
          </div>
          <h2 className="section-title">Deploy Regional Infrastructure Nodes</h2>
          <p className="section-desc">
            Instantly propagate Next.js API micro-agents to strategic edge locations worldwide.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Select Target Deployment Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#090d16',
                  border: '1px solid var(--border-glow)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              >
                {regionList.map((r) => (
                  <option key={r.code} value={r.code}>{r.name} — {r.location}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handleDeployRegion} disabled={deploying} className="btn btn-primary" style={{ width: '100%', height: '46px' }}>
                {deploying ? <Loader2 size={16} className="spin" /> : <Server size={16} />}
                {deploying ? 'Propagating Cluster...' : 'Deploy Regional Node'}
              </button>
            </div>
          </div>

          {/* Deployment Inspector Output */}
          <div className="terminal-box">
            <div className="terminal-header">
              <Radio size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Edge DNS & Deployment Telemetry
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!deploying && !deployResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Select a region and click "Deploy Regional Node" to test global DNS propagation.
                </span>
              )}

              {deploying && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Deploying micro-container to {selectedRegion} edge network...
                </span>
              )}

              {!deploying && deployResult && deployResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ Node Active — Deployment ID: {deployResult.deploymentId}
                  </div>
                  <div style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>
                    DNS Anycast Endpoint: <span style={{ color: 'var(--accent-cyan)' }}>{deployResult.dnsRecord}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Global Anycast Propagation Time: {deployResult.propagationTimeMs}ms
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
