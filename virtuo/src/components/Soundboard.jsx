import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Play, Square, Volume2, Music2, Zap, Ghost, Rocket, Sparkles } from 'lucide-react';
import masterBus from '../audio/masterBus';

const SOUNDS = [
  { id: 'impact', name: 'Impact', icon: Zap, color: '#f59e0b' },
  { id: 'riser', name: 'Riser', icon: Rocket, color: '#3b82f6' },
  { id: 'ambient', name: 'Ghost', icon: Ghost, color: '#a855f7' },
  { id: 'shimmer', name: 'Shimmer', icon: Sparkles, color: '#10b981' },
];

export default function Soundboard() {
  const [activeSound, setActiveSound] = useState(null);
  const players = useRef({});

  useEffect(() => {
    // Initialize synthesizers for the soundboard effects
    // In a real app, these could be samples, but here we synthesize them
    
    // Impact Sound
    const impact = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).connect(masterBus);
    
    // Riser Sound
    const riser = new Tone.Oscillator('C2', 'sawtooth').connect(
      new Tone.Filter(200, 'lowpass').connect(masterBus)
    );
    
    // Ghost Sound
    const ghost = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 1, decay: 2, sustain: 0.5, release: 3 }
    }).connect(new Tone.Reverb(5).connect(masterBus));

    // Shimmer Sound
    const shimmer = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 1, release: 0.8 }
    }).connect(new Tone.FeedbackDelay('8n', 0.5).connect(masterBus));

    players.current = { impact, riser, ghost, shimmer };

    return () => {
      Object.values(players.current).forEach(p => p.dispose());
    };
  }, []);

  const playSound = (id) => {
    const p = players.current[id];
    if (!p) return;

    setActiveSound(id);
    
    if (id === 'impact') {
      p.triggerAttackRelease('C1', '2n');
    } else if (id === 'riser') {
      p.frequency.setValueAtTime('C2', Tone.now());
      p.frequency.linearRampToValueAtTime('C6', Tone.now() + 2);
      p.start().stop('+2');
    } else if (id === 'ambient') {
      p.triggerAttackRelease('1n');
    } else if (id === 'shimmer') {
      p.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '1n');
    }

    setTimeout(() => setActiveSound(null), 1000);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', maxWidth: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Music2 size={20} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>FX Soundboard</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {SOUNDS.map(sound => (
          <motion.button
            key={sound.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playSound(sound.id)}
            className="btn-glass"
            style={{
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              justifyContent: 'center',
              background: activeSound === sound.id ? sound.color : 'rgba(255,255,255,0.05)',
              borderColor: activeSound === sound.id ? 'white' : 'var(--glass-border)',
              color: activeSound === sound.id ? 'white' : 'var(--text-main)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <sound.icon size={24} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sound.name}</span>
            {activeSound === sound.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  borderRadius: '50%'
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
