import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Mic } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Kazoo() {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(-5);
  const [pitch, setPitch] = useState(400); // Center pitch
  
  const synthRef = useRef(null);
  const distRef = useRef(null);

  useEffect(() => {
    // Kazoo relies on a buzzy waveform and distortion
    distRef.current = new Tone.Distortion(0.8).connect(masterBus);
    
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { type: 'highpass', frequency: 200 },
      envelope: { attack: 0.05, decay: 0.1, sustain: 1, release: 0.1 }
    }).connect(distRef.current);

    return () => {
      synthRef.current?.dispose();
      distRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const handleHumStart = async () => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(pitch);
      setActive(true);
    }
  };

  const handleHumStop = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActive(false);
    }
  };

  const handleMouseMove = (e) => {
    if (active && synthRef.current) {
        const bounds = e.currentTarget.getBoundingClientRect();
        // Map X position to pitch (200Hz to 800Hz)
        const relativeX = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
        const newPitch = 200 + (relativeX * 600);
        setPitch(newPitch);
        synthRef.current.frequency.rampTo(newPitch, 0.05);
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

      {/* The Kazoo Interaction Area */}
      <div 
        style={{ 
            width: '600px', height: '200px', 
            background: '#ef4444', // Red plastic kazoo
            borderRadius: '100px',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.5)',
            cursor: 'crosshair'
        }}
        onMouseDown={(e) => {
            const bounds = e.currentTarget.getBoundingClientRect();
            const relativeX = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
            setPitch(200 + (relativeX * 600));
            handleHumStart();
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleHumStop}
        onMouseLeave={handleHumStop}
      >
        {/* The Resonator (Turret) */}
        <motion.div 
            animate={{ scale: active ? 1.1 : 1, rotate: active ? [0, 5, -5, 0] : 0 }}
            transition={{ repeat: active ? Infinity : 0, duration: 0.1 }}
            style={{
                position: 'absolute', top: '-30px', left: '30%',
                width: '80px', height: '80px', background: '#eab308', // Yellow top
                borderRadius: '50%', border: '10px solid #ef4444',
                boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.3)',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
        >
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
        </motion.div>

        {/* Mouthpiece */}
        <div style={{ position: 'absolute', left: 0, width: '40px', height: '80px', background: '#dc2626', borderRadius: '20px 0 0 20px' }} />
        
        {/* End piece */}
        <div style={{ position: 'absolute', right: 0, width: '60px', height: '60px', background: '#dc2626', borderRadius: '0 30px 30px 0' }} />

        {active && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ pointerEvents: 'none', color: '#fff', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
            >
                Bzzzzzz... ({Math.round(pitch)} Hz)
            </motion.div>
        )}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag across the Kazoo to hum and change the pitch!</p>
    </div>
  );
}
