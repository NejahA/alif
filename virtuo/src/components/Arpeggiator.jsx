import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Repeat, ChevronRight } from 'lucide-react';
import masterBus from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const SCALES = {
  'Major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  'Minor': ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
  'Blues': ['C4', 'Eb4', 'F4', 'Gb4', 'G4', 'Bb4', 'C5'],
  'Phrygian': ['C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
};

export default function Arpeggiator() {
  const isAudioReady = useAudioSafe();
  const [isActive, setIsActive] = useState(false);
  const [pattern, setPattern] = useState('up');
  const [scale, setScale] = useState('Major');
  const [speed, setSpeed] = useState('8n');
  const [octaves, setOctaves] = useState(1);
  const [gate, setGate] = useState(0.8);
  const [swing, setSwing] = useState(0);
  
  const synthRef = useRef(null);
  const patternRef = useRef(null);

  const initSynth = () => {
    if (synthRef.current) return;
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.5 }
    }).connect(masterBus);
  };

  useEffect(() => {
    if (!isAudioReady) return;
    initSynth();
    return () => {
      synthRef.current?.dispose();
      patternRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isAudioReady) return;
    if (patternRef.current) patternRef.current.dispose();

    let notes = SCALES[scale];
    
    // Add octaves
    const multiOctaveNotes = [];
    for (let i = 0; i < octaves; i++) {
      notes.forEach(note => {
        const freq = Tone.Frequency(note).transpose(i * 12);
        multiOctaveNotes.push(freq.toNote());
      });
    }
    
    patternRef.current = new Tone.Pattern((time, note) => {
      synthRef.current.triggerAttackRelease(note, gate === 1 ? speed : `${Math.round(parseFloat(speed) * gate)}n`, time);
    }, multiOctaveNotes, pattern);

    patternRef.current.interval = speed;
    Tone.Transport.swing = swing;

    if (isActive) {
      initSynth();
      patternRef.current.start(0);
      Tone.Transport.start();
    } else {
      patternRef.current.stop();
    }
  }, [isActive, pattern, speed, scale, octaves, gate, swing]);

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
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Scale</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {Object.keys(SCALES).map(s => (
            <button
              key={s}
              className={`btn-glass ${scale === s ? 'active' : ''}`}
              onClick={() => setScale(s)}
              style={{ flex: '1 0 45%', padding: '5px', fontSize: '0.7rem' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Pattern</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {['up', 'down', 'upDown', 'downUp', 'random', 'randomWalk'].map(p => (
            <button
              key={p}
              className={`btn-glass ${pattern === p ? 'active' : ''}`}
              onClick={() => setPattern(p)}
              style={{ flex: '1 0 30%', padding: '5px', fontSize: '0.65rem', textTransform: 'capitalize' }}
            >
              {p.replace(/([A-Z])/g, ' $1')}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Octaves</p>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[1, 2, 3].map(o => (
              <button
                key={o}
                className={`btn-glass ${octaves === o ? 'active' : ''}`}
                onClick={() => setOctaves(o)}
                style={{ flex: 1, padding: '5px', fontSize: '0.7rem' }}
              >
                {o}x
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Gate</p>
          <input 
            type="range" min="0.1" max="1" step="0.1" 
            value={gate} 
            onChange={(e) => setGate(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Swing</p>
            <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{Math.round(swing * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={swing} 
            onChange={(e) => setSwing(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>
    </div>
  );
}
