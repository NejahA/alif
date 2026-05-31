import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const FRETS = [
  { note: 'E4' }, { note: 'F4' }, { note: 'F#4' }, { note: 'G4' },
  { note: 'G#4' }, { note: 'A4' }, { note: 'A#4' }, { note: 'B4' },
  { note: 'C5' }, { note: 'C#5' }, { note: 'D5' }, { note: 'D#5' }, { note: 'E5' }
];

export default function Balalaika() {
  const [activeFret, setActiveFret] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [isTremolo, setIsTremolo] = useState(false);
  
  const synthRef = useRef(null);
  const tremoloLoopRef = useRef(null);

  useEffect(() => {
    // Sharp plucked string sound
    synthRef.current = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 3000,
      resonance: 0.98
    }).connect(masterBus);

    // Set up a loop for rapid tremolo picking
    tremoloLoopRef.current = new Tone.Loop((time) => {
      if (synthRef.current && activeFret) {
        synthRef.current.triggerAttack(activeFret, time);
      }
    }, "16n");

    return () => {
      synthRef.current?.dispose();
      tremoloLoopRef.current?.dispose();
      Tone.Transport.stop();
    };
  }, [activeFret]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  // Handle the hold-down tremolo
  useEffect(() => {
    if (isTremolo && activeFret) {
        Tone.Transport.start();
        tremoloLoopRef.current.start(0);
    } else {
        tremoloLoopRef.current.stop();
    }
  }, [isTremolo, activeFret]);

  const startPicking = async (note) => {
    await Tone.start();
    setActiveFret(note);
    setIsTremolo(true);
    // Initial pluck
    if (synthRef.current && !isTremolo) {
        synthRef.current.triggerAttack(note);
    }
  };

  const stopPicking = () => {
    setIsTremolo(false);
    setActiveFret(null);
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
        
        {/* The Triangular Body */}
        <div style={{ 
            width: '300px', height: '300px', background: '#d97706', // Light wood
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', // Triangle
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            paddingBottom: '20px', position: 'relative', borderBottom: '10px solid #b45309'
        }}>
            {/* Sound hole */}
            <div style={{ width: '40px', height: '40px', background: '#451a03', borderRadius: '50%', marginBottom: '40px' }} />
            
            {/* Bridge */}
            <div style={{ width: '80px', height: '10px', background: '#111', borderRadius: '5px', marginBottom: '20px' }} />

            {/* Strings running up */}
            <div style={{ position: 'absolute', bottom: '30px', top: '0', display: 'flex', gap: '5px' }}>
                <div style={{ width: '2px', background: '#e5e7eb' }} />
                <div style={{ width: '2px', background: '#e5e7eb' }} />
                <div style={{ width: '2px', background: '#e5e7eb' }} />
            </div>
        </div>

        {/* The Neck (Frets to click) */}
        <div style={{ width: '80px', height: '300px', background: '#451a03', borderRadius: '5px', display: 'flex', flexDirection: 'column', padding: '10px 0' }}>
            {FRETS.map((f, i) => (
                <div 
                    key={i}
                    onMouseDown={() => startPicking(f.note)}
                    onMouseUp={stopPicking}
                    onMouseLeave={stopPicking}
                    style={{ 
                        flex: 1, borderBottom: '2px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: activeFret === f.note ? 'rgba(255,255,255,0.2)' : 'transparent',
                        cursor: 'pointer', color: '#fff', fontSize: '10px', fontWeight: 'bold'
                    }}
                >
                    {f.note}
                </div>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Hold down the frets to trigger the rapid tremolo picking unique to the Balalaika.</p>
    </div>
  );
}
