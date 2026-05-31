import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Target, Zap, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const FrequencySidechain = () => {
  const [params, setParams] = useState({
    band: 'Low',
    threshold: -24,
    ratio: 4,
    attack: 0.01,
    release: 0.1,
    mix: 1
  });
  const [isActive, setIsActive] = useState(false);
  const [gainReduction, setGainReduction] = useState(0);

  return (
    <div className="frequency-sidechain" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Target color="#ef4444" /> Frequency Sidechain
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Frequency-aware sidechaining that ducks specific bands for surgical precision.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#ef4444' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'PROCESSING' : 'ENGAGE DETECTOR'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>DETECTOR BAND</h3>
           <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              {['Sub', 'Low', 'Mid', 'High', 'All'].map(b => (
                <button key={b} onClick={() => setParams({...params, band: b})} className={`btn-glass ${params.band === b ? 'active' : ''}`} style={{ flex: 1 }}>{b.toUpperCase()}</button>
              ))}
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>THRESHOLD</span>
                    <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{params.threshold} dB</span>
                 </div>
                 <input type="range" min="-60" max="0" step="1" value={params.threshold} onChange={(e) => setParams({...params, threshold: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#ef4444' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>ATTACK</span>
                    <input type="range" min="0" max="0.1" step="0.001" value={params.attack} onChange={(e) => setParams({...params, attack: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#ef4444' }} />
                 </div>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>RELEASE</span>
                    <input type="range" min="0" max="1" step="0.01" value={params.release} onChange={(e) => setParams({...params, release: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#ef4444' }} />
                 </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>GAIN REDUCTION</span>
                 <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 800 }}>-12.4 dB</span>
              </div>
              <div style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                 <motion.div
                   animate={{ width: isActive ? ['0%', '40%', '10%', '60%', '20%'] : '0%' }}
                   transition={{ duration: 0.2, repeat: Infinity }}
                   style={{ height: '100%', background: 'linear-gradient(90deg, #ef4444, transparent)', marginLeft: 'auto' }}
                 />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                 {[0, 3, 6, 9, 12, 18, 24].map(v => <span key={v} style={{ fontSize: '0.6rem', opacity: 0.3 }}>{v}</span>)}
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>LOOKAHEAD</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>5.0ms</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>KNEE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>SOFT</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>RMS/PEAK</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>70/30</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencySidechain;
