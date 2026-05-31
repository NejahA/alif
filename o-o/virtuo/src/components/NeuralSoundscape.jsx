import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Cloud, Zap, Wind, Trees, Home, Rocket, RefreshCw } from 'lucide-react';

const SCENES = [
  { name: "Neon Rain", icon: Cloud, color: "#3b82f6" },
  { name: "Ancient Forest", icon: Trees, color: "#10b981" },
  { name: "Deep Space", icon: Rocket, color: "#8b5cf6" },
  { name: "Cozy Hearth", icon: Home, color: "#f59e0b" }
];

const NeuralSoundscape = () => {
  const [scene, setScene] = useState(SCENES[0]);
  const [isActive, setIsActive] = useState(false);
  const [density, setDensity] = useState(0.5);
  
  const noiseRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const noise = new Tone.Noise("pink").start();
    const filter = new Tone.AutoFilter({
      frequency: 0.1,
      baseFrequency: 200,
      octaves: 4
    }).toDestination();
    
    noise.connect(filter);
    noise.volume.value = -Infinity;
    
    noiseRef.current = noise;
    filterRef.current = filter;

    return () => {
      noise.dispose();
      filter.dispose();
    };
  }, []);

  useEffect(() => {
    if (noiseRef.current) {
        noiseRef.current.volume.rampTo(isActive ? Tone.gainToDb(density * 0.2) : -Infinity, 1);
    }
  }, [isActive, density]);

  return (
    <div className="neural-soundscape" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Cloud color={scene.color} /> Neural Soundscape
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>AI-driven environment synthesis for immersive background textures.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? scene.color : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'ENVIRONMENT LIVE' : 'START SYNTHESIS'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {SCENES.map(s => (
          <motion.div
            key={s.name}
            whileHover={{ scale: 1.05 }}
            onClick={() => setScene(s)}
            className="glass-panel"
            style={{ 
              padding: '20px', 
              cursor: 'pointer', 
              textAlign: 'center',
              border: scene.name === s.name ? `2px solid ${s.color}` : '1px solid rgba(255,255,255,0.05)',
              background: scene.name === s.name ? `${s.color}15` : 'rgba(255,255,255,0.02)'
            }}
          >
            <s.icon size={32} color={s.color} style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>{s.name}</h3>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>ATMOSPHERIC DENSITY</span>
                  <span style={{ fontSize: '0.8rem', color: scene.color }}>{Math.round(density * 100)}%</span>
               </div>
               <input type="range" min="0" max="1" step="0.01" value={density} onChange={(e) => setDensity(parseFloat(e.target.value))} style={{ width: '100%', accentColor: scene.color }} />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
               <button className="btn-glass" style={{ flex: 1 }}><RefreshCw size={14} /> EVOLVE SEED</button>
               <button className="btn-glass" style={{ flex: 1 }}><Wind size={14} /> RANDOMIZE</button>
            </div>
         </div>

         <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '0.65rem', opacity: 0.4, letterSpacing: '2px', marginBottom: '15px' }}>NEURAL ACTIVITY</h4>
            <div style={{ display: 'flex', gap: '4px', height: '60px', alignItems: 'flex-end' }}>
               {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: isActive ? [10, 40, 15, 50, 10] : 4,
                      opacity: isActive ? [0.2, 1, 0.4] : 0.1
                    }}
                    transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: i * 0.1 }}
                    style={{ flex: 1, background: scene.color, borderRadius: '2px' }}
                  />
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default NeuralSoundscape;
