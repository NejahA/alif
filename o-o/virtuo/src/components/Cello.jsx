import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STRINGS = ['C2', 'G2', 'D3', 'A3'];

export default function Cello() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [bowPosition, setBowPosition] = useState(0);
  
  const synthRef = useRef(null);
  const vibratoRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 4, wet: 0.4 }).connect(masterBus);
    vibratoRef.current = new Tone.Vibrato({ frequency: 6, depth: 0.1 }).connect(reverbRef.current);
    
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { Q: 1, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.3, decay: 0.1, sustain: 1, release: 1 },
      filterEnvelope: { attack: 0.3, decay: 0.2, sustain: 1, release: 1, baseFrequency: 200, octaves: 2 }
    }).connect(vibratoRef.current);
    
    return () => {
      synthRef.current?.dispose();
      vibratoRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
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

  const handleMouseMove = (e) => {
    if (activeNote) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const relativeX = (e.clientX - bounds.left) / bounds.width;
      setBowPosition(relativeX);
      
      // Map mouse X to vibrato depth and filter cutoff to simulate bowing pressure/speed
      if (vibratoRef.current && synthRef.current) {
        vibratoRef.current.depth.rampTo(0.1 + relativeX * 0.1, 0.1);
        synthRef.current.filter.frequency.rampTo(200 + relativeX * 1000, 0.1);
      }
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
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        <div 
          style={{ width: '150px', height: '400px', background: '#3e2723', borderRadius: '20px', position: 'relative', display: 'flex', justifyContent: 'space-evenly', padding: '20px 0', boxShadow: 'inset 0 0 20px #000, 0 10px 30px rgba(0,0,0,0.5)' }}
          onMouseMove={handleMouseMove}
          onMouseUp={releaseNote}
          onMouseLeave={releaseNote}
        >
          {/* F-holes */}
          <div style={{ position: 'absolute', top: '50%', left: '20px', width: '15px', height: '60px', background: '#111', borderRadius: '50%', transform: 'translateY(-50%) rotate(15deg)' }} />
          <div style={{ position: 'absolute', top: '50%', right: '20px', width: '15px', height: '60px', background: '#111', borderRadius: '50%', transform: 'translateY(-50%) rotate(-15deg)' }} />

          {STRINGS.map((note) => (
            <div 
              key={note}
              style={{ position: 'relative', width: '30px', height: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <motion.div
                animate={{ x: activeNote === note ? Math.sin(bowPosition * 20) * 2 : 0 }}
                onMouseDown={() => playNote(note)}
                style={{
                  width: '4px',
                  height: '100%',
                  background: activeNote === note ? '#fff' : '#aaa',
                  cursor: 'pointer',
                  boxShadow: activeNote === note ? '0 0 10px #fff' : 'none'
                }}
              />
              <span style={{ position: 'absolute', bottom: '-25px', fontSize: '12px', color: '#888' }}>{note}</span>
            </div>
          ))}

          {/* Virtual Bow */}
          {activeNote && (
            <motion.div
              style={{
                position: 'absolute',
                top: '50%',
                left: bowPosition * 100 + '%',
                width: '150px',
                height: '10px',
                background: 'rgba(255,255,255,0.8)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(255,255,255,0.5)'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
