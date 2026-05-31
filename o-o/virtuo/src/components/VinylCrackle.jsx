import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, Disc3 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function VinylCrackle() {
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(-10);
  
  const noiseRef = useRef(null);
  const crackleLoopRef = useRef(null);

  useEffect(() => {
    // Continuous vinyl hiss (Pink noise filtered)
    const filter = new Tone.Filter(400, "highpass").connect(masterBus);
    noiseRef.current = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 1, decay: 0, sustain: 1, release: 1 }
    }).connect(filter);

    // Random pops and crackles
    const crackleSynth = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0 }
    }).connect(masterBus);

    crackleLoopRef.current = new Tone.Loop((time) => {
        if (Math.random() > 0.6) {
            crackleSynth.triggerAttackRelease("32n", time);
        }
    }, "8n");

    return () => {
      noiseRef.current?.dispose();
      crackleSynth.dispose();
      crackleLoopRef.current?.dispose();
      filter.dispose();
    };
  }, []);

  useEffect(() => {
    if (noiseRef.current) {
        noiseRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const toggleVinyl = async () => {
    await Tone.start();
    if (isActive) {
        noiseRef.current?.triggerRelease();
        crackleLoopRef.current?.stop();
        Tone.Transport.stop();
        setIsActive(false);
    } else {
        Tone.Transport.start();
        noiseRef.current?.triggerAttack();
        crackleLoopRef.current?.start(0);
        setIsActive(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Noise Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* The Vinyl Record */}
        <div 
            onClick={toggleVinyl}
            style={{ 
                width: '250px', height: '250px', background: '#111', 
                borderRadius: '50%', border: '5px solid #222',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                cursor: 'pointer', position: 'relative',
                animation: isActive ? 'spin 2s linear infinite' : 'none'
            }}
        >
            <style>
                {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
            </style>
            
            {/* Grooves */}
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ 
                    position: 'absolute', width: `${230 - i * 15}px`, height: `${230 - i * 15}px`,
                    border: '1px solid #222', borderRadius: '50%'
                }} />
            ))}
            
            {/* Center Label */}
            <div style={{ width: '80px', height: '80px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ width: '10px', height: '10px', background: '#fff', borderRadius: '50%' }} />
            </div>

            {/* Tonearm */}
            {isActive && (
                <div style={{ position: 'absolute', top: '-20px', right: '-40px', width: '100px', height: '150px', borderLeft: '10px solid #d4d4d8', borderBottom: '10px solid #d4d4d8', borderRadius: '0 0 0 20px', transform: 'rotate(20deg)' }} />
            )}
        </div>

        <button 
            className={`btn-glass ${isActive ? 'active' : ''}`}
            onClick={toggleVinyl}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isActive ? '#ef4444' : 'transparent', color: isActive ? '#fff' : '#fff' }}
        >
            <Disc3 size={16} /> {isActive ? 'Stop Record' : 'Drop the Needle'}
        </button>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>A Studio FX unit. Drop the needle to add authentic vinyl dust, crackle, and hiss to your beats.</p>
    </div>
  );
}
