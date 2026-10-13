'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Zap, Shield, Sparkles, Activity, CheckCircle, Database } from 'lucide-react';

interface HeroProps {
  onOpenDashboard: () => void;
}

export default function Hero({ onOpenDashboard }: HeroProps) {
  const [liveStats, setLiveStats] = useState({
    activeUsers: '142,850',
    requestsProcessed: '4.8B+',
    avgLatency: '14ms',
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLiveStats({
            activeUsers: data.data.activeUsers.toLocaleString(),
            requestsProcessed: data.data.requestsProcessed,
            avgLatency: `${data.data.avgLatencyMs}ms`,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        
        {/* Hero Badge */}
        <div className="hero-badge">
          <span className="badge-dot"></span>
          <span>Saassy v2.4 Released — Next-Gen Autonomous AI Pipelines</span>
          <Sparkles size={14} style={{ color: 'var(--accent-amber)' }} />
        </div>

        {/* Headline */}
        <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', maxWidth: '900px', margin: '0 auto 24px auto' }}>
          Accelerate Engineering Workflows with <span className="text-gradient">Autonomous AI Agents</span>
        </h1>

        {/* Subtitle */}
        <p className="section-desc" style={{ maxWidth: '720px', margin: '0 auto 36px auto', fontSize: '1.2rem' }}>
          Build, deploy, and scale high-performance automated cloud pipelines in seconds. Integrate Next.js, Node APIs, and autonomous micro-agents with zero configuration.
        </p>

        {/* Call to Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          <button onClick={onOpenDashboard} className="btn btn-primary btn-lg">
            Launch SaaS Portal <ArrowRight size={18} />
          </button>
          <a href="#demo" className="btn btn-secondary btn-lg">
            <Play size={18} style={{ fill: 'currentColor' }} /> Explore Playground
          </a>
        </div>

        {/* Realtime Hero Live Window / Graphic */}
        <div className="glass-card" style={{ maxWidth: '980px', margin: '0 auto', padding: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>saassy-cluster-prod // cluster-us-east</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                <Activity size={14} /> LIVE 99.99%
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Box 1 */}
            <div style={{ background: '#0b101d', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Active Developers</span>
                <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{liveStats.activeUsers}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>+24% this week</span>
            </div>

            {/* Box 2 */}
            <div style={{ background: '#0b101d', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Requests Processed</span>
                <Database size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{liveStats.requestsProcessed}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>Sub-millisecond routing</span>
            </div>

            {/* Box 3 */}
            <div style={{ background: '#0b101d', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Average Latency</span>
                <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{liveStats.avgLatency}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>Ultra-fast Global Edge</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
