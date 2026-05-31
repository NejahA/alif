import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Wind, Volume2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

const NOTES = [
  { note: 'C4', key: 'a' },
  { note: 'D4', key: 's' },
  { note: 'E4', key: 'd' },
  { note: 'F4', key: 'f' },
  { note: 'G4', key: 'g' },
  { note: 'A4', key: 'h' },
  { note: 'B4', key: 'j' },
  { note: 'C5', key: 'k' },
  { note: 'D5', key: 'l' },
  { note: 'E5', key: ';' }
];

export default function Flute() {
  const synthRef = useRef(null);
  const vibratoRef = useRef(null);
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [breathLevel, setBreathLevel] = useState(50); // 0-100 noise mix

  useEffect(() => {
    vibratoRef.current = new Tone.Vibrato({
      maxDelay: 0.005,
      frequency: 5,
      depth: 0.1,
      type: "sine"
    }).connect(masterBus);

    // Create a breathy tone using FM Synth
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 }
    }).connect(vibratoRef.current);
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const n = NOTES.find(n => n.key === e.key.toLowerCase());
      if (n) playNote(n.note);
    };

    const handleKeyUp = (e) => {
      const n = NOTES.find(n => n.key === e.key.toLowerCase());
      if (n && activeNote === n.note) stopNote();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      synthRef.current?.dispose();
      vibratoRef.current?.dispose();
    };
  }, [activeNote]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  useEffect(() => {
    if (vibratoRef.current) vibratoRef.current.depth.value = breathLevel / 500; // Map breath to vibrato depth loosely
  }, [breathLevel]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    
    // Add breath noise
    if (breathLevel > 0) {
      const noise = new Tone.Noise("white").start();
      const noiseVol = new Tone.Volume(-40 + (breathLevel * 0.3)).connect(masterBus);
      const noiseEnv = new Tone.AmplitudeEnvelope({ attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.5 }).connect(noiseVol);
      noise.connect(noiseEnv);
      noiseEnv.triggerAttack();
      
      // Store on synth ref to clean up later
      synthRef.current.noise = { noise, noiseEnv, noiseVol };
    }

    synthRef.current.triggerAttack(note);
    setActiveNote(note);
  };

  const stopNote = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      if (synthRef.current.noise) {
        synthRef.current.noise.noiseEnv.triggerRelease();
        setTimeout(() => {
          synthRef.current.noise.noise.dispose();
          synthRef.current.noise.noiseEnv.dispose();
          synthRef.current.noise.noiseVol.dispose();
          delete synthRef.current.noise;
        }, 500);
      }
    }
    setActiveNote(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Wind size={14} /> Breath/Vibrato
          </label>
          <input 
            type="range" min="0" max="100" step="1" 
            value={breathLevel} 
            onChange={(e) => setBreathLevel(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Flute Body / Keys */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        alignItems: 'center',
        background: 'linear-gradient(to right, #d4d4d4, #f5f5f5, #a3a3a3)',
        padding: '20px 40px',
        borderRadius: '30px',
        boxShadow: 'inset 0 5px 15px rgba(255,255,255,0.8), inset 0 -5px 15px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative',
        minHeight: '80px'
      }}>
        {/* Embouchure Hole */}
        <div style={{
          width: '30px',
          height: '20px',
          borderRadius: '50%',
          background: 'linear-gradient(to right, #1a1a1a, #333, #1a1a1a)',
          marginRight: '20px',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8)'
        }} />

        {NOTES.map((n, i) => (
          <motion.div
            key={n.note}
            animate={{
              scale: activeNote === n.note ? 0.9 : 1,
              backgroundColor: activeNote === n.note ? '#a8b0c2' : '#e0e0e0'
            }}
            onMouseDown={() => playNote(n.note)}
            onMouseUp={stopNote}
            onMouseLeave={stopNote}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: activeNote === n.note ? 'inset 0 2px 5px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.8)',
              border: '2px solid #ccc',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>{n.note}</div>
            <div style={{ fontSize: '10px', color: '#888', position: 'absolute', bottom: '-20px' }}>{n.key.toUpperCase()}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
