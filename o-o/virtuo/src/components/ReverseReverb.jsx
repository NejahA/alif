import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Wind, Zap, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const ReverseReverb = () => {
  const [params, setParams] = useState({
    roomSize: 0.8,
    decay: 4,
    preDelay: 0.1,
    wet: 0.5,
    reverse: true
  });
  const [isActive, setIsActive] = useState(false);
  
  const reverbRef = useRef(null);

  useEffect(() => {
    const reverb = new Tone.Reverb({
      decay: 4,
      preDelay: 0.1,
      wet: 0
    }).toDestination();
    
    reverbRef.current = reverb;

    return () => {
      reverb.dispose();
    };
  }, []);

  useEffect(() => {
    if (reverbRef.current) {
        reverbRef.current.wet.rampTo(isActive ? params.wet : 0, 0.1);
        reverbRef.current.decay = params.decay;
        reverbRef.current.preDelay = params.preDelay;
    }
  }, [isActive, params]);

  return (
    <div className="reverse-reverb" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Wind color="#06b6d4" /> Reverse Reverb
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ethereal, blooming space with reversed temporal reflections.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#06b6d4' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'REVERB ON' : 'ENGAGE SPACE'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '25px' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>SPATIAL PARAMETERS</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>DECAY TIME</span>
                    <span style={{ fontSize: '0.8rem', color: '#06b6d4' }}>{params.decay}S</span>
                 </div>
                 <input type="range" min="0.5" max="10" step="0.1" value={params.decay} onChange={(e) => setParams({...params, decay: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#06b6d4' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>PRE-DELAY</span>
                    <span style={{ fontSize: '0.8rem', color: '#06b6d4' }}>{Math.round(params.preDelay * 1000)}ms</span>
                 </div>
                 <input type="range" min="0" max="0.5" step="0.01" value={params.preDelay} onChange={(e) => setParams({...params, preDelay: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#06b6d4' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>DRY/WET</span>
                    <span style={{ fontSize: '0.8rem', color: '#06b6d4' }}>{Math.round(params.wet * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={params.wet} onChange={(e) => setParams({...params, wet: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#06b6d4' }} />
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                 {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        opacity: isActive ? [0, 0.5, 0] : 0.05,
                        scaleX: isActive ? [0, 1] : 1,
                        x: isActive ? [200, 0] : 0
                      }}
                      transition={{ 
                        duration: params.decay * 0.5, 
                        repeat: Infinity, 
                        delay: i * (params.decay / 20),
                        ease: "easeOut"
                      }}
                      style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: `${i * 5}%`, 
                        width: '100%', 
                        height: '2px', 
                        background: 'linear-gradient(90deg, transparent, #06b6d4)',
                        transformOrigin: 'right'
                      }}
                    />
                 ))}
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Volume2 size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>REFLECT</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>REVERSE</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>DAMPING</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>MED</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>BLOOM</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>850ms</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReverseReverb;
