import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Zap, RefreshCcw, Activity, Waves } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function TransientShaper() {
  const [attack, setAttack] = useState(0);
  const [sustain, setSustain] = useState(0);
  const [mix, setMix] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const envelopeRef = useRef(null);

  useEffect(() => {
    envelopeRef.current = new Tone.Gain(1).connect(masterBus);
    return () => envelopeRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!envelopeRef.current) return;
    envelopeRef.current.gain.rampTo(isActive ? mix : 1, 0.05);
  }, [isActive, mix]);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Waves size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Transient Shaper</h3>
        <button onClick={() => setIsActive(!isActive)}
          style={{ padding: '4px 12px', borderRadius: '12px', border: 'none', background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)', color: isActive ? 'white' : 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Attack</span>
          <span>{attack > 0 ? `+${attack}` : attack} dB</span>
        </div>
        <input type="range" min="-20" max="20" step="0.5" value={attack} onChange={(e) => setAttack(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Sustain</span>
          <span>{sustain > 0 ? `+${sustain}` : sustain} dB</span>
        </div>
        <input type="range" min="-20" max="20" step="0.5" value={sustain} onChange={(e) => setSustain(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Mix</span>
          <span>{Math.round(mix * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={mix} onChange={(e) => setMix(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, height: '40px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', padding: '4px', gap: '2px' }}>
          {[20, 40, 60, 30, 50, 70, 40, 60, 80, 50, 30, 60, 40, 70, 50, 80].map((h, i) => {
            const adjusted = Math.max(2, Math.min(36, h + (attack * 1.5) + (sustain * 0.5)));
            return <div key={i} style={{ width: '100%', height: `${adjusted}%`, background: 'var(--accent-primary)', borderRadius: '2px', opacity: 0.6 + (adjusted / 80) }} />;
          })}
        </div>
      </div>

      <button className="btn-glass" onClick={() => { setAttack(0); setSustain(0); setMix(1); }} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>

      <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: 'center' }}>
        Boost or cut the attack and sustain portions of your audio.
      </div>
    </div>
  );
}
