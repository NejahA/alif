import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Settings, Timer, Music } from 'lucide-react';

export default function SessionSettings() {
  const [bpm, setBpm] = useState(120);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Session</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Timer size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem' }}>Tempo</span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{bpm} BPM</span>
        </div>
        <input 
          type="range" min="40" max="240" step="1" 
          value={bpm} 
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
      </div>

      <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Global BPM syncs the Metronome, Sequencer, and Arpeggiator.
      </p>
    </div>
  );
}
