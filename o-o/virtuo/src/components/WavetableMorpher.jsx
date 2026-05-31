import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { RefreshCw, Zap, Activity, Waves, Sliders, Volume2, Box } from 'lucide-react';

const WavetableMorpher = () => {
  const [params, setParams] = useState({
    position: 0.5,
    morphSpeed: 0.2,
    smoothing: 0.1,
    complexity: 0.4
  });
  const [isActive, setIsActive] = useState(false);
  const [currentWave, setCurrentWave] = useState([]);

  useEffect(() => {
    // Generate dummy wave points for visualization
    const points = [];
    for(let i=0; i<32; i++) {
        points.push(Math.sin(i / 5) * 0.5 + (Math.random() * 0.1));
    }
    setCurrentWave(points);
  }, [params.position]);

  return (
    <div className="wavetable-morpher" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Box color="#ec4899" /> Wavetable Morpher
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dynamic step-based morphing between complex oscillator wavetables.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#ec4899' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'MORPHING...' : 'INIT MORPH'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>MORPH ENGINE</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>WAVETABLE POSITION</span>
                    <span style={{ fontSize: '0.8rem', color: '#ec4899' }}>{Math.round(params.position * 256)}</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={params.position} onChange={(e) => setParams({...params, position: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#ec4899' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>MORPH SPEED</span>
                    <span style={{ fontSize: '0.8rem', color: '#ec4899' }}>{params.morphSpeed} Hz</span>
                 </div>
                 <input type="range" min="0.01" max="10" step="0.01" value={params.morphSpeed} onChange={(e) => setParams({...params, morphSpeed: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#ec4899' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>INTERPOLATION</span>
                    <span style={{ fontSize: '0.8rem', color: '#ec4899' }}>LINEAR</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={params.smoothing} onChange={(e) => setParams({...params, smoothing: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#ec4899' }} />
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '4px', height: '150px', alignItems: 'center', width: '100%' }}>
                 {currentWave.map((val, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: `${(val + 0.6) * 100}%`,
                        background: isActive ? ['#ec4899', '#8b5cf6', '#ec4899'] : '#ec4899',
                        opacity: isActive ? [0.4, 1, 0.4] : 0.6
                      }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                      style={{ flex: 1, borderRadius: '2px' }}
                    />
                 ))}
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>FRAME</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>C-8</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <RefreshCw size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SCAN</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>FWD</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>ALIAS</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>OFF</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WavetableMorpher;
