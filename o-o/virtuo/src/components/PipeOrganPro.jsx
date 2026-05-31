import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Columns, Zap, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const PipeOrganPro = () => {
  const [stops, setStops] = useState({
    principals: true,
    flutes: false,
    reeds: true,
    strings: false
  });
  const [swell, setSwell] = useState(0.8);
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="pipe-organ-pro" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Columns color="#fbbf24" /> Pipe Organ Majestic
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Grand cathedral organ simulator with authentic stop configurations.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#fbbf24' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'WIND BLOWING' : 'ENGAGE BLOWER'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>ORGAN STOPS</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {Object.keys(stops).map(stop => (
                <button 
                  key={stop} 
                  className={`btn-glass ${stops[stop] ? 'active' : ''}`}
                  onClick={() => setStops({...stops, [stop]: !stops[stop]})}
                  style={{ 
                    padding: '15px', 
                    fontSize: '0.75rem', 
                    border: stops[stop] ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.05)',
                    background: stops[stop] ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  {stop.toUpperCase()}
                </button>
              ))}
           </div>

           <div style={{ marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>SWELL PEDAL (EXPRESSION)</span>
                 <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{Math.round(swell * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={swell} onChange={(e) => setSwell(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24' }} />
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, background: 'radial-gradient(circle at 50% 50%, #fbbf24 0%, transparent 70%)' }} />
              
              {[...Array(12)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{ 
                     height: isActive ? (i % 3 === 0 ? '80%' : '60%') : '20%',
                     opacity: isActive ? 1 : 0.1
                   }}
                   transition={{ duration: 0.1, delay: i * 0.02 }}
                   style={{ width: '12px', background: 'linear-gradient(180deg, #fbbf24, #92400e)', borderRadius: '6px 6px 0 0', border: '1px solid rgba(0,0,0,0.3)' }}
                 />
              ))}
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Volume2 size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>CHORUS</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>TUTTI</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>REVERB</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>CATHEDRAL</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>WIND</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>STEADY</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PipeOrganPro;
