import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Activity, Wind, Zap } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function KarplusStrongSynth() {
  const [dampening, setDampening] = useState(4000);
  const [resonance, setResonance] = useState(0.7);
  const [isVibrating, setIsVibrating] = useState(false);
  
  const synthRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current = new Tone.Filter({
      type: 'peaking',
      frequency: 200,
      Q: 2,
      gain: 10
    }).connect(masterBus);

    synthRef.current = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: dampening,
      resonance: resonance
    }).connect(bodyRef.current);

    return () => {
      synthRef.current?.dispose();
      bodyRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.dampening = dampening;
      synthRef.current.resonance = resonance;
    }
  }, [dampening, resonance]);

  const playNote = async (note) => {
    await Tone.start();
    synthRef.current.triggerAttack(note);
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Music size={24} color="#f97316" /> Physical Pluck
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Karplus-Strong String Modeling</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* String Visualizer */}
        <div style={{ height: '100px', width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
           <motion.div 
             animate={isVibrating ? {
               y: [0, -10, 8, -6, 4, -2, 0],
               opacity: [1, 0.8, 1, 0.9, 1]
             } : {}}
             transition={{ duration: 0.5 }}
             style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)', boxShadow: '0 0 10px #f97316' }} 
           />
           <div style={{ position: 'absolute', left: 0, width: '10px', height: '40px', background: '#333', borderRadius: '2px' }} />
           <div style={{ position: 'absolute', right: 0, width: '10px', height: '40px', background: '#333', borderRadius: '2px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
               <span>DAMPENING</span>
               <span>{dampening}Hz</span>
            </div>
            <input 
              type="range" min="100" max="8000" step="10" 
              value={dampening} 
              onChange={(e) => setDampening(Number(e.target.value))}
              style={{ accentColor: '#f97316' }}
            />
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Controls the high-frequency decay rate (String Brightness).</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
               <span>RESONANCE</span>
               <span>{Math.round(resonance * 100)}%</span>
            </div>
            <input 
              type="range" min="0.5" max="0.99" step="0.01" 
              value={resonance} 
              onChange={(e) => setResonance(Number(e.target.value))}
              style={{ accentColor: '#f97316' }}
            />
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Feedback coefficient (String Length/Sustain).</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {['G2', 'C3', 'E3', 'G3', 'B3', 'C4', 'E4', 'G4'].map(note => (
            <motion.button
              key={note}
              whileTap={{ scale: 0.9 }}
              onClick={() => playNote(note)}
              className="btn-glass"
              style={{ width: '70px', height: '70px', borderRadius: '50%', fontWeight: 800 }}
            >
              {note}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> DELAY-LINE FEEDBACK</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wind size={14} /> NATURAL HARMONICS</div>
      </div>
    </div>
  );
}
