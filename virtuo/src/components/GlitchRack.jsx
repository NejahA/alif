import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Wind, Skull, Sparkles, Repeat } from 'lucide-react';
import { setGlitchWet, setPhaserWet, setBitcrusherWet, setReverbWet } from '../audio/masterBus';

export default function GlitchRack() {
  const [activeEffects, setActiveEffects] = useState({});

  const toggleEffect = (id, setter, valOn = 0.8, valOff = 0) => {
    const newState = !activeEffects[id];
    setActiveEffects(prev => ({ ...prev, [id]: newState }));
    setter(newState ? valOn : valOff);
  };

  const handleMomentary = (id, setter, valOn = 0.8, valOff = 0, isDown = true) => {
    setActiveEffects(prev => ({ ...prev, [id]: isDown }));
    setter(isDown ? valOn : valOff);
  };

  const effects = [
    { id: 'stutter', name: 'STUTTER', icon: Repeat, setter: setGlitchWet, color: '#f43f5e', momentary: true },
    { id: 'wash', name: 'WASH', icon: Wind, setter: setPhaserWet, color: '#3b82f6', momentary: true },
    { id: 'crush', name: 'CRUSH', icon: Skull, setter: setBitcrusherWet, color: '#f59e0b', momentary: false },
    { id: 'space', name: 'SPACE', icon: Sparkles, setter: setReverbWet, color: '#a855f7', momentary: false },
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Zap size={20} color="var(--accent-primary)" />
        <h4 style={{ margin: 0 }}>Glitch Rack</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {effects.map(fx => (
          <motion.button
            key={fx.id}
            onMouseDown={fx.momentary ? () => handleMomentary(fx.id, fx.setter, 0.8, 0, true) : undefined}
            onMouseUp={fx.momentary ? () => handleMomentary(fx.id, fx.setter, 0.8, 0, false) : undefined}
            onMouseLeave={fx.momentary && activeEffects[fx.id] ? () => handleMomentary(fx.id, fx.setter, 0.8, 0, false) : undefined}
            onClick={!fx.momentary ? () => toggleEffect(fx.id, fx.setter, 0.6) : undefined}
            whileTap={{ scale: 0.95 }}
            className="btn-glass"
            style={{
              height: '60px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.7rem',
              fontWeight: 800,
              background: activeEffects[fx.id] ? fx.color : 'rgba(255,255,255,0.05)',
              borderColor: activeEffects[fx.id] ? 'white' : 'var(--glass-border)',
              color: activeEffects[fx.id] ? 'white' : 'var(--text-main)',
              boxShadow: activeEffects[fx.id] ? `0 0 20px ${fx.color}80` : 'none'
            }}
          >
            <fx.icon size={18} />
            {fx.name}
            {fx.momentary && (
              <span style={{ fontSize: '0.5rem', opacity: 0.5, position: 'absolute', bottom: '4px' }}>HOLD</span>
            )}
          </motion.button>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Hold STUTTER/WASH for momentary master effects.
      </p>
    </div>
  );
}
