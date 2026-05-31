import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Target, Zap, Activity, Waves, Sliders, Volume2, Shield, Crosshair } from 'lucide-react';

const ResonanceMapper = () => {
  const [nodes, setNodes] = useState([
    { id: 1, x: 20, y: 50, q: 10, gain: -12, freq: 250 },
    { id: 2, x: 60, y: 30, q: 25, gain: -18, freq: 2400 }
  ]);
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="resonance-mapper" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Crosshair color="#ef4444" /> Resonance Mapper
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Surgical frequency resonance detection and removal via high-Q notch filtering.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#ef4444' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'ANALYSIS LIVE' : 'START SCAN'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '40px', background: 'rgba(0,0,0,0.5)', height: '400px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
         {/* Background Grid */}
         <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         
         {/* Frequency Curve Simulation */}
         <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <svg width="100%" height="100%" preserveAspectRatio="none">
               <motion.path
                 d="M 0 200 Q 200 100 400 200 T 800 200"
                 fill="none"
                 stroke={isActive ? "#ef4444" : "rgba(255,255,255,0.2)"}
                 strokeWidth="2"
                 animate={{ d: isActive ? "M 0 200 Q 200 150 400 200 T 800 200" : "M 0 200 Q 200 100 400 200 T 800 200" }}
               />
            </svg>
         </div>

         {nodes.map(node => (
            <motion.div
              key={node.id}
              drag
              dragConstraints={{ top: 0, left: 0, right: 800, bottom: 400 }}
              style={{ 
                position: 'absolute', 
                left: `${node.x}%`, 
                top: `${node.y}%`, 
                width: '12px', 
                height: '12px', 
                background: '#ef4444', 
                borderRadius: '50%', 
                cursor: 'move',
                boxShadow: '0 0 15px #ef4444'
              }}
            >
               <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.6rem', opacity: 0.6 }}>
                  {node.freq}Hz | {node.gain}dB
               </div>
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '50%' }} />
            </motion.div>
         ))}

         <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '20px', fontSize: '0.6rem', opacity: 0.4 }}>
            <span>20Hz</span>
            <span>200Hz</span>
            <span>2kHz</span>
            <span>20kHz</span>
         </div>
      </div>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SMOOTHING</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>FAST</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SENSITIVITY</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>ULTRA</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Sliders size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>Q-FACTOR</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>SURGICAL</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>LIMITER</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>ACTIVE</p>
         </div>
      </div>
    </div>
  );
};

export default ResonanceMapper;
