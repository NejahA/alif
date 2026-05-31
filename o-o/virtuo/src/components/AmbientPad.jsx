import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Cloud, Wind, Sun } from 'lucide-react';
import masterBus from '../audio/masterBus';

const PAD_CHORDS = [
  { name: 'C Maj', notes: ['C3', 'E3', 'G3', 'B3'] },
  { name: 'A Min', notes: ['A2', 'C3', 'E3', 'G3'] },
  { name: 'F Maj', notes: ['F2', 'A2', 'C3', 'E3'] },
  { name: 'G Maj', notes: ['G2', 'B2', 'D3', 'F3'] },
  { name: 'D Min', notes: ['D2', 'F2', 'A2', 'C3'] },
  { name: 'E Min', notes: ['E2', 'G2', 'B2', 'D3'] },
];

export default function AmbientPad() {
  const [activeChord, setActiveChord] = useState(null);
  const [brightness, setBrightness] = useState(0.5);
  const [texture, setTexture] = useState(0.3);
  
  const synthRef = useRef(null);
  const lfoRef = useRef(null);

  useEffect(() => {
    // Atmospheric Pad Synth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 30 },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 1,
        release: 4
      }
    }).connect(masterBus);

    // LFO for movement
    lfoRef.current = new Tone.LFO({
      frequency: 0.1,
      min: 400,
      max: 2000
    }).start();

    return () => {
      synthRef.current?.dispose();
      lfoRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        oscillator: { spread: 10 + texture * 60 }
      });
    }
  }, [texture]);

  const playChord = async (chord) => {
    await Tone.start();
    if (activeChord === chord.name) {
      synthRef.current.releaseAll();
      setActiveChord(null);
    } else {
      synthRef.current.releaseAll();
      synthRef.current.triggerAttack(chord.notes);
      setActiveChord(chord.name);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '800px', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Atmosphere</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Texture</span>
              <span>{Math.round(texture * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={texture} onChange={(e) => setTexture(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
            
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Adjust the detune spread for a thicker sound.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sun size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Movement</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.8 }}>Slow LFO modulation is applied to the internal filter for a drifting, organic feel.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        {PAD_CHORDS.map(chord => (
          <motion.button
            key={chord.name}
            onClick={() => playChord(chord)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn-glass ${activeChord === chord.name ? 'active' : ''}`}
            style={{
              height: '100px',
              flexDirection: 'column',
              justifyContent: 'center',
              fontSize: '1.1rem',
              gap: '5px',
              borderWidth: activeChord === chord.name ? '2px' : '1px',
              boxShadow: activeChord === chord.name ? '0 0 30px var(--accent-glow)' : 'none'
            }}
          >
            <Cloud size={20} opacity={activeChord === chord.name ? 1 : 0.5} />
            {chord.name}
          </motion.button>
        ))}
      </div>
      
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        * Ambient pads have long attack and release times. Toggle chords to create a wash of sound.
      </p>
    </div>
  );
}
