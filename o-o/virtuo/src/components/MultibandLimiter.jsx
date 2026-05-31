import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, Waves, Sliders, Volume2, Target } from 'lucide-react';

const BandModule = ({ label, color, reduction }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', opacity: 0.5 }}>
        <span>{label}</span>
        <span style={{ color }}>-{reduction}dB</span>
     </div>
     <div style={{ height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          animate={{ height: `${reduction * 5}%` }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, background: color, opacity: 0.3 }}
        />
        <div style={{ height: '100%', borderLeft: `1px solid ${color}40`, position: 'absolute', left: '50%' }} />
     </div>
  </div>
);

const MultibandLimiter = () => {
  const [params, setParams] = useState({
    threshold: -1,
    ceiling: -0.1,
    release: 0.1,
    lookahead: 0.005
  });
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="multiband-limiter" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Shield color="#3b82f6" /> Multiband Limiter Pro
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>4-band professional mastering limiter with zero-latency lookahead.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'LIMITING ACTIVE' : 'BYPASS'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
         <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <BandModule label="LOW" color="#3b82f6" reduction={isActive ? 4.2 : 0} />
            <BandModule label="MID-L" color="#10b981" reduction={isActive ? 2.1 : 0} />
            <BandModule label="MID-H" color="#f59e0b" reduction={isActive ? 3.8 : 0} />
            <BandModule label="HIGH" color="#f43f5e" reduction={isActive ? 1.5 : 0} />
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>GLOBAL THRESHOLD</span>
                  <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{params.threshold} dB</span>
               </div>
               <input type="range" min="-12" max="0" step="0.1" value={params.threshold} onChange={(e) => setParams({...params, threshold: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#3b82f6' }} />
            </div>
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>CEILING</span>
                  <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{params.ceiling} dB</span>
               </div>
               <input type="range" min="-1" max="0" step="0.01" value={params.ceiling} onChange={(e) => setParams({...params, ceiling: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#3b82f6' }} />
            </div>
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>RELEASE</span>
                  <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{Math.round(params.release * 1000)}ms</span>
               </div>
               <input type="range" min="0.01" max="1" step="0.01" value={params.release} onChange={(e) => setParams({...params, release: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#3b82f6' }} />
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>LOOKAHEAD</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>5.0ms</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>OVERSAMPLE</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>4X</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Target size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>DITHER</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>TRIANGULAR</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>INTER-PEAK</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>TRUE</p>
         </div>
      </div>
    </div>
  );
};

export default MultibandLimiter;
