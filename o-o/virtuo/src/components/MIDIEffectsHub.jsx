import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Share2, Zap, Activity, Waves, Sliders, Volume2, Target, Grid } from 'lucide-react';

const MIDIEffectsHub = () => {
  const [activeEffects, setActiveEffects] = useState({
    chordMemory: false,
    velocityRandomizer: false,
    scaleQuantizer: true,
    humanizer: false
  });

  const toggleEffect = (effect) => {
    setActiveEffects(prev => ({ ...prev, [effect]: !prev[effect] }));
  };

  return (
    <div className="midi-effects-hub" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Share2 color="#10b981" /> MIDI Effects Hub
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Central processing for MIDI utilities, chord generation, and humanization.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
           <div style={{ width: '10px', height: '100%', background: '#10b981', borderRadius: '5px' }} />
           <span style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '2px' }}>ROUTING: SERIAL</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {[
          { id: 'chordMemory', label: 'Chord Memory', desc: 'Trigger full chords from single notes.', icon: Grid },
          { id: 'velocityRandomizer', label: 'Velocity Random', desc: 'Add dynamic variation to note hits.', icon: Activity },
          { id: 'scaleQuantizer', label: 'Scale Quantize', desc: 'Snap all notes to the active project scale.', icon: Target },
          { id: 'humanizer', label: 'Note Humanizer', desc: 'Micro-timing offsets for a natural feel.', icon: Sliders }
        ].map(effect => (
          <motion.div
            key={effect.id}
            whileHover={{ scale: 1.02 }}
            className="glass-panel"
            style={{ 
              padding: '25px', 
              cursor: 'pointer', 
              border: activeEffects[effect.id] ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.05)',
              background: activeEffects[effect.id] ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)'
            }}
            onClick={() => toggleEffect(effect.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <effect.icon size={20} color={activeEffects[effect.id] ? '#10b981' : 'rgba(255,255,255,0.3)'} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{effect.label}</h3>
               </div>
               <div style={{ width: '30px', height: '15px', borderRadius: '10px', background: activeEffects[effect.id] ? '#10b981' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                  <motion.div
                    animate={{ x: activeEffects[effect.id] ? 15 : 0 }}
                    style={{ width: '11px', height: '11px', background: 'white', borderRadius: '50%', margin: '2px' }}
                  />
               </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{effect.desc}</p>
            
            {activeEffects[effect.id] && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 style={{ marginTop: '20px', borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '15px' }}
               >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                     <span style={{ opacity: 0.5 }}>INTENSITY</span>
                     <span style={{ color: '#10b981' }}>75%</span>
                  </div>
                  <input type="range" style={{ width: '100%', accentColor: '#10b981', marginTop: '8px' }} onClick={e => e.stopPropagation()} />
               </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="glass-panel" style={{ marginTop: '30px', padding: '20px', display: 'flex', justifyContent: 'center', gap: '40px', background: 'rgba(0,0,0,0.3)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
            <Zap size={14} />
            <span style={{ fontSize: '0.7rem' }}>LATENCY: 0.4ms</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
            <Activity size={14} />
            <span style={{ fontSize: '0.7rem' }}>JITTER: NONE</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
            <Volume2 size={14} />
            <span style={{ fontSize: '0.7rem' }}>THRU: ACTIVE</span>
         </div>
      </div>
    </div>
  );
};

export default MIDIEffectsHub;
