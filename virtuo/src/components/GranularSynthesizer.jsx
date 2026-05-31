import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Box, Sparkles, Wind, Layers } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function GranularSynthesizer() {
  const [grainSize, setGrainSize] = useState(0.1);
  const [overlap, setOverlap] = useState(0.05);
  const [detune, setDetune] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const playerRef = useRef(null);
  
  useEffect(() => {
    // For this simulation, we'll use a GrainPlayer with a generated buffer
    // since we don't have local files easily accessible.
    const buffer = new Tone.ToneAudioBuffer().fromArray(new Float32Array(44100).map(() => Math.random() * 2 - 1));
    
    playerRef.current = new Tone.GrainPlayer({
      url: buffer,
      loop: true,
      grainSize: grainSize,
      overlap: overlap,
      detune: detune
    }).connect(masterBus);

    return () => playerRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.grainSize = grainSize;
      playerRef.current.overlap = overlap;
      playerRef.current.detune = detune;
    }
  }, [grainSize, overlap, detune]);

  const toggleGrain = async () => {
    await Tone.start();
    if (isActive) {
      playerRef.current.stop();
      setIsActive(false);
    } else {
      playerRef.current.start();
      setIsActive(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '800px', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleGrain}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px solid var(--glass-border)',
            boxShadow: isActive ? '0 0 40px var(--accent-glow)' : 'none'
          }}
        >
          <Box size={50} color={isActive ? 'white' : 'var(--text-muted)'} />
        </motion.div>
        <h3 style={{ margin: 0 }}>{isActive ? 'Granular Active' : 'Start Granular'}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Grain Density</h4>
          </div>
          <input type="range" min="0.01" max="0.5" step="0.01" value={grainSize} onChange={(e) => setGrainSize(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Fine</span>
            <span>Coarse</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Overlap</h4>
          </div>
          <input type="range" min="0.01" max="0.2" step="0.01" value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind size={18} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Pitch Drift</h4>
          </div>
          <input type="range" min="-1200" max="1200" step="10" value={detune} onChange={(e) => setDetune(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
        </div>
      </div>
    </div>
  );
}
