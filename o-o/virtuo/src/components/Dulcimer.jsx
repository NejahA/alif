import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STRINGS = [
  { note: 'D4', group: 'bass' }, { note: 'E4', group: 'bass' }, { note: 'F#4', group: 'bass' }, { note: 'G4', group: 'bass' },
  { note: 'A4', group: 'treble' }, { note: 'B4', group: 'treble' }, { note: 'C#5', group: 'treble' }, { note: 'D5', group: 'treble' },
  { note: 'E5', group: 'treble' }, { note: 'F#5', group: 'treble' }, { note: 'G5', group: 'treble' }, { note: 'A5', group: 'treble' }
];

export default function Dulcimer() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(masterBus);
    
    // Hammered Dulcimer is a plucked/hammered string with bright metallic resonance
    synthRef.current = new Tone.PolySynth(Tone.PluckSynth, {
      attackNoise: 2,
      dampening: 4000,
      resonance: 0.95
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

  const hammerString = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveNotes(prev => new Set(prev).add(note));
      setTimeout(() => {
          setActiveNotes(prev => {
              const next = new Set(prev);
              next.delete(note);
              return next;
          });
      }, 150); // Visual hammer bounce
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

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        {/* Trapezoidal Body */}
        <div style={{ 
            width: '600px', height: '300px', background: '#5c3a21', // Dark wood
            borderTop: '20px solid #3e2723', borderBottom: '20px solid #3e2723',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', // Trapezoid
            display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', padding: '0 50px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)', position: 'relative'
        }}>
            {/* Bridges */}
            <div style={{ position: 'absolute', left: '30%', top: '20px', bottom: '20px', width: '10px', background: '#111', borderRadius: '5px' }} />
            <div style={{ position: 'absolute', right: '30%', top: '20px', bottom: '20px', width: '10px', background: '#111', borderRadius: '5px' }} />

            {/* Strings */}
            {STRINGS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textShadow: '1px 1px 2px #000', width: '20px' }}>{s.note}</div>
                    <div 
                        onMouseDown={() => hammerString(s.note)}
                        onMouseEnter={(e) => { if (e.buttons === 1) hammerString(s.note); }}
                        style={{ 
                            flex: 1, height: '4px', 
                            background: activeNotes.has(s.note) ? '#fff' : '#d1d5db',
                            boxShadow: activeNotes.has(s.note) ? '0 0 10px #fff' : '0 2px 4px rgba(0,0,0,0.5)',
                            cursor: 'crosshair', transition: 'background 0.05s',
                            transform: activeNotes.has(s.note) ? 'scaleY(2)' : 'none'
                        }}
                    />
                </div>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag across the strings to "hammer" the Dulcimer.</p>
    </div>
  );
}
