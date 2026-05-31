import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { BarChart3, Music, Sparkles, Activity, Trash2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function AdditiveSynth() {
  const [partials, setPartials] = useState(new Array(16).fill(0).map((_, i) => (i === 0 ? 1 : 0)));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState('C3');
  const [stretch, setStretch] = useState(1);
  
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { 
        type: 'sine', // Placeholder
        partials: partials 
      },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        oscillator: { partials: partials }
      });
    }
  }, [partials]);

  const updatePartial = (idx, value) => {
    const newPartials = [...partials];
    newPartials[idx] = value;
    setPartials(newPartials);
  };

  const playNote = async (note) => {
    await Tone.start();
    synthRef.current.triggerAttack(note);
    setCurrentNote(note);
    setIsPlaying(true);
  };

  const stopNote = (note) => {
    synthRef.current.triggerRelease(note);
    setIsPlaying(false);
  };

  const clearPartials = () => {
    setPartials(new Array(16).fill(0).map((_, i) => (i === 0 ? 1 : 0)));
  };

  const generateSeries = (type) => {
    const newPartials = new Array(16).fill(0);
    for (let i = 0; i < 16; i++) {
      const h = i + 1;
      if (type === 'saw') newPartials[i] = 1 / h;
      if (type === 'square') newPartials[i] = h % 2 === 0 ? 0 : 1 / h;
      if (type === 'triangle') newPartials[i] = h % 2 === 0 ? 0 : Math.pow(-1, (h - 1) / 2) / Math.pow(h, 2);
    }
    setPartials(newPartials);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <BarChart3 size={24} color="#3b82f6" /> Additive Synthesizer
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Harmonic Stacking Engine</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-glass" onClick={() => generateSeries('saw')}>Saw Series</button>
            <button className="btn-glass" onClick={() => generateSeries('square')}>Square Series</button>
            <button className="btn-glass" onClick={() => generateSeries('triangle')}>Triangle Series</button>
          </div>
          <button className="btn-glass" onClick={clearPartials} style={{ color: '#ef4444' }}>
            <Trash2 size={16} /> Clear
          </button>
        </div>

        <div style={{ 
          height: '250px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px',
          background: 'rgba(0,0,0,0.3)', borderRadius: '15px', border: '1px solid var(--glass-border)'
        }}>
          {partials.map((val, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '100%', height: `${val * 180}px`, background: 'var(--accent-primary)', 
                borderRadius: '4px 4px 0 0', opacity: 0.3 + (val * 0.7),
                boxShadow: `0 0 15px ${val > 0.1 ? 'var(--accent-glow)' : 'transparent'}`,
                transition: 'height 0.1s linear'
              }} />
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={val} 
                onChange={(e) => updatePartial(i, Number(e.target.value))}
                style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '20px', height: '100px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }} 
              />
              <span style={{ fontSize: '9px', opacity: 0.5 }}>H{i + 1}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['C2', 'G2', 'C3', 'E3', 'G3', 'C4', 'E4'].map(note => (
            <button
              key={note}
              className={`btn-glass ${isPlaying && currentNote === note ? 'active' : ''}`}
              onMouseDown={() => playNote(note)}
              onMouseUp={() => stopNote(note)}
              onMouseLeave={() => isPlaying && stopNote(note)}
              style={{ padding: '15px 30px', borderRadius: '12px' }}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> 16-VOICE PARTIALS</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={14} /> SPECTRAL SYNTHESIS</div>
      </div>
    </div>
  );
}
