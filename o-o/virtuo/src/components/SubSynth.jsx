import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, Waves } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function SubSynth() {
  const [drive, setDrive] = useState(0.5);
  const [cutoff, setCutoff] = useState(150);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const synthRef = useRef(null);
  const distRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    distRef.current = new Tone.Distortion(drive).connect(masterBus);
    filterRef.current = new Tone.Filter(cutoff, 'lowpass').connect(distRef.current);
    
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 1, release: 0.8 },
      filterEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.5, baseFrequency: 50, octaves: 2 }
    }).connect(filterRef.current);

    return () => {
      synthRef.current?.dispose();
      distRef.current?.dispose();
      filterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (distRef.current) distRef.current.distortion = drive;
    if (filterRef.current) filterRef.current.frequency.value = cutoff;
  }, [drive, cutoff]);

  const playNote = async (note) => {
    await Tone.start();
    synthRef.current.triggerAttack(note);
    setIsPlaying(true);
  };

  const stopNote = () => {
    synthRef.current.triggerRelease();
    setIsPlaying(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Shield size={24} color="#ef4444" /> Sub Bass Generator
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Low-Frequency Harmonic Reinforcement</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Sub Visualizer */}
        <div style={{ height: '150px', background: '#000', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #333' }}>
           <motion.div 
             animate={isPlaying ? {
               scale: [1, 1.2, 1],
               opacity: [0.5, 1, 0.5]
             } : { scale: 1, opacity: 0.2 }}
             transition={{ duration: 0.5, repeat: Infinity }}
             style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)', filter: 'blur(20px)' }}
           />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
               <span>HARMONIC GRIT</span>
               <span>{Math.round(drive * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={drive} 
              onChange={(e) => setDrive(Number(e.target.value))}
              style={{ accentColor: '#ef4444' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
               <span>LOW PASS CEILING</span>
               <span>{cutoff}Hz</span>
            </div>
            <input 
              type="range" min="20" max="500" step="1" 
              value={cutoff} 
              onChange={(e) => setCutoff(Number(e.target.value))}
              style={{ accentColor: '#ef4444' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
          {['C1', 'D1', 'E1', 'F1', 'G1', 'A1', 'B1', 'C2', 'D2', 'E2', 'F2', 'G2'].map(note => (
            <button
              key={note}
              className="btn-glass"
              onMouseDown={() => playNote(note)}
              onMouseUp={stopNote}
              onMouseLeave={() => isPlaying && stopNote()}
              style={{ padding: '20px 10px', fontSize: '12px', fontWeight: 900 }}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={14} /> ANALOG SATURATION</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Waves size={14} /> PURE SINE FUNDAMENTAL</div>
      </div>
    </div>
  );
}
