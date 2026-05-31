import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const PIPES = [
  { note: 'G4' }, { note: 'A4' }, { note: 'B4' }, { note: 'C5' },
  { note: 'D5' }, { note: 'E5' }, { note: 'F#5' }, { note: 'G5' }
];

export default function PanFlute() {
  const [activePipe, setActivePipe] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 2.5, wet: 0.6 }).connect(masterBus);
    
    // Pan flute uses noise and sine waves
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1,
      modulationIndex: 1,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 }
    }).connect(reverbRef.current);

    return () => {
      synthRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const blow = async (note) => {
    await Tone.start();
    if (synthRef.current && note !== activePipe) {
      synthRef.current.triggerAttack(note);
      setActivePipe(note);
    }
  };

  const release = () => {
    if (synthRef.current && activePipe) {
      synthRef.current.triggerRelease(activePipe);
      setActivePipe(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Master Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div 
        style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}
        onMouseLeave={release}
        onMouseUp={release}
      >
        {PIPES.map((p, i) => (
          <div key={p.note} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              onMouseEnter={(e) => { if (e.buttons === 1) blow(p.note); }}
              onMouseDown={() => blow(p.note)}
              style={{
                width: '30px', height: '20px', 
                background: 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                borderTopLeftRadius: '10px', borderTopRightRadius: '10px',
                marginBottom: '5px'
              }}
              title="Click and drag across to blow"
            />
            <motion.div
              animate={{ filter: activePipe === p.note ? 'brightness(1.5)' : 'brightness(1)' }}
              style={{
                width: '26px',
                height: `${200 - (i * 15)}px`,
                background: 'linear-gradient(to right, #b45309, #d97706, #b45309)',
                borderRadius: '5px',
                boxShadow: '2px 0 5px rgba(0,0,0,0.5)',
                border: '1px solid #78350f'
              }}
            />
            <span style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>{p.note}</span>
          </div>
        ))}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag across the top of the pipes to play.</p>
    </div>
  );
}
