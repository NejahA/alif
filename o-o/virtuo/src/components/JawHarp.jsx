import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function JawHarp() {
  const [active, setActive] = useState(false);
  const [vowel, setVowel] = useState(500); // Filter frequency corresponding to mouth shape
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    // Vowel formant filter
    filterRef.current = new Tone.Filter({ type: 'bandpass', frequency: 500, Q: 3 }).connect(masterBus);
    
    // Very rich, buzzy tone for the metal reed
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.1 }
    }).connect(filterRef.current);

    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.rampTo(vowel, 0.1);
    }
  }, [vowel]);

  const pluck = async () => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack('C2'); // Low fundamental pitch
      setActive(true);
      setTimeout(() => setActive(false), 100);
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

      <div style={{ display: 'flex', gap: '50px', alignItems: 'center' }}>
        
        {/* Pluck Trigger (The Reed) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#888', fontSize: '12px' }}>Pluck Reed</div>
            <div 
                onMouseDown={pluck}
                style={{ 
                    width: '60px', height: '150px', background: '#3f3f46', 
                    borderRadius: '30px', border: '5px solid #a1a1aa',
                    position: 'relative', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {/* The metal tongue */}
                <div style={{ 
                    width: '4px', height: '120px', background: '#e5e7eb',
                    transform: active ? 'scaleX(4)' : 'scaleX(1)',
                    transition: 'transform 0.05s', boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                }} />
            </div>
        </div>

        {/* Mouth Shape (Vowel Filter) Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#888', fontSize: '12px' }}>Mouth Shape (Vowel)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>Ooo</span>
                <input 
                    type="range" min="300" max="2500" step="10" 
                    value={vowel} 
                    onChange={(e) => setVowel(Number(e.target.value))}
                    style={{ width: '200px', accentColor: '#10b981' }}
                />
                <span style={{ color: '#fff', fontWeight: 'bold' }}>Eee</span>
            </div>
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the metal frame to pluck the reed, and move the slider to change your mouth shape ("Boing" effect).</p>
    </div>
  );
}
