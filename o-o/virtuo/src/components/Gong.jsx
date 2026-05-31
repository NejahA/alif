import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Gong() {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 6, wet: 0.8 }).connect(masterBus);
    
    // Lowpass filter that slowly opens up to simulate the blooming sound of a gong
    filterRef.current = new Tone.Filter({ type: 'lowpass', frequency: 100, Q: 2 }).connect(reverbRef.current);
    
    // Metallic gong sound using MetalSynth
    synthRef.current = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.1, decay: 0.1, release: 5 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).connect(filterRef.current);

    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const strikeGong = async () => {
    await Tone.start();
    if (synthRef.current && filterRef.current) {
      synthRef.current.triggerAttackRelease('1m'); // Long release
      
      // Filter sweep to simulate the bloom
      filterRef.current.frequency.value = 100;
      filterRef.current.frequency.rampTo(5000, 0.5);
      filterRef.current.frequency.rampTo(100, 4);

      setActive(true);
      setTimeout(() => setActive(false), 200);
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

      <div style={{ position: 'relative', width: '400px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Support Frame */}
        <div style={{ position: 'absolute', top: 0, width: '300px', height: '20px', background: '#3e2723' }} />
        <div style={{ position: 'absolute', top: '20px', left: '100px', width: '5px', height: '80px', background: '#fff' }} />
        <div style={{ position: 'absolute', top: '20px', right: '100px', width: '5px', height: '80px', background: '#fff' }} />

        {/* The Gong */}
        <motion.div
          animate={{ scale: active ? 0.98 : 1, rotate: active ? [0, 2, -2, 1, -1, 0] : 0 }}
          transition={{ duration: 0.5 }}
          onMouseDown={strikeGong}
          style={{ 
            width: '300px', height: '300px', 
            background: 'radial-gradient(circle, #ca8a04 0%, #a16207 70%, #713f12 100%)',
            borderRadius: '50%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 50px rgba(0,0,0,0.5)',
            border: '5px solid #854d0e',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'absolute', top: '100px'
          }}
        >
          {/* Gong Center */}
          <div style={{ width: '50px', height: '50px', background: 'radial-gradient(circle, #713f12 0%, #ca8a04 100%)', borderRadius: '50%', boxShadow: '0 5px 10px rgba(0,0,0,0.5)' }} />
        </motion.div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the center of the Gong to strike it with the mallet.</p>
    </div>
  );
}
