'use client';

import React, { useState } from 'react';
import { AlertOctagon, Zap, ShieldCheck, Activity, RefreshCw, Flame, Cpu } from 'lucide-react';

interface ComponentHealth {
  name: string;
  type: 'database' | 'api' | 'queue' | 'cache';
  status: 'healthy' | 'degraded' | 'outage';
  latencyMs: number;
  errorRate: number;
}

export default function ChaosEngineSimulator() {
  const [components, setComponents] = useState<ComponentHealth[]>([
    { name: 'Primary Postgres DB Cluster', type: 'database', status: 'healthy', latencyMs: 4, errorRate: 0.001 },
    { name: 'API Gateway & Ingress Router', type: 'api', status: 'healthy', latencyMs: 12, errorRate: 0.005 },
    { name: 'Kafka Event Bus Pipeline', type: 'queue', status: 'healthy', latencyMs: 8, errorRate: 0.002 },
    { name: 'Redis Cache Layer', type: 'cache', status: 'healthy', latencyMs: 2, errorRate: 0.000 }
  ]);

  const [activeChaosEffect, setActiveChaosEffect] = useState<string | null>(null);

  const injectChaos = (type: 'latency' | 'db_crash' | 'packet_loss') => {
    setActiveChaosEffect(type);

    if (type === 'latency') {
      setComponents(prev => prev.map(c => c.type === 'api' ? { ...c, status: 'degraded', latencyMs: 850, errorRate: 4.2 } : c));
    } else if (type === 'db_crash') {
      setComponents(prev => prev.map(c => c.type === 'database' ? { ...c, status: 'outage', latencyMs: 9999, errorRate: 100.0 } : c));
    } else {
      setComponents(prev => prev.map(c => c.type === 'queue' ? { ...c, status: 'degraded', latencyMs: 420, errorRate: 18.5 } : c));
    }

    // Auto heal self-mesh
    setTimeout(() => {
      setComponents([
        { name: 'Primary Postgres DB Cluster', type: 'database', status: 'healthy', latencyMs: 4, errorRate: 0.001 },
        { name: 'API Gateway & Ingress Router', type: 'api', status: 'healthy', latencyMs: 12, errorRate: 0.005 },
        { name: 'Kafka Event Bus Pipeline', type: 'queue', status: 'healthy', latencyMs: 8, errorRate: 0.002 },
        { name: 'Redis Cache Layer', type: 'cache', status: 'healthy', latencyMs: 2, errorRate: 0.000 }
      ]);
      setActiveChaosEffect(null);
    }, 4000);
  };

  return (
    <section id="chaos-engine" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Flame size={16} />
            <span>Chaos Engineering & Fault Injection</span>
          </div>
          <h2 className="section-title">
            Chaos Engineering & <span className="text-gradient">Outage Simulator</span>
          </h2>
          <p className="section-desc">
            Test system resilience under sudden outages, packet drops, and database failovers with self-healing service mesh recovery.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          {/* Action Triggers */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              INJECT CHAOS FAULT VECTOR:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => injectChaos('latency')} disabled={!!activeChaosEffect} className="btn btn-secondary btn-sm" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                ⚡ Spike API Latency (+800ms)
              </button>
              <button onClick={() => injectChaos('db_crash')} disabled={!!activeChaosEffect} className="btn btn-secondary btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                💥 Kill Primary Database
              </button>
              <button onClick={() => injectChaos('packet_loss')} disabled={!!activeChaosEffect} className="btn btn-secondary btn-sm" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
                🌊 Inject 20% Packet Loss
              </button>
            </div>
          </div>

          {/* Component Mesh Health Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {components.map((comp, i) => (
              <div
                key={i}
                style={{
                  background: '#060911',
                  borderRadius: '14px',
                  border: `1px solid ${comp.status === 'healthy' ? 'rgba(16,185,129,0.3)' : comp.status === 'degraded' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.5)'}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{comp.name}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: comp.status === 'healthy' ? 'rgba(16,185,129,0.15)' : comp.status === 'degraded' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: comp.status === 'healthy' ? '#10b981' : comp.status === 'degraded' ? '#f59e0b' : '#ef4444'
                  }}>
                    {comp.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>Latency: <strong>{comp.latencyMs}ms</strong></span>
                  <span>Error Rate: <strong>{comp.errorRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
