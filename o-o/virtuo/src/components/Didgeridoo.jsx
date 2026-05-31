import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Didgeridoo() {
  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const lfoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-5);
  const [intensity, setIntensity] = useState(50); // Modulates the LFO rate for rhythmic changes

  useEffect(() => {
    // Didgeridoo sound: Low frequency FM Synth passed through a modulating filter
    filterRef.current = new Tone.Filter(200, "lowpass").connect(masterBus);
    
    synthRef.current = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 10,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.5, decay: 0, sustain: 1, release: 1 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 1 }
    }).connect(filterRef.current);

    // LFO to simulate the rhythmic breathing/vocalizations
    lfoRef.current = new Tone.LFO(4, 100, 1000).connect(filterRef.current.frequency);
    lfoRef.current.type = "sine";
    lfoRef.current.start();
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' && !isPlaying) {
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      lfoRef.current?.dispose();
    };
  }, [isPlaying]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  useEffect(() => {
    if (lfoRef.current) {
      // Map intensity to LFO rate (rhythm speed) and filter depth
      const rate = 1 + (intensity / 100) * 8; // 1Hz to 9Hz
      lfoRef.current.frequency.rampTo(rate, 0.1);
      
      const maxFreq = 300 + (intensity / 100) * 1500;
      lfoRef.current.max = maxFreq;
    }
    if (synthRef.current) {
        synthRef.current.modulationIndex.value = 5 + (intensity / 100) * 15;
    }
  }, [intensity]);

  const togglePlay = async () => {
    await Tone.start();
    if (!synthRef.current) return;
    
    if (!isPlaying) {
      synthRef.current.triggerAttack("C1"); // Deep drone note
      setIsPlaying(true);
    } else {
      synthRef.current.triggerRelease();
      setIsPlaying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Activity size={14} /> Breath Rhythm
          </label>
          <input 
            type="range" min="0" max="100" step="1" 
            value={intensity} 
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={togglePlay}
            style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {isPlaying ? 'Stop Drone' : 'Blow Drone (Space)'}
          </button>
        </div>
      </div>

      {/* Didgeridoo Visual */}
      <div style={{ 
        position: 'relative',
        height: '300px',
        width: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        perspective: '500px'
      }}>
        
        {/* The Pipe */}
        <motion.div 
          animate={{ 
             scaleX: isPlaying ? [1, 1.05, 1] : 1,
             rotateZ: isPlaying ? [0, -1, 1, 0] : 0 
          }}
          transition={{ 
             duration: 1 / (1 + (intensity / 100) * 8), // Match animation roughly to LFO rate
             repeat: isPlaying ? Infinity : 0 
          }}
          style={{
            height: '100%',
            width: '40px',
            background: 'linear-gradient(to right, #3e1f0b, #8b4513, #3e1f0b)',
            borderRadius: '50px 50px 10px 10px / 100px 100px 5px 5px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
           {/* Wood grain details */}
           <div style={{ position: 'absolute', top: 0, bottom: 0, left: 10, width: 2, background: 'rgba(0,0,0,0.2)' }} />
           <div style={{ position: 'absolute', top: 0, bottom: 0, right: 15, width: 1, background: 'rgba(0,0,0,0.3)' }} />
           <div style={{ position: 'absolute', top: 50, left: 0, right: 0, height: 10, background: 'rgba(0,0,0,0.4)' }} />
           <div style={{ position: 'absolute', top: 150, left: 0, right: 0, height: 5, background: 'rgba(0,0,0,0.4)' }} />
        </motion.div>

        {/* The Bell (bottom) */}
        <motion.div 
          animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
          transition={{ 
             duration: 1 / (1 + (intensity / 100) * 8), 
             repeat: isPlaying ? Infinity : 0 
          }}
          style={{
            position: 'absolute',
            bottom: '-20px',
            width: '80px',
            height: '40px',
            background: 'radial-gradient(ellipse at center, #1a0d05, #3e1f0b, #5c2e12)',
            borderRadius: '50%',
            boxShadow: '0 5px 10px rgba(0,0,0,0.8), inset 0 5px 10px rgba(0,0,0,0.5)',
            border: '2px solid #2a1508'
          }}
        />
        
        {/* Mouthpiece */}
        <div style={{
            position: 'absolute',
            top: '-5px',
            width: '30px',
            height: '10px',
            background: '#d2b48c', // beeswax color
            borderRadius: '50%',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
        }} />

      </div>
    </div>
  );
}
