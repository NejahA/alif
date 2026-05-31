import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Waterphone() {
  const [volume, setVolume] = useState(-5);
  const [activeRods, setActiveRods] = useState(new Set());
  
  const synthsRef = useRef([]);
  const reverbRef = useRef(null);

  // Frequencies for the unequal metal rods of a waterphone
  const rods = [
    300, 315, 340, 390, 410, 480, 520, 600, 650, 710, 800, 890, 950, 1100, 1250, 1400
  ];

  useEffect(() => {
    // Huge dark cavernous reverb for the eerie effect
    reverbRef.current = new Tone.Reverb({ decay: 8, wet: 0.8 }).connect(masterBus);
    
    synthsRef.current = rods.map(freq => {
      // FM Synth gives the metallic squeal of bowed rods
      const synth = new Tone.FMSynth({
        harmonicity: 3.1,
        modulationIndex: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 2 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.5, decay: 0.2, sustain: 1, release: 2 }
      }).connect(reverbRef.current);
      return { synth, freq };
    });

    return () => {
      synthsRef.current.forEach(s => s.synth.dispose());
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    synthsRef.current.forEach(s => s.synth.volume.rampTo(volume, 0.1));
  }, [volume]);

  const bowRod = async (index) => {
    await Tone.start();
    const { synth, freq } = synthsRef.current[index];
    
    // Add random slight pitch bend to simulate water shifting in the bowl
    const detune = (Math.random() - 0.5) * 50; 
    synth.detune.value = detune;

    synth.triggerAttack(freq);
    setActiveRods(prev => new Set(prev).add(index));
  };

  const releaseRod = (index) => {
    const { synth } = synthsRef.current[index];
    synth.triggerRelease();
    setActiveRods(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
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

      <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        
        {/* Metal Rods arranged in a semi-circle */}
        {rods.map((_, i) => {
          const angle = (i / (rods.length - 1)) * Math.PI - (Math.PI / 2); // -90 to 90 degrees
          const radius = 100;
          const x = Math.sin(angle) * radius;
          
          // Height varies arbitrarily
          const height = 150 + (i % 3) * 20 - (i % 2) * 10;
          
          return (
            <div 
              key={i}
              onMouseEnter={(e) => { if (e.buttons === 1) bowRod(i); }}
              onMouseDown={() => bowRod(i)}
              onMouseUp={() => releaseRod(i)}
              onMouseLeave={() => releaseRod(i)}
              style={{
                position: 'absolute',
                bottom: '100px',
                left: `calc(50% + ${x}px)`,
                width: '6px',
                height: `${height}px`,
                background: activeRods.has(i) ? '#fff' : '#71717a',
                borderRadius: '3px 3px 0 0',
                transformOrigin: 'bottom',
                transform: `rotate(${angle * 0.2}rad)`, // Slight flare outwards
                boxShadow: activeRods.has(i) ? '0 0 10px #fff' : 'inset -2px 0 2px rgba(0,0,0,0.5)',
                cursor: 'crosshair',
                transition: 'background 0.1s'
              }}
            />
          );
        })}

        {/* Central Resonator Bowl / Handle */}
        <div style={{ 
            position: 'absolute', bottom: '0', 
            width: '120px', height: '100px', 
            background: 'radial-gradient(ellipse at top, #52525b, #27272a)',
            borderRadius: '50% 50% 10px 10px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.8), inset 0 5px 10px rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px'
        }}>
            <div style={{ width: '20px', height: '120px', background: '#3f3f46', borderRadius: '10px', position: 'absolute', bottom: '20px' }} />
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag across the metal rods to "bow" the Waterphone. Excellent for horror scores.</p>
    </div>
  );
}
