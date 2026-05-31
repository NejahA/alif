import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function OndesMartenot() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVol, setMasterVol] = useState(-5);
  
  // Expression Key (Volume)
  const [expression, setExpression] = useState(0); 

  // Ring Position (Pitch)
  const [pitchPercent, setPitchPercent] = useState(0.5);

  const synthRef = useRef(null);
  const wireRef = useRef(null);

  useEffect(() => {
    // The Ondes Martenot produces a very pure, singing, theremin-like tone (often a sine wave with slight harmonics)
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0, sustain: 1, release: 0.1 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  // Update overall volume based on expression key AND master volume
  useEffect(() => {
    if (synthRef.current) {
        // expression is 0 to 1
        // Map expression to dB (-60 to masterVol)
        const db = expression > 0.05 ? masterVol - (1 - expression) * 40 : -100;
        synthRef.current.volume.rampTo(db, 0.05);
    }
  }, [expression, masterVol]);

  // Handle dragging the Ring along the wire
  const handleWireInteraction = async (e) => {
    if (e.buttons !== 1) return;
    await Tone.start();
    
    if (wireRef.current && synthRef.current) {
      const rect = wireRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      
      setPitchPercent(percentage);
      
      // Map percentage to frequency (e.g., C3 to C6 -> approx 130Hz to 1046Hz)
      const newPitch = 130 + percentage * 916;
      synthRef.current.frequency.rampTo(newPitch, 0.05); // Smooth glide (portamento)
    }
  };

  // Start/Stop sound only if Expression Key is pressed
  const handleExpressionKey = async (e) => {
      await Tone.start();
      // Y position on the expression key controls volume
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = Math.max(0, Math.min(1, y / rect.height));
      
      setExpression(percentage);

      if (!isPlaying) {
          // Trigger synth at current frequency
          const freq = 130 + pitchPercent * 916;
          synthRef.current.triggerAttack(freq);
          setIsPlaying(true);
      }
  };

  const releaseExpressionKey = () => {
      setExpression(0);
      setIsPlaying(false);
      if (synthRef.current) {
          synthRef.current.triggerRelease();
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
            value={masterVol} 
            onChange={(e) => setMasterVol(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', width: '100%' }}>
        
        {/* The Wire & Ring */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#888', fontSize: '12px' }}>Slide Ring (Pitch)</div>
            <div 
                ref={wireRef}
                onMouseDown={handleWireInteraction}
                onMouseMove={handleWireInteraction}
                style={{ 
                    width: '80%', height: '40px', background: '#111', 
                    borderRadius: '20px', border: '2px solid #333',
                    position: 'relative', cursor: 'ew-resize',
                    display: 'flex', alignItems: 'center'
                }}
            >
                {/* The Wire */}
                <div style={{ position: 'absolute', left: '10px', right: '10px', height: '2px', background: '#ccc' }} />
                
                {/* The Ring */}
                <div style={{ 
                    position: 'absolute', left: `calc(${pitchPercent * 100}% - 15px)`,
                    width: '30px', height: '30px', border: '5px solid #fff', borderRadius: '50%',
                    background: 'transparent', boxShadow: '0 0 10px #fff', pointerEvents: 'none'
                }} />
            </div>
        </div>

        {/* The Expression Key */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#888', fontSize: '12px' }}>Press & Drag Key (Volume/Expression)</div>
            <div 
                onMouseDown={handleExpressionKey}
                onMouseMove={(e) => { if (e.buttons === 1) handleExpressionKey(e); }}
                onMouseUp={releaseExpressionKey}
                onMouseLeave={releaseExpressionKey}
                style={{ 
                    width: '100px', height: '150px', background: '#e5e7eb', // White key
                    border: '1px solid #9ca3af', borderRadius: '0 0 5px 5px',
                    cursor: 'pointer', position: 'relative',
                    boxShadow: isPlaying ? 'inset 0 -20px 20px rgba(0,0,0,0.2)' : '0 10px 20px rgba(0,0,0,0.5)',
                    transform: isPlaying ? 'rotateX(5deg)' : 'none',
                    transformOrigin: 'top'
                }}
            >
                {/* Visual indicator of pressure/volume */}
                {isPlaying && (
                    <div style={{ 
                        position: 'absolute', bottom: 0, left: 0, right: 0, 
                        height: `${expression * 100}%`, background: 'rgba(59, 130, 246, 0.2)',
                        pointerEvents: 'none'
                    }} />
                )}
            </div>
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Slide the Ring left/right to change Pitch. Press and drag down on the Expression Key to increase Volume.</p>
    </div>
  );
}
