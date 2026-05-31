import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Launchpad() {
  const [activePads, setActivePads] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);

  // Isomorphic layout logic (like Ableton Push)
  // Rows are perfect 4ths apart (5 semitones)
  // Columns are semitones
  // Let's create an 8x8 grid. Bottom left is note 36 (C2)
  const rows = 8;
  const cols = 8;
  const rootNote = 36;
  
  const getNoteValue = (r, c) => {
      // r is 0 to 7 (top to bottom), but musically we want bottom to top
      const rowUp = (rows - 1) - r;
      return rootNote + (rowUp * 5) + c;
  };

  const getNoteName = (midiValue) => {
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const octave = Math.floor(midiValue / 12) - 1;
      const noteName = notes[midiValue % 12];
      return `${noteName}${octave}`;
  };

  const getColor = (midiValue) => {
      // Highlight C notes (root)
      if (midiValue % 12 === 0) return '#10b981'; // Green
      // Highlight scale notes (C major for simplicity)
      const majorScale = [0, 2, 4, 5, 7, 9, 11];
      if (majorScale.includes(midiValue % 12)) return '#3b82f6'; // Blue
      // Out of scale
      return '#3f3f46'; // Dark gray
  };

  useEffect(() => {
    // Bright, plucky EDM synth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const hitPad = async (r, c) => {
    await Tone.start();
    const id = `${r}-${c}`;
    const note = getNoteName(getNoteValue(r, c));
    
    if (synthRef.current && !activePads.has(id)) {
      synthRef.current.triggerAttack(note);
      setActivePads(prev => new Set(prev).add(id));
    }
  };

  const releasePad = (r, c) => {
    const id = `${r}-${c}`;
    const note = getNoteName(getNoteValue(r, c));
    
    if (synthRef.current) {
      synthRef.current.triggerRelease([note]);
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
          background: '#18181b', padding: '20px', borderRadius: '15px', 
          border: '2px solid #27272a', display: 'flex', flexDirection: 'column', gap: '5px'
      }}>
        {Array.from({ length: rows }).map((_, r) => (
            <div key={`row-${r}`} style={{ display: 'flex', gap: '5px' }}>
                {Array.from({ length: cols }).map((_, c) => {
                    const id = `${r}-${c}`;
                    const val = getNoteValue(r, c);
                    const baseColor = getColor(val);
                    const isActive = activePads.has(id);
                    
                    return (
                        <div
                            key={id}
                            onMouseDown={() => hitPad(r, c)}
                            onMouseUp={() => releasePad(r, c)}
                            onMouseLeave={() => releasePad(r, c)}
                            onMouseEnter={(e) => { if (e.buttons === 1) hitPad(r, c); }}
                            style={{
                                width: '40px', height: '40px',
                                background: isActive ? '#fff' : baseColor,
                                borderRadius: '5px', border: '1px solid #111',
                                boxShadow: isActive ? `0 0 15px ${baseColor}` : 'none',
                                cursor: 'pointer', transition: 'all 0.05s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        />
                    );
                })}
            </div>
        ))}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>64-pad isomorphic grid. Green pads are C. Blue pads are in C Major. Slide your mouse to play arpeggios!</p>
    </div>
  );
}
