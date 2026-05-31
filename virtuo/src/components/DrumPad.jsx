import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const PADS = [
  { id: 1, name: 'Kick', note: 'C1', color: '#f87171', key: '1' },
  { id: 2, name: 'Snare', note: 'D1', color: '#60a5fa', key: '2' },
  { id: 3, name: 'HiHat', note: 'F#1', color: '#34d399', key: '3' },
  { id: 4, name: 'Open HH', note: 'A#1', color: '#fbbf24', key: '4' },
  { id: 5, name: 'Clap', note: 'D#1', color: '#a78bfa', key: '5' },
  { id: 6, name: 'Tom Low', note: 'F1', color: '#f472b6', key: '6' },
  { id: 7, name: 'Tom Mid', note: 'G1', color: '#fb923c', key: '7' },
  { id: 8, name: 'Tom High', note: 'A1', color: '#818cf8', key: '8' },
];

export default function DrumPad() {
  const isAudioReady = useAudioSafe();
  const samplesRef = useRef(null);
  const [activePad, setActivePad] = React.useState(null);

  useEffect(() => {
    if (!isAudioReady) return;
    // Drum Synthesizers
    const kick = new Tone.MembraneSynth().connect(getChannel('pads'));
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(getChannel('pads'));
    const hihat = new Tone.MetalSynth({
      frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
    }).connect(getChannel('pads'));

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

    const handleKeyDown = (e) => {
      const pad = PADS.find(p => p.key === e.key);
      if (pad) {
        triggerPad(pad.note, pad.name, pad.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      Object.values(samplesRef.current).forEach(s => s.dispose());
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const triggerPad = async (note, name, id) => {
    await Tone.start();
    const synth = samplesRef.current[note];
    if (synth) {
      setActivePad(id);
      setTimeout(() => setActivePad(null), 100);
      
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
          whileTap={{ scale: 0.95 }}
          animate={{
            backgroundColor: activePad === pad.id ? `${pad.color}44` : 'var(--glass-bg)',
            borderColor: activePad === pad.id ? pad.color : `${pad.color}44`,
            boxShadow: activePad === pad.id ? `0 0 20px ${pad.color}44` : 'none'
          }}
          onMouseDown={() => triggerPad(pad.note, pad.name, pad.id)}
          style={{
            aspectRatio: '1/1',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.1s ease',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid'
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
          <span style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>{pad.key}</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: pad.color }}>{pad.name}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pad.note}</span>
        </motion.div>
      ))}
    </div>
  );
}
