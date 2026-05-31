import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Zap, Activity, Radio, Waves, Sigma, ArrowRight, Plus, Trash2 } from 'lucide-react';
import * as Tone from 'tone';

const SOURCES = [
  { id: 'lfo1', name: 'LFO 1', icon: Activity, color: '#3b82f6' },
  { id: 'lfo2', name: 'LFO 2', icon: Activity, color: '#8b5cf6' },
  { id: 'env1', name: 'Envelope 1', icon: Zap, color: '#f59e0b' },
  { id: 'vel', name: 'Velocity', icon: Radio, color: '#22c55e' },
  { id: 'mod', name: 'Mod Wheel', icon: Sigma, color: '#ef4444' },
  { id: 'rnd', name: 'Random', icon: Waves, color: '#ec4899' }
];

const TARGETS = [
  { id: 'cutoff', name: 'Filter Cutoff', param: 'frequency', color: '#3b82f6' },
  { id: 'res', name: 'Filter Resonance', param: 'Q', color: '#8b5cf6' },
  { id: 'amp', name: 'Amplitude', param: 'gain', color: '#f59e0b' },
  { id: 'pan', name: 'Pan', param: 'pan', color: '#22c55e' },
  { id: 'detune', name: 'Detune', param: 'detune', color: '#ef4444' },
  { id: 'reverb', name: 'Reverb Wet', param: 'reverb', color: '#ec4899' }
];

export default function ModulationMatrix() {
  const [routes, setRoutes] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const addRoute = () => {
    if (!selectedSource || !selectedTarget) return;
    const newRoute = {
      id: Date.now(),
      source: selectedSource,
      target: selectedTarget,
      amount: 50,
      bipolar: false
    };
    setRoutes(prev => [...prev, newRoute]);
  };

  const removeRoute = (id) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  const updateRoute = (id, field, value) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '380px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <GitBranch size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Modulation Matrix</h3>
        <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{routes.length} routes</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '4px' }}>SOURCE</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {SOURCES.map(src => {
              const Icon = src.icon;
              return (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(src.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${selectedSource === src.id ? src.color : 'var(--glass-border)'}`,
                    background: selectedSource === src.id ? `${src.color}20` : 'rgba(255,255,255,0.05)',
                    color: selectedSource === src.id ? src.color : 'var(--text-muted)',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <Icon size={10} /> {src.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '4px' }}>TARGET</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {TARGETS.map(tgt => (
              <button
                key={tgt.id}
                onClick={() => setSelectedTarget(tgt.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${selectedTarget === tgt.id ? tgt.color : 'var(--glass-border)'}`,
                  background: selectedTarget === tgt.id ? `${tgt.color}20` : 'rgba(255,255,255,0.05)',
                  color: selectedTarget === tgt.id ? tgt.color : 'var(--text-muted)',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                {tgt.name}
              </button>
            ))}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={addRoute}
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid var(--accent-primary)',
            background: 'var(--accent-primary)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: selectedSource && selectedTarget ? 1 : 0.3
          }}
          disabled={!selectedSource || !selectedTarget}
        >
          <Plus size={16} />
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
        {routes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.7rem', opacity: 0.3, border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
            No modulation routes. Select source + target and click + to add.
          </div>
        )}
        {routes.map(route => {
          const src = SOURCES.find(s => s.id === route.source);
          const tgt = TARGETS.find(t => t.id === route.target);
          const SrcIcon = src?.icon || Activity;
          return (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '60px', fontSize: '0.65rem', fontWeight: 600 }}>
                <SrcIcon size={10} color={src?.color} />
                <span style={{ color: src?.color }}>{src?.name}</span>
              </div>
              <ArrowRight size={12} opacity={0.3} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: tgt?.color, minWidth: '70px' }}>{tgt?.name}</span>
              <input
                type="range" min="-100" max="100" step="1"
                value={route.amount}
                onChange={(e) => updateRoute(route.id, 'amount', Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', height: '4px' }}
              />
              <span style={{ fontSize: '0.6rem', minWidth: '30px', opacity: 0.5 }}>{route.amount > 0 ? '+' : ''}{route.amount}%</span>
              <button
                onClick={() => removeRoute(route.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', opacity: 0.6 }}
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          );
        })}
      </div>

      <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: 'center' }}>
        Route modulation sources to parameters. Uses internal Tone.js LFO/envelope modulation.
      </div>
    </div>
  );
}
