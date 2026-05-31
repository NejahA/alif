import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

// Simple chord map for Autoharp
const CHORDS = {
  'C Major': ['C3', 'E3', 'G3', 'C4', 'E4', 'G4'],
  'G Major': ['G2', 'B2', 'D3', 'G3', 'B3', 'D4'],
  'F Major': ['F2', 'A2', 'C3', 'F3', 'A3', 'C4'],
  'A Minor': ['A2', 'C3', 'E3', 'A3', 'C4', 'E4'],
  'D Minor': ['D3', 'F3', 'A3', 'D4', 'F4', 'A4'],
  'E Minor': ['E2', 'G2', 'B2', 'E3', 'G3', 'B3']
};

export default function Autoharp() {
  const [activeChord, setActiveChord] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [strummingIndex, setStrummingIndex] = useState(-1);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(masterBus);
    
    // Use PluckSynth for the strings
    synthRef.current = new Tone.PolySynth(Tone.PluckSynth, {
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.9
    }).connect(reverbRef.current);

    return () => {
      synthRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const selectChord = (chordName) => {
    setActiveChord(chordName);
  };

  const strumString = async (noteIndex) => {
    if (!activeChord) return;
    await Tone.start();
    
    const notes = CHORDS[activeChord];
    if (synthRef.current && notes[noteIndex]) {
      synthRef.current.triggerAttack(notes[noteIndex]);
      setStrummingIndex(noteIndex);
      setTimeout(() => setStrummingIndex(-1), 100);
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

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Chord Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#27272a', padding: '20px', borderRadius: '10px' }}>
            <div style={{ color: '#fff', fontSize: '12px', marginBottom: '10px' }}>Chord Bars</div>
            {Object.keys(CHORDS).map(chord => (
                <button
                    key={chord}
                    onClick={() => selectChord(chord)}
                    style={{
                        padding: '10px 20px',
                        background: activeChord === chord ? '#10b981' : '#3f3f46',
                        color: '#fff', border: 'none', borderRadius: '5px',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    {chord}
                </button>
            ))}
        </div>

        {/* The Strings (Strum Area) */}
        <div style={{ 
            width: '300px', height: '400px', background: '#3e2723', 
            borderRadius: '10px 100px 10px 10px', padding: '20px',
            position: 'relative', boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            {/* Draw 6 string hit areas */}
            {Array.from({ length: 6 }).map((_, i) => (
                <div 
                    key={i}
                    onMouseEnter={(e) => { if (e.buttons === 1) strumString(i); }}
                    onMouseDown={() => strumString(i)}
                    style={{
                        flex: 1, position: 'relative', cursor: 'crosshair',
                        display: 'flex', alignItems: 'center'
                    }}
                >
                    <div style={{ 
                        width: '100%', height: '2px', 
                        background: activeChord ? (strummingIndex === i ? '#fff' : '#888') : '#444',
                        boxShadow: strummingIndex === i ? '0 0 10px #fff' : 'none'
                    }} />
                </div>
            ))}
            
            {/* Visual sound hole */}
            <div style={{ position: 'absolute', right: '40px', bottom: '40px', width: '80px', height: '80px', background: '#1a1110', borderRadius: '50%', boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.8)' }} />
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Select a chord bar on the left, then click and drag across the strings to strum!</p>
    </div>
  );
}
