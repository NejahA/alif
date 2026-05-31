import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const PhaseDistortionSynth = () => {
  const [params, setParams] = useState({
    distortion: 0.5,
    resonance: 0.3,
    attack: 0.05,
    release: 0.5,
    modSpeed: 0.2
  });
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="phase-distortion-synth" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Cpu color="#6366f1" /> Phase Distortion Synth
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Classic 80s futuristic synthesis inspired by the CZ-series digital engines.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#6366f1' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'SYNTH READY' : 'INIT ENGINE'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '25px', letterSpacing: '2px' }}>PD OSCILLATOR</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>PD INTENSITY (BRIGHTNESS)</span>
                    <span style={{ fontSize: '0.8rem', color: '#6366f1' }}>{Math.round(params.distortion * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={params.distortion} onChange={(e) => setParams({...params, distortion: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#6366f1' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>MODULATION DEPTH</span>
                    <span style={{ fontSize: '0.8rem', color: '#6366f1' }}>{Math.round(params.resonance * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={params.resonance} onChange={(e) => setParams({...params, resonance: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#6366f1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>ATTACK</span>
                    <input type="range" min="0" max="2" step="0.01" value={params.attack} onChange={(e) => setParams({...params, attack: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#6366f1' }} />
                 </div>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>RELEASE</span>
                    <input type="range" min="0" max="4" step="0.01" value={params.release} onChange={(e) => setParams({...params, release: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#6366f1' }} />
                 </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                 {[...Array(32)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isActive ? [`${20 + Math.sin(i / 2) * 40}%`, `${60 + Math.cos(i / 2) * 30}%`, `${20 + Math.sin(i / 2) * 40}%`] : '10%',
                        background: isActive ? '#6366f1' : 'rgba(255,255,255,0.1)'
                      }}
                      transition={{ duration: 1 / (params.modSpeed || 0.1), repeat: Infinity, delay: i * 0.02 }}
                      style={{ position: 'absolute', left: `${i * 3.1}%`, bottom: 0, width: '2px', borderRadius: '1px' }}
                    />
                 ))}
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Volume2 size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>OSC</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>SAW/SQU</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>FILTER</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>DCW</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>POLY</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>8 VOICE</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseDistortionSynth;
