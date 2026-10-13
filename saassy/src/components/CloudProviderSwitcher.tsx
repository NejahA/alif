'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, DollarSign, RefreshCw, Zap } from 'lucide-react';

export default function CloudProviderSwitcher() {
  const [providerData, setProviderData] = useState<any>(null);
  const [activeProviderId, setActiveProviderId] = useState('aws');

  useEffect(() => {
    fetch('/api/cloud-providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProviderData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Cloud size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Multi-Cloud Cost Arbitrage</span>
          </div>
          <h2 className="section-title">Multi-Cloud Provider Switcher & Cost Arbitrage</h2>
          <p className="section-desc">
            Dynamically route compute workloads across AWS, GCP, Azure, and Vercel Edge for maximum cost efficiency.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Cost Arbitrage Savings</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {providerData ? providerData.monthlySavingsArbitrage : '$1,420 / mo'}
              </div>
            </div>

            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.15)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Active Load Balancer: Multi-Cloud BGP
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {providerData?.providers?.map((p: any) => {
              const isSelected = activeProviderId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProviderId(p.id)}
                  style={{
                    background: isSelected ? 'var(--bg-surface)' : '#090d16',
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Cloud size={20} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    {isSelected && <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />}
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{p.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    {p.costPerMillion} / 1M reqs
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Latency: {p.latencyMs} ({p.regions} Regions)
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
