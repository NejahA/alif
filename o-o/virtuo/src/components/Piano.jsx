import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import masterBus from '../audio/masterBus';

const NOTES = [
  { note: 'C4', type: 'white', key: 'a' },
  { note: 'C#4', type: 'black', key: 'w' },
  { note: 'D4', type: 'white', key: 's' },
  { note: 'D#4', type: 'black', key: 'e' },
  { note: 'E4', type: 'white', key: 'd' },
  { note: 'F4', type: 'white', key: 'f' },
  { note: 'F#4', type: 'black', key: 't' },
  { note: 'G4', type: 'white', key: 'g' },
  { note: 'G#4', type: 'black', key: 'y' },
  { note: 'A4', type: 'white', key: 'h' },
  { note: 'A#4', type: 'black', key: 'u' },
  { note: 'B4', type: 'white', key: 'j' },
  { note: 'C5', type: 'white', key: 'k' },
];

export default function Piano() {
  const synthRef = useRef(null);
  const [activeKeys, setActiveKeys] = useState(new Set());

  useEffect(() => {
    // Initialize Tone.js PolySynth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
    }).connect(masterBus);

    // MIDI Listeners
    const onMidiOn = (e) => {
      playNote(e.detail.note);
    };
    const onMidiOff = (e) => {
      releaseNote(e.detail.note);
    };

    window.addEventListener('virtuo-midi-on', onMidiOn);
    window.addEventListener('virtuo-midi-off', onMidiOff);

    const handleKeyDown = (e) => {
      const keyObj = NOTES.find(n => n.key === e.key.toLowerCase());
      if (keyObj && !activeKeys.has(keyObj.note)) {
        playNote(keyObj.note);
      }
    };

    const handleKeyUp = (e) => {
      const keyObj = NOTES.find(n => n.key === e.key.toLowerCase());
      if (keyObj) {
        releaseNote(keyObj.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      synthRef.current?.dispose();
      window.removeEventListener('virtuo-midi-on', onMidiOn);
      window.removeEventListener('virtuo-midi-off', onMidiOff);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const playNote = async (note) => {
    await Tone.start(); // Ensure audio context is started
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveKeys(prev => new Set(prev).add(note));
    }
  };

  const releaseNote = (note) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', height: '300px', margin: '40px 0' }}>
      {NOTES.map((keyObj, i) => {
        const isBlack = keyObj.type === 'black';
        const isActive = activeKeys.has(keyObj.note);

        return (
          <motion.div
            key={keyObj.note}
            onMouseDown={() => playNote(keyObj.note)}
            onMouseUp={() => releaseNote(keyObj.note)}
            onMouseLeave={() => releaseNote(keyObj.note)}
            animate={{
              boxShadow: isActive ? '0 0 20px var(--accent-glow)' : 'none',
              y: isActive ? 5 : 0
            }}
            transition={{ duration: 0.1 }}
            style={{
              width: isBlack ? '40px' : '60px',
              height: isBlack ? '200px' : '300px',
              background: isBlack ? 'var(--key-black)' : 'var(--key-white)',
              border: '1px solid #333',
              borderRadius: '0 0 4px 4px',
              marginLeft: isBlack ? '-20px' : '0',
              marginRight: isBlack ? '-20px' : '0',
              zIndex: isBlack ? 2 : 1,
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '20px',
              color: isBlack ? 'white' : 'black',
              fontWeight: 600,
              userSelect: 'none'
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'var(--key-active)',
                opacity: 0.5,
                borderRadius: '0 0 4px 4px',
              }} />
            )}
            <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 0.7 }}>
              <span style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '3px', textTransform: 'uppercase' }}>{keyObj.key}</span>
              <span style={{ fontSize: '0.8rem' }}>{keyObj.note}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
