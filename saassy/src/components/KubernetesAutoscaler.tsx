'use client';

import React, { useState } from 'react';
import { Cpu, Server, Leaf, DollarSign, Activity, Zap, RefreshCw, Layers, Sliders, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface CloudRegion {
  name: string;
  provider: 'AWS' | 'GCP' | 'Azure' | 'Cloudflare';
  latencyMs: number;
  costPerHour: number;
  carbonFootprint: number; // gCO2/kWh
  status: 'OPTIMAL' | 'DEGRADED' | 'STANDBY';
}

export default function KubernetesAutoscaler() {
  const [trafficRps, setTrafficRps] = useState<number>(24500); // Requests per sec
  const [isAutoScaling, setIsAutoScaling] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Dynamic calculations based on traffic RPS
  const podCount = Math.max(3, Math.min(64, Math.ceil(trafficRps / 1200)));
  const cpuUtilization = Math.min(98, Math.max(20, Math.round((trafficRps / (podCount * 1200)) * 75)));
  const memoryUtilization = Math.min(94, Math.max(30, Math.round(cpuUtilization * 0.85)));

  const [regions, setRegions] = useState<CloudRegion[]>([
    { name: 'us-east-1 (N. Virginia)', provider: 'AWS', latencyMs: 14, costPerHour: 1.45, carbonFootprint: 380, status: 'OPTIMAL' },
    { name: 'europe-west1 (Belgium)', provider: 'GCP', latencyMs: 85, costPerHour: 1.28, carbonFootprint: 110, status: 'OPTIMAL' },
    { name: 'asia-east1 (Taiwan)', provider: 'Azure', latencyMs: 142, costPerHour: 1.62, carbonFootprint: 450, status: 'STANDBY' },
    { name: 'global-edge (Workers)', provider: 'Cloudflare', latencyMs: 8, costPerHour: 0.82, carbonFootprint: 65, status: 'OPTIMAL' }
  ]);

  const handleOptimizeFleet = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setRegions(prev => prev.map(r => ({
        ...r,
        costPerHour: Number((r.costPerHour * 0.78).toFixed(2)),
        carbonFootprint: Math.round(r.carbonFootprint * 0.82)
      })));
      setIsOptimizing(false);
    }, 1200);
  };

  const getProviderColor = (provider: CloudRegion['provider']) => {
    switch (provider) {
      case 'AWS': return '#f59e0b';
      case 'GCP': return '#4285F4';
      case 'Azure': return '#0078D4';
      case 'Cloudflare': return '#f97316';
    }
  };

  return (
    <section id="k8s-autoscaler" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}>
            <Server size={16} />
            <span>Autonomous Cloud Orchestration</span>
          </div>
          <h2 className="section-title">
            Kubernetes Pod <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>Autoscaler & Carbon Engine</span>
          </h2>
          <p className="section-desc">
            Simulate real-time traffic surges, watch Kubernetes Horizontal Pod Autoscaler (HPA) provision microservices, and optimize multi-cloud carbon footprint.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Traffic Intensity Control */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} color="#10b981" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Workload Ingress Simulator (RPS)
                </span>
              </div>
              <div style={{ background: '#060911', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>
                ⚡ {trafficRps.toLocaleString()} Requests / sec
              </div>
            </div>

            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={trafficRps}
              onChange={e => setTrafficRps(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>1,000 RPS (Idle Baseline)</span>
              <span>50,000 RPS (Black Friday Spike)</span>
              <span>100,000 RPS (Global Launch Surge)</span>
            </div>
          </div>

          {/* HPA Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ACTIVE POD FLEET</span>
                <Layers size={18} color="#6366f1" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {podCount} Replicas
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                HPA Target: 75% CPU Utilization
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CLUSTER CPU USAGE</span>
                <Cpu size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: cpuUtilization > 85 ? '#ef4444' : '#f59e0b' }}>
                {cpuUtilization}%
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${cpuUtilization}%`, height: '100%', background: cpuUtilization > 85 ? '#ef4444' : '#f59e0b', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ESTIMATED MONTHLY COST</span>
                <DollarSign size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                ${Math.round(podCount * 42.50).toLocaleString()} / mo
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Autoscaled compute efficiency
              </div>
            </div>
          </div>

          {/* Pod Visualizer Matrix */}
          <div style={{ background: '#060911', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} color="#6366f1" /> KUBERNETES NODE TOPOLOGY (NAME: PROD-FRONTEND-DEPLOYMENT)
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
                ● HPA Active (Min: 3 | Max: 64)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {Array.from({ length: podCount }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: '0.65rem',
                    color: '#a5b4fc',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <Server size={14} color="#818cf8" />
                  <span>pod-{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Cloud Carbon & Cost Comparison Table */}
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Leaf size={18} color="#10b981" /> Multi-Cloud Carbon & Cost Routing Engine
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Intelligent workload balancing prioritizing low-carbon energy grids and spot instance pricing.
                </p>
              </div>

              <button
                onClick={handleOptimizeFleet}
                disabled={isOptimizing}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <RefreshCw size={14} className={isOptimizing ? 'spin-icon' : ''} />
                {isOptimizing ? 'Optimizing Fleet...' : 'Optimize Carbon & Cost'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Cloud Region</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Provider</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Latency</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Cost / Hr</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Carbon Footprint</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((reg, idx) => {
                    const pColor = getProviderColor(reg.provider);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>{reg.name}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: `${pColor}22`, color: pColor, fontWeight: 700, fontSize: '0.72rem' }}>
                            {reg.provider}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{reg.latencyMs} ms</td>
                        <td style={{ padding: '12px 10px', fontWeight: 700, color: '#10b981' }}>${reg.costPerHour.toFixed(2)}/hr</td>
                        <td style={{ padding: '12px 10px', color: reg.carbonFootprint < 150 ? '#10b981' : '#f59e0b' }}>
                          🌿 {reg.carbonFootprint} gCO2/kWh
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: reg.status === 'OPTIMAL' ? '#10b981' : 'var(--text-muted)' }}>
                            {reg.status === 'OPTIMAL' ? '✓ OPTIMAL' : 'STANDBY'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
