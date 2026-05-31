import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'F4', type: 'natural' }, { note: 'F#4', type: 'accidental' },
  { note: 'G4', type: 'natural' }, { note: 'G#4', type: 'accidental' },
  { note: 'A4', type: 'natural' }, { note: 'A#4', type: 'accidental' },
  { note: 'B4', type: 'natural' },
  { note: 'C5', type: 'natural' }, { note: 'C#5', type: 'accidental' },
  { note: 'D5', type: 'natural' }, { note: 'D#5', type: 'accidental' },
  { note: 'E5', type: 'natural' },
  { note: 'F5', type: 'natural' }
];

export default function Vibraphone() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [motorSpeed, setMotorSpeed] = useState(5); // Tremolo speed in Hz
  
  const synthRef = useRef(null);
  const tremoloRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 4, wet: 0.5 }).connect(masterBus);
    
    // The Vibraphone's defining feature is the rotating discs in the resonators
    // which create a deep amplitude tremolo
    tremoloRef.current = new Tone.Tremolo({ frequency: motorSpeed, depth: 0.8, spread: 180 }).connect(reverbRef.current).start();
    
    // Smooth, metallic bell tone
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 1,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 1, sustain: 0.2, release: 2 },
      modulation: { type: 'sine' }
    }).connect(tremoloRef.current);

    return () => {
      synthRef.current?.dispose();
      tremoloRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  useEffect(() => {
      if (tremoloRef.current) {
          tremoloRef.current.frequency.rampTo(motorSpeed, 0.1);
      }
  }, [motorSpeed]);

  const hitKey = async (note) => {
    await Tone.start();
    if (synthRef.current && !activeNotes.has(note)) {
      synthRef.current.triggerAttack(note);
      setActiveNotes(prev => new Set(prev).add(note));
    }
  };

  const releaseKey = (note) => {
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Motor Speed (Tremolo Hz)</label>
          <input 
            type="range" min="1" max="15" step="0.5" 
            value={motorSpeed} 
            onChange={(e) => setMotorSpeed(Number(e.target.value))}
            style={{ width: '150px', accentColor: '#10b981' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '5px', padding: '20px', background: '#27272a', borderRadius: '10px', position: 'relative' }}>
        
        {/* Natural Keys */}
        {KEYS.filter(k => k.type === 'natural').map((k, i) => (
            <div 
                key={k.note}
                onMouseDown={() => hitKey(k.note)}
                onMouseUp={() => releaseKey(k.note)}
                onMouseLeave={() => releaseKey(k.note)}
                style={{
                    width: '50px', 
                    height: `${250 - (i * 5)}px`, // Get slightly shorter
                    background: activeNotes.has(k.note) ? '#fff' : 'linear-gradient(to right, #d1d5db, #f3f4f6, #d1d5db)', // Silver metal
                    borderRadius: '5px', border: '1px solid #9ca3af',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                    cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px',
                    transition: 'background 0.1s'
                }}
            >
                <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>{k.note}</span>
            </div>
        ))}

        {/* Accidental Keys (Raised layer) */}
        <div style={{ position: 'absolute', top: '10px', left: '45px', display: 'flex', gap: '5px', pointerEvents: 'none' }}>
            {KEYS.map((k, i) => {
                if (k.type === 'natural') {
                    // Spacer for naturals that don't have a sharp
                    if (k.note === 'B4' || k.note === 'E5') {
                        return <div key={`space-${i}`} style={{ width: '50px' }} />;
                    }
                    return null;
                }
                
                return (
                    <div 
                        key={k.note}
                        onMouseDown={() => hitKey(k.note)}
                        onMouseUp={() => releaseKey(k.note)}
                        onMouseLeave={() => releaseKey(k.note)}
                        style={{
                            width: '50px', 
                            height: `${200 - (i * 5)}px`,
                            background: activeNotes.has(k.note) ? '#fff' : 'linear-gradient(to right, #9ca3af, #d1d5db, #9ca3af)', // Darker silver
                            borderRadius: '5px', border: '1px solid #6b7280',
                            boxShadow: '0 15px 25px rgba(0,0,0,0.8)',
                            cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px',
                            pointerEvents: 'auto', transition: 'background 0.1s'
                        }}
                    >
                        <span style={{ color: '#000', fontSize: '10px', fontWeight: 'bold' }}>{k.note}</span>
                    </div>
                );
            })}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Adjust the Motor Speed slider to control the deep Tremolo effect.</p>
    </div>
  );
}
