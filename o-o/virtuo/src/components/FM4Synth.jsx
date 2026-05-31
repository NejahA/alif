import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Radio, Zap, Settings, Activity, Layers } from 'lucide-react';
import masterBus from '../audio/masterBus';

const ALGORITHMS = [
  { id: 1, name: 'Stack', description: '4 → 3 → 2 → 1' },
  { id: 2, name: 'Dual Stack', description: '(4 → 3) + (2 → 1)' },
  { id: 3, name: 'Parallel', description: '4 + 3 + 2 + 1' },
  { id: 4, name: 'Complex', description: '(4+3) → 2 → 1' }
];

export default function FM4Synth() {
  const [activeAlgorithm, setActiveAlgorithm] = useState(1);
  const [opParams, setOpParams] = useState([
    { ratio: 1, level: 1, attack: 0.1, release: 1 },
    { ratio: 2, level: 0.5, attack: 0.2, release: 0.5 },
    { ratio: 0.5, level: 0.2, attack: 0.05, release: 0.2 },
    { ratio: 4, level: 0.1, attack: 0.01, release: 0.1 }
  ]);
  
  const voicesRef = useRef({});

  const createVoice = (note) => {
    const context = Tone.context;
    const ops = [];
    const gains = [];
    const envelopes = [];
    
    // Create 4 operators
    for (let i = 0; i < 4; i++) {
      const osc = new Tone.Oscillator(note).start();
      const gain = new Tone.Gain(0);
      const env = new Tone.AmplitudeEnvelope({
        attack: opParams[i].attack,
        decay: 0.2,
        sustain: 0.5,
        release: opParams[i].release
      });
      
      osc.connect(gain);
      gain.connect(env);
      
      ops.push(osc);
      gains.push(gain);
      envelopes.push(env);
    }

    // Connect according to algorithm
    const outGain = new Tone.Gain(0.2).connect(masterBus);
    
    switch(activeAlgorithm) {
      case 1: // 4 -> 3 -> 2 -> 1
        envelopes[3].connect(ops[2].frequency);
        envelopes[2].connect(ops[1].frequency);
        envelopes[1].connect(ops[0].frequency);
        envelopes[0].connect(outGain);
        break;
      case 2: // (4->3) + (2->1)
        envelopes[3].connect(ops[2].frequency);
        envelopes[2].connect(outGain);
        envelopes[1].connect(ops[0].frequency);
        envelopes[0].connect(outGain);
        break;
      case 3: // 4+3+2+1
        envelopes.forEach(e => e.connect(outGain));
        break;
      case 4: // (4+3) -> 2 -> 1
        envelopes[3].connect(ops[1].frequency);
        envelopes[2].connect(ops[1].frequency);
        envelopes[1].connect(ops[0].frequency);
        envelopes[0].connect(outGain);
        break;
    }

    return { ops, gains, envelopes, outGain, note };
  };

  const playNote = async (note) => {
    await Tone.start();
    if (voicesRef.current[note]) return;
    
    const voice = createVoice(note);
    voicesRef.current[note] = voice;
    
    voice.envelopes.forEach((env, i) => {
      env.triggerAttack();
      voice.gains[i].gain.value = opParams[i].level * 1000; // FM index
      voice.ops[i].frequency.value = Tone.Frequency(note).toFrequency() * opParams[i].ratio;
    });
    // First op is carrier, gain should be normal
    voice.gains[0].gain.value = opParams[0].level;
  };

  const stopNote = (note) => {
    const voice = voicesRef.current[note];
    if (voice) {
      voice.envelopes.forEach(env => env.triggerRelease());
      setTimeout(() => {
        voice.ops.forEach(o => o.dispose());
        voice.gains.forEach(g => g.dispose());
        voice.envelopes.forEach(e => e.dispose());
        voice.outGain.dispose();
        delete voicesRef.current[note];
      }, 2000);
    }
  };

  const updateOp = (idx, field, value) => {
    const newParams = [...opParams];
    newParams[idx][field] = value;
    setOpParams(newParams);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Zap size={24} color="#facc15" /> FM4 Synthesizer
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>4-Operator Frequency Modulation Engine</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', width: '100%', maxWidth: '1200px' }}>
        {opParams.map((op, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', borderTop: `4px solid ${['#facc15', '#3b82f6', '#10b981', '#ef4444'][i]}` }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '12px', opacity: 0.6 }}>OPERATOR {i + 1}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>RATIO</span>
                  <span>{op.ratio}x</span>
                </div>
                <input type="range" min="0.25" max="16" step="0.25" value={op.ratio} onChange={(e) => updateOp(i, 'ratio', Number(e.target.value))} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>LEVEL / INDEX</span>
                  <span>{Math.round(op.level * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={op.level} onChange={(e) => updateOp(i, 'level', Number(e.target.value))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '9px' }}>ATTACK</span>
                  <input type="range" min="0.01" max="2" step="0.01" value={op.attack} onChange={(e) => updateOp(i, 'attack', Number(e.target.value))} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '9px' }}>RELEASE</span>
                  <input type="range" min="0.01" max="2" step="0.01" value={op.release} onChange={(e) => updateOp(i, 'release', Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} />
            <span style={{ fontWeight: 700 }}>ALGORITHM</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {ALGORITHMS.map(algo => (
              <button 
                key={algo.id}
                className={`btn-glass ${activeAlgorithm === algo.id ? 'active' : ''}`}
                onClick={() => setActiveAlgorithm(algo.id)}
                style={{ padding: '8px 15px', fontSize: '11px' }}
              >
                {algo.name}
              </button>
            ))}
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
          {ALGORITHMS.find(a => a.id === activeAlgorithm).description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          {['C3', 'E3', 'G3', 'C4', 'E4', 'G4'].map(note => (
            <button
              key={note}
              className="btn-glass"
              onMouseDown={() => playNote(note)}
              onMouseUp={() => stopNote(note)}
              style={{ width: '60px', height: '60px', borderRadius: '15px' }}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> PHASE-SYNCED OPS</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={14} /> DX-ARCHITECTURE</div>
      </div>
    </div>
  );
}
