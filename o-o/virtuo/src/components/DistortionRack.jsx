import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Flame, Zap, Activity, Waves, Sliders } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function DistortionRack() {
  const [drive, setDrive] = useState(0.5);
  const [mode, setMode] = useState('valve');
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  
  const distRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    distRef.current = new Tone.Distortion(drive).connect(masterBus);
    
    synthRef.current = new Tone.PolySynth(Tone.Synth).connect(distRef.current);

    return () => {
      distRef.current?.dispose();
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!distRef.current) return;
    
    if (mode === 'valve') {
      distRef.current.distortion = drive * 0.5;
      distRef.current.oversample = '4x';
    } else if (mode === 'fuzz') {
      distRef.current.distortion = drive * 2;
      distRef.current.oversample = 'none';
    } else if (mode === 'rectifier') {
      // For rectifier, we could use a custom WaveShaper, 
      // but Tone.Distortion with high drive and specific curve works too.
      distRef.current.distortion = drive * 4;
    }
  }, [drive, mode]);

  const playTest = async () => {
    await Tone.start();
    setIsTestPlaying(true);
    synthRef.current.triggerAttackRelease(['C3', 'G3'], '0.5s');
    setTimeout(() => setIsTestPlaying(false), 500);
  };

  const drawCurve = () => {
    const points = [];
    for (let i = -1; i <= 1; i += 0.1) {
      let y = i;
      if (mode === 'valve') y = Math.tanh(i * drive * 5);
      if (mode === 'fuzz') y = Math.sign(i) * (1 - Math.exp(-Math.abs(i * drive * 10)));
      if (mode === 'rectifier') y = Math.abs(i) * drive;
      points.push({ x: (i + 1) * 50, y: (1 - (y / 2 + 0.5)) * 100 });
    }
    return points.map(p => `${p.x},${p.y}`).join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Flame size={24} color="#ef4444" /> Distortion Rack
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Multi-Mode Saturation Engine</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          {/* Curve Visualizer */}
          <div style={{ height: '200px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '1px solid #333', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <polyline
                  points={drawCurve()}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
             </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>DISTORTION MODE</span>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['valve', 'fuzz', 'rectifier'].map(m => (
                    <button 
                      key={m}
                      className={`btn-glass ${mode === m ? 'active' : ''}`}
                      onClick={() => setMode(m)}
                      style={{ padding: '10px', fontSize: '10px', textTransform: 'uppercase' }}
                    >
                      {m}
                    </button>
                  ))}
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700 }}>
                  <span>DRIVE AMOUNT</span>
                  <span>{Math.round(drive * 100)}%</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.01" 
                 value={drive} 
                 onChange={(e) => setDrive(Number(e.target.value))}
                 style={{ accentColor: '#ef4444' }}
               />
            </div>

            <button 
              className="btn-glass"
              onClick={playTest}
              style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid #ef4444', color: '#ef4444' }}
            >
               <Zap size={16} /> TEST SATURATION
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sliders size={14} /> OVERSAMPLED DRIVE</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> HARMONIC GENERATION</div>
      </div>
    </div>
  );
}
