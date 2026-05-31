import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, Zap } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function SpringReverb() {
  const [volume, setVolume] = useState(-5);
  const [tankColor, setTankColor] = useState('#27272a');
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    // We emulate a spring reverb tank crash.
    // When you kick a real spring reverb, the springs violently rattle against the metal chassis.
    // This sounds like a chaotic, metallic thunderclap.
    
    // We use a MetalSynth for the raw harsh metallic noise, heavily fed into a Reverb.
    reverbRef.current = new Tone.Reverb({ decay: 4, wet: 1 }).connect(masterBus);
    
    synthRef.current = new Tone.MetalSynth({
      frequency: 100,
      envelope: { attack: 0.01, decay: 1, release: 2 },
      harmonicity: 8.1,
      modulationIndex: 50, // Extreme chaos
      resonance: 8000,
      octaves: 2
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

  const kickTank = async () => {
    await Tone.start();
    if (synthRef.current) {
      // Trigger the chaotic crash
      synthRef.current.triggerAttackRelease("4n");
      
      // Visual feedback
      setTankColor('#ef4444');
      setTimeout(() => setTankColor('#27272a'), 150);
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* The Metal Tank */}
        <div 
            style={{ 
                width: '400px', height: '150px', 
                background: tankColor, 
                borderRadius: '5px', border: '5px solid #52525b',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.1s ease-out'
            }}
        >
            {/* Visual Springs inside */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '90%' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ 
                        width: '100%', height: '10px', 
                        background: 'repeating-linear-gradient(90deg, #71717a, #71717a 2px, #3f3f46 2px, #3f3f46 4px)',
                        borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                    }} />
                ))}
            </div>
            
            {/* Warning Label */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#fbbf24', fontSize: '10px', fontWeight: 'bold' }}>
                <Zap size={10} style={{ verticalAlign: 'middle', marginRight: '2px' }}/> HIGH VOLTAGE
            </div>
        </div>

        {/* The Kick Button */}
        <button 
            onClick={kickTank}
            style={{ 
                padding: '15px 40px', background: '#dc2626', color: '#fff', 
                fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px',
                cursor: 'pointer', boxShadow: '0 5px 0 #991b1b', textTransform: 'uppercase'
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = 'none'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 0 #991b1b'; }}
        >
            Kick the Tank
        </button>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>"Kicking" a real spring reverb tank produces a legendary thunderous crash. Give it a hit.</p>
    </div>
  );
}
