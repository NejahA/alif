import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const NOTES = [
  { note: 'C2', label: 'C' }, { note: 'D2', label: 'D' }, { note: 'E2', label: 'E' }, { note: 'F2', label: 'F' },
  { note: 'G2', label: 'G' }, { note: 'A2', label: 'A' }
];

export default function Alphorn() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    // Massive cavernous reverb for the mountain echo
    reverbRef.current = new Tone.Reverb({ decay: 8, wet: 0.8 }).connect(masterBus);
    
    // Deep, powerful, slightly detuned brass
    synthRef.current = new Tone.FMSynth({
      harmonicity: 0.99, // Slight detune for that wooden brass sound
      modulationIndex: 1.5,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 1.5 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.5, decay: 0.2, sustain: 0.5, release: 1.5 }
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
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveNote(note);
    }
  };

  const releaseNote = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActiveNote(null);
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
        
        {/* The Giant Horn */}
        <div style={{ 
            width: '600px', height: '120px', display: 'flex', alignItems: 'center',
            position: 'relative'
        }}>
            {/* Mouthpiece */}
            <div style={{ width: '40px', height: '20px', background: '#3e2723', borderRadius: '5px' }} />
            
            {/* Very long body */}
            <div style={{ 
                flex: 1, height: '40px', background: 'linear-gradient(to bottom, #d97706, #b45309, #78350f)',
                clipPath: 'polygon(0% 25%, 100% 0%, 100% 100%, 0% 75%)', // getting thicker
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }} />
            
            {/* Curving Bell */}
            <div style={{ 
                width: '100px', height: '120px', background: 'radial-gradient(ellipse at right, #451a03, #b45309)',
                borderRadius: '0 60px 60px 0', border: '5px solid #78350f', borderLeft: 'none',
                boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.8)',
                marginLeft: '-5px'
            }} />
        </div>

        {/* Notes */}
        <div style={{ display: 'flex', gap: '15px' }}>
            {NOTES.map((k) => (
                <button 
                    key={k.note}
                    onMouseDown={() => playNote(k.note)}
                    onMouseUp={releaseNote}
                    onMouseLeave={releaseNote}
                    style={{
                        width: '60px', height: '60px', background: activeNote === k.note ? '#fef08a' : '#d97706',
                        borderRadius: '50%', border: '4px solid #78350f',
                        cursor: 'pointer', color: '#111', fontSize: '14px', fontWeight: 'bold',
                        boxShadow: activeNote === k.note ? '0 0 20px #fef08a' : '0 10px 20px rgba(0,0,0,0.5)',
                        transition: 'all 0.1s'
                    }}
                >
                    {k.label}
                </button>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Play deep, resonating notes through the massive Alpine mountain horn.</p>
    </div>
  );
}
