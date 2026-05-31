import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Zap, Activity, Waves, RefreshCcw, Radio } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function AutoFilter() {
  const [frequency, setFrequency] = useState(1000);
  const [depth, setDepth] = useState(0.7);
  const [rate, setRate] = useState(2);
  const [resonance, setResonance] = useState(2);
  const [type, setType] = useState('lowpass');
  const [isActive, setIsActive] = useState(true);
  const [lfoFreq, setLfoFreq] = useState(2);
  const autoFilterRef = useRef(null);

  useEffect(() => {
    if (!autoFilterRef.current) {
      autoFilterRef.current = new Tone.AutoFilter({
        frequency: lfoFreq,
        depth,
        baseFrequency: frequency,
        type: 'sine'
      }).connect(masterBus);
      autoFilterRef.current.filter.type = type;
      autoFilterRef.current.filter.Q.value = resonance;
    }
    return () => autoFilterRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!autoFilterRef.current) return;
    autoFilterRef.current.wet.rampTo(isActive ? 1 : 0, 0.1);
  }, [isActive]);

  useEffect(() => {
    if (!autoFilterRef.current) return;
    autoFilterRef.current.frequency.value = lfoFreq;
    autoFilterRef.current.depth = depth;
    autoFilterRef.current.baseFrequency = frequency;
    autoFilterRef.current.filter.Q.value = resonance;
    autoFilterRef.current.filter.type = type;
  }, [lfoFreq, depth, frequency, resonance, type]);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Activity size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Auto Filter</h3>
        <button onClick={() => setIsActive(!isActive)}
          style={{ padding: '4px 12px', borderRadius: '12px', border: 'none', background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)', color: isActive ? 'white' : 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '5px' }}>
        {['lowpass', 'highpass', 'bandpass', 'notch'].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: `1px solid ${type === t ? 'var(--accent-primary)' : 'var(--glass-border)'}`, background: type === t ? 'rgba(138,43,226,0.2)' : 'transparent', color: type === t ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: '0.55rem', cursor: 'pointer', fontWeight: type === t ? 700 : 400, textTransform: 'capitalize', flex: 1 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Base Frequency</span>
          <span>{frequency} Hz</span>
        </div>
        <input type="range" min="20" max="8000" step="10" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Depth</span>
          <span>{Math.round(depth * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={depth} onChange={(e) => setDepth(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>LFO Rate</span>
          <input type="range" min="0.1" max="20" step="0.1" value={lfoFreq} onChange={(e) => setLfoFreq(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{lfoFreq.toFixed(1)} Hz</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Resonance</span>
          <input type="range" min="0" max="20" step="0.5" value={resonance} onChange={(e) => setResonance(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{resonance.toFixed(1)}</span>
        </div>
      </div>

      <button className="btn-glass" onClick={() => { setFrequency(1000); setDepth(0.7); setLfoFreq(2); setResonance(2); }} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>
    </div>
  );
}
