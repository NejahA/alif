import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Maximize, Minimize, Move, Activity, Zap } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function StereoImager() {
  const [width, setWidth] = useState(1);
  const [pan, setPan] = useState(0);
  const [phase, setPhase] = useState(0); // Simulated correlation
  
  const widenerRef = useRef(null);
  const pannerRef = useRef(null);

  useEffect(() => {
    widenerRef.current = new Tone.StereoWidener(width).connect(masterBus);
    pannerRef.current = new Tone.Panner(pan).connect(widenerRef.current);
    
    // Connect a test synth
    const synth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 }
    }).connect(pannerRef.current);

    return () => {
      widenerRef.current?.dispose();
      pannerRef.current?.dispose();
      synth.dispose();
    };
  }, []);

  useEffect(() => {
    if (widenerRef.current) widenerRef.current.width.value = width;
    if (pannerRef.current) pannerRef.current.pan.value = pan;
    
    // Simulate correlation meter
    setPhase((1 - Math.abs(pan)) * (1 - (width - 1) * 0.5));
  }, [width, pan]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Maximize size={24} color="#06b6d4" /> Stereo Imager
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Spatial Width & Phase Correlation</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          {/* Stereo Field Visualizer */}
          <div style={{ height: '250px', background: '#000', borderRadius: '15px', border: '1px solid #333', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
             <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
             
             {/* Width Representation */}
             <motion.div 
               animate={{ 
                 width: `${width * 100}%`,
                 left: `${50 + pan * 50}%`,
                 opacity: 0.5 + phase * 0.5
               }}
               style={{ 
                 position: 'absolute', top: '50%', height: '4px', background: '#06b6d4', 
                 transform: 'translate(-50%, -50%)', borderRadius: '2px', boxShadow: '0 0 15px #06b6d4' 
               }} 
             />
             
             {/* Phase Correlation Meter */}
             <div style={{ position: 'absolute', bottom: '10px', left: '20px', right: '20px', height: '4px', background: '#222', borderRadius: '2px' }}>
                <motion.div 
                  animate={{ left: `${(phase + 1) * 50}%` }}
                  style={{ position: 'absolute', top: '-4px', width: '2px', height: '12px', background: '#fff' }} 
                />
                <div style={{ position: 'absolute', left: 0, fontSize: '8px', bottom: '-15px' }}>-1</div>
                <div style={{ position: 'absolute', left: '50%', fontSize: '8px', bottom: '-15px', transform: 'translateX(-50%)' }}>0</div>
                <div style={{ position: 'absolute', right: 0, fontSize: '8px', bottom: '-15px' }}>+1</div>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Maximize size={14} /> STEREO WIDTH</span>
                   <span>{Math.round(width * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="2" step="0.01" 
                  value={width} 
                  onChange={(e) => setWidth(Number(e.target.value))}
                  style={{ accentColor: '#06b6d4' }}
                />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Move size={14} /> GLOBAL PAN</span>
                   <span>{pan > 0 ? `R ${Math.round(pan * 100)}` : pan < 0 ? `L ${Math.round(Math.abs(pan) * 100)}` : 'C'}</span>
                </div>
                <input 
                  type="range" min="-1" max="1" step="0.01" 
                  value={pan} 
                  onChange={(e) => setPan(Number(e.target.value))}
                  style={{ accentColor: '#06b6d4' }}
                />
             </div>

             <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <strong>Tip:</strong> Width above 100% (200% max) increases Side signals, which can cause phase cancellation in mono. Keep the correlation meter in the positive range.
             </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> MID/SIDE BALANCING</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={14} /> MONO COMPATIBILITY CHECK</div>
      </div>
    </div>
  );
}
