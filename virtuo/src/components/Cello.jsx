import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const STRINGS = [
  { note: 'C2', name: 'C String' },
  { note: 'G2', name: 'G String' },
  { note: 'D3', name: 'D String' },
  { note: 'A3', name: 'A String' }
];

export default function Cello() {
  const isAudioReady = useAudioSafe();
  const synthRef = useRef(null);
  const [activeStrings, setActiveStrings] = useState(new Set());

  useEffect(() => {
    if (!isAudioReady) return;
    // A cello synth - deeper and warmer than violin
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2.5,
      modulationIndex: 10,
      oscillator: { type: 'sawtooth' },
      envelope: { 
        attack: 0.2, 
        decay: 0.5, 
        sustain: 0.7, 
        release: 2.0 
      },
      modulation: { type: 'triangle' },
      modulationEnvelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5
      }
    }).connect(getChannel('cello'));

    return () => {
      synthRef.current?.dispose();
    };
  }, [isAudioReady]);

  const playBow = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveStrings(prev => new Set(prev).add(note));
    }
  };

  const releaseBow = (note) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
      setActiveStrings(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '600px' }}>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Hover or click the strings for deep cello resonance</p>
      
      <div style={{ 
        background: 'rgba(64, 42, 32, 0.4)', // Darker wood tint
        padding: '30px 0',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
      }}>
        {STRINGS.map((str) => {
          const isActive = activeStrings.has(str.note);
          
          return (
            <motion.div
              key={str.note}
              onMouseDown={() => playBow(str.note)}
              onMouseUp={() => releaseBow(str.note)}
              onMouseEnter={() => playBow(str.note)}
              onMouseLeave={() => releaseBow(str.note)}
              animate={{
                scaleY: isActive ? 2 : 1,
                boxShadow: isActive ? '0 0 20px var(--accent-glow)' : 'none',
                background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)'
              }}
              style={{
                height: '6px', // Thicker strings for cello
                width: '100%',
                margin: '40px 0',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <span style={{ 
                position: 'absolute', 
                left: '-80px', 
                top: '-10px', 
                color: isActive ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                {str.name}
              </span>
              <span style={{ 
                position: 'absolute', 
                right: '-50px', 
                top: '-10px', 
                color: 'var(--text-muted)',
                fontWeight: 600
              }}>
                {str.note}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
