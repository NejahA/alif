import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

// Simplified diatonic harmonica layout
const HOLES = [
  { blow: 'C4', draw: 'D4' },
  { blow: 'E4', draw: 'G4' },
  { blow: 'G4', draw: 'B4' },
  { blow: 'C5', draw: 'D5' },
  { blow: 'E5', draw: 'F5' },
  { blow: 'G5', draw: 'A5' },
  { blow: 'C6', draw: 'B5' },
];

export default function Harmonica() {
  const [activeHole, setActiveHole] = useState(null);
  const [action, setAction] = useState(null); // 'blow' or 'draw'
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    // Harmonica uses free reeds
    filterRef.current = new Tone.Filter({ type: 'bandpass', frequency: 1000, Q: 1 }).connect(masterBus);
    
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'square', modulationFrequency: 0.2 },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.1 },
      filterEnvelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.1, baseFrequency: 800, octaves: 2 }
    }).connect(filterRef.current);
    
    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const interact = async (index, type) => {
    await Tone.start();
    const note = type === 'blow' ? HOLES[index].blow : HOLES[index].draw;
    
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveHole(index);
      setAction(type);
      
      // Slight filter mod for draw vs blow
      if (filterRef.current) {
        filterRef.current.frequency.rampTo(type === 'blow' ? 1200 : 800, 0.1);
      }
    }
  };

  const release = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActiveHole(null);
      setAction(null);
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

      <div style={{ 
        display: 'flex', 
        background: 'linear-gradient(to bottom, #d4d4d8, #71717a, #d4d4d8)', 
        padding: '30px 40px', 
        borderRadius: '20px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.5)'
      }}>
        <div style={{ display: 'flex', gap: '15px', background: '#3f3f46', padding: '10px', borderRadius: '10px', border: '2px solid #27272a' }}>
          {HOLES.map((hole, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              
              <motion.button
                animate={{ 
                  scale: activeHole === i && action === 'blow' ? 1.1 : 1,
                  backgroundColor: activeHole === i && action === 'blow' ? '#22c55e' : 'rgba(255,255,255,0.1)'
                }}
                onMouseDown={() => interact(i, 'blow')}
                onMouseUp={release}
                onMouseLeave={release}
                className="btn-glass"
                style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, fontSize: '10px' }}
              >
                Blow
              </motion.button>

              {/* The Hole */}
              <div style={{ 
                width: '25px', height: '25px', background: '#000', borderRadius: '5px',
                boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.2)'
              }} />

              <motion.button
                animate={{ 
                  scale: activeHole === i && action === 'draw' ? 1.1 : 1,
                  backgroundColor: activeHole === i && action === 'draw' ? '#ef4444' : 'rgba(255,255,255,0.1)'
                }}
                onMouseDown={() => interact(i, 'draw')}
                onMouseUp={release}
                onMouseLeave={release}
                className="btn-glass"
                style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, fontSize: '10px' }}
              >
                Draw
              </motion.button>
              
            </div>
          ))}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click Blow or Draw on the holes to play the reeds.</p>
    </div>
  );
}
