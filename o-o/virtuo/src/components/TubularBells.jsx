import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const CHIMES = [
  { note: 'C4' }, { note: 'D4' }, { note: 'E4' }, { note: 'F4' },
  { note: 'G4' }, { note: 'A4' }, { note: 'B4' }, { note: 'C5' }
];

export default function TubularBells() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 5, wet: 0.6 }).connect(masterBus);
    
    // Complex metallic sound using FMSynth and long release
    synthRef.current = new Tone.FMSynth({
      harmonicity: 3.14,
      modulationIndex: 5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 4 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 4 }
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

  const strikeBell = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, "4n");
      setActiveNote(note);
      setTimeout(() => setActiveNote(null), 200); // Visual flash
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

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', height: '400px' }}>
        
        {/* Support Rack */}
        <div style={{ display: 'flex', gap: '15px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderTop: '5px solid #27272a' }}>
            {CHIMES.map((k, i) => (
                <div key={k.note} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Hanging String */}
                    <div style={{ width: '2px', height: '20px', background: '#555' }} />
                    
                    {/* The Brass Tube */}
                    <div 
                        onMouseDown={() => strikeBell(k.note)}
                        style={{
                            width: '30px', 
                            height: `${300 - (i * 20)}px`, // Getting shorter = higher pitch
                            background: activeNote === k.note ? '#fef08a' : 'linear-gradient(to right, #b45309, #f59e0b, #b45309)',
                            borderRadius: '2px', cursor: 'pointer',
                            boxShadow: activeNote === k.note ? '0 0 20px #f59e0b' : '0 5px 10px rgba(0,0,0,0.5)',
                            transition: 'background 0.1s, box-shadow 0.1s',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px'
                        }}
                    >
                        <span style={{ color: '#000', fontSize: '10px', fontWeight: 'bold', opacity: 0.5 }}>{k.note}</span>
                    </div>
                </div>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the heavy brass tubes to strike the orchestral chimes.</p>
    </div>
  );
}
