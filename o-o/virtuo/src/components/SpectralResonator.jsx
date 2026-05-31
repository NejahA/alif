import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Activity, Zap, Radio, Waves, Sliders, Layers } from 'lucide-react';

const SpectralResonator = () => {
  const [settings, setSettings] = useState({
    frequency: 440,
    resonance: 0.8,
    decay: 0.5,
    harmonics: 4,
    mix: 0.5
  });
  const [isActive, setIsActive] = useState(false);
  const filterRef = useRef(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    // Spectral Resonance Chain
    const feedback = new Tone.FeedbackDelay("16n", 0.5).toDestination();
    const filter = new Tone.Filter({
      type: "bandpass",
      frequency: 440,
      Q: 10
    }).connect(feedback);

    filterRef.current = filter;
    feedbackRef.current = feedback;

    return () => {
      filter.dispose();
      feedback.dispose();
    };
  }, []);

  useEffect(() => {
    if (filterRef.current) {
        filterRef.current.frequency.rampTo(settings.frequency, 0.1);
        filterRef.current.Q.value = settings.resonance * 50;
    }
    if (feedbackRef.current) {
        feedbackRef.current.feedback.value = settings.decay * 0.9;
        feedbackRef.current.wet.value = settings.mix;
    }
  }, [settings]);

  return (
    <div className="spectral-resonator" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Activity color="#8b5cf6" /> Spectral Resonator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Experimental harmonic resonance engine based on frequency analysis.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 30px', background: isActive ? '#8b5cf6' : 'rgba(255,255,255,0.05)', color: isActive ? 'white' : 'inherit' }}
        >
          {isActive ? 'RESONATING...' : 'ENGAGE ENGINE'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>BASE FREQUENCY</span>
                  <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{settings.frequency} Hz</span>
                </div>
                <input type="range" min="100" max="2000" step="1" value={settings.frequency} onChange={(e) => setSettings({...settings, frequency: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#8b5cf6' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>RESONANCE (Q)</span>
                  <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{Math.round(settings.resonance * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={settings.resonance} onChange={(e) => setSettings({...settings, resonance: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#8b5cf6' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>DECAY / FEEDBACK</span>
                  <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{Math.round(settings.decay * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={settings.decay} onChange={(e) => setSettings({...settings, decay: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#8b5cf6' }} />
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 70%)' }} />
              
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                 {/* Visualizer: Rotating Harmonic Rings */}
                 {[...Array(settings.harmonics)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        rotate: 360,
                        scale: isActive ? [1, 1.2, 1] : 1,
                        opacity: isActive ? [0.2, 0.5, 0.2] : 0.1
                      }}
                      transition={{ 
                        rotate: { duration: 10 / (i + 1), repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity },
                        opacity: { duration: 2, repeat: Infinity }
                      }}
                      style={{ 
                        position: 'absolute', 
                        top: i * 15, left: i * 15, right: i * 15, bottom: i * 15,
                        border: '1px solid #8b5cf6',
                        borderRadius: '50%',
                        borderTopColor: 'transparent',
                        borderBottomColor: 'transparent'
                      }}
                    />
                 ))}
                 <div style={{ position: 'absolute', inset: '45%', background: '#8b5cf6', borderRadius: '50%', boxShadow: '0 0 20px #8b5cf6' }} />
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Radio size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>HARMONICS</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{settings.harmonics}X</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>WAVE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>SINE</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Layers size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>STAGES</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>8-POLE</p>
              </div>
           </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '30px', padding: '15px', display: 'flex', alignItems: 'center', gap: '20px' }}>
         <Sliders size={20} color="#8b5cf6" />
         <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
               <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>DRY / WET MIX</span>
               <span style={{ fontSize: '0.7rem' }}>{Math.round(settings.mix * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={settings.mix} onChange={(e) => setSettings({...settings, mix: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#8b5cf6' }} />
         </div>
         <div style={{ display: 'flex', gap: '5px' }}>
            <Zap size={16} color={isActive ? '#8b5cf6' : 'rgba(255,255,255,0.2)'} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{isActive ? 'LINEAR PHASE' : 'BYPASS'}</span>
         </div>
      </div>
    </div>
  );
};

export default SpectralResonator;
