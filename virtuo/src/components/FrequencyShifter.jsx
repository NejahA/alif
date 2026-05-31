import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Zap, RefreshCcw, Activity, Wind } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function FrequencyShifter() {
  const [frequency, setFrequency] = useState(0);
  const [wet, setWet] = useState(0);
  const shifterRef = useRef(null);

  useEffect(() => {
    shifterRef.current = new Tone.FrequencyShifter(0).connect(masterBus);
    return () => {
      shifterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (shifterRef.current) {
      shifterRef.current.frequency.value = frequency;
      shifterRef.current.wet.value = wet;
    }
  }, [frequency, wet]);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Zap size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Frequency Shifter</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.6 }}>
            <span>Shift Amount</span>
            <span>{frequency} Hz</span>
          </div>
          <input 
            type="range" min="-1000" max="1000" step="1" 
            value={frequency} 
            onChange={(e) => setFrequency(Number(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.6 }}>
            <span>Mix (Wet)</span>
            <span>{Math.round(wet * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={wet} 
            onChange={(e) => setWet(Number(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-glass" onClick={() => setFrequency(0)} style={{ flex: 1, justifyContent: 'center' }}>
            <RefreshCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.4, textAlign: 'center' }}>
        Creates non-harmonic frequency shifts for metallic, dissonant, or robotic textures.
      </div>
    </div>
  );
}
