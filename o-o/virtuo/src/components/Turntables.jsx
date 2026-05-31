import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion, useAnimation } from 'framer-motion';
import { Volume2, Disc } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Turntables() {
  const [volume, setVolume] = useState(-5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const controls = useAnimation();
  
  const playerRef = useRef(null);

  useEffect(() => {
    // We'll use an oscillator for the scratch sound since we don't have an audio file loaded
    playerRef.current = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.1 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 }
    }).connect(masterBus);

    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      controls.start({ rotate: 360, transition: { duration: 2 / speed, repeat: Infinity, ease: 'linear' } });
    } else {
      controls.stop();
    }
  }, [isPlaying, speed, controls]);

  const togglePlay = async () => {
    await Tone.start();
    setIsPlaying(!isPlaying);
  };

  const handleScratch = async (e) => {
    await Tone.start();
    if (playerRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const centerY = bounds.top + bounds.height / 2;
      const dist = e.clientY - centerY;
      
      // Map vertical mouse movement to "scratch" pitch/modulation
      const freq = 400 + Math.abs(dist) * 5;
      
      playerRef.current.triggerAttackRelease(freq, 0.1);
      
      // Visual scratch
      controls.set({ rotate: dist > 0 ? 10 : -10 });
      if (isPlaying) {
        controls.start({ rotate: 360, transition: { duration: 2, repeat: Infinity, ease: 'linear' } });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'space-between' }}>
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
        
        <button 
          className={`btn-glass ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
        >
          {isPlaying ? 'STOP' : 'PLAY'}
        </button>
      </div>

      <div 
        style={{ 
          width: '400px', height: '400px', background: '#111', borderRadius: '20px', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
          border: '5px solid #333'
        }}
      >
        <motion.div
          animate={controls}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleScratch(e);
          }}
          onMouseDown={(e) => {
             controls.stop();
             handleScratch(e);
          }}
          onMouseUp={() => {
             if(isPlaying) controls.start({ rotate: 360, transition: { duration: 2/speed, repeat: Infinity, ease: 'linear' } });
          }}
          onMouseLeave={() => {
             if(isPlaying) controls.start({ rotate: 360, transition: { duration: 2/speed, repeat: Infinity, ease: 'linear' } });
          }}
          style={{
            width: '300px', height: '300px', background: '#000', borderRadius: '50%',
            cursor: 'grab', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: 'inset 0 0 20px #333'
          }}
        >
          {/* Record Grooves */}
          <div style={{ position: 'absolute', width: '280px', height: '280px', border: '1px solid #111', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: '260px', height: '260px', border: '1px solid #111', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: '240px', height: '240px', border: '1px solid #111', borderRadius: '50%' }} />
          
          {/* Record Label */}
          <div style={{ width: '100px', height: '100px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Disc size={40} color="#000" />
            {/* Center Pin */}
            <div style={{ position: 'absolute', width: '10px', height: '10px', background: '#ccc', borderRadius: '50%' }} />
          </div>
        </motion.div>
        
        {/* Tonearm */}
        <div style={{
          position: 'absolute', top: '50px', right: '40px', width: '20px', height: '200px',
          background: '#aaa', transformOrigin: 'top center',
          transform: `rotate(${isPlaying ? '20deg' : '0deg'})`,
          transition: 'transform 0.5s ease',
          borderRadius: '10px'
        }}>
          {/* Headshell */}
          <div style={{ position: 'absolute', bottom: '-10px', left: '-5px', width: '30px', height: '40px', background: '#333', borderRadius: '5px' }} />
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag the record to scratch.</p>
    </div>
  );
}
