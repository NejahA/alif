import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Play, Square, RefreshCw, Layers, Music2 } from 'lucide-react';

const GENRES = ["Acid Techno", "Deep House", "Future Garage", "Dubstep", "Cyberpunk"];
const SCALES = ["C Minor", "D Phrygian", "E Aeolian", "G Mixolydian"];

const AIBasslineGenerator = () => {
  const [genre, setGenre] = useState(GENRES[0]);
  const [scale, setScale] = useState(SCALES[0]);
  const [complexity, setComplexity] = useState(0.6);
  const [pattern, setPattern] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const synthRef = useRef(null);
  const sequenceRef = useRef(null);

  useEffect(() => {
    const synth = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.1 },
      filter: { Q: 2, type: "lowpass", rolloff: -24 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, baseFrequency: 200, octaves: 4 }
    }).toDestination();
    
    synthRef.current = synth;
    generatePattern();

    return () => {
      synth.dispose();
      if (sequenceRef.current) sequenceRef.current.dispose();
    };
  }, []);

  const generatePattern = () => {
    const newPattern = [];
    const notes = scale.includes("Minor") ? ["C2", "Eb2", "G2", "Bb2", "C3"] : ["C2", "D2", "E2", "G2", "A2", "C3"];
    
    for (let i = 0; i < 16; i++) {
      if (Math.random() < complexity) {
        newPattern.push({
          note: notes[Math.floor(Math.random() * notes.length)],
          duration: Math.random() > 0.8 ? "8n" : "16n",
          velocity: 0.5 + Math.random() * 0.5
        });
      } else {
        newPattern.push(null);
      }
    }
    setPattern(newPattern);

    if (sequenceRef.current) sequenceRef.current.dispose();
    
    sequenceRef.current = new Tone.Sequence((time, step) => {
      if (step) {
        synthRef.current.triggerAttackRelease(step.note, step.duration, time, step.velocity);
      }
    }, newPattern, "16n").start(0);
  };

  const togglePlay = () => {
    if (Tone.context.state !== 'running') Tone.start();
    if (isPlaying) {
      Tone.Transport.stop();
    } else {
      Tone.Transport.start();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="ai-bassline-generator" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Brain color="var(--accent-primary)" /> AI Bassline Generator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Neural-inspired melodic patterns for deep low-end drive.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button className="btn-glass" onClick={generatePattern}><RefreshCw size={16} /> EVOLVE</button>
           <button 
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={togglePlay}
            style={{ padding: '10px 30px', background: isPlaying ? '#ef4444' : 'var(--accent-primary)', color: 'white' }}
           >
             {isPlaying ? <Square size={16} /> : <Play size={16} />} {isPlaying ? 'STOP' : 'GENERATE'}
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '25px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>GENRE STYLE</label>
                 <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                 </select>
              </div>
              <div>
                 <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>HARMONIC SCALE</label>
                 <select value={scale} onChange={(e) => setScale(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                    {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>COMPLEXITY</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{Math.round(complexity * 100)}%</span>
                 </div>
                 <input type="range" min="0.1" max="0.9" step="0.01" value={complexity} onChange={(e) => setComplexity(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
              </div>
           </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px' }}>PATTERN VISUALIZER</h3>
              <div style={{ display: 'flex', gap: '5px' }}>
                 {[...Array(4)].map((_, i) => <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: isPlaying ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)' }} />)}
              </div>
           </div>
           
           <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '4px', alignItems: 'center' }}>
              {pattern.map((step, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: step ? (step.duration === '8n' ? '80%' : '40%') : '5%',
                    opacity: step ? 1 : 0.1,
                    background: step ? 'var(--accent-primary)' : 'white'
                  }}
                  style={{ borderRadius: '2px', width: '100%' }}
                />
              ))}
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Music2 size={16} opacity={0.5} style={{ marginBottom: '5px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>NOTES</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{pattern.filter(Boolean).length}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Layers size={16} opacity={0.5} style={{ marginBottom: '5px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>STEPS</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>16</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Zap size={16} opacity={0.5} style={{ marginBottom: '5px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>PROB</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>DYNAMIC</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIBasslineGenerator;
