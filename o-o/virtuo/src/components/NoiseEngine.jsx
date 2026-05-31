import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Radio, Zap, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const NoiseEngine = () => {
  const [params, setParams] = useState({
    type: 'pink',
    filterFreq: 1200,
    resonance: 5,
    bitDepth: 8,
    sampleRate: 0.1
  });
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="noise-engine" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Radio color="#ec4899" /> Experimental Noise Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chaotic texture generator for industrial grit, foley layers, and complex noise beds.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#ec4899' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'EMITTING NOISE' : 'START GENERATOR'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>SOURCE NOISE</h3>
           <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              {['white', 'pink', 'brown'].map(t => (
                <button key={t} onClick={() => setParams({...params, type: t})} className={`btn-glass ${params.type === t ? 'active' : ''}`} style={{ flex: 1 }}>{t.toUpperCase()}</button>
              ))}
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>RESONANT FILTER</span>
                    <span style={{ fontSize: '0.8rem', color: '#ec4899' }}>{params.filterFreq} Hz</span>
                 </div>
                 <input type="range" min="100" max="8000" step="10" value={params.filterFreq} onChange={(e) => setParams({...params, filterFreq: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#ec4899' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>BIT REDUCTION</span>
                    <input type="range" min="1" max="16" step="1" value={params.bitDepth} onChange={(e) => setParams({...params, bitDepth: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#ec4899' }} />
                 </div>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>SR REDUCTION</span>
                    <input type="range" min="0" max="1" step="0.01" value={params.sampleRate} onChange={(e) => setParams({...params, sampleRate: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#ec4899' }} />
                 </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '120px', width: '100%' }}>
                 {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isActive ? `${Math.random() * 100}%` : '5%',
                        opacity: isActive ? Math.random() : 0.1
                      }}
                      style={{ flex: 1, background: '#ec4899', borderRadius: '1px' }}
                    />
                 ))}
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>PHASE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>RANDOM</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>CLIPPING</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>SOFT</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SYNC</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>OFF</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NoiseEngine;
