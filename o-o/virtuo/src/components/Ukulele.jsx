import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STRINGS = ['G4', 'C4', 'E4', 'A4'];

export default function Ukulele() {
  const [activeStrings, setActiveStrings] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [chord, setChord] = useState('C'); // Simple chord selection: C, G, F, Am
  
  const synthsRef = useRef(new Map());
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).connect(masterBus);
    
    STRINGS.forEach(note => {
      const synth = new Tone.PluckSynth({
        attackNoise: 1.5,
        dampening: 5000,
        resonance: 0.8
      }).connect(reverbRef.current);
      synthsRef.current.set(note, synth);
    });

    return () => {
      synthsRef.current.forEach(synth => synth.dispose());
      synthsRef.current.clear();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    synthsRef.current.forEach(synth => {
      synth.volume.rampTo(volume, 0.1);
    });
  }, [volume]);

  // Adjust notes based on selected chord (very simplified)
  const getChordNotes = () => {
    switch(chord) {
      case 'C': return ['G4', 'C4', 'E4', 'C5'];
      case 'G': return ['G4', 'D4', 'G4', 'B4'];
      case 'F': return ['A4', 'C4', 'F4', 'A4'];
      case 'Am': return ['A4', 'C4', 'E4', 'A4'];
      default: return STRINGS;
    }
  };

  const playString = async (index) => {
    await Tone.start();
    const notes = getChordNotes();
    const note = notes[index];
    
    // We use the synth corresponding to the physical string position, but trigger the chord note
    const baseNote = STRINGS[index];
    const synth = synthsRef.current.get(baseNote);
    
    if (synth) {
      synth.triggerAttack(note);
      setActiveStrings(prev => new Set(prev).add(index));
      setTimeout(() => {
        setActiveStrings(prev => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }, 150);
    }
  };

  const strumDown = async () => {
    for(let i=0; i<4; i++) {
      playString(i);
      await new Promise(r => setTimeout(r, 40));
    }
  };

  const strumUp = async () => {
    for(let i=3; i>=0; i--) {
      playString(i);
      await new Promise(r => setTimeout(r, 40));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'space-between' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chord</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['C', 'G', 'F', 'Am'].map(c => (
              <button 
                key={c}
                className={`btn-glass ${chord === c ? 'active' : ''}`}
                onClick={() => setChord(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button className="btn-glass" onClick={strumDown}>Strum Down ↓</button>
        <button className="btn-glass" onClick={strumUp}>Strum Up ↑</button>
      </div>

      <div style={{ position: 'relative', width: '600px', height: '250px', background: '#d2b48c', borderRadius: '10px 100px 100px 10px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', display: 'flex', padding: '20px 0', alignItems: 'center' }}>
        {/* Sound hole */}
        <div style={{ position: 'absolute', right: '150px', width: '100px', height: '100px', background: '#3e2723', borderRadius: '50%', border: '4px solid #8b4513' }} />
        
        {/* Fretboard */}
        <div style={{ width: '350px', height: '120px', background: '#2c1e16', position: 'relative', borderRight: '10px solid #fff' }}>
            {/* Frets */}
            {[1, 2, 3, 4, 5, 6].map(f => (
                <div key={f} style={{ position: 'absolute', left: `${f * 15}%`, width: '2px', height: '100%', background: '#ccc' }} />
            ))}
        </div>

        {/* Bridge */}
        <div style={{ position: 'absolute', right: '50px', width: '20px', height: '100px', background: '#3e2723', borderRadius: '5px' }} />

        <div style={{ position: 'absolute', left: 0, width: '100%', height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
          {STRINGS.map((note, i) => (
            <div 
              key={note}
              style={{ position: 'relative', width: '100%', height: '20px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => playString(i)}
            >
              <motion.div
                animate={{ y: activeStrings.has(i) ? [0, -3, 3, -2, 2, 0] : 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: '100%',
                  height: i === 0 ? '2px' : i === 1 ? '3px' : i === 2 ? '4px' : '2px', // Ukulele string thicknesses
                  background: 'rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  cursor: 'pointer'
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Hover over the strings to pluck, or use the strum buttons.</p>
    </div>
  );
}
