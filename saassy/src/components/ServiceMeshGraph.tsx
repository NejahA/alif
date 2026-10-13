'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Activity, CheckCircle2, Server, ArrowRight, RefreshCw } from 'lucide-react';

export default function ServiceMeshGraph() {
  const [meshData, setMeshData] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<string>('gateway');

  const fetchMesh = () => {
    fetch('/api/service-mesh')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMeshData(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMesh();
  }, []);

  const activeSvc = meshData?.services?.find((s: any) => s.id === selectedService) || meshData?.services?.[0];

  return (
    <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Service Mesh Topology</span>
          </div>
          <h2 className="section-title">Microservice RPC & Dependency Graph</h2>
          <p className="section-desc">
            Visualize inter-service gRPC communication channels, latency distribution, and load balance nodes.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mesh Status</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} /> {meshData ? meshData.meshHealth : '100% Operational'}
              </div>
            </div>

            <button onClick={fetchMesh} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Refresh Topology
            </button>
          </div>

          {/* Topology Node Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {meshData?.services?.map((svc: any) => {
              const isSelected = selectedService === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc.id)}
                  style={{
                    background: isSelected ? 'var(--bg-surface)' : '#090d16',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Server size={18} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>● ONLINE</span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{svc.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{svc.rps.toLocaleString()} RPS ({svc.latencyMs}ms)</div>
                </div>
              );
            })}
          </div>

          {/* Node Inspector */}
          {activeSvc && (
            <div style={{ background: '#090d16', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glow)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Selected Node: {activeSvc.name}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Downstream Connected RPC Targets: {activeSvc.downstream.length > 0 ? activeSvc.downstream.join(', ') : 'None (Leaf Node)'}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
