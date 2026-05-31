import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Play, Square, Music, Activity, Grid, RotateCcw } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STEPS = 16;

export default function PatternArpeggiator() {
  const [pattern, setPattern] = useState(new Array(STEPS).fill({ active: true, offset: 0 }));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [baseNote, setBaseNote] = useState('C3');
  
  const synthRef = useRef(null);
  const seqRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.5 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
      seqRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  const togglePlay = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.Transport.stop();
      seqRef.current?.dispose();
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      seqRef.current = new Tone.Sequence((time, step) => {
        setCurrentStep(step);
        const p = pattern[step];
        if (p.active) {
          const freq = Tone.Frequency(baseNote).transpose(p.offset);
          synthRef.current.triggerAttackRelease(freq, '16n', time);
        }
      }, new Array(STEPS).fill(0).map((_, i) => i), '16n').start(0);
      
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const updateStep = (idx, field, value) => {
    const newPattern = [...pattern];
    newPattern[idx] = { ...newPattern[idx], [field]: value };
    setPattern(newPattern);
  };

  const resetPattern = () => {
    setPattern(new Array(STEPS).fill({ active: true, offset: 0 }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Grid size={24} color="#facc15" /> Pattern Arpeggiator
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Step-Based Melodic Engine</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             <button 
               className={`btn-glass ${isPlaying ? 'active' : ''}`}
               onClick={togglePlay}
               style={{ width: '60px', height: '60px', borderRadius: '50%', color: isPlaying ? '#ef4444' : '#10b981' }}
             >
               {isPlaying ? <Square size={24} /> : <Play size={24} />}
             </button>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>TEMPO</span>
                <input type="range" min="40" max="220" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
                <span style={{ fontSize: '12px' }}>{bpm} BPM</span>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
             <button className="btn-glass" onClick={resetPattern}><RotateCcw size={16} /> Reset</button>
             <select 
               className="btn-glass" 
               value={baseNote} 
               onChange={(e) => setBaseNote(e.target.value)}
               style={{ padding: '10px' }}
             >
                {['C2', 'C3', 'C4', 'G2', 'G3', 'G4'].map(n => <option key={n} value={n}>{n}</option>)}
             </select>
          </div>
        </div>

        {/* Step Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '10px', height: '300px' }}>
          {pattern.map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div 
                 onClick={() => updateStep(i, 'active', !p.active)}
                 style={{ 
                   height: '10px', borderRadius: '5px', cursor: 'pointer',
                   background: currentStep === i ? '#fff' : p.active ? '#facc15' : '#333',
                   boxShadow: currentStep === i ? '0 0 10px #fff' : 'none',
                   transition: 'all 0.1s linear'
                 }} 
               />
               <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '8px', position: 'relative', display: 'flex', flexDirection: 'column-reverse', padding: '10px 0' }}>
                  <input 
                    type="range" min="-12" max="12" step="1" 
                    value={p.offset} 
                    onChange={(e) => updateStep(i, 'offset', Number(e.target.value))}
                    style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '100%', height: '100%', cursor: 'pointer', accentColor: '#facc15' }}
                  />
               </div>
               <span style={{ fontSize: '9px', textAlign: 'center', color: p.offset === 0 ? 'var(--text-muted)' : '#facc15' }}>
                  {p.offset > 0 ? `+${p.offset}` : p.offset}
               </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> 16-STEP SEQUENCER</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Music size={14} /> SEMITONE TRANSPOSE</div>
      </div>
    </div>
  );
}
