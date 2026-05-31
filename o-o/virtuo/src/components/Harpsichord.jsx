import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const NATURAL_KEYS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];
const SHARP_KEYS = ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null, 'C#5', 'D#5', null, 'F#5', 'G#5', 'A#5', null];

export default function Harpsichord() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).connect(masterBus);
    
    // Harpsichord plucks the strings, creating a bright, complex tone with sharp attack
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 1.5,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.1 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }
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

  const playNote = async (note) => {
    if (!note) return;
    await Tone.start();
    if (synthRef.current && !activeNotes.has(note)) {
      synthRef.current.triggerAttack(note);
      setActiveNotes(prev => new Set(prev).add(note));
    }
  };

  const releaseNote = (note) => {
    if (!note) return;
    if (synthRef.current) {
      synthRef.current.triggerRelease([note]);
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
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
          padding: '20px', background: '#3e2723', borderRadius: '10px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)', border: '5px solid #271612'
      }}>
        {/* Ornate detail */}
        <div style={{ width: '100%', height: '20px', background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', marginBottom: '10px' }} />

        {/* Keyboard (Inverted colors for Harpsichord) */}
        <div style={{ position: 'relative', height: '150px', display: 'flex' }}>
            {/* Natural Keys (Black) */}
            {NATURAL_KEYS.map((note) => (
                <div 
                    key={note}
                    onMouseDown={() => playNote(note)}
                    onMouseUp={() => releaseNote(note)}
                    onMouseLeave={() => releaseNote(note)}
                    style={{
                        width: '40px', height: '150px', 
                        background: activeNotes.has(note) ? '#333' : '#111',
                        border: '1px solid #000', borderBottomRadius: '5px',
                        cursor: 'pointer', zIndex: 1
                    }}
                />
            ))}

            {/* Sharp Keys (White/Wood) */}
            <div style={{ position: 'absolute', top: 0, left: '0', display: 'flex', pointerEvents: 'none', paddingLeft: '20px' }}>
                {SHARP_KEYS.map((note, i) => (
                    <div 
                        key={i}
                        onMouseDown={() => playNote(note)}
                        onMouseUp={() => releaseNote(note)}
                        onMouseLeave={() => releaseNote(note)}
                        style={{
                            width: '24px', height: '90px', 
                            background: note ? (activeNotes.has(note) ? '#d1d5db' : '#f3f4f6') : 'transparent',
                            marginRight: note ? '16px' : '56px',
                            border: note ? '1px solid #9ca3af' : 'none',
                            borderRadius: '0 0 3px 3px',
                            cursor: note ? 'pointer' : 'default', pointerEvents: note ? 'auto' : 'none',
                            zIndex: 2, boxShadow: note ? '0 2px 5px rgba(0,0,0,0.5)' : 'none'
                        }}
                    />
                ))}
            </div>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>The classic Baroque keyboard. It plucks the strings, creating a bright attack with no velocity dynamics.</p>
    </div>
  );
}
