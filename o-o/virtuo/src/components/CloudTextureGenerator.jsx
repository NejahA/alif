import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Wind, Sun, Moon, Layers, RefreshCw, Zap } from 'lucide-react';

const CloudTextureGenerator = () => {
  const [isActive, setIsActive] = useState(false);
  const [params, setParams] = useState({
    density: 0.4,
    drift: 0.2,
    brightness: 0.6,
    space: 0.8,
    evolution: 0.5
  });

  const nodesRef = useRef([]);
  const reverbRef = useRef(null);
  const delayRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    // Ambient Cloud Engine
    const reverb = new Tone.Reverb({ decay: 10, wet: 0.8 }).toDestination();
    const delay = new Tone.FeedbackDelay("4n", 0.6).connect(reverb);
    const filter = new Tone.AutoFilter({
      frequency: 0.1,
      baseFrequency: 200,
      octaves: 4,
      filter: { type: "lowpass", rolloff: -24 }
    }).connect(delay).start();

    reverbRef.current = reverb;
    delayRef.current = delay;
    filterRef.current = filter;

    // Create 8 ethereal voices
    const voices = Array(8).fill(null).map(() => {
      const osc = new Tone.Oscillator({
        type: "sine",
        frequency: 100 + Math.random() * 400,
        volume: -Infinity
      }).connect(filter);
      
      const lfo = new Tone.LFO({
        frequency: 0.05 + Math.random() * 0.2,
        min: -60,
        max: -20
      }).connect(osc.volume).start();

      return { osc, lfo };
    });

    nodesRef.current = voices;

    return () => {
      voices.forEach(v => { v.osc.dispose(); v.lfo.dispose(); });
      reverb.dispose();
      delay.dispose();
      filter.dispose();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      nodesRef.current.forEach((v, i) => {
        const freq = 50 + (i * 50) + (params.drift * 500);
        v.osc.frequency.rampTo(freq, 5);
        v.osc.start();
      });
      filterRef.current.frequency.value = 0.05 + params.evolution * 2;
      reverbRef.current.wet.value = params.space;
    } else {
      nodesRef.current.forEach(v => v.osc.stop());
    }
  }, [isActive, params]);

  const randomize = () => {
    setParams({
      density: Math.random(),
      drift: Math.random(),
      brightness: Math.random(),
      space: Math.random(),
      evolution: Math.random()
    });
  };

  return (
    <div className="cloud-texture-generator" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Cloud color="#a5f3fc" /> Cloud Texture Generator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generative ambient soundscapes and ethereal harmonic clouds.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-glass" onClick={randomize}><RefreshCw size={16} /></button>
          <button 
            className={`btn-glass ${isActive ? 'active' : ''}`} 
            onClick={() => {
              if (Tone.context.state !== 'running') Tone.start();
              setIsActive(!isActive);
            }}
            style={{ padding: '10px 30px', background: isActive ? '#06b6d4' : 'rgba(255,255,255,0.05)', color: isActive ? 'white' : 'inherit' }}
          >
            {isActive ? 'DISPERSE' : 'CONGEAL'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px', position: 'relative', overflow: 'hidden', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle at 50% 50%, #06b6d4 0%, transparent 80%)' }} />
          
          <AnimatePresence>
            {isActive && Array(12).fill(null).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }}
                animate={{ 
                  opacity: [0, 0.4, 0], 
                  scale: [1, 2 + params.density * 2, 1],
                  x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                  y: [Math.random() * 200 - 100, Math.random() * 200 - 100]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                  position: 'absolute', 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: '#a5f3fc', 
                  filter: 'blur(40px)',
                  mixBlendMode: 'screen'
                }}
              />
            ))}
          </AnimatePresence>
          
          <div style={{ position: 'relative', textAlign: 'center', zIndex: 10 }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
              <Cloud size={80} color="#a5f3fc" style={{ filter: 'drop-shadow(0 0 20px #06b6d4)' }} />
            </motion.div>
            <p style={{ marginTop: '20px', fontSize: '0.7rem', letterSpacing: '4px', opacity: 0.4 }}>{isActive ? 'ATMOSPHERE ACTIVE' : 'SYSTEM DORMANT'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(params).map(([key, value]) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', opacity: 0.6, textTransform: 'uppercase' }}>{key}</span>
                <span style={{ fontSize: '0.8rem', color: '#06b6d4' }}>{Math.round(value * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={value} 
                onChange={(e) => setParams(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>
          ))}

          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', background: 'rgba(6, 182, 212, 0.05)' }}>
               <Wind size={18} style={{ marginBottom: '8px', opacity: 0.5 }} />
               <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>DRIFT</p>
               <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>STABLE</p>
            </div>
            <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', background: 'rgba(6, 182, 212, 0.05)' }}>
               <Sun size={18} style={{ marginBottom: '8px', opacity: 0.5 }} />
               <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>RADIANCE</p>
               <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>HIGH</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Layers size={20} color="#06b6d4" />
        <div style={{ flex: 1 }}>
          <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div 
              animate={{ width: isActive ? ['20%', '80%', '40%', '60%'] : '0%' }}
              transition={{ repeat: Infinity, duration: 10 }}
              style={{ height: '100%', background: '#06b6d4' }} 
            />
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', opacity: 0.4, fontFamily: 'monospace' }}>RES_SPECT_8X</span>
      </div>
    </div>
  );
};

export default CloudTextureGenerator;
