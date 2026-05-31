import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { Timer, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BPMTapper() {
  const [bpm, setBpm] = useState(120);
  const [taps, setTaps] = useState([]);
  const [isTapping, setIsTapping] = useState(false);
  const tapTimeout = useRef(null);

  const handleTap = () => {
    const now = Date.now();
    setIsTapping(true);
    
    // Clear visual feedback after 100ms
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setIsTapping(false), 100);

    const newTaps = [...taps, now].slice(-8); // Keep last 8 taps for average
    setTaps(newTaps);

    if (newTaps.length > 1) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      
      if (newBpm > 20 && newBpm < 300) {
        setBpm(newBpm);
        Tone.Transport.bpm.value = newBpm;
      }
    }
  };

  const resetTaps = () => {
    setTaps([]);
  };

  useEffect(() => {
    // Initialize BPM from Transport
    setBpm(Math.round(Tone.Transport.bpm.value));
    
    // Reset taps if user stops tapping for 2 seconds
    const timer = setInterval(() => {
      if (taps.length > 0 && Date.now() - taps[taps.length - 1] > 2000) {
        resetTaps();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [taps]);

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', width: '250px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Timer size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>BPM Tapper</h3>
      </div>

      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', textShadow: '0 0 10px var(--accent-glow)' }}>
        {bpm}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleTap}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '2px solid var(--accent-primary)',
          background: isTapping ? 'var(--accent-primary)' : 'rgba(0,0,0,0.2)',
          color: isTapping ? 'white' : 'var(--accent-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.1s ease',
          boxShadow: isTapping ? '0 0 30px var(--accent-glow)' : 'none'
        }}
      >
        <Zap size={24} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '5px' }}>TAP</span>
      </motion.button>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
        Tap at least twice to set tempo. <br/>
        Resets after 2s of inactivity.
      </p>

      <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: i < taps.length ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)' 
            }} 
          />
        ))}
      </div>
    </div>
  );
}
