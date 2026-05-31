import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Activity, Zap, Waves, Settings, Target } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function LFOModulator() {
  const [rate, setRate] = useState(1);
  const [depth, setDepth] = useState(0.5);
  const [type, setType] = useState('sine');
  const [target, setTarget] = useState('volume');
  const [isActive, setIsActive] = useState(false);
  
  const lfoRef = useRef(null);
  const synthRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    filterRef.current = new Tone.Filter(2000, 'lowpass').connect(masterBus);
    synthRef.current = new Tone.PolySynth(Tone.Synth).connect(filterRef.current);
    
    lfoRef.current = new Tone.LFO(rate, -60, 0).start();

    return () => {
      lfoRef.current?.dispose();
      synthRef.current?.dispose();
      filterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!lfoRef.current) return;
    lfoRef.current.frequency.value = rate;
    lfoRef.current.type = type;
    
    // Disconnect previous mapping
    lfoRef.current.disconnect();
    
    if (isActive) {
      if (target === 'volume') {
        lfoRef.current.min = -60;
        lfoRef.current.max = 0;
        lfoRef.current.connect(synthRef.current.volume);
      } else if (target === 'filter') {
        lfoRef.current.min = 100;
        lfoRef.current.max = 5000;
        lfoRef.current.connect(filterRef.current.frequency);
      } else if (target === 'pitch') {
        lfoRef.current.min = -1200;
        lfoRef.current.max = 1200;
        lfoRef.current.connect(synthRef.current.detune);
      }
    }
  }, [rate, depth, type, target, isActive]);

  const playTest = async () => {
    await Tone.start();
    synthRef.current.triggerAttackRelease('C3', '2s');
  };

  const drawWave = () => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const x = i;
      let y = 50;
      const t = (i / 100) * Math.PI * 2 * rate;
      if (type === 'sine') y = 50 + Math.sin(t) * 40 * depth;
      if (type === 'square') y = 50 + (Math.sin(t) > 0 ? 40 : -40) * depth;
      if (type === 'sawtooth') y = 50 + (((i * rate) % 100) / 50 - 1) * 40 * depth;
      if (type === 'triangle') y = 50 + (Math.abs(((i * rate) % 100) / 25 - 2) - 1) * 40 * depth;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Activity size={24} color="#10b981" /> LFO Modulator
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Low Frequency Oscillator Source</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
          {/* Waveform Visualizer */}
          <div style={{ height: '200px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '1px solid #333', position: 'relative', overflow: 'hidden', padding: '10px' }}>
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={drawWave()}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
             </svg>
             <motion.div 
               animate={{ x: [0, 100] }}
               transition={{ duration: 1/rate, repeat: Infinity, ease: 'linear' }}
               style={{ position: 'absolute', top: 0, width: '2px', height: '100%', background: 'rgba(255,255,255,0.2)' }}
             />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>WAVE SHAPE</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                   {['sine', 'square', 'sawtooth', 'triangle'].map(t => (
                     <button key={t} className={`btn-glass ${type === t ? 'active' : ''}`} onClick={() => setType(t)} style={{ fontSize: '10px' }}>{t}</button>
                   ))}
                </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700 }}>
                   <span>RATE (Hz)</span>
                   <span>{rate} Hz</span>
                </div>
                <input type="range" min="0.1" max="20" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ accentColor: '#10b981' }} />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700 }}>
                   <span>MOD DEPTH</span>
                   <span>{Math.round(depth * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={depth} onChange={(e) => setDepth(Number(e.target.value))} style={{ accentColor: '#10b981' }} />
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Target size={20} />
              <div style={{ display: 'flex', gap: '10px' }}>
                 {['volume', 'filter', 'pitch'].map(t => (
                   <button key={t} className={`btn-glass ${target === t ? 'active' : ''}`} onClick={() => setTarget(t)} style={{ textTransform: 'uppercase', fontSize: '10px' }}>{t}</button>
                 ))}
              </div>
           </div>
           
           <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-glass" onClick={playTest}><Zap size={16} /> TEST</button>
              <button 
                className={`btn-glass ${isActive ? 'active' : ''}`} 
                onClick={() => setIsActive(!isActive)}
                style={{ background: isActive ? '#10b981' : '', borderColor: '#10b981', color: isActive ? '#000' : '#10b981' }}
              >
                {isActive ? 'MAPPING ON' : 'ACTIVATE LFO'}
              </button>
           </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Waves size={14} /> MULTI-WAVE OSCILLATOR</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={14} /> CROSS-PARAMETER MAPPING</div>
      </div>
    </div>
  );
}
