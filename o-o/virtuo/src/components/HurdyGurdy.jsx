import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function HurdyGurdy() {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(-5);
  const [pitch, setPitch] = useState('C4');
  const [crankSpeed, setCrankSpeed] = useState(1);
  
  const droneRef = useRef(null);
  const chanterRef = useRef(null);
  const reverbRef = useRef(null);
  const lfoRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(masterBus);
    
    // The drone strings (constant tone when cranking)
    droneRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.5, decay: 0.1, sustain: 1, release: 1 }
    }).connect(reverbRef.current);

    // The melody string (chanterelle)
    chanterRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { type: 'lowpass', frequency: 2000 },
      envelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 0.1 }
    }).connect(reverbRef.current);

    // Modulate pitch slightly based on cranking speed
    lfoRef.current = new Tone.LFO(crankSpeed * 2, -10, 10).start();
    lfoRef.current.connect(chanterRef.current.detune);

    return () => {
      droneRef.current?.dispose();
      chanterRef.current?.dispose();
      lfoRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (droneRef.current) droneRef.current.volume.rampTo(volume - 5, 0.1);
    if (chanterRef.current) chanterRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  useEffect(() => {
    if (lfoRef.current) {
        lfoRef.current.frequency.rampTo(crankSpeed * 2, 0.1);
    }
  }, [crankSpeed]);

  const toggleCrank = async () => {
    await Tone.start();
    if (active) {
      droneRef.current.triggerRelease(['C3', 'G3']);
      chanterRef.current.triggerRelease();
      setActive(false);
    } else {
      droneRef.current.triggerAttack(['C3', 'G3']);
      chanterRef.current.triggerAttack(pitch);
      setActive(true);
    }
  };

  const changePitch = (newPitch) => {
    setPitch(newPitch);
    if (active && chanterRef.current) {
        chanterRef.current.frequency.rampTo(newPitch, 0.05);
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crank Speed</label>
          <input 
            type="range" min="0.5" max="5" step="0.1" 
            value={crankSpeed} 
            onChange={(e) => setCrankSpeed(Number(e.target.value))}
            style={{ width: '100px', accentColor: '#a16207' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        
        {/* The Instrument Body (Keys) */}
        <div style={{ 
            width: '400px', height: '150px', background: '#5f3c23', // Wood
            borderRadius: '100px 20px 20px 100px',
            border: '5px solid #3e2723',
            display: 'flex', alignItems: 'center', padding: '0 20px',
            position: 'relative', boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', gap: '5px', zIndex: 2, marginLeft: '50px' }}>
                {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map(note => (
                    <div 
                        key={note}
                        onMouseDown={() => changePitch(note)}
                        style={{
                            width: '20px', height: '80px', background: pitch === note ? '#d4d4d8' : '#fff',
                            border: '1px solid #888', borderRadius: '5px', cursor: 'pointer',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '5px',
                            boxShadow: pitch === note ? 'none' : '0 5px 0 #888',
                            transform: pitch === note ? 'translateY(5px)' : 'none'
                        }}
                    >
                        <span style={{ fontSize: '10px', color: '#555' }}>{note[0]}</span>
                    </div>
                ))}
            </div>

            {/* Drone strings visual */}
            <div style={{ position: 'absolute', top: '20px', left: 0, width: '100%', height: '2px', background: '#fff', opacity: 0.5 }} />
            <div style={{ position: 'absolute', bottom: '20px', left: 0, width: '100%', height: '2px', background: '#fff', opacity: 0.5 }} />
        </div>

        {/* The Crank Wheel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div
                animate={{ rotate: active ? 360 : 0 }}
                transition={{ repeat: active ? Infinity : 0, duration: 1 / crankSpeed, ease: 'linear' }}
                style={{
                    width: '100px', height: '100px', borderRadius: '50%', background: '#3e2723',
                    border: '10px solid #8b4513', position: 'relative', cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                }}
                onClick={toggleCrank}
            >
                {/* Crank Handle */}
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '20px', background: '#d4d4d8', borderRadius: '50%' }} />
            </motion.div>
            <button className={`btn-glass ${active ? 'active' : ''}`} onClick={toggleCrank}>
                {active ? 'Stop Cranking' : 'Turn Crank'}
            </button>
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click 'Turn Crank' to start the drone strings, then press the wooden keys to play melodies.</p>
    </div>
  );
}
