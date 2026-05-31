import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { VolumeX, Volume2, RefreshCcw, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function NoiseGate() {
  const [threshold, setThreshold] = useState(-40);
  const [attack, setAttack] = useState(0.01);
  const [release, setRelease] = useState(0.1);
  const [hold, setHold] = useState(0.05);
  const [ratio, setRatio] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const gateRef = useRef(null);

  useEffect(() => {
    gateRef.current = new Tone.Gate(threshold, 0.01).connect(masterBus);
    return () => gateRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!gateRef.current) return;
    gateRef.current.threshold = threshold;
    gateRef.current.smoothing = attack;
  }, [threshold, attack]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gateRef.current) {
        setIsOpen(Math.random() > 0.3);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <VolumeX size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Noise Gate</h3>
        <button onClick={() => setIsActive(!isActive)}
          style={{ padding: '4px 12px', borderRadius: '12px', border: 'none', background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)', color: isActive ? 'white' : 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
        <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', left: `${((threshold + 60) / 60) * 100}%`, top: '-4px', width: '4px', height: '16px', background: 'white', borderRadius: '2px', boxShadow: '0 0 6px rgba(255,255,255,0.5)' }} />
        </div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: isOpen ? '#22c55e' : '#ef4444' }}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Threshold</span>
          <span>{threshold} dB</span>
        </div>
        <input type="range" min="-80" max="-10" step="1" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Ratio</span>
          <span>{ratio}:1</span>
        </div>
        <input type="range" min="2" max="20" step="1" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Attack</span>
          <input type="range" min="0.001" max="0.1" step="0.001" value={attack} onChange={(e) => setAttack(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{(attack * 1000).toFixed(0)}ms</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Hold</span>
          <input type="range" min="0.01" max="0.5" step="0.01" value={hold} onChange={(e) => setHold(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{(hold * 1000).toFixed(0)}ms</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Release</span>
          <input type="range" min="0.01" max="1" step="0.01" value={release} onChange={(e) => setRelease(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{(release * 1000).toFixed(0)}ms</span>
        </div>
      </div>

      <button className="btn-glass" onClick={() => { setThreshold(-40); setAttack(0.01); setRelease(0.1); setHold(0.05); setRatio(10); }} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>
    </div>
  );
}
