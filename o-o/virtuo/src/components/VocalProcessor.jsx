import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Mic, MicOff, Activity, Wind } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function VocalProcessor() {
  const [isActive, setIsActive] = useState(false);
  const [pitchShift, setPitchShift] = useState(0);
  const [wet, setWet] = useState(0.5);
  
  const micRef = useRef(null);
  const shiftRef = useRef(null);

  const startMic = async () => {
    try {
      await Tone.start();
      micRef.current = new Tone.UserMedia();
      await micRef.current.open();
      
      shiftRef.current = new Tone.PitchShift({
        pitch: pitchShift,
        wet: wet
      }).connect(masterBus);

      micRef.current.connect(shiftRef.current);
      setIsActive(true);
    } catch (err) {
      console.error("Could not open microphone", err);
    }
  };

  const stopMic = () => {
    if (micRef.current) {
      micRef.current.close();
      micRef.current.dispose();
    }
    if (shiftRef.current) {
      shiftRef.current.dispose();
    }
    setIsActive(false);
  };

  useEffect(() => {
    if (shiftRef.current) {
      shiftRef.current.pitch = pitchShift;
    }
  }, [pitchShift]);

  useEffect(() => {
    if (shiftRef.current) {
      shiftRef.current.wet.rampTo(wet, 0.1);
    }
  }, [wet]);

  useEffect(() => {
    return () => stopMic();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '600px', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <motion.div
          animate={{ 
            scale: isActive ? [1, 1.05, 1] : 1,
            boxShadow: isActive ? '0 0 30px var(--accent-glow)' : 'none'
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px solid var(--glass-border)'
          }}
          onClick={isActive ? stopMic : startMic}
        >
          {isActive ? <Mic size={40} color="white" /> : <MicOff size={40} color="var(--text-muted)" />}
        </motion.div>
        
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{isActive ? 'Microphone Active' : 'Microphone Inactive'}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isActive ? 'Your voice is being processed through the master bus.' : 'Click to start the vocal processor.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Pitch Shift</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Semitones</span>
              <span>{pitchShift > 0 ? `+${pitchShift}` : pitchShift}</span>
            </div>
            <input 
              type="range" min="-12" max="12" step="1" 
              value={pitchShift} 
              onChange={(e) => setPitchShift(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind size={18} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Effect Mix</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Dry / Wet</span>
              <span>{Math.round(wet * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={wet} 
              onChange={(e) => setWet(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
        * Vocal processing includes real-time pitch shifting and routes through the Master FX chain.
      </p>
    </div>
  );
}
