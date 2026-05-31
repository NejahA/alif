import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Zap, Activity, Waves, Sliders, Volume2, Sparkles, Sun } from 'lucide-react';

const HarmonicExciter = () => {
  const [params, setParams] = useState({
    freq: 3000,
    amount: 0.5,
    harmonics: 0.3,
    mix: 0.4
  });
  const [isActive, setIsActive] = useState(false);
  
  const filterRef = useRef(null);
  const distortRef = useRef(null);

  useEffect(() => {
    // Exciter Chain: HPF -> Distortion -> Blend back
    const filter = new Tone.Filter(3000, "highpass").toDestination();
    const distort = new Tone.Distortion(0.5).connect(filter);
    
    filterRef.current = filter;
    distortRef.current = distort;

    return () => {
      filter.dispose();
      distort.dispose();
    };
  }, []);

  useEffect(() => {
    if (filterRef.current) {
        filterRef.current.frequency.value = params.freq;
        distortRef.current.distortion = params.harmonics;
        // In a real implementation, we'd use a dry/wet crossfader
    }
  }, [params]);

  return (
    <div className="harmonic-exciter" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Sparkles color="#fbbf24" /> Harmonic Exciter
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add harmonic clarity, air, and presence to high frequencies.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#fbbf24' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'EXCITER ON' : 'ADD SPARKLE'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '25px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>CLARITY CONTROLS</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>CUTOFF FREQUENCY</span>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{params.freq} Hz</span>
                 </div>
                 <input type="range" min="1000" max="8000" step="10" value={params.freq} onChange={(e) => setParams({...params, freq: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#fbbf24' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>HARMONICS (DRIVE)</span>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{Math.round(params.harmonics * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={params.harmonics} onChange={(e) => setParams({...params, harmonics: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#fbbf24' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>AIR AMOUNT</span>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{Math.round(params.mix * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={params.mix} onChange={(e) => setParams({...params, mix: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#fbbf24' }} />
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, #fbbf24 0%, transparent 70%)' }} />
              
              <div style={{ position: 'relative' }}>
                 <motion.div
                   animate={{ 
                     scale: isActive ? [1, 1.2, 1] : 1,
                     opacity: isActive ? [0.3, 0.8, 0.3] : 0.2
                   }}
                   transition={{ duration: 2, repeat: Infinity }}
                   style={{ position: 'absolute', inset: -40, background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)', filter: 'blur(20px)', borderRadius: '50%' }}
                 />
                 <Sun size={64} color="#fbbf24" style={{ opacity: isActive ? 1 : 0.3 }} />
              </div>
              <p style={{ position: 'absolute', bottom: '20px', fontSize: '0.65rem', letterSpacing: '4px', opacity: 0.4 }}>HARMONIC PRESENCE V2</p>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>TUBE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>EMU</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>PHASE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>0.01ms</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Sparkles size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SPARKLE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>HIGH</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HarmonicExciter;
