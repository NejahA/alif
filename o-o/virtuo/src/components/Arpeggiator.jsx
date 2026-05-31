import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Repeat, ChevronRight } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Arpeggiator() {
  const [isActive, setIsActive] = useState(false);
  const [pattern, setPattern] = useState('up');
  const [octaves, setOctaves] = useState(1);
  const [speed, setSpeed] = useState('8n');
  
  const synthRef = useRef(null);
  const patternRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.5 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
      patternRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (patternRef.current) patternRef.current.dispose();

    const notes = pattern === 'up' ? ['C4', 'E4', 'G4', 'B4'] : ['B4', 'G4', 'E4', 'C4'];
    
    patternRef.current = new Tone.Pattern((time, note) => {
      synthRef.current.triggerAttackRelease(note, '16n', time);
    }, notes, pattern);

    patternRef.current.interval = speed;

    if (isActive) {
      patternRef.current.start(0);
      Tone.Transport.start();
    } else {
      patternRef.current.stop();
    }
  }, [isActive, pattern, speed]);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Repeat size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Arpeggiator</h3>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => setIsActive(!isActive)}
          style={{ padding: '5px 15px', fontSize: '0.8rem' }}
        >
          {isActive ? 'Stop' : 'Start'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Pattern</p>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['up', 'down', 'upDown', 'random'].map(p => (
            <button
              key={p}
              className={`btn-glass ${pattern === p ? 'active' : ''}`}
              onClick={() => setPattern(p)}
              style={{ flex: 1, padding: '5px', fontSize: '0.7rem', textTransform: 'capitalize' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Speed</p>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['4n', '8n', '16n', '32n'].map(s => (
            <button
              key={s}
              className={`btn-glass ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
              style={{ flex: 1, padding: '5px', fontSize: '0.7rem' }}
            >
              {s.replace('n', 'th')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
