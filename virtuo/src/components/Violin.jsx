import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const STRINGS = [
  { note: 'G3', name: 'G String' },
  { note: 'D4', name: 'D String' },
  { note: 'A4', name: 'A String' },
  { note: 'E5', name: 'E String' }
];

export default function Violin() {
  const isAudioReady = useAudioSafe();
  const synthRef = useRef(null);
  const [activeStrings, setActiveStrings] = useState(new Set());

  useEffect(() => {
    if (!isAudioReady) return;
    // A synth that sounds a bit more like a bowed string
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.5 }
    }).connect(getChannel('violin'));

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
      <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Hover or click the strings to bow</p>
      
      <div style={{ 
        background: 'rgba(92, 64, 51, 0.3)', // Wood-like tint
        padding: '20px 0',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)'
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
                scaleY: isActive ? 1.5 : 1,
                boxShadow: isActive ? '0 0 15px var(--accent-glow)' : 'none',
                background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.7)'
              }}
              style={{
                height: '4px',
                width: '100%',
                margin: '30px 0',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <span style={{ 
                position: 'absolute', 
                left: '-60px', 
                top: '-10px', 
                color: isActive ? 'var(--accent-primary)' : 'var(--text-main)',
                fontWeight: 600
              }}>
                {str.name}
              </span>
              <span style={{ 
                position: 'absolute', 
                right: '-40px', 
                top: '-10px', 
                color: 'var(--text-muted)'
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
