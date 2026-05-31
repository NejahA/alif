import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Plug, ArrowRight, Plus, Trash2, Music, Zap, Activity, Disc, Mic, Cloud, Waves } from 'lucide-react';

const SOURCES = [
  { id: 'master', name: 'Master Out', icon: Radio, color: '#8a2be2' },
  { id: 'piano', name: 'Piano', icon: Music, color: '#3b82f6' },
  { id: 'violin', name: 'Violin', icon: Activity, color: '#8b5cf6' },
  { id: 'guitar', name: 'Guitar', icon: Music, color: '#22c55e' },
  { id: 'drums', name: 'Drums', icon: Disc, color: '#ef4444' },
  { id: 'synth', name: 'Synth', icon: Zap, color: '#14b8a6' },
  { id: 'bass', name: 'Bass', icon: Activity, color: '#f59e0b' },
  { id: 'vocal', name: 'Vocal', icon: Mic, color: '#06b6d4' },
  { id: 'sampler', name: 'Sampler', icon: Waves, color: '#ec4899' },
  { id: 'fx', name: 'FX Send', icon: Cloud, color: '#6366f1' }
];

const DESTINATIONS = [
  { id: 'main', name: 'Main Mix', color: '#8a2be2' },
  { id: 'reverb', name: 'Reverb Bus', color: '#3b82f6' },
  { id: 'delay', name: 'Delay Bus', color: '#22c55e' },
  { id: 'sidechain', name: 'Sidechain Bus', color: '#ef4444' },
  { id: 'group1', name: 'Group A', color: '#f59e0b' },
  { id: 'group2', name: 'Group B', color: '#8b5cf6' },
  { id: 'monitor', name: 'Monitor', color: '#ec4899' }
];

export default function PatchBay() {
  const [patches, setPatches] = useState([
    { id: 'p1', source: 'drums', destination: 'main', level: 0 },
    { id: 'p2', source: 'bass', destination: 'main', level: 0 },
    { id: 'p3', source: 'vocal', destination: 'reverb', level: -6 }
  ]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);

  const addPatch = () => {
    if (!selectedSource || !selectedDest) return;
    if (patches.find(p => p.source === selectedSource && p.destination === selectedDest)) return;
    const newPatch = { id: `p${Date.now()}`, source: selectedSource, destination: selectedDest, level: 0 };
    setPatches(prev => [...prev, newPatch]);
  };

  const removePatch = (id) => {
    setPatches(prev => prev.filter(p => p.id !== id));
  };

  const updatePatchLevel = (id, level) => {
    setPatches(prev => prev.map(p => p.id === id ? { ...p, level } : p));
  };

  const getSource = (id) => SOURCES.find(s => s.id === id);
  const getDest = (id) => DESTINATIONS.find(d => d.id === id);

  const connections = [];
  patches.forEach(p => {
    const src = getSource(p.source);
    const dst = getDest(p.destination);
    if (src && dst) {
      connections.push({ id: p.id, from: src, to: dst, level: p.level, sourceId: p.source, destId: p.destination });
    }
  });

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '380px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Radio size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Patch Bay</h3>
        <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{patches.length} cables</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '4px' }}>SOURCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {SOURCES.map(src => {
              const Icon = src.icon;
              const isUsed = patches.some(p => p.source === src.id);
              return (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(src.id)}
                  style={{
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: `1px solid ${selectedSource === src.id ? src.color : 'var(--glass-border)'}`,
                    background: selectedSource === src.id ? `${src.color}20` : 'transparent',
                    color: selectedSource === src.id ? src.color : 'var(--text-muted)',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: isUsed ? 0.4 : 1
                  }}
                >
                  <Icon size={10} /> {src.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
          <ArrowRight size={16} opacity={0.3} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '4px' }}>DESTINATION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {DESTINATIONS.map(dst => (
              <button
                key={dst.id}
                onClick={() => setSelectedDest(dst.id)}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${selectedDest === dst.id ? dst.color : 'var(--glass-border)'}`,
                  background: selectedDest === dst.id ? `${dst.color}20` : 'transparent',
                  color: selectedDest === dst.id ? dst.color : 'var(--text-muted)',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {dst.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={addPatch}
        disabled={!selectedSource || !selectedDest}
        style={{
          padding: '6px',
          borderRadius: '6px',
          border: '1px solid var(--accent-primary)',
          background: selectedSource && selectedDest ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
          color: 'white',
          cursor: selectedSource && selectedDest ? 'pointer' : 'not-allowed',
          opacity: selectedSource && selectedDest ? 1 : 0.3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.7rem',
          fontWeight: 600
        }}
      >
        <Plus size={14} /> Patch Connection
      </motion.button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
        <AnimatePresence>
          {connections.map(conn => (
            <motion.div
              key={conn.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              style={{
                padding: '6px 10px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: conn.from.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: conn.from.color, minWidth: '50px' }}>{conn.from.name}</span>
              <ArrowRight size={10} opacity={0.3} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: conn.to.color, minWidth: '50px' }}>{conn.to.name}</span>
              <input
                type="range" min="-30" max="6" step="1"
                value={conn.level}
                onChange={(e) => updatePatchLevel(conn.id, Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', height: '3px' }}
              />
              <span style={{ fontSize: '0.55rem', opacity: 0.5, minWidth: '24px' }}>{conn.level > 0 ? '+' : ''}{conn.level}dB</span>
              <button onClick={() => removePatch(conn.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', opacity: 0.5 }}>
                <Trash2 size={10} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {patches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '15px', fontSize: '0.65rem', opacity: 0.3, border: '1px dashed var(--glass-border)', borderRadius: '6px' }}>
            No patch connections. Route sources to destinations.
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: 'center' }}>
        Virtual patch bay for routing audio between sources and buses.
      </div>
    </div>
  );
}
