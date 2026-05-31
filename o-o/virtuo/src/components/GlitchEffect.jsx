import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Power, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function GlitchEffect() {
  const [isActive, setIsActive] = useState(false);
  const [glitchRate, setGlitchRate] = useState(8); // 8n, 16n etc.
  
  const tremoloRef = useRef(null);
  const pitchShiftRef = useRef(null);
  const autoFilterRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    // Create the glitch effect chain
    // masterBus -> PitchShift -> AutoFilter -> Tremolo -> Destination
    
    pitchShiftRef.current = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0,
      feedback: 0
    }).toDestination();

    autoFilterRef.current = new Tone.AutoFilter({
      frequency: "8n",
      type: "square",
      depth: 1,
      baseFrequency: 200,
      octaves: 3,
      filter: {
        type: "lowpass",
        rolloff: -24,
        Q: 5
      }
    }).connect(pitchShiftRef.current);

    tremoloRef.current = new Tone.Tremolo({
      frequency: "16n",
      type: "square",
      depth: 1,
      spread: 180
    }).connect(autoFilterRef.current);

    return () => {
      masterBus.disconnect();
      masterBus.toDestination(); // restore default
      
      tremoloRef.current?.dispose();
      pitchShiftRef.current?.dispose();
      autoFilterRef.current?.dispose();
      if (loopRef.current) loopRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      // Route masterBus through effect chain
      masterBus.disconnect();
      masterBus.connect(tremoloRef.current);
      
      tremoloRef.current.start();
      autoFilterRef.current.start();
      
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }

      // Randomize parameters on a loop to create "glitch"
      loopRef.current = new Tone.Loop((time) => {
        // Randomly change pitch shift slightly or aggressively
        if (Math.random() > 0.7) {
           pitchShiftRef.current.pitch = Math.floor(Math.random() * 24) - 12; // -12 to +12 semitones
        } else {
           pitchShiftRef.current.pitch = 0;
        }

        // Randomly toggle tremolo depth for stutter effect
        if (Math.random() > 0.5) {
           tremoloRef.current.depth.value = 1;
           tremoloRef.current.frequency.value = ["16n", "32n", "8n"][Math.floor(Math.random() * 3)];
        } else {
           tremoloRef.current.depth.value = 0;
        }

      }, `${glitchRate}n`).start(0);

    } else {
      // Stop and restore
      masterBus.disconnect();
      masterBus.toDestination();
      
      tremoloRef.current?.stop();
      autoFilterRef.current?.stop();
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
      }
      
      // reset pitch just in case
      if (pitchShiftRef.current) pitchShiftRef.current.pitch = 0;
    }
  }, [isActive, glitchRate]);

  const toggleGlitch = async () => {
    await Tone.start();
    setIsActive(!isActive);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%', fontFamily: 'monospace' }}>
      
      <div style={{ textAlign: 'center', maxWidth: '600px', color: '#ff0055' }}>
        WARNING: Master bus glitch effect. This will aggressively stutter and pitch-shift all active audio.
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#111', borderRadius: '0', border: '2px solid #ff0055', boxShadow: isActive ? '0 0 20px rgba(255,0,85,0.5)' : 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: '#ff0055', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Activity size={14} /> Chaos Rate
          </label>
          <select 
            value={glitchRate} 
            onChange={(e) => setGlitchRate(Number(e.target.value))}
            disabled={!isActive}
            style={{ background: '#000', color: '#ff0055', border: '1px solid #ff0055', padding: '5px' }}
          >
            <option value={16}>Very Fast (16n)</option>
            <option value={8}>Fast (8n)</option>
            <option value={4}>Medium (4n)</option>
          </select>
        </div>
      </div>

      {/* Glitch UI */}
      <div style={{ 
        position: 'relative',
        width: '400px',
        height: '250px',
        background: '#000',
        border: '4px solid #ff0055',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        
        {/* Background Glitch Text */}
        {isActive && [...Array(10)].map((_, i) => (
           <motion.div
             key={i}
             animate={{
                x: [0, Math.random() * 20 - 10, 0],
                y: [0, Math.random() * 20 - 10, 0],
                opacity: [0, 1, 0]
             }}
             transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() }}
             style={{
               position: 'absolute',
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               color: '#00ffcc',
               fontSize: '20px',
               fontWeight: 'bold',
               opacity: 0.5,
               mixBlendMode: 'difference'
             }}
           >
             ERR
           </motion.div>
        ))}

        {/* Big Power Button */}
        <button 
          onClick={toggleGlitch}
          style={{ 
            width: '100px', height: '100px', borderRadius: '50%', 
            background: isActive ? 'transparent' : '#ff0055',
            border: isActive ? '4px solid #ff0055' : 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isActive ? '#ff0055' : '#000',
            zIndex: 10,
            boxShadow: isActive ? '0 0 30px #ff0055, inset 0 0 20px #ff0055' : 'none',
            position: 'relative'
          }}
        >
          <Power size={40} />
          {isActive && (
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#ff0055', mixBlendMode: 'screen' }}
            />
          )}
        </button>

        {/* Glitch Overlay Bars */}
        {isActive && (
          <motion.div 
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '20px',
              background: 'rgba(255,255,255,0.2)',
              zIndex: 20,
              pointerEvents: 'none'
            }}
          />
        )}

      </div>
    </div>
  );
}
