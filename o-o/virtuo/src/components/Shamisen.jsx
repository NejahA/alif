import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STRINGS = ['D3', 'G3', 'D4'];

export default function Shamisen() {
  const [activeString, setActiveString] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthsRef = useRef(new Map());
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 1, wet: 0.2 }).connect(masterBus);
    
    // Shamisen uses a large plectrum (Bachi) creating a sharp attack
    STRINGS.forEach(note => {
      const synth = new Tone.PluckSynth({
        attackNoise: 2, // High noise for percussive attack
        dampening: 3000,
        resonance: 0.7
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
    synthsRef.current.forEach(synth => synth.volume.rampTo(volume, 0.1));
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    const synth = synthsRef.current.get(note);
    if (synth) {
      synth.triggerAttack(note);
      setActiveString(note);
      setTimeout(() => {
        setActiveString(null);
      }, 150);
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

      <div style={{ position: 'relative', width: '500px', height: '150px', display: 'flex', alignItems: 'center' }}>
        
        {/* Neck */}
        <div style={{ width: '300px', height: '40px', background: '#3e2723', borderRight: '5px solid #fff' }} />
        
        {/* Body (Dou) */}
        <div style={{ width: '180px', height: '140px', background: '#fdf5e6', border: '5px solid #3e2723', borderRadius: '10px', position: 'relative' }}>
          
          {/* Bridge */}
          <div style={{ position: 'absolute', right: '30px', top: '20px', width: '10px', height: '100px', background: '#8b4513' }} />

          {/* Strings */}
          <div style={{ position: 'absolute', top: 0, left: '-300px', width: '450px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px', paddingLeft: '10px' }}>
            {STRINGS.map((note) => (
              <div 
                key={note}
                onMouseDown={() => playNote(note)}
                style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <motion.div
                  animate={{ y: activeString === note ? [-3, 3, -2, 2, 0] : 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ width: '100%', height: '2px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                />
                {/* Visual Bachi Hit Area */}
                <div style={{ position: 'absolute', right: '80px', width: '40px', height: '20px', background: 'rgba(255,255,255,0.1)' }} title="Pluck here" />
              </div>
            ))}
          </div>

        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the strings over the body to strike with the Bachi.</p>
    </div>
  );
}
