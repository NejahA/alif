import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Maximize2, Zap, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const StereoWidenerPro = () => {
  const [width, setWidth] = useState(1.4);
  const [midGain, setMidGain] = useState(0);
  const [sideGain, setSideGain] = useState(3);
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="stereo-widener-pro" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Maximize2 color="#a855f7" /> Stereo Widener Pro
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Advanced Mid/Side processing for extreme width and spatial clarity.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#a855f7' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'WIDENING ON' : 'BYPASS'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '25px', letterSpacing: '2px' }}>MID / SIDE BALANCER</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>STEREO WIDTH</span>
                    <span style={{ fontSize: '0.8rem', color: '#a855f7' }}>{Math.round(width * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="2" step="0.01" value={width} onChange={(e) => setWidth(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>MID GAIN</span>
                    <input type="range" min="-12" max="12" step="0.1" value={midGain} onChange={(e) => setMidGain(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
                 </div>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>SIDE GAIN</span>
                    <input type="range" min="-12" max="12" step="0.1" value={sideGain} onChange={(e) => setSideGain(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
                 </div>
              </div>
           </div>

           <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
              <button className="btn-glass" style={{ flex: 1, fontSize: '0.7rem' }}>MONO CHECK</button>
              <button className="btn-glass" style={{ flex: 1, fontSize: '0.7rem' }}>SWAP L/R</button>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Correlation Meter Simulation */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', opacity: 0.5 }}>
                    <span>-1 (OUT)</span>
                    <span>0</span>
                    <span>+1 (IN)</span>
                 </div>
                 <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', position: 'relative' }}>
                    <motion.div
                      animate={{ x: isActive ? ['80%', '90%', '75%', '85%', '95%'] : '50%' }}
                      style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', background: '#a855f7', boxShadow: '0 0 10px #a855f7' }}
                    />
                 </div>
                 <p style={{ textAlign: 'center', fontSize: '0.6rem', opacity: 0.4, letterSpacing: '4px' }}>PHASE CORRELATION</p>
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>MODE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>M/S</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>STB</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>HIGH</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>LIMIT</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>-0.1dB</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StereoWidenerPro;
