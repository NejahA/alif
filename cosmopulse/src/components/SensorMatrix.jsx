import React, { useState, useEffect } from 'react';
import { Radio, Crosshair, Wifi, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SensorMatrix({ isStreaming, onLogMessage }) {
  const [nodes, setNodes] = useState([
    { id: 'ALPHA-01', sector: 'Sector 7', lat: '14.2° N', status: 'ACTIVE', latency: 8.4, signal: 99 },
    { id: 'ORION-09', sector: 'Sector 4', lat: '32.8° S', status: 'ACTIVE', latency: 12.1, signal: 94 },
    { id: 'NEBULA-X', sector: 'Sector 12', lat: '04.1° E', status: 'SYNCING', latency: 24.5, signal: 82 },
    { id: 'TITAN-03', sector: 'Sector 2', lat: '88.3° N', status: 'ACTIVE', latency: 9.8, signal: 98 },
    { id: 'PULSAR-5', sector: 'Sector 9', lat: '45.0° W', status: 'CALIBRATING', latency: 19.2, signal: 88 },
    { id: 'HELIOS-2', sector: 'Sector 1', lat: '12.4° S', status: 'ACTIVE', latency: 7.2, signal: 100 },
  ]);

  const [selectedNode, setSelectedNode] = useState(nodes[0]);
  const [pingingId, setPingingId] = useState(null);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          latency: parseFloat((node.latency + (Math.random() - 0.5) * 1.5).toFixed(1)),
          signal: Math.min(100, Math.max(70, Math.floor(node.signal + (Math.random() - 0.5) * 4))),
        }))
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const triggerPing = (node) => {
    setPingingId(node.id);
    if (onLogMessage) {
      onLogMessage('SIGNAL', `Diagnostic telemetry ping dispatched to node [${node.id}] in ${node.sector}`);
    }
    setTimeout(() => {
      setPingingId(null);
    }, 1000);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <Crosshair style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Orbital Sensor Grid</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Deep-Space Satellite Mesh</p>
          </div>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
          6/6 ONLINE
        </span>
      </div>

      {/* Nodes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isPinging = pingingId === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{
                background: isSelected ? 'rgba(139, 92, 246, 0.25)' : 'rgba(0, 0, 0, 0.3)',
                border: isSelected ? '1px solid var(--accent-violet)' : '1px solid var(--border-glass)',
                borderRadius: '12px',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isSelected ? 'var(--glow-violet)' : 'none'
              }}
            >
              {isPinging && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(6, 182, 212, 0.3)',
                    animation: 'ping-flash 0.8s ease-out',
                  }}
                />
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {node.id}
                </span>
                <span className={`pulse-indicator ${node.status === 'ACTIVE' ? '' : 'warning'}`} />
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{node.sector}</div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{node.latency}ms</span>
                <span style={{ color: 'var(--text-secondary)' }}>{node.signal}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Control & Details Panel */}
      {selectedNode && (
        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-glass)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wifi style={{ width: '16px', height: '16px', color: 'var(--accent-cyan)' }} />
              <strong style={{ fontSize: '0.85rem' }}>{selectedNode.id} Detailed Telemetry</strong>
            </div>
            <button
              onClick={() => triggerPing(selectedNode)}
              className="btn-cosmo-outline"
              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
            >
              PING SIGNAL
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Coordinates</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{selectedNode.lat}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Status</div>
              <div style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>{selectedNode.status}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Signal Strength</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{selectedNode.signal}%</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
