import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);

  // We rely on global Tone.Transport.bpm set in SessionSettings

  useEffect(() => {
    // We create a synth to click for the metronome
    const clickSynth = new Tone.MembraneSynth().toDestination();
    
    // Create a loop that triggers on every quarter note
    const loop = new Tone.Loop(time => {
      clickSynth.triggerAttackRelease('C2', '8n', time);
      // We use Tone.Draw to safely update React state synced with audio
      Tone.Draw.schedule(() => {
        setBeat(prev => (prev + 1) % 4);
      }, time);
    }, '4n');

    if (isPlaying) {
      Tone.Transport.start();
      loop.start(0);
    } else {
      Tone.Transport.stop();
      loop.stop(0);
      setBeat(0);
    }

    return () => {
      loop.dispose();
      clickSynth.dispose();
    };
  }, [isPlaying]);

  return (
    <div style={{
      padding: '15px 20px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Metronome</h3>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[0, 1, 2, 3].map(i => (
            <motion.div 
              key={i}
              animate={{ 
                scale: isPlaying && beat === i ? 1.3 : 1, 
                backgroundColor: isPlaying && beat === i ? (i === 0 ? 'var(--accent-primary)' : '#d946ef') : 'rgba(255,255,255,0.1)',
                boxShadow: isPlaying && beat === i ? '0 0 10px var(--accent-glow)' : 'none'
              }}
              style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--text-muted)' }}
            />
          ))}
        </div>
      </div>

      <button 
        className={`btn-glass ${isPlaying ? 'active' : ''}`} 
        onClick={async () => {
          await Tone.start();
          setIsPlaying(!isPlaying);
        }}
        style={{ justifyContent: 'center' }}
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}
