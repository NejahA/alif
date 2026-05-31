import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { SlidersHorizontal, Plus, Trash2, Power, Settings, Move, GripVertical } from 'lucide-react';
import { useAudioSafe } from '../hooks/useAudioSafe';

const EFFECT_TYPES = {
  reverb: {
    name: 'Reverb',
    icon: '🏛️',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.3 },
      { id: 'decay', name: 'Decay', min: 0.1, max: 10, step: 0.1, defaultValue: 2.5 },
      { id: 'preDelay', name: 'PreDelay', min: 0, max: 0.1, step: 0.001, defaultValue: 0.01 }
    ],
    create: () => new Tone.Reverb({ decay: 2.5, preDelay: 0.01 })
  },
  delay: {
    name: 'Delay',
    icon: '⏱️',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.3 },
      { id: 'delayTime', name: 'Time', min: 0.1, max: 2, step: 0.1, defaultValue: 0.5 },
      { id: 'feedback', name: 'Feedback', min: 0, max: 0.95, step: 0.05, defaultValue: 0.3 }
    ],
    create: () => new Tone.FeedbackDelay({ delayTime: 0.5, feedback: 0.3 })
  },
  distortion: {
    name: 'Distortion',
    icon: '🔊',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
      { id: 'distortion', name: 'Amount', min: 0, max: 1, step: 0.01, defaultValue: 0.4 },
      { id: 'oversample', name: 'Quality', min: 1, max: 4, step: 1, defaultValue: 2 }
    ],
    create: () => new Tone.Distortion({ distortion: 0.4, oversample: '2x' })
  },
  chorus: {
    name: 'Chorus',
    icon: '🌀',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
      { id: 'frequency', name: 'Rate', min: 0.1, max: 10, step: 0.1, defaultValue: 2 },
      { id: 'depth', name: 'Depth', min: 0, max: 1, step: 0.01, defaultValue: 0.3 }
    ],
    create: () => new Tone.Chorus({ frequency: 2, depth: 0.3, type: 'sine' })
  },
  phaser: {
    name: 'Phaser',
    icon: '🌊',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
      { id: 'frequency', name: 'Rate', min: 0.1, max: 10, step: 0.1, defaultValue: 1 },
      { id: 'octaves', name: 'Depth', min: 0, max: 4, step: 0.1, defaultValue: 2 }
    ],
    create: () => new Tone.Phaser({ frequency: 1, octaves: 2, baseFrequency: 350 })
  },
  filter: {
    name: 'Filter',
    icon: '🎛️',
    params: [
      { id: 'frequency', name: 'Cutoff', min: 20, max: 20000, step: 1, defaultValue: 1000 },
      { id: 'Q', name: 'Resonance', min: 0.1, max: 20, step: 0.1, defaultValue: 1 },
      { id: 'type', name: 'Type', type: 'select', options: ['lowpass', 'highpass', 'bandpass'], defaultValue: 'lowpass' }
    ],
    create: () => new Tone.Filter({ frequency: 1000, type: 'lowpass', Q: 1 })
  },
  compressor: {
    name: 'Compressor',
    icon: '📊',
    params: [
      { id: 'threshold', name: 'Threshold', min: -60, max: 0, step: 1, defaultValue: -24 },
      { id: 'ratio', name: 'Ratio', min: 1, max: 20, step: 1, defaultValue: 4 },
      { id: 'attack', name: 'Attack', min: 0, max: 1, step: 0.001, defaultValue: 0.003 },
      { id: 'release', name: 'Release', min: 0, max: 1, step: 0.001, defaultValue: 0.25 }
    ],
    create: () => new Tone.Compressor({ threshold: -24, ratio: 4 })
  },
  bitcrusher: {
    name: 'Bitcrusher',
    icon: '👾',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
      { id: 'bits', name: 'Bits', min: 1, max: 16, step: 1, defaultValue: 4 }
    ],
    lockedUntil: { virtue: 'timbre', level: 3 },
    create: () => new Tone.BitCrusher({ bits: 4 })
  },
  chebyshev: {
    name: 'Chebyshev',
    icon: '🎻',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
      { id: 'order', name: 'Harmonics', min: 1, max: 100, step: 1, defaultValue: 50 }
    ],
    lockedUntil: { virtue: 'expression', level: 5 },
    create: () => new Tone.Chebyshev({ order: 50 })
  },
  tremolo: {
    name: 'Tremolo',
    icon: '📳',
    params: [
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
      { id: 'frequency', name: 'Rate', min: 0.1, max: 20, step: 0.1, defaultValue: 5 },
      { id: 'depth', name: 'Depth', min: 0, max: 1, step: 0.01, defaultValue: 0.5 }
    ],
    lockedUntil: { virtue: 'rhythm', level: 4 },
    create: () => new Tone.Tremolo({ frequency: 5, depth: 0.5 }).start()
  }
};

export default function InstrumentFXChain({ instrumentId, inputNode, outputNode }) {
  const isAudioReady = useAudioSafe();
  const [effects, setEffects] = useState(() => {
    const saved = localStorage.getItem(`virtuo_fx_${instrumentId}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [virtues, setVirtues] = useState(() => {
    const saved = localStorage.getItem('virtuo_virtues');
    return saved ? JSON.parse(saved) : {};
  });

  const getVirtueLevel = (virtue) => {
    const data = virtues[virtue];
    if (!data) return 0;
    return Math.floor(Math.sqrt(data.xp / 100));
  };

  const isLocked = (type) => {
    const def = EFFECT_TYPES[type];
    if (!def.lockedUntil) return false;
    return getVirtueLevel(def.lockedUntil.virtue) < def.lockedUntil.level;
  };
  
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const effectsChainRef = useRef([]);
  const nodesRef = useRef({});

  // Initialize effects chain
  useEffect(() => {
    if (!isAudioReady || !inputNode || !outputNode) return;
    
    // Dispose previous effects
    effectsChainRef.current.forEach(effect => effect.dispose());
    effectsChainRef.current = [];
    nodesRef.current = {};
    
    // Create new effects chain
    let current = inputNode;
    
    effects.forEach((effectConfig, index) => {
      if (effectConfig.enabled) {
        const effectDef = EFFECT_TYPES[effectConfig.type];
        if (effectDef) {
          const effect = effectDef.create();
          
          // Apply saved parameters
          Object.keys(effectConfig.params).forEach(param => {
            if (effect[param] !== undefined) {
              effect[param].value = effectConfig.params[param];
            }
          });
          
          current.connect(effect);
          current = effect;
          effectsChainRef.current.push(effect);
          nodesRef.current[effectConfig.id] = effect;
        }
      }
    });
    
    current.connect(outputNode);
    
    return () => {
      effectsChainRef.current.forEach(effect => effect.dispose());
    };
  }, [effects, inputNode, outputNode, instrumentId]);

  // Save effects to localStorage
  useEffect(() => {
    localStorage.setItem(`virtuo_fx_${instrumentId}`, JSON.stringify(effects));
  }, [effects, instrumentId]);

  const addEffect = (type) => {
    const effectDef = EFFECT_TYPES[type];
    if (!effectDef) return;
    
    const newEffect = {
      id: Date.now(),
      type,
      name: effectDef.name,
      enabled: true,
      params: effectDef.params.reduce((acc, param) => ({
        ...acc,
        [param.id]: param.defaultValue
      }), {})
    };
    
    setEffects(prev => [...prev, newEffect]);
    setSelectedEffect(newEffect.id);
  };

  const removeEffect = (id) => {
    setEffects(prev => prev.filter(effect => effect.id !== id));
    if (selectedEffect === id) {
      setSelectedEffect(null);
    }
  };

  const toggleEffect = (id) => {
    setEffects(prev => prev.map(effect => 
      effect.id === id ? { ...effect, enabled: !effect.enabled } : effect
    ));
  };

  const updateEffectParam = (effectId, param, value) => {
    setEffects(prev => prev.map(effect => {
      if (effect.id === effectId) {
        return {
          ...effect,
          params: { ...effect.params, [param]: value }
        };
      }
      return effect;
    }));
    
    // Update real-time parameter if effect exists
    const effectNode = nodesRef.current[effectId];
    if (effectNode && effectNode[param]) {
      effectNode[param].value = value;
    }
  };

  const moveEffect = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const newEffects = [...effects];
    const [moved] = newEffects.splice(fromIndex, 1);
    newEffects.splice(toIndex, 0, moved);
    
    setEffects(newEffects);
  };

  const clearAllEffects = () => {
    if (confirm('Are you sure you want to clear all effects?')) {
      setEffects([]);
      setSelectedEffect(null);
    }
  };

  const selectedEffectConfig = effects.find(e => e.id === selectedEffect);
  const selectedEffectDef = selectedEffectConfig ? EFFECT_TYPES[selectedEffectConfig.type] : null;

  return (
    <div className="glass-panel" style={{ 
      padding: '20px', 
      width: '400px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px' 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SlidersHorizontal size={20} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Effects Chain</h3>
        </div>
        
        {effects.length > 0 && (
          <button 
            className="btn-glass"
            onClick={clearAllEffects}
            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
          >
            <Trash2 size={12} />
            Clear All
          </button>
        )}
      </div>

      {/* Effects Chain Visualization */}
      <div style={{ 
        minHeight: '60px', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: '8px', 
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {effects.length === 0 ? (
          <div style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.8rem', 
            textAlign: 'center', 
            width: '100%' 
          }}>
            No effects added. Drag effects from the palette below.
          </div>
        ) : (
          effects.map((effect, index) => (
            <div
              key={effect.id}
              className="btn-glass"
              onClick={() => setSelectedEffect(effect.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                border: selectedEffect === effect.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                opacity: effect.enabled ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <GripVertical size={12} style={{ opacity: 0.5, cursor: 'move' }} />
              <Power 
                size={12} 
                color={effect.enabled ? 'var(--accent-primary)' : 'var(--text-muted)'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEffect(effect.id);
                }}
                style={{ cursor: 'pointer' }}
              />
              {EFFECT_TYPES[effect.type]?.icon} {effect.name}
            </div>
          ))
        )}
      </div>

      {/* Effects Palette */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Add Effect:
        </h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(EFFECT_TYPES).map(([type, def]) => {
            const locked = isLocked(type);
            return (
              <button
                key={type}
                className="btn-glass"
                onClick={() => !locked && addEffect(type)}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: locked ? 0.4 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  borderColor: locked ? 'rgba(255,255,255,0.1)' : 'var(--glass-border)'
                }}
                title={locked ? `Unlocks at ${def.lockedUntil.virtue} Level ${def.lockedUntil.level}` : def.name}
              >
                {locked ? '🔒' : def.icon}
                {def.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Effect Parameters Editor */}
      {selectedEffectConfig && selectedEffectDef && (
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px', 
          padding: '15px',
          marginTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>
              {selectedEffectDef.icon} {selectedEffectConfig.name}
            </h4>
            <button 
              className="btn-glass"
              onClick={() => removeEffect(selectedEffectConfig.id)}
              style={{ padding: '4px 8px', fontSize: '0.7rem', borderColor: '#ef4444', color: '#ef4444' }}
            >
              <Trash2 size={12} />
              Remove
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedEffectDef.params.map(param => (
              <div key={param.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{param.name}</span>
                  <span>
                    {param.type === 'select' ? (
                      <select
                        value={selectedEffectConfig.params[param.id] || param.defaultValue}
                        onChange={(e) => updateEffectParam(selectedEffectConfig.id, param.id, e.target.value)}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: 'var(--text-main)',
                          padding: '2px 6px',
                          fontSize: '0.7rem'
                        }}
                      >
                        {param.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      selectedEffectConfig.params[param.id]?.toFixed?.(2) || param.defaultValue.toFixed(2)
                    )}
                  </span>
                </div>
                
                {param.type !== 'select' && (
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={selectedEffectConfig.params[param.id] || param.defaultValue}
                    onChange={(e) => updateEffectParam(selectedEffectConfig.id, param.id, Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CPU Usage Indicator */}
      <div style={{ 
        fontSize: '0.7rem', 
        color: 'var(--text-muted)', 
        textAlign: 'center',
        marginTop: '10px'
      }}>
        {effects.filter(e => e.enabled).length > 0 ? (
          `Active: ${effects.filter(e => e.enabled).length} effect(s)`
        ) : (
          'Effects are processed in real-time with Tone.js'
        )}
      </div>
    </div>
  );
}