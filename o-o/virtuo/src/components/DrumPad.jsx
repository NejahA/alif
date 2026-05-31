import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import masterBus from '../audio/masterBus';

const PADS = [
  { id: 1, name: 'Kick', note: 'C1', color: '#f87171' },
  { id: 2, name: 'Snare', note: 'D1', color: '#60a5fa' },
  { id: 3, name: 'HiHat', note: 'F#1', color: '#34d399' },
  { id: 4, name: 'Open HH', note: 'A#1', color: '#fbbf24' },
  { id: 5, name: 'Clap', note: 'D#1', color: '#a78bfa' },
  { id: 6, name: 'Tom Low', note: 'F1', color: '#f472b6' },
  { id: 7, name: 'Tom Mid', note: 'G1', color: '#fb923c' },
  { id: 8, name: 'Tom High', note: 'A1', color: '#818cf8' },
];

export default function DrumPad() {
  const samplesRef = useRef(null);

  useEffect(() => {
    // We use a Sampler or multiple synths. For simplicity and consistent sound:
    const kick = new Tone.MembraneSynth().connect(masterBus);
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(masterBus);
    const hihat = new Tone.MetalSynth({
      frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
    }).connect(masterBus);

    samplesRef.current = {
      'C1': kick,
      'D1': snare,
      'F#1': hihat,
      'A#1': hihat,
      'D#1': snare,
      'F1': kick,
      'G1': kick,
      'A1': kick,
    };

    return () => {
      Object.values(samplesRef.current).forEach(s => s.dispose());
    };
  }, []);

  const triggerPad = async (note, name) => {
    await Tone.start();
    const synth = samplesRef.current[note];
    if (synth) {
      if (name.includes('Snare') || name.includes('Clap')) {
        synth.triggerAttackRelease('16n');
      } else if (name.includes('HiHat') || name.includes('HH')) {
        synth.triggerAttackRelease('32n');
      } else {
        synth.triggerAttackRelease(note, '8n');
      }
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '15px', 
      width: '100%', 
      maxWidth: '500px',
      padding: '20px'
    }}>
      {PADS.map(pad => (
        <motion.div
          key={pad.id}
          whileTap={{ scale: 0.9, brightness: 1.2 }}
          onMouseDown={() => triggerPad(pad.note, pad.name)}
          style={{
            aspectRatio: '1/1',
            background: 'var(--glass-bg)',
            border: `2px solid ${pad.color}44`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '4px', 
            background: pad.color,
            boxShadow: `0 0 10px ${pad.color}`
          }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: pad.color }}>{pad.name}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pad.note}</span>
        </motion.div>
      ))}
    </div>
  );
}
