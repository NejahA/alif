import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Mic, Activity, Wind, Circle } from 'lucide-react';
import masterBus from '../audio/masterBus';

const VOWELS = {
  A: { f1: 730, f2: 1090, f3: 2440, x: 0, y: 1 },
  E: { f1: 360, f2: 2220, f3: 2960, x: -0.95, y: 0.31 },
  I: { f1: 270, f2: 2290, f3: 3010, x: -0.58, y: -0.81 },
  O: { f1: 570, f2: 840, f3: 2410, x: 0.58, y: -0.81 },
  U: { f1: 300, f2: 870, f3: 2240, x: 0.95, y: 0.31 }
};

export default function FormantFilter() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false);
  
  const filtersRef = useRef([]);
  const inputRef = useRef(null);

  useEffect(() => {
    // 3 peaking filters in parallel
    const f1 = new Tone.Filter(500, 'peaking').connect(masterBus);
    const f2 = new Tone.Filter(1500, 'peaking').connect(masterBus);
    const f3 = new Tone.Filter(2500, 'peaking').connect(masterBus);
    
    filtersRef.current = [f1, f2, f3];
    
    inputRef.current = new Tone.UserMedia();

    return () => {
      filtersRef.current.forEach(f => f.dispose());
      inputRef.current.dispose();
    };
  }, []);

  const updateFormants = (x, y) => {
    // Calculate weights based on distance to each vowel
    let totalWeight = 0;
    const weights = {};
    Object.entries(VOWELS).forEach(([key, val]) => {
      const dist = Math.sqrt(Math.pow(x - val.x, 2) + Math.pow(y - val.y, 2));
      const weight = 1 / (dist + 0.1);
      weights[key] = weight;
      totalWeight += weight;
    });

    let targetF1 = 0, targetF2 = 0, targetF3 = 0;
    Object.entries(VOWELS).forEach(([key, val]) => {
      const normWeight = weights[key] / totalWeight;
      targetF1 += val.f1 * normWeight;
      targetF2 += val.f2 * normWeight;
      targetF3 += val.f3 * normWeight;
    });

    filtersRef.current[0].frequency.rampTo(targetF1, 0.1);
    filtersRef.current[1].frequency.rampTo(targetF2, 0.1);
    filtersRef.current[2].frequency.rampTo(targetF3, 0.1);
  };

  const handleMouseMove = (e) => {
    if (e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setPos({ x, y });
    updateFormants(x, y);
  };

  const toggleMic = async () => {
    if (isListening) {
      inputRef.current.close();
      setIsListening(false);
    } else {
      try {
        await inputRef.current.open();
        inputRef.current.connect(filtersRef.current[0]);
        inputRef.current.connect(filtersRef.current[1]);
        inputRef.current.connect(filtersRef.current[2]);
        setIsListening(true);
      } catch (e) {
        alert("Mic access error: " + e.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Mic size={24} color="#a855f7" /> Formant Morph
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Vocal Tract Resonance Modeling</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <button 
          className={`btn-glass ${isListening ? 'active' : ''}`}
          onClick={toggleMic}
          style={{ padding: '20px', borderRadius: '15px', fontWeight: 800, border: isListening ? '2px solid #a855f7' : '1px solid #333' }}
        >
          {isListening ? 'VOWEL FILTER ACTIVE' : 'CONNECT INPUT SOURCE'}
        </button>

        <div 
          style={{ 
            height: '400px', background: 'radial-gradient(circle, #1a1a1a, #000)', borderRadius: '25px', 
            position: 'relative', border: '1px solid #333', cursor: 'crosshair', overflow: 'hidden' 
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseMove}
        >
          {Object.entries(VOWELS).map(([key, val]) => (
            <div key={key} style={{ 
              position: 'absolute', 
              left: `${(val.x + 1) * 50}%`, 
              top: `${(-val.y + 1) * 50}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{key}</div>
            </div>
          ))}

          {/* Current Position Marker */}
          <motion.div 
            animate={{ left: `${(pos.x + 1) * 50}%`, top: `${(-pos.y + 1) * 50}%` }}
            style={{ 
              position: 'absolute', width: '20px', height: '20px', borderRadius: '50%', 
              background: '#fff', boxShadow: '0 0 20px #fff', pointerEvents: 'none' 
            }} 
          />
          
          {/* Mouth visualization */}
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <motion.div 
               animate={{ 
                 width: 20 + (pos.x + 1) * 30, 
                 height: 20 + (pos.y + 1) * 30,
                 borderRadius: pos.y > 0 ? '50%' : '10px'
               }}
               style={{ background: '#a855f7', opacity: 0.5 }} 
             />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> 3-POLE RESONATORS</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Circle size={14} /> CONTINUOUS MORPHING</div>
      </div>
    </div>
  );
}
