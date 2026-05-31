import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, Radio, Play, RefreshCw, Layers } from 'lucide-react';

const NeuralDrumSynth = () => {
  const [params, setParams] = useState({
    complexity: 0.5,
    entropy: 0.3,
    morph: 0.5,
    density: 0.6,
    resonance: 0.4
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(null);
  const noiseRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    // Neural Synthesis Engine: Combining FM, Noise, and complex filtering
    const filter = new Tone.Filter({
      type: "lowpass",
      frequency: 2000,
      Q: 2
    }).toDestination();

    const synth = new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.1
      },
      modulation: { type: "square" },
      modulationEnvelope: {
        attack: 0.002,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      }
    }).connect(filter);

    const noise = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      }
    }).connect(filter);

    synthRef.current = synth;
    noiseRef.current = noise;
    filterRef.current = filter;

    return () => {
      synth.dispose();
      noise.dispose();
      filter.dispose();
    };
  }, []);

  const triggerSynth = () => {
    if (Tone.context.state !== 'running') Tone.start();

    // Neural logic for parameter randomization
    const freq = 50 + (params.complexity * 200) + (Math.random() * params.entropy * 100);
    const decay = 0.05 + (params.morph * 0.5);
    const noiseLevel = params.density;

    synthRef.current.harmonicity.value = 1 + (params.entropy * 10);
    synthRef.current.modulationIndex.value = params.complexity * 50;
    synthRef.current.envelope.decay = decay;
    
    filterRef.current.frequency.rampTo(200 + (params.resonance * 8000), 0.01);
    filterRef.current.Q.value = params.resonance * 20;

    synthRef.current.triggerAttackRelease(freq, "16n");
    
    if (Math.random() < noiseLevel) {
      noiseRef.current.envelope.decay = decay * 0.5;
      noiseRef.current.triggerAttackRelease("16n");
    }
  };

  const randomize = () => {
    setParams({
      complexity: Math.random(),
      entropy: Math.random(),
      morph: Math.random(),
      density: Math.random(),
      resonance: Math.random()
    });
  };

  return (
    <div className="neural-drum-synth" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Cpu color="var(--accent-primary)" /> Neural Drum Synth
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deep-learning inspired percussion synthesis engine.</p>
        </div>
        <button className="btn-glass" onClick={randomize} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <RefreshCw size={16} /> EVOLVE
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(params).map(([key, value]) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, opacity: 0.6 }}>{key}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{Math.round(value * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={value} 
                onChange={(e) => setParams(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>
          ))}
          
          <button 
            className="btn-glass" 
            onMouseDown={triggerSynth}
            style={{ 
              marginTop: '20px', 
              padding: '20px', 
              background: 'rgba(138, 43, 226, 0.2)', 
              border: '2px solid var(--accent-primary)',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '4px',
              cursor: 'pointer'
            }}
          >
            TRIGGER NODE
          </button>
        </div>

        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at center, var(--accent-primary) 0%, transparent 70%)' }} />
          
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
             {/* Animated Neural Net Visualization */}
             <svg width="200" height="200" viewBox="0 0 100 100">
                <motion.circle cx="50" cy="50" r={20 + params.complexity * 20} fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} />
                <motion.circle cx="50" cy="50" r={10 + params.entropy * 30} fill="none" stroke="var(--accent-primary)" strokeWidth="0.2" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} strokeDasharray="2,2" />
                
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <g key={i} transform={`rotate(${angle} 50 50)`}>
                    <line x1="50" y1="20" x2="50" y2="30" stroke="var(--accent-primary)" strokeWidth="1" opacity="0.5" />
                    <circle cx="50" cy="20" r="2" fill="var(--accent-primary)" />
                  </g>
                ))}
             </svg>

             <div style={{ position: 'absolute', bottom: '-40px', left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', opacity: 0.5 }}>
                  <Activity size={14} />
                  <Radio size={14} />
                  <Zap size={14} />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
          <Layers size={18} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>ENGINE</p>
          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>TENSOR-V3</p>
        </div>
        <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
          <Activity size={18} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>PRECISION</p>
          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>FLOAT64</p>
        </div>
        <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
          <Zap size={18} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>LATENCY</p>
          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>0.42ms</p>
        </div>
        <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
          <Play size={18} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.7rem', opacity: 0.4 }}>NODES</p>
          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>1,024 active</p>
        </div>
      </div>
    </div>
  );
};

export default NeuralDrumSynth;
