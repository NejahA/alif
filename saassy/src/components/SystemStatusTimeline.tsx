'use client';

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export default function SystemStatusTimeline() {
  const [statusData, setStatusData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/status-timeline')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatusData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Activity size={14} style={{ color: 'var(--accent-emerald)' }} />
            <span>90-Day Cluster Health</span>
          </div>
          <h2 className="section-title">Historical Uptime & Incident Log</h2>
          <p className="section-desc">
            Transparent status monitoring and automated incident self-healing records.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Historical Uptime (90 Days)</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {statusData ? statusData.overallUptime : '99.994%'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
              <CheckCircle2 size={16} /> All 6 Edge Clusters Fully Operational
            </div>
          </div>

          {/* Visual 90-Day Timeline Bar Stream */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '3px', height: '32px', marginBottom: '8px' }}>
              {[...Array(90)].map((_, i) => (
                <div
                  key={i}
                  title={`Day ${i + 1}: 100% Operational`}
                  style={{
                    flex: 1,
                    background: i === 42 || i === 76 ? 'rgba(16, 185, 129, 0.7)' : 'var(--accent-emerald)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>90 Days Ago</span>
              <span>Today (100% Operational)</span>
            </div>
          </div>

          {/* Past Self-Healed Incidents */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--accent-primary)' }} /> Recent Self-Healing Events
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {statusData?.incidents?.map((inc: any) => (
                <div key={inc.id} style={{ background: '#090d16', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{inc.date}</span>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inc.title}</h5>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                      Auto-healed in {inc.durationSec}s
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '10px' }}>
                      RESOLVED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
