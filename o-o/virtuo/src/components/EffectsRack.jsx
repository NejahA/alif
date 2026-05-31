import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Zap, Wind, Waves, Filter, Volume2, Settings, Radio, Sparkles, Music } from 'lucide-react';
import masterBus from '../audio/masterBus';

const EFFECTS = [
  {
    id: 'reverb',
    name: 'Reverb',
    icon: '🏛️',
    color: '#8b5cf6',
    description: 'Simulates acoustic space',
    params: [
      { id: 'decay', name: 'Decay', min: 0.1, max: 10, step: 0.1, value: 2.5, unit: 's' },
      { id: 'preDelay', name: 'Pre-Delay', min: 0, max: 0.1, step: 0.001, value: 0.01, unit: 's' },
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, value: 0.3, unit: '%' },
    ]
  },
  {
    id: 'delay',
    name: 'Delay',
    icon: '🔄',
    color: '#3b82f6',
    description: 'Echo effect with feedback',
    params: [
      { id: 'delayTime', name: 'Time', min: 0.1, max: 2, step: 0.1, value: 0.5, unit: 's' },
      { id: 'feedback', name: 'Feedback', min: 0, max: 0.9, step: 0.01, value: 0.3, unit: '%' },
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, value: 0.2, unit: '%' },
    ]
  },
  {
    id: 'distortion',
    name: 'Distortion',
    icon: '🔥',
    color: '#ef4444',
    description: 'Adds harmonic saturation',
    params: [
      { id: 'distortion', name: 'Amount', min: 0, max: 1, step: 0.01, value: 0.2, unit: '' },
      { id: 'oversample', name: 'Quality', min: 0, max: 2, step: 1, value: 2, unit: 'x' },
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, value: 0.1, unit: '%' },
    ]
  },
  {
    id: 'filter',
    name: 'Filter',
    icon: '🎛️',
    color: '#10b981',
    description: 'Frequency shaping',
    params: [
      { id: 'frequency', name: 'Freq', min: 20, max: 20000, step: 1, value: 1000, unit: 'Hz' },
      { id: 'type', name: 'Type', options: ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'], value: 'lowpass' },
      { id: 'Q', name: 'Resonance', min: 0.1, max: 10, step: 0.1, value: 1, unit: 'Q' },
    ]
  },
  {
    id: 'chorus',
    name: 'Chorus',
    icon: '🌀',
    color: '#06b6d4',
    description: 'Thickens sound with modulation',
    params: [
      { id: 'frequency', name: 'Rate', min: 0.1, max: 10, step: 0.1, value: 2, unit: 'Hz' },
      { id: 'delayTime', name: 'Delay', min: 0.1, max: 20, step: 0.1, value: 3.5, unit: 'ms' },
      { id: 'depth', name: 'Depth', min: 0, max: 1, step: 0.01, value: 0.5, unit: '%' },
    ]
  },
  {
    id: 'phaser',
    name: 'Phaser',
    icon: '🌊',
    color: '#ec4899',
    description: 'Sweeping filter effect',
    params: [
      { id: 'frequency', name: 'Rate', min: 0.1, max: 10, step: 0.1, value: 1, unit: 'Hz' },
      { id: 'octaves', name: 'Octaves', min: 0, max: 4, step: 0.1, value: 1, unit: '' },
      { id: 'baseFrequency', name: 'Base Freq', min: 100, max: 5000, step: 10, value: 1000, unit: 'Hz' },
    ]
  },
  {
    id: 'compressor',
    name: 'Compressor',
    icon: '📊',
    color: '#f59e0b',
    description: 'Controls dynamic range',
    params: [
      { id: 'threshold', name: 'Threshold', min: -60, max: 0, step: 1, value: -20, unit: 'dB' },
      { id: 'ratio', name: 'Ratio', min: 1, max: 20, step: 1, value: 4, unit: ':1' },
      { id: 'attack', name: 'Attack', min: 0.001, max: 1, step: 0.001, value: 0.01, unit: 's' },
    ]
  },
  {
    id: 'bitcrusher',
    name: 'Bit Crusher',
    icon: '🕹️',
    color: '#84cc16',
    description: 'Reduces audio resolution',
    params: [
      { id: 'bits', name: 'Bits', min: 1, max: 16, step: 1, value: 8, unit: 'bit' },
      { id: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, value: 0.3, unit: '%' },
    ]
  },
];

export default function EffectsRack() {
  const effectsRef = useRef({});
  const [activeEffects, setActiveEffects] = useState({});
  const [effectParams, setEffectParams] = useState({});
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isBypassed, setIsBypassed] = useState(false);
  const [preset, setPreset] = useState('default');
  const [testSound, setTestSound] = useState('sine');

  useEffect(() => {
    // Initialize all effects
    EFFECTS.forEach(effect => {
      switch(effect.id) {
        case 'reverb':
          effectsRef.current[effect.id] = new Tone.Reverb({
            decay: effect.params.find(p => p.id === 'decay')?.value || 2.5,
            preDelay: effect.params.find(p => p.id === 'preDelay')?.value || 0.01,
            wet: effect.params.find(p => p.id === 'wet')?.value || 0.3,
          }).connect(masterBus);
          break;
          
        case 'delay':
          effectsRef.current[effect.id] = new Tone.FeedbackDelay({
            delayTime: effect.params.find(p => p.id === 'delayTime')?.value || 0.5,
            feedback: effect.params.find(p => p.id === 'feedback')?.value || 0.3,
            wet: effect.params.find(p => p.id === 'wet')?.value || 0.2,
          }).connect(masterBus);
          break;
          
        case 'distortion':
          effectsRef.current[effect.id] = new Tone.Distortion({
            distortion: effect.params.find(p => p.id === 'distortion')?.value || 0.2,
            oversample: effect.params.find(p => p.id === 'oversample')?.value || '4x',
            wet: effect.params.find(p => p.id === 'wet')?.value || 0.1,
          }).connect(masterBus);
          break;
          
        case 'filter':
          effectsRef.current[effect.id] = new Tone.Filter({
            frequency: effect.params.find(p => p.id === 'frequency')?.value || 1000,
            type: effect.params.find(p => p.id === 'type')?.value || 'lowpass',
            Q: effect.params.find(p => p.id === 'Q')?.value || 1,
          }).connect(masterBus);
          break;
          
        case 'chorus':
          effectsRef.current[effect.id] = new Tone.Chorus({
            frequency: effect.params.find(p => p.id === 'frequency')?.value || 2,
            delayTime: effect.params.find(p => p.id === 'delayTime')?.value || 3.5,
            depth: effect.params.find(p => p.id === 'depth')?.value || 0.5,
            wet: 0.5,
          }).connect(masterBus);
          break;
          
        case 'phaser':
          effectsRef.current[effect.id] = new Tone.Phaser({
            frequency: effect.params.find(p => p.id === 'frequency')?.value || 1,
            octaves: effect.params.find(p => p.id === 'octaves')?.value || 1,
            baseFrequency: effect.params.find(p => p.id === 'baseFrequency')?.value || 1000,
            wet: 0.5,
          }).connect(masterBus);
          break;
          
        case 'compressor':
          effectsRef.current[effect.id] = new Tone.Compressor({
            threshold: effect.params.find(p => p.id === 'threshold')?.value || -20,
            ratio: effect.params.find(p => p.id === 'ratio')?.value || 4,
            attack: effect.params.find(p => p.id === 'attack')?.value || 0.01,
            release: 0.25,
          }).connect(masterBus);
          break;
          
        case 'bitcrusher':
          effectsRef.current[effect.id] = new Tone.BitCrusher({
            bits: effect.params.find(p => p.id === 'bits')?.value || 8,
            wet: effect.params.find(p => p.id === 'wet')?.value || 0.3,
          }).connect(masterBus);
          break;
      }
    });

    // Initialize effect params state
    const initialParams = {};
    EFFECTS.forEach(effect => {
      initialParams[effect.id] = {};
      effect.params.forEach(param => {
        if (param.options) {
          initialParams[effect.id][param.id] = param.value;
        } else {
          initialParams[effect.id][param.id] = param.value;
        }
      });
    });
    setEffectParams(initialParams);

    // Initialize active effects
    const initialActive = {};
    EFFECTS.forEach(effect => {
      initialActive[effect.id] = true;
    });
    setActiveEffects(initialActive);

    return () => {
      Object.values(effectsRef.current).forEach(effect => effect?.dispose());
    };
  }, []);

  const updateEffectParam = (effectId, paramId, value) => {
    setEffectParams(prev => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        [paramId]: value
      }
    }));

    // Update the actual effect
    const effect = effectsRef.current[effectId];
    if (effect) {
      if (paramId === 'type' && effect.set) {
        effect.set({ type: value });
      } else if (effect[paramId]) {
        if (typeof effect[paramId].value !== 'undefined') {
          effect[paramId].value = value;
        } else {
          effect[paramId] = value;
        }
      }
    }
  };

  const toggleEffect = (effectId) => {
    setActiveEffects(prev => ({
      ...prev,
      [effectId]: !prev[effectId]
    }));

    const effect = effectsRef.current[effectId];
    if (effect) {
      if (effect.wet) {
        effect.wet.value = activeEffects[effectId] ? 0 : effectParams[effectId]?.wet || 0.5;
      }
    }
  };

  const playTestSound = async () => {
    await Tone.start();
    
    const synth = new Tone.Synth({
      oscillator: { type: testSound },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
    }).toDestination();

    // Connect through active effects
    let chain = synth;
    EFFECTS.forEach(effect => {
      if (activeEffects[effect.id] && effectsRef.current[effect.id]) {
        chain = chain.connect(effectsRef.current[effect.id]);
      }
    });
    chain.connect(masterBus);

    synth.triggerAttackRelease('C4', '1s');
    
    setTimeout(() => {
      synth.dispose();
    }, 2000);
  };

  const loadPreset = (presetName) => {
    const presets = {
      default: {
        reverb: { decay: 2.5, preDelay: 0.01, wet: 0.3 },
        delay: { delayTime: 0.5, feedback: 0.3, wet: 0.2 },
        distortion: { distortion: 0.2, oversample: 2, wet: 0.1 },
        filter: { frequency: 1000, type: 'lowpass', Q: 1 },
      },
      ambient: {
        reverb: { decay: 5, preDelay: 0.05, wet: 0.7 },
        delay: { delayTime: 1, feedback: 0.5, wet: 0.4 },
        chorus: { frequency: 0.5, delayTime: 5, depth: 0.8 },
        phaser: { frequency: 0.3, octaves: 2, baseFrequency: 500 },
      },
      aggressive: {
        distortion: { distortion: 0.8, oversample: 4, wet: 0.6 },
        compressor: { threshold: -30, ratio: 10, attack: 0.001 },
        filter: { frequency: 2000, type: 'highpass', Q: 5 },
        bitcrusher: { bits: 4, wet: 0.5 },
      },
      clean: {
        compressor: { threshold: -15, ratio: 2, attack: 0.05 },
        filter: { frequency: 5000, type: 'lowshelf', Q: 0.5 },
        reverb: { decay: 1.5, preDelay: 0.005, wet: 0.2 },
      }
    };

    const presetData = presets[presetName] || presets.default;
    setPreset(presetName);
    
    Object.entries(presetData).forEach(([effectId, params]) => {
      Object.entries(params).forEach(([paramId, value]) => {
        updateEffectParam(effectId, paramId, value);
      });
    });
  };

  const resetEffects = () => {
    EFFECTS.forEach(effect => {
      effect.params.forEach(param => {
        updateEffectParam(effect.id, param.id, param.value);
      });
    });
    setPreset('default');
  };

  const getEffectChain = () => {
    return EFFECTS.filter(effect => activeEffects[effect.id]).map(effect => effect.name).join(' → ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Effects Rack</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Advanced audio processing with 8 professional effects. Chain them together for unique sounds.
        </p>
      </div>

      {/* Master Controls */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Master Volume</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Volume2 size={16} color="var(--text-muted)" />
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={masterVolume} 
              onChange={(e) => {
                setMasterVolume(Number(e.target.value));
                Tone.Destination.volume.rampTo(Tone.gainToDb(Number(e.target.value)), 0.1);
              }}
              style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
            />
            <span style={{ fontSize: '0.8rem', minWidth: '40px' }}>{(masterVolume * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Test Sound</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['sine', 'triangle', 'sawtooth', 'square'].map(type => (
              <button
                key={type}
                className={`btn-glass ${testSound === type ? 'active' : ''}`}
                onClick={() => setTestSound(type)}
                style={{ 
                  padding: '5px 10px',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Presets</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['default', 'ambient', 'aggressive', 'clean'].map(presetName => (
              <button
                key={presetName}
                className={`btn-glass ${preset === presetName ? 'active' : ''}`}
                onClick={() => loadPreset(presetName)}
                style={{ 
                  padding: '5px 10px',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}
              >
                {presetName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Effect Chain Display */}
      <div style={{ 
        width: '100%', 
        maxWidth: '800px',
        background: 'rgba(255,255,255,0.05)',
        border: '2px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Active Effect Chain:</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
            {getEffectChain() || 'No effects active'}
          </div>
        </div>
      </div>

      {/* Effects Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        width: '100%',
        maxWidth: '1200px'
      }}>
        {EFFECTS.map(effect => {
          const isActive = activeEffects[effect.id];
          const params = effectParams[effect.id] || {};
          
          return (
            <motion.div
              key={effect.id}
              animate={{
                borderColor: isActive ? effect.color : 'var(--glass-border)',
                backgroundColor: isActive ? `${effect.color}10` : 'rgba(255,255,255,0.03)',
                boxShadow: isActive ? `0 0 20px ${effect.color}40` : 'none'
              }}
              style={{
                border: '2px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}
            >
              {/* Effect Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '1.5rem' }}>{effect.icon}</div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: effect.color }}>
                      {effect.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {effect.description}
                    </div>
                  </div>
                </div>
                
                <button
                  className={`btn-glass ${isActive ? 'active' : ''}`}
                  onClick={() => toggleEffect(effect.id)}
                  style={{ 
                    padding: '5px 10px',
                    fontSize: '0.8rem',
                    background: isActive ? effect.color : undefined,
                    borderColor: effect.color
                  }}
                >
                  {isActive ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Effect Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {effect.params.map(param => {
                  const value = params[param.id] !== undefined ? params[param.id] : param.value;
                  
                  return (
                    <div key={param.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{param.name}</span>
                        <span style={{ color: effect.color, fontWeight: 600 }}>
                          {typeof value === 'number' ? value.toFixed(param.id === 'type' ? 0 : 2) : value}
                          {param.unit && ` ${param.unit}`}
                        </span>
                      </div>
                      
                      {param.options ? (
                        <select
                          value={value}
                          onChange={(e) => updateEffectParam(effect.id, param.id, e.target.value)}
                          className="btn-glass"
                          style={{ 
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            borderColor: effect.color,
                            color: effect.color
                          }}
                          disabled={!isActive}
                        >
                          {param.options.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={value}
                          onChange={(e) => updateEffectParam(effect.id, param.id, Number(e.target.value))}
                          style={{ 
                            width: '100%',
                            accentColor: effect.color,
                            opacity: isActive ? 1 : 0.5
                          }}
                          disabled={!isActive}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Test Button */}
              <button
                className="btn-glass"
                onClick={playTestSound}
                style={{ 
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  borderColor: effect.color,
                  color: effect.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
                disabled={!isActive}
              >
                <Music size={14} /> Test {effect.name}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Global Controls */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn-glass"
          onClick={playTestSound}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Zap size={16} /> Play Test Sound
        </button>
        
        <button
          className="btn-glass"
          onClick={resetEffects}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Settings size={16} /> Reset All
        </button>
        
        <button
          className={`btn-glass ${isBypassed ? 'active' : ''}`}
          onClick={() => setIsBypassed(!isBypassed)}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isBypassed ? '🔊 Bypass Off' : '🔇 Bypass On'}
        </button>
      </div>

      {/* Signal Flow Diagram */}
      <div style={{ 
        width: '100%', 
        maxWidth: '800px',
        background: 'rgba(255,255,255,0.05)',
        border: '2px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
          Signal Flow
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          overflowX: 'auto',
          padding: '10px 0'
        }}>
          <div style={{ 
            padding: '8px 15px',
            background: 'var(--accent-primary)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            Input
          </div>
          
          {EFFECTS.filter(effect => activeEffects[effect.id]).map((effect, index) => (
            <React.Fragment key={effect.id}>
              <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</div>
              <div style={{ 
                padding: '8px 15px',
                background: effect.color,
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                {effect.name}
              </div>
            </React.Fragment>
          ))}
          
          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</div>
          <div style={{ 
            padding: '8px 15px',
            background: '#10b981',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>
            Output
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
          Professional audio effects processor. Toggle effects on/off, adjust parameters, and chain them together.
          Use presets for quick setups or create your own custom chains.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          background: 'rgba(0,0,0,0.2)', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#8b5cf6', fontWeight: 600 }}>Reverb & Delay</div>
            <div style={{ color: 'var(--text-muted)' }}>Space and echo effects</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#ef4444', fontWeight: 600 }}>Distortion & Filter</div>
            <div style={{ color: 'var(--text-muted)' }}>Tone shaping</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#06b6d4', fontWeight: 600 }}>Modulation</div>
            <div style={{ color: 'var(--text-muted)' }}>Chorus, phaser, etc.</div>
          </div>
        </div>
      </div>
    </div>
  );
}