import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { Scissors, Play, Square, RefreshCw, Layers, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BeatSlicer() {
  const [slices, setSlices] = useState(8);
  const [activeSlice, setActiveSlice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const sequenceRef = useRef(null);

  const [pattern, setPattern] = useState(Array(16).fill(null).map(() => Math.floor(Math.random() * 8)));

  useEffect(() => {
    // In a real app, we'd load an actual loop. For now, we use a synth to simulate slices.
    const sampler = new Tone.Sampler({
      urls: {
        C4: "https://tonejs.github.io/audio/drum-samples/breakbeat.mp3"
      },
      onload: () => {
        playerRef.current = sampler;
      }
    }).toDestination();

    return () => {
      sampler.dispose();
      if (sequenceRef.current) sequenceRef.current.dispose();
    };
  }, []);

  const playSlice = (index) => {
    if (!playerRef.current) return;
    setActiveSlice(index);
    
    // Calculate start time based on slices
    // This is simplified for the demo
    const duration = Tone.Time("1n").toSeconds();
    const sliceTime = (duration / slices) * index;
    
    playerRef.current.triggerAttackRelease("C4", "8n", undefined, 1);
    
    setTimeout(() => setActiveSlice(null), 100);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      Tone.Transport.stop();
      if (sequenceRef.current) sequenceRef.current.stop();
      setIsPlaying(false);
    } else {
      if (sequenceRef.current) sequenceRef.current.dispose();
      
      sequenceRef.current = new Tone.Sequence((time, step) => {
        const sliceIndex = pattern[step];
        if (sliceIndex !== null) {
          playSlice(sliceIndex);
        }
      }, Array.from({length: 16}, (_, i) => i), "16n").start(0);
      
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const randomizePattern = () => {
    setPattern(pattern.map(() => Math.floor(Math.random() * slices)));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Scissors size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Beat Slicer</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
        {Array.from({ length: slices }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => playSlice(i)}
            style={{
              height: '40px',
              background: activeSlice === i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '4px',
              color: 'white',
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: activeSlice === i ? '0 0 15px var(--accent-glow)' : 'none'
            }}
          >
            Slice {i + 1}
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Slices:</span>
        <input 
          type="range" min="4" max="16" step="4" 
          value={slices} 
          onChange={(e) => setSlices(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
        />
        <span style={{ fontSize: '0.8rem' }}>{slices}</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className={`btn-glass ${isPlaying ? 'active' : ''}`} onClick={togglePlayback} style={{ flex: 1 }}>
          {isPlaying ? <Square size={14} /> : <Play size={14} />} {isPlaying ? 'Stop' : 'Play Pattern'}
        </button>
        <button className="btn-glass" onClick={randomizePattern}>
          <RefreshCw size={14} /> Random
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Pattern Sequence</span>
        <div style={{ display: 'flex', gap: '2px', height: '20px' }}>
          {pattern.map((s, i) => (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                background: isPlaying && (Tone.Transport.ticks / (Tone.Transport.PPQ / 4)) % 16 === i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                borderRadius: '1px'
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
