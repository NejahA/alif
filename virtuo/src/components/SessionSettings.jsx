import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Settings, Timer, Music, Activity, ArrowUpCircle, Wind, Sliders } from 'lucide-react';
import { setSwing, setMasterFilterFreq } from '../audio/masterBus';

export default function SessionSettings() {
  const [bpm, setBpm] = useState(120);
  const [lastTap, setLastTap] = useState(0);
  const [transpose, setTranspose] = useState(0);
  const [swing, setSwingState] = useState(0);
  const [masterFilter, setMasterFilter] = useState(20000);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const handleSwingChange = (val) => {
    setSwingState(val);
    setSwing(val);
  };

  const handleFilterChange = (val) => {
    setMasterFilter(val);
    setMasterFilterFreq(val);
  };

  useEffect(() => {
    // Custom event to notify all instruments of global transpose change
    window.dispatchEvent(new CustomEvent('virtuo-transpose', { detail: { transpose } }));
  }, [transpose]);

  const handleTap = () => {
    const now = Date.now();
    if (lastTap > 0) {
      const diff = now - lastTap;
      if (diff < 2000) { // Only count if within 2 seconds
        const newBpm = Math.round(60000 / diff);
        if (newBpm >= 40 && newBpm <= 240) {
          setBpm(newBpm);
        }
      }
    }
    setLastTap(now);
  };

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
        <button 
          className="btn-glass" 
          onClick={handleTap}
          style={{ width: '100%', fontSize: '0.75rem', padding: '5px' }}
        >
          <Activity size={14} /> Tap Tempo
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowUpCircle size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem' }}>Transpose</span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{transpose > 0 ? `+${transpose}` : transpose}</span>
        </div>
        <input 
          type="range" min="-12" max="12" step="1" 
          value={transpose} 
          onChange={(e) => setTranspose(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sliders size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem' }}>Global Swing</span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{Math.round(swing * 100)}%</span>
        </div>
        <input 
          type="range" min="0" max="1" step="0.01" 
          value={swing} 
          onChange={(e) => handleSwingChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Wind size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem' }}>Master Sweep</span>
          </div>
        </div>
        <input 
          type="range" min="100" max="20000" step="1" 
          value={masterFilter} 
          onChange={(e) => handleFilterChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
      </div>

      <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Global BPM syncs the Metronome, Sequencer, and Arpeggiator.
      </p>
    </div>
  );
}
