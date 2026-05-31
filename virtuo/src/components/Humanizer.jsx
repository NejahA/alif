import React, { useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { RefreshCcw, Activity, Music, Clock, Percent } from 'lucide-react';

export default function Humanizer() {
  const [swing, setSwing] = useState(0);
  const [randomVelocity, setRandomVelocity] = useState(0);
  const [timingJitter, setTimingJitter] = useState(0);
  const [grooveTemplate, setGrooveTemplate] = useState('none');

  const applySwing = () => {
    Tone.Transport.swing = swing;
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', { detail: { virtue: 'rhythm', amount: 15 } }));
  };

  const applyRandomize = () => {
    const newSwing = Math.random() * 0.3;
    const newVel = Math.random() * 40;
    const newJitter = Math.random() * 20;
    setSwing(Math.round(newSwing * 100) / 100);
    setRandomVelocity(Math.round(newVel));
    setTimingJitter(Math.round(newJitter));
    Tone.Transport.swing = newSwing;
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', { detail: { virtue: 'rhythm', amount: 25 } }));
  };

  const resetAll = () => {
    setSwing(0);
    setRandomVelocity(0);
    setTimingJitter(0);
    setGrooveTemplate('none');
    Tone.Transport.swing = 0;
  };

  const grooveTemplates = [
    { id: 'none', name: 'None' },
    { id: 'shuffle', name: 'Shuffle' },
    { id: 'swing16', name: '16th Swing' },
    { id: 'funk', name: 'Funk' },
    { id: 'halfTime', name: 'Half-Time Feel' },
    { id: 'latin', name: 'Latin' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Activity size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Humanizer</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span><Clock size={12} /> Swing Amount</span>
          <span>{Math.round(swing * 100)}%</span>
        </div>
        <input type="range" min="0" max="0.5" step="0.01" value={swing} onChange={(e) => { setSwing(Number(e.target.value)); Tone.Transport.swing = Number(e.target.value); }} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div>
        <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '4px' }}>Groove Template</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {grooveTemplates.map(g => (
            <button key={g.id} onClick={() => setGrooveTemplate(g.id)}
              style={{ padding: '3px 10px', borderRadius: '4px', border: `1px solid ${grooveTemplate === g.id ? 'var(--accent-primary)' : 'var(--glass-border)'}`, background: grooveTemplate === g.id ? 'rgba(138,43,226,0.2)' : 'transparent', color: grooveTemplate === g.id ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: '0.6rem', cursor: 'pointer', fontWeight: grooveTemplate === g.id ? 700 : 400 }}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span><Percent size={12} /> Velocity Random</span>
          <span>{randomVelocity}%</span>
        </div>
        <input type="range" min="0" max="100" step="1" value={randomVelocity} onChange={(e) => setRandomVelocity(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Timing Jitter</span>
          <span>±{timingJitter}ms</span>
        </div>
        <input type="range" min="0" max="50" step="1" value={timingJitter} onChange={(e) => setTimingJitter(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-glass" onClick={applySwing} style={{ flex: 1, justifyContent: 'center', fontSize: '0.7rem' }}>
          <Music size={12} /> Apply
        </button>
        <button className="btn-glass" onClick={applyRandomize} style={{ flex: 1, justifyContent: 'center', fontSize: '0.7rem', borderColor: '#f59e0b', color: '#f59e0b' }}>
          <Activity size={12} /> Randomize
        </button>
      </div>

      <button className="btn-glass" onClick={resetAll} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>

      <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: 'center' }}>
        Add swing, random velocity, and timing variations for more natural-sounding performances.
      </div>
    </div>
  );
}
