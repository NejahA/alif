import React, { useState, useEffect } from 'react';
import { Keyboard, Edit2, RotateCcw, Save, Trash2 } from 'lucide-react';

const DEFAULT_MAPPING = {
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5'
};

export default function MidiMapper() {
  const [mapping, setMapping] = useState(() => {
    const saved = localStorage.getItem('virtuo_midi_mapping');
    return saved ? JSON.parse(saved) : DEFAULT_MAPPING;
  });
  const [editingKey, setEditingKey] = useState(null);

  const startEditing = (key) => {
    setEditingKey(key);
    const handleNextKey = (e) => {
      e.preventDefault();
      const newMapping = { ...mapping };
      const oldNote = mapping[key];
      delete newMapping[key];
      newMapping[e.key.toLowerCase()] = oldNote;
      setMapping(newMapping);
      setEditingKey(null);
      window.removeEventListener('keydown', handleNextKey);
    };
    window.addEventListener('keydown', handleNextKey);
  };

  const updateNote = (key, note) => {
    setMapping(prev => ({ ...prev, [key]: note }));
  };

  const resetMapping = () => {
    setMapping(DEFAULT_MAPPING);
    localStorage.removeItem('virtuo_midi_mapping');
  };

  const saveMapping = () => {
    localStorage.setItem('virtuo_midi_mapping', JSON.stringify(mapping));
    // Dispatch event to update global mapping if needed
    window.dispatchEvent(new CustomEvent('virtuo-mapping-updated', { detail: mapping }));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Keyboard size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Keyboard Mapper</h3>
      </div>

      <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
        {Object.entries(mapping).sort().map(([key, note]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
            <div 
              onClick={() => startEditing(key)}
              style={{ 
                width: '30px', 
                height: '30px', 
                background: editingKey === key ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}
            >
              {key.toUpperCase()}
            </div>
            <ArrowRight size={12} opacity={0.3} />
            <select 
              value={note}
              onChange={(e) => updateNote(key, e.target.value)}
              className="btn-glass"
              style={{ flex: 1, fontSize: '0.8rem', padding: '2px 8px' }}
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(n => (
                [3, 4, 5].map(oct => (
                  <option key={`${n}${oct}`} value={`${n}${oct}`}>{n}{oct}</option>
                ))
              ))}
            </select>
            <button className="btn-glass" onClick={() => {
              const newMapping = { ...mapping };
              delete newMapping[key];
              setMapping(newMapping);
            }}>
              <Trash2 size={12} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-glass" onClick={resetMapping} style={{ flex: 1, justifyContent: 'center' }}>
          <RotateCcw size={14} /> Reset
        </button>
        <button className="btn-glass active" onClick={saveMapping} style={{ flex: 1, justifyContent: 'center' }}>
          <Save size={14} /> Save
        </button>
      </div>

      <p style={{ fontSize: '0.65rem', opacity: 0.5, textAlign: 'center' }}>
        Click a key square then press a new key to remap.
      </p>
    </div>
  );
}

function ArrowRight({ size, opacity }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity }}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
