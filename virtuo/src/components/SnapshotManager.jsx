import React, { useState, useEffect } from 'react';
import { Camera, Save, Trash2, RotateCcw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SnapshotManager() {
  const [snapshots, setSnapshots] = useState(() => {
    const saved = localStorage.getItem('virtuo_snapshots');
    return saved ? JSON.parse(saved) : [];
  });

  const takeSnapshot = () => {
    const name = prompt("Enter snapshot name:", `Snapshot ${snapshots.length + 1}`);
    if (!name) return;

    // Capture essential state from various sources
    const snapshot = {
      id: Date.now(),
      name,
      timestamp: new Date().toLocaleString(),
      data: {
        mixer: JSON.parse(localStorage.getItem('virtuo_mixer_volumes') || '{}'),
        pans: JSON.parse(localStorage.getItem('virtuo_mixer_pans') || '{}'),
        theme: JSON.parse(localStorage.getItem('virtuo_advanced_theme') || '{}'),
        activeTab: document.querySelector('[data-active-tab]')?.getAttribute('data-active-tab') || 'piano'
      }
    };

    const updated = [snapshot, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem('virtuo_snapshots', JSON.stringify(updated));
  };

  const loadSnapshot = (snapshot) => {
    // Apply state
    if (snapshot.data.mixer) localStorage.setItem('virtuo_mixer_volumes', JSON.stringify(snapshot.data.mixer));
    if (snapshot.data.pans) localStorage.setItem('virtuo_mixer_pans', JSON.stringify(snapshot.data.pans));
    if (snapshot.data.theme) localStorage.setItem('virtuo_advanced_theme', JSON.stringify(snapshot.data.theme));
    
    // Trigger global reload of these states
    window.location.reload(); 
  };

  const deleteSnapshot = (id) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem('virtuo_snapshots', JSON.stringify(updated));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Camera size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Snapshots</h3>
        </div>
        <button className="btn-glass active" onClick={takeSnapshot} title="Take Snapshot">
          <Save size={16} />
        </button>
      </div>

      <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
        <AnimatePresence>
          {snapshots.map(s => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              key={s.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                background: 'rgba(255,255,255,0.05)', 
                padding: '10px', 
                borderRadius: '8px',
                border: '1px solid var(--glass-border)'
              }}
            >
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => loadSnapshot(s)}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={10} /> {s.timestamp}
                </div>
              </div>
              <button 
                onClick={() => deleteSnapshot(s.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {snapshots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', opacity: 0.3, fontSize: '0.8rem' }}>
            No snapshots yet. Capture your current setup!
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.4, textAlign: 'center' }}>
        Snapshots store mixer levels, pans, and theme settings.
      </div>
    </div>
  );
}
