'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Zap, Radio, CheckCircle, RefreshCw, Server, ArrowUpRight } from 'lucide-react';

interface EdgeRegion {
  id: string;
  name: string;
  location: string;
  flag: string;
  latencyMs: number;
  status: 'optimal' | 'good' | 'degraded';
  cacheHitRatio: number;
  ttfbMs: number;
}

export default function EdgePingBenchmark() {
  const [regions, setRegions] = useState<EdgeRegion[]>([
    { id: 'us-east', name: 'N. Virginia (us-east-1)', location: 'USA', flag: '🇺🇸', latencyMs: 12, status: 'optimal', cacheHitRatio: 99.4, ttfbMs: 18 },
    { id: 'eu-west', name: 'Frankfurt (eu-central-1)', location: 'Germany', flag: '🇩🇪', latencyMs: 24, status: 'optimal', cacheHitRatio: 98.8, ttfbMs: 31 },
    { id: 'ap-east', name: 'Tokyo (ap-northeast-1)', location: 'Japan', flag: '🇯🇵', latencyMs: 45, status: 'good', cacheHitRatio: 97.5, ttfbMs: 52 },
    { id: 'sa-east', name: 'São Paulo (sa-east-1)', location: 'Brazil', flag: '🇧🇷', latencyMs: 68, status: 'good', cacheHitRatio: 96.1, ttfbMs: 74 },
    { id: 'ap-south', name: 'Sydney (ap-southeast-2)', location: 'Australia', flag: '🇦🇺', latencyMs: 82, status: 'good', cacheHitRatio: 95.8, ttfbMs: 89 },
    { id: 'af-south', name: 'Johannesburg (af-south-1)', location: 'South Africa', flag: '🇿🇦', latencyMs: 110, status: 'degraded', cacheHitRatio: 92.4, ttfbMs: 125 }
  ]);

  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const runBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      setRegions(prev => prev.map(r => {
        const delta = Math.floor(Math.random() * 10) - 5;
        const newLat = Math.max(8, r.latencyMs + delta);
        return {
          ...r,
          latencyMs: newLat,
          ttfbMs: newLat + Math.floor(Math.random() * 8 + 4),
          status: newLat < 30 ? 'optimal' : newLat < 90 ? 'good' : 'degraded'
        };
      }));
      setIsBenchmarking(false);
    }, 1200);
  };

  const avgLatency = Math.round(regions.reduce((acc, r) => acc + r.latencyMs, 0) / regions.length);
  const avgCacheHit = (regions.reduce((acc, r) => acc + r.cacheHitRatio, 0) / regions.length).toFixed(1);

  return (
    <section id="edge-ping" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Globe size={16} />
            <span>Multi-Region CDN Telemetry</span>
          </div>
          <h2 className="section-title">
            Global Edge Latency & <span className="text-gradient">Ping Benchmark</span>
          </h2>
          <p className="section-desc">
            Benchmark real-time TTFB, DNS resolution, and cache hit ratios across 300+ edge PoPs worldwide.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          {/* Header Action & Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#06b6d4" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Global Avg Latency:</span>
                <span style={{ fontWeight: 800, color: '#06b6d4' }}>{avgLatency} ms</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} color="#10b981" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cache Hit Ratio:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>{avgCacheHit}%</span>
              </div>
            </div>

            <button onClick={runBenchmark} disabled={isBenchmarking} className="btn btn-primary">
              <RefreshCw size={16} className={isBenchmarking ? 'spin' : ''} /> {isBenchmarking ? 'Pinging PoPs...' : 'Run Global Ping Benchmark'}
            </button>
          </div>

          {/* Region Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {regions.map(region => (
              <div
                key={region.id}
                style={{
                  background: '#060911',
                  borderRadius: '14px',
                  border: `1px solid ${region.status === 'optimal' ? 'rgba(16,185,129,0.3)' : region.status === 'good' ? 'rgba(6,182,212,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{region.flag}</span>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{region.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{region.location}</span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: region.status === 'optimal' ? 'rgba(16,185,129,0.15)' : region.status === 'good' ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.15)',
                    color: region.status === 'optimal' ? '#10b981' : region.status === 'good' ? '#06b6d4' : '#ef4444'
                  }}>
                    {region.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Latency</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{region.latencyMs}ms</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TTFB</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#06b6d4' }}>{region.ttfbMs}ms</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Cache Hit</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{region.cacheHitRatio}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
