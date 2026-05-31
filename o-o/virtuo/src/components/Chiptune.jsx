import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Gamepad2, Settings2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', key: 'a', color: '#fff' },
  { note: 'C#4', key: 'w', color: '#000' },
  { note: 'D4', key: 's', color: '#fff' },
  { note: 'D#4', key: 'e', color: '#000' },
  { note: 'E4', key: 'd', color: '#fff' },
  { note: 'F4', key: 'f', color: '#fff' },
  { note: 'F#4', key: 't', color: '#000' },
  { note: 'G4', key: 'g', color: '#fff' },
  { note: 'G#4', key: 'y', color: '#000' },
  { note: 'A4', key: 'h', color: '#fff' },
  { note: 'A#4', key: 'u', color: '#000' },
  { note: 'B4', key: 'j', color: '#fff' },
  { note: 'C5', key: 'k', color: '#fff' }
];

export default function Chiptune() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [waveType, setWaveType] = useState('square'); // square, triangle, pulse
  const [arpEnabled, setArpEnabled] = useState(false);

  useEffect(() => {
    // 8-bit sound: Basic oscillators with fast attack and release
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: waveType },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.01 }
    }).connect(masterBus);
    
    synthRef.current.volume.value = volume;

    let arpPattern;
    if (arpEnabled) {
       // Simple arpeggiator logic: 
       // When notes are held, we cycle through them rapidly. 
       // For a real chiptune arpeggiator, we'd use a Tone.Pattern.
       // Here we implement a simplified "fake chord" arpeggiator typical of old gameboys.
       arpPattern = new Tone.Pattern((time, note) => {
         if (synthRef.current) synthRef.current.triggerAttackRelease(note, "16n", time);
       }, Array.from(activeNotes), "up");
       
       arpPattern.interval = "16n";
       if (activeNotes.size > 0) {
         arpPattern.start();
         if (Tone.Transport.state !== "started") Tone.Transport.start();
       }
    }

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = KEYS.find(k => k.key === e.key.toLowerCase());
      if (k) playNote(k.note);
    };

    const handleKeyUp = (e) => {
      const k = KEYS.find(k => k.key === e.key.toLowerCase());
      if (k) stopNote(k.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (arpPattern) {
        arpPattern.stop();
        arpPattern.dispose();
      }
      synthRef.current?.dispose();
    };
  }, [waveType, arpEnabled, activeNotes]); // Re-bind when active notes change for arp

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    
    if (!arpEnabled) {
      synthRef.current.triggerAttack(note);
    }
    setActiveNotes(prev => new Set([...prev, note]));
  };

  const stopNote = (note) => {
    if (!synthRef.current) return;
    if (!arpEnabled) {
      synthRef.current.triggerRelease(note);
    }
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%', fontFamily: '"Courier New", Courier, monospace' }}>
      
      {/* Retro Header */}
      <div style={{ color: '#0f0', background: '#000', padding: '10px 20px', border: '2px solid #0f0', borderRadius: '0', textTransform: 'uppercase' }}>
        <Gamepad2 size={24} style={{ display: 'inline', marginRight: '10px' }} />
        8-Bit Synthesizer Module
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#222', border: '2px solid #555', boxShadow: '5px 5px 0px #000' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: '#0f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Vol
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: '#0f0' }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: '#0f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Settings2 size={14} /> Wave
          </label>
          <select 
            value={waveType} 
            onChange={(e) => setWaveType(e.target.value)}
            style={{ background: '#000', color: '#0f0', border: '1px solid #0f0', padding: '2px 5px', fontFamily: 'inherit' }}
          >
            <option value="square">Square</option>
            <option value="triangle">Triangle</option>
            <option value="pulse">Pulse</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            onClick={() => setArpEnabled(!arpEnabled)}
            style={{ 
              background: arpEnabled ? '#0f0' : '#000', 
              color: arpEnabled ? '#000' : '#0f0', 
              border: '1px solid #0f0', 
              padding: '5px 10px',
              fontFamily: 'inherit',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Arp: {arpEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Keyboard (Pixel Art Style) */}
      <div style={{ 
        position: 'relative',
        height: '150px',
        width: '400px',
        background: '#ccc',
        border: '4px solid #fff',
        boxShadow: 'inset -4px -4px 0px #888, 5px 5px 0px #000',
        padding: '10px'
      }}>
        
        {/* White Keys */}
        <div style={{ display: 'flex', height: '100%', gap: '2px' }}>
          {KEYS.filter(k => k.color === '#fff').map((k, i) => (
            <div
              key={k.note}
              onMouseDown={() => playNote(k.note)}
              onMouseUp={() => stopNote(k.note)}
              onMouseLeave={() => stopNote(k.note)}
              style={{
                flex: 1,
                background: activeNotes.has(k.note) ? '#aaa' : '#fff',
                border: '2px solid #000',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '5px',
                boxShadow: activeNotes.has(k.note) ? 'none' : 'inset -2px -2px 0px #ccc'
              }}
            >
              <span style={{ fontSize: '10px', color: '#000', fontWeight: 'bold' }}>{k.key.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Black Keys */}
        <div style={{ display: 'flex', position: 'absolute', top: '10px', left: '10px', width: 'calc(100% - 20px)' }}>
          {KEYS.filter(k => k.color === '#000').map((k, i) => {
            const leftPos = k.note === 'C#4' ? 9 : 
                            k.note === 'D#4' ? 24 : 
                            k.note === 'F#4' ? 53 : 
                            k.note === 'G#4' ? 68 : 82.5; 
            return (
              <div
                key={k.note}
                onMouseDown={() => playNote(k.note)}
                onMouseUp={() => stopNote(k.note)}
                onMouseLeave={() => stopNote(k.note)}
                style={{
                  position: 'absolute',
                  left: `${leftPos}%`,
                  width: '8%',
                  height: '60%',
                  background: activeNotes.has(k.note) ? '#333' : '#000',
                  border: '2px solid #000',
                  cursor: 'pointer',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '5px',
                  boxShadow: activeNotes.has(k.note) ? 'none' : 'inset -1px -1px 0px #555'
                }}
              >
                <span style={{ fontSize: '10px', color: '#fff' }}>{k.key.toUpperCase()}</span>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}
