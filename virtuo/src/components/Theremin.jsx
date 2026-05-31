import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Zap, Activity, Volume2 } from 'lucide-react';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function Theremin() {
  const isAudioReady = useAudioSafe();
  const [isActive, setIsActive] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(-20);
  
  const oscRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isAudioReady) return;
    oscRef.current = new Tone.Oscillator({
      type: 'sine',
      frequency: 440,
      volume: -Infinity
    }).connect(getChannel('synth')); // Using synth channel for now

    return () => oscRef.current?.dispose();
  }, []);

  const handleMouseMove = (e) => {
    if (!isActive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = 1 - (e.clientY - rect.top) / rect.height; // 0 to 1

    // Logarithmic frequency mapping (100Hz to 2000Hz)
    const newFreq = 100 * Math.pow(20, x);
    // Linear volume mapping (-60dB to 0dB)
    const newVol = -60 + (y * 60);

    setFrequency(newFreq);
    setVolume(newVol);

    if (oscRef.current) {
      oscRef.current.frequency.rampTo(newFreq, 0.05);
      oscRef.current.volume.rampTo(newVol, 0.05);
    }
  };

  const toggleTheremin = async () => {
    await Tone.start();
    if (isActive) {
      oscRef.current.stop();
      setIsActive(false);
    } else {
      oscRef.current.start();
      setIsActive(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '800px', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={toggleTheremin}
          style={{ padding: '10px 30px', fontSize: '1.1rem', background: isActive ? 'var(--accent-primary)' : undefined }}
        >
          <Zap size={20} /> {isActive ? 'DEACTIVATE' : 'ACTIVATE THEREMIN'}
        </button>

        <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }} />

        <div style={{ display: 'flex', flex: 1, gap: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} />
            <span>Freq: {Math.round(frequency)} Hz</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={14} />
            <span>Vol: {Math.round(volume)} dB</span>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (isActive) oscRef.current.volume.rampTo(-Infinity, 0.2);
        }}
        onMouseEnter={() => {
          if (isActive) oscRef.current.volume.rampTo(volume, 0.1);
        }}
        style={{
          height: '400px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '20px',
          border: '2px solid var(--glass-border)',
          cursor: isActive ? 'none' : 'default',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {!isActive && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', opacity: 0.5 }}>
            Activate to start playing.
          </p>
        )}

        {isActive && (
          <>
            {/* Visual feedback circles */}
            <motion.div 
              animate={{ 
                x: (frequency / 2000) * 100 - 50 + '%',
                y: (1 - (volume + 60) / 60) * 100 - 50 + '%',
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                filter: 'blur(40px)',
                pointerEvents: 'none'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'var(--glass-border)',
              opacity: 0.2
            }} />
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'var(--glass-border)',
              opacity: 0.2
            }} />
            <p style={{ position: 'absolute', bottom: '20px', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.5 }}>
              X-Axis: Frequency | Y-Axis: Volume
            </p>
          </>
        )}
      </div>
    </div>
  );
}
