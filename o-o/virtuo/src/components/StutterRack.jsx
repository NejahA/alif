import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Repeat, Scissors, Sliders, Waves } from 'lucide-react';

const StutterRack = () => {
  const [params, setParams] = useState({
    rate: '16n',
    feedback: 0.5,
    jitter: 0.2,
    smoothing: 0.1,
    mix: 0.5
  });
  const [isStuttering, setIsStuttering] = useState(false);
  
  const stutterRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    // Stutter Engine using FeedbackDelay as a base for buffer-like repeating
    const gain = new Tone.Gain(1).toDestination();
    const stutter = new Tone.FeedbackDelay({
      delayTime: "16n",
      feedback: 0.5,
      wet: 0
    }).connect(gain);

    stutterRef.current = stutter;
    gainRef.current = gain;

    return () => {
      stutter.dispose();
      gain.dispose();
    };
  }, []);

  const toggleStutter = () => {
    if (Tone.context.state !== 'running') Tone.start();
    const newState = !isStuttering;
    setIsStuttering(newState);
    
    if (stutterRef.current) {
        stutterRef.current.wet.rampTo(newState ? params.mix : 0, 0.05);
        if (newState) {
            stutterRef.current.delayTime.value = params.rate;
            stutterRef.current.feedback.value = params.feedback;
        }
    }
  };

  return (
    <div className="stutter-rack" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Scissors color="#f43f5e" /> Stutter Rack
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rhythmic buffer repeating and glitch engine for high-energy fills.</p>
        </div>
        <button 
          className={`btn-glass ${isStuttering ? 'active' : ''}`}
          onMouseDown={toggleStutter}
          onMouseUp={toggleStutter}
          style={{ padding: '15px 40px', background: isStuttering ? '#f43f5e' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '4px' }}
        >
          {isStuttering ? 'STUTTERING' : 'HOLD TO STUTTER'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>STUTTER RATE</span>
                    <span style={{ fontSize: '0.8rem', color: '#f43f5e' }}>1/{params.rate === '16n' ? '16' : params.rate === '32n' ? '32' : '8'}</span>
                 </div>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    {['8n', '16n', '32n', '64n'].map(r => (
                      <button 
                        key={r} 
                        className={`btn-glass ${params.rate === r ? 'active' : ''}`}
                        onClick={() => setParams({...params, rate: r})}
                        style={{ flex: 1, fontSize: '0.75rem' }}
                      >
                        1/{r.replace('n', '')}
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>FEEDBACK (TAIL)</span>
                    <span style={{ fontSize: '0.8rem', color: '#f43f5e' }}>{Math.round(params.feedback * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="0.95" step="0.01" value={params.feedback} onChange={(e) => setParams({...params, feedback: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f43f5e' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>JITTER</span>
                    <input type="range" min="0" max="1" step="0.01" value={params.jitter} onChange={(e) => setParams({...params, jitter: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f43f5e' }} />
                 </div>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>DRY/WET</span>
                    <input type="range" min="0" max="1" step="0.01" value={params.mix} onChange={(e) => setParams({...params, mix: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f43f5e' }} />
                 </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, #f43f5e 0%, transparent 70%)' }} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                 {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isStuttering ? [20, 100, 20] : 20,
                        opacity: isStuttering ? [0.3, 1, 0.3] : 0.2
                      }}
                      transition={{ 
                        duration: 0.1 * (i + 1), 
                        repeat: Infinity,
                        delay: i * 0.05
                      }}
                      style={{ width: '12px', background: '#f43f5e', borderRadius: '6px' }}
                    />
                 ))}
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Repeat size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>MODE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>RHYTHMIC</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>PITCH</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>STATIC</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SLICE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>64-BIT</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StutterRack;
