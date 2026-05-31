import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Kaossilator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [x, setX] = useState(0.5);
  const [y, setY] = useState(0.5);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const delayRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    delayRef.current = new Tone.PingPongDelay("8n", 0.4).connect(masterBus);
    
    // Lowpass filter controlled by Y axis
    filterRef.current = new Tone.Filter({ type: 'lowpass', frequency: 1000, Q: 5 }).connect(delayRef.current);
    
    // Rich synth controlled by X axis
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'fmsawtooth', modulationIndex: 10 },
      envelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 0.5 }
    }).connect(filterRef.current);

    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      delayRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
        synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const handlePadInteraction = async (e) => {
    if (e.buttons !== 1) return;
    await Tone.start();
    
    if (padRef.current && synthRef.current && filterRef.current) {
      const rect = padRef.current.getBoundingClientRect();
      let percentX = (e.clientX - rect.left) / rect.width;
      let percentY = 1 - ((e.clientY - rect.top) / rect.height); // Bottom is 0, Top is 1
      
      percentX = Math.max(0, Math.min(1, percentX));
      percentY = Math.max(0, Math.min(1, percentY));

      setX(percentX);
      setY(percentY);

      // Map X to Pitch (C2 to C6, quantized to pentatonic scale for musicality)
      const scale = [65.41, 73.42, 82.41, 98.00, 110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C pentatonic
      const noteIndex = Math.floor(percentX * (scale.length - 1));
      const freq = scale[noteIndex];

      // Map Y to Filter Cutoff
      const cutoff = 100 + percentY * 5000;

      synthRef.current.frequency.rampTo(freq, 0.05);
      filterRef.current.frequency.rampTo(cutoff, 0.05);

      if (!isPlaying) {
          synthRef.current.triggerAttack(freq);
          setIsPlaying(true);
      }
    }
  };

  const releasePad = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setIsPlaying(false);
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

      <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '2px solid #333' }}>
          
        {/* XY Pad */}
        <div 
            ref={padRef}
            onMouseDown={handlePadInteraction}
            onMouseMove={handlePadInteraction}
            onMouseUp={releasePad}
            onMouseLeave={releasePad}
            style={{ 
                width: '300px', height: '300px', background: '#000', 
                borderRadius: '10px', border: '2px solid #10b981',
                position: 'relative', cursor: 'crosshair', overflow: 'hidden',
                boxShadow: isPlaying ? '0 0 30px rgba(16, 185, 129, 0.5)' : 'none'
            }}
        >
            {/* Grid lines */}
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={`v-${i}`} style={{ position: 'absolute', left: `${i * 10}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(16, 185, 129, 0.2)' }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={`h-${i}`} style={{ position: 'absolute', top: `${i * 10}%`, left: 0, right: 0, height: '1px', background: 'rgba(16, 185, 129, 0.2)' }} />
            ))}

            {/* Glowing Touch Point */}
            {isPlaying && (
                <div style={{
                    position: 'absolute',
                    left: `${x * 100}%`,
                    top: `${(1 - y) * 100}%`,
                    width: '20px', height: '20px',
                    background: '#10b981',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 20px #10b981, 0 0 40px #fff',
                    pointerEvents: 'none'
                }} />
            )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '10px', marginTop: '10px', fontFamily: 'monospace' }}>
            <span>PITCH (X)</span>
            <span>CUTOFF (Y)</span>
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag inside the glowing square to sweep Pitch and Filter Cutoff simultaneously.</p>
    </div>
  );
}
