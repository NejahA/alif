import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Erhu() {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(-5);
  const [pitch, setPitch] = useState(400);
  
  const synthRef = useRef(null);
  const vibratoRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0.4 }).connect(masterBus);
    vibratoRef.current = new Tone.Vibrato({ frequency: 6, depth: 0.1 }).connect(reverbRef.current);
    
    // Erhu has a very vocal-like, nasal string sound
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { Q: 3, type: 'bandpass' },
      envelope: { attack: 0.2, decay: 0.1, sustain: 1, release: 0.5 },
      filterEnvelope: { attack: 0.2, decay: 0.1, sustain: 1, release: 0.5, baseFrequency: 300, octaves: 2 }
    }).connect(vibratoRef.current);

    return () => {
      synthRef.current?.dispose();
      vibratoRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const handleBowStart = async (e) => {
    await Tone.start();
    const bounds = e.currentTarget.getBoundingClientRect();
    const relativeY = 1 - Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height));
    const initialPitch = 200 + (relativeY * 800);
    setPitch(initialPitch);
    
    if (synthRef.current) {
      synthRef.current.triggerAttack(initialPitch);
      setActive(true);
    }
  };

  const handleBowMove = (e) => {
    if (active && synthRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const relativeY = 1 - Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height));
      const newPitch = 200 + (relativeY * 800);
      setPitch(newPitch);
      // Smooth portamento
      synthRef.current.frequency.rampTo(newPitch, 0.1);
      
      // Map X movement to vibrato depth
      const relativeX = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
      if (vibratoRef.current) {
        vibratoRef.current.depth.rampTo(0.05 + (relativeX * 0.2), 0.1);
      }
    }
  };

  const handleBowStop = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActive(false);
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        
        {/* Erhu Body & Neck */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Neck */}
            <div style={{ width: '10px', height: '300px', background: '#3e2723', borderRight: '2px solid #fff' }} />
            {/* Body */}
            <div style={{ 
                width: '80px', height: '100px', 
                background: '#4e342e', // snakeskin-ish color
                border: '4px solid #3e2723',
                borderRadius: '10px',
                marginTop: '-20px',
                position: 'relative'
            }} />
        </div>

        {/* Interaction Play Area (Virtual Bow) */}
        <div 
            onMouseDown={handleBowStart}
            onMouseMove={handleBowMove}
            onMouseUp={handleBowStop}
            onMouseLeave={handleBowStop}
            style={{ 
                width: '100px', height: '300px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: '10px',
                cursor: 'crosshair',
                position: 'relative',
                display: 'flex', justifyContent: 'center'
            }}
        >
            <div style={{ position: 'absolute', top: '10px', color: '#555', fontSize: '10px' }}>High Pitch</div>
            <div style={{ position: 'absolute', bottom: '10px', color: '#555', fontSize: '10px' }}>Low Pitch</div>
            
            {active && (
                <motion.div 
                    style={{ 
                        position: 'absolute', 
                        bottom: `${((pitch - 200) / 800) * 100}%`, 
                        width: '100%', height: '2px', 
                        background: '#fff',
                        boxShadow: '0 0 10px #fff'
                    }} 
                />
            )}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag vertically to slide pitch. Drag horizontally for vibrato.</p>
    </div>
  );
}
