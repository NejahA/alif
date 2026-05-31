import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Upload } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function GranularSynth() {
  const [volume, setVolume] = useState(-5);
  const [grainSize, setGrainSize] = useState(0.1);
  const [overlap, setOverlap] = useState(0.05);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  
  const playerRef = useRef(null);

  useEffect(() => {
    // GrainPlayer is perfect for granular synthesis in Tone.js
    playerRef.current = new Tone.GrainPlayer({
      url: "https://tonejs.github.io/audio/loop/FW3.mp3", // Default sample
      loop: true,
      grainSize: grainSize,
      overlap: overlap,
      playbackRate: playbackRate
    }).connect(masterBus);
    
    Tone.loaded().then(() => {
      setHasAudio(true);
    });

    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) playerRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  useEffect(() => {
    if (playerRef.current && hasAudio) {
      playerRef.current.grainSize = grainSize;
      playerRef.current.overlap = overlap;
      playerRef.current.playbackRate = playbackRate;
    }
  }, [grainSize, overlap, playbackRate, hasAudio]);

  const togglePlay = async () => {
    await Tone.start();
    if (!hasAudio) return;
    
    if (isPlaying) {
      playerRef.current.stop();
    } else {
      playerRef.current.start();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (isPlaying) {
        playerRef.current.stop();
        setIsPlaying(false);
      }
      playerRef.current.buffer = new Tone.ToneAudioBuffer(url, () => {
        setHasAudio(true);
      });
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
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="btn-glass" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Upload size={16} /> Load Audio
            <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button 
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={togglePlay}
            disabled={!hasAudio}
            style={{ opacity: hasAudio ? 1 : 0.5 }}
          >
            {isPlaying ? 'STOP' : 'PLAY'}
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', gap: '40px', padding: '30px', 
        background: '#111', borderRadius: '20px', border: '1px solid #333',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
      }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '12px' }}>
              <span>Grain Size</span>
              <span>{grainSize.toFixed(2)}s</span>
            </div>
            <input 
              type="range" min="0.01" max="0.5" step="0.01" 
              value={grainSize} 
              onChange={(e) => setGrainSize(Number(e.target.value))}
              style={{ width: '200px', accentColor: '#8a2be2' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '12px' }}>
              <span>Overlap</span>
              <span>{overlap.toFixed(2)}s</span>
            </div>
            <input 
              type="range" min="0.01" max="0.2" step="0.01" 
              value={overlap} 
              onChange={(e) => setOverlap(Number(e.target.value))}
              style={{ width: '200px', accentColor: '#3b82f6' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '12px' }}>
              <span>Playback Rate</span>
              <span>{playbackRate.toFixed(2)}x</span>
            </div>
            <input 
              type="range" min="0.1" max="4" step="0.1" 
              value={playbackRate} 
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              style={{ width: '200px', accentColor: '#10b981' }}
            />
          </div>

        </div>

        {/* Visualizer representation */}
        <div style={{ 
          width: '200px', height: '200px', 
          background: '#000', borderRadius: '50%',
          position: 'relative', overflow: 'hidden',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          {isPlaying && Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * 200, 
                y: (Math.random() - 0.5) * 200,
                opacity: 0,
                scale: Math.random() * 2
              }}
              transition={{ duration: grainSize, repeat: Infinity, ease: 'easeOut', delay: Math.random() * overlap }}
              style={{
                position: 'absolute',
                width: '10px', height: '10px',
                background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                borderRadius: '50%'
              }}
            />
          ))}
          {!isPlaying && <span style={{ color: '#333' }}>IDLE</span>}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Load an audio file and manipulate its tiny grains to create new textures.</p>
    </div>
  );
}
