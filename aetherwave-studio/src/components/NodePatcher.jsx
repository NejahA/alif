import React, { useState } from 'react';
import { Cpu, Link, Zap, Radio, Check, RefreshCw } from 'lucide-react';

export const NodePatcher = ({ isOpen, onClose }) => {
  const [nodes, setNodes] = useState([
    { id: 'osc1', name: 'Multi-Oscillator Synth', type: 'Source', x: 40, y: 80, color: '#8b5cf6' },
    { id: 'lfo1', name: 'LFO Pulse Generator', type: 'Modulator', x: 40, y: 220, color: '#ec4899' },
    { id: 'filter1', name: 'Lowpass Biquad Filter', type: 'Effect', x: 260, y: 120, color: '#06b6d4' },
    { id: 'delay1', name: 'Feedback Echo Delay', type: 'Effect', x: 480, y: 80, color: '#f59e0b' },
    { id: 'reverb1', name: 'Space Reverb Impulse', type: 'Effect', x: 480, y: 220, color: '#10b981' },
    { id: 'master', name: 'Master Analyser Output', type: 'Destination', x: 700, y: 150, color: '#3b82f6' }
  ]);

  const [connections, setConnections] = useState([
    { from: 'osc1', to: 'filter1' },
    { from: 'lfo1', to: 'filter1' },
    { from: 'filter1', to: 'delay1' },
    { from: 'filter1', to: 'reverb1' },
    { from: 'delay1', to: 'master' },
    { from: 'reverb1', to: 'master' }
  ]);

  const [selectedNode, setSelectedNode] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '940px',
      height: '480px',
      zIndex: 50,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={20} color="var(--accent-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff' }}>
            Interactive Audio Signal Node Graph
          </h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {/* Interactive Node Graph Canvas */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'rgba(5, 7, 18, 0.85)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden'
      }}>
        {/* SVG Cable Wires */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {connections.map((c, i) => {
            const n1 = nodes.find(n => n.id === c.from);
            const n2 = nodes.find(n => n.id === c.to);
            if (!n1 || !n2) return null;

            const x1 = n1.x + 160;
            const y1 = n1.y + 35;
            const x2 = n2.x;
            const y2 = n2.y + 35;
            const dx = (x2 - x1) / 2;

            return (
              <g key={i}>
                {/* Glow cable */}
                <path
                  d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={n1.color}
                  strokeWidth="3"
                  strokeOpacity="0.75"
                />
                {/* Animated signal dot */}
                <circle r="4" fill="#fff">
                  <animateMotion
                    path={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Audio Node Blocks */}
        {nodes.map(n => (
          <div
            key={n.id}
            onClick={() => setSelectedNode(n.id)}
            style={{
              position: 'absolute',
              left: `${n.x}px`,
              top: `${n.y}px`,
              width: '160px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: selectedNode === n.id ? 'rgba(255,255,255,0.18)' : 'rgba(18, 22, 41, 0.9)',
              border: `1.5px solid ${n.color}`,
              boxShadow: selectedNode === n.id ? `0 0 20px ${n.color}` : '0 4px 15px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              userSelect: 'none',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: n.color, fontFamily: 'var(--font-mono)' }}>
                {n.type}
              </span>
              <Radio size={12} color={n.color} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{n.name}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>⚡ Signal wires process low-latency audio & modulation data in real-time</span>
        <button onClick={() => setConnections([...connections])} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RefreshCw size={12} /> Reset Graph Connections
        </button>
      </div>
    </div>
  );
};
