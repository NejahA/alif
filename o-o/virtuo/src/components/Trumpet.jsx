import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Wind } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Trumpet() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  // Simulating 3 trumpet valves (binary: 000 to 111)
  const [valves, setValves] = useState([false, false, false]);
  
  const synthRef = useRef(null);
  const vibratoRef = useRef(null);
  const reverbRef = useRef(null);

  // Map valve combinations to some base notes (simplified)
  // 000 = C4, 100 = A#3, 010 = B3, 110 = A3, etc.
  const getNoteFromValves = () => {
    const v = valves;
    if (!v[0] && !v[1] && !v[2]) return 'C4'; // Open
    if (!v[0] && v[1] && !v[2]) return 'B3'; // 2nd
    if (v[0] && !v[1] && !v[2]) return 'A#3'; // 1st
    if (v[0] && v[1] && !v[2]) return 'A3'; // 1st + 2nd
    if (!v[0] && v[1] && v[2]) return 'G#3'; // 2nd + 3rd
    if (v[0] && !v[1] && v[2]) return 'G3'; // 1st + 3rd
    if (v[0] && v[1] && v[2]) return 'F#3'; // All
    return 'C4';
  };

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).connect(masterBus);
    vibratoRef.current = new Tone.Vibrato({ frequency: 6, depth: 0.1 }).connect(reverbRef.current);
    
    synthRef.current = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 2,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.4 },
      modulation: { type: 'sawtooth' },
      modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.4 }
    }).connect(vibratoRef.current);
    
    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT') return;
      
      // Keys 'j', 'k', 'l' for valves
      if (['j', 'k', 'l'].includes(e.key.toLowerCase())) {
        const index = e.key.toLowerCase() === 'j' ? 0 : e.key.toLowerCase() === 'k' ? 1 : 2;
        setValves(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }
      
      // Key 'space' to blow
      if (e.code === 'Space' && !activeNote) {
        e.preventDefault();
        playNote();
      }
    };

    const handleKeyUp = (e) => {
      if (['j', 'k', 'l'].includes(e.key.toLowerCase())) {
        const index = e.key.toLowerCase() === 'j' ? 0 : e.key.toLowerCase() === 'k' ? 1 : 2;
        setValves(prev => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      }
      
      if (e.code === 'Space') {
        releaseNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      synthRef.current?.dispose();
      vibratoRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, [activeNote, valves]);

  useEffect(() => {
    if (synthRef.current && activeNote) {
      // Allow dynamic note change while blowing if valves change
      const note = getNoteFromValves();
      synthRef.current.frequency.rampTo(note, 0.05);
    }
  }, [valves]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const playNote = async () => {
    await Tone.start();
    const note = getNoteFromValves();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveNote(note);
    }
  };

  const releaseNote = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActiveNote(null);
    }
  };

  const toggleValve = (index, state) => {
    setValves(prev => {
      const next = [...prev];
      next[index] = state;
      return next;
    });
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
      </div>

      <div style={{ position: 'relative', width: '500px', height: '200px', display: 'flex', alignItems: 'center' }}>
        
        {/* Trumpet Body */}
        <div style={{ 
          position: 'absolute', right: '50px', width: '350px', height: '40px', 
          background: 'linear-gradient(to bottom, #fde047, #ca8a04, #fde047)',
          borderRadius: '5px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
        }} />
        
        {/* Bell */}
        <div style={{ 
          position: 'absolute', right: 0, width: '60px', height: '120px', 
          background: 'radial-gradient(ellipse at center, #ca8a04 0%, #fde047 100%)',
          borderRadius: '50%',
          transform: 'translateX(20px)',
          boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.8)'
        }} />
        
        {/* Mouthpiece */}
        <div style={{ 
          position: 'absolute', left: '70px', width: '30px', height: '20px', 
          background: '#d4d4d8',
          borderRadius: '10px 0 0 10px',
          cursor: 'pointer'
        }} 
        onMouseDown={playNote}
        onMouseUp={releaseNote}
        onMouseLeave={releaseNote}
        title="Click here or press Space to blow"
        />

        {/* Valves */}
        <div style={{ position: 'absolute', left: '200px', top: '40px', display: 'flex', gap: '15px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                animate={{ y: valves[i] ? 15 : 0 }}
                onMouseDown={() => toggleValve(i, true)}
                onMouseUp={() => toggleValve(i, false)}
                onMouseLeave={() => toggleValve(i, false)}
                style={{
                  width: '20px',
                  height: '40px',
                  background: '#fef08a',
                  border: '2px solid #ca8a04',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  zIndex: 2
                }}
              />
              <div style={{ width: '16px', height: '50px', background: '#a16207', marginTop: '-10px', zIndex: 1 }} />
              <span style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '10px' }}>
                {i === 0 ? 'J' : i === 1 ? 'K' : 'L'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Hold <kbd>Space</kbd> to blow, and <kbd>J</kbd>, <kbd>K</kbd>, <kbd>L</kbd> for valves.</p>
    </div>
  );
}
