import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STRINGS = ['E1', 'A1', 'D2', 'G2'];

export default function DoubleBass() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [isPizzicato, setIsPizzicato] = useState(true);
  
  const arcoSynthRef = useRef(null);
  const pizzSynthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 3, wet: 0.3 }).connect(masterBus);
    
    // Arco (Bowed)
    arcoSynthRef.current = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 1.5,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.4, decay: 0.2, sustain: 0.8, release: 1 },
      modulation: { type: 'sine' }
    }).connect(reverbRef.current);

    // Pizzicato (Plucked)
    pizzSynthRef.current = new Tone.PluckSynth({
      attackNoise: 2,
      dampening: 2000,
      resonance: 0.9
    }).connect(reverbRef.current);

    return () => {
      arcoSynthRef.current?.dispose();
      pizzSynthRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (arcoSynthRef.current) arcoSynthRef.current.volume.rampTo(volume, 0.1);
    if (pizzSynthRef.current) pizzSynthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    setActiveNote(note);
    if (isPizzicato) {
      pizzSynthRef.current.triggerAttack(note);
    } else {
      arcoSynthRef.current.triggerAttack(note);
    }
  };

  const releaseNote = () => {
    setActiveNote(null);
    if (!isPizzicato) {
      arcoSynthRef.current.triggerRelease();
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

        <button 
            onClick={() => setIsPizzicato(!isPizzicato)}
            style={{ 
                padding: '10px 20px', background: isPizzicato ? '#10b981' : '#3b82f6',
                color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
            }}
        >
            {isPizzicato ? 'Pizzicato (Pluck)' : 'Arco (Bow)'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        {/* The Fingerboard */}
        <div style={{ 
            width: '120px', height: '400px', background: '#111', 
            borderRadius: '10px', position: 'relative', display: 'flex', justifyContent: 'space-evenly',
            paddingTop: '20px', paddingBottom: '20px', border: '2px solid #3e2723'
        }}>
            {STRINGS.map((note, i) => (
                <div key={note} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: '#fff', fontSize: '10px' }}>{note}</div>
                    <div 
                        onMouseDown={() => playNote(note)}
                        onMouseUp={releaseNote}
                        onMouseLeave={releaseNote}
                        style={{ 
                            width: '15px', flex: 1, background: activeNote === note ? '#fff' : '#d1d5db',
                            borderRadius: '5px', cursor: 'pointer',
                            boxShadow: activeNote === note ? '0 0 10px #fff' : 'inset -2px 0 2px rgba(0,0,0,0.5)',
                            transition: 'all 0.1s'
                        }}
                    />
                </div>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>The foundation of the orchestra. Click the strings to play deep bass tones.</p>
    </div>
  );
}
