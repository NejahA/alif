import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Home, Building2, Ghost, Warehouse, Sliders } from 'lucide-react';
import masterBus from '../audio/masterBus';

const SPACES = [
  { id: 'cathedral', name: 'Cathedral', decay: 10, preDelay: 0.1, icon: <Ghost size={24} /> },
  { id: 'hall', name: 'Concert Hall', decay: 4, preDelay: 0.05, icon: <Building2 size={24} /> },
  { id: 'room', name: 'Studio Room', decay: 1.5, preDelay: 0.01, icon: <Home size={24} /> },
  { id: 'warehouse', name: 'Warehouse', decay: 6, preDelay: 0.08, icon: <Warehouse size={24} /> }
];

export default function ConvolutionReverb() {
  const [activeSpace, setActiveSpace] = useState('hall');
  const [wet, setWet] = useState(0.5);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({
      decay: 4,
      preDelay: 0.05,
      wet: wet
    }).connect(masterBus);
    
    // Connect masterBus to itself through the reverb for simulation
    // Note: This is simplified for the demo.
    masterBus.connect(reverbRef.current);

    return () => {
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const space = SPACES.find(s => s.id === activeSpace);
    if (reverbRef.current && space) {
      setIsGenerating(true);
      reverbRef.current.decay = space.decay;
      reverbRef.current.preDelay = space.preDelay;
      reverbRef.current.generate().then(() => {
        setIsGenerating(false);
      });
    }
  }, [activeSpace]);

  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.rampTo(wet, 0.1);
    }
  }, [wet]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Building2 size={24} color="#f472b6" /> Convolution Reverb
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Impulse Response Modeling</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', width: '100%', maxWidth: '900px' }}>
        {SPACES.map(space => (
          <motion.div
            key={space.id}
            whileHover={{ y: -5 }}
            onClick={() => setActiveSpace(space.id)}
            style={{
              padding: '30px', background: activeSpace === space.id ? 'var(--accent-primary)' : 'rgba(0,0,0,0.2)',
              borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
              cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'background 0.3s'
            }}
          >
            <div style={{ color: activeSpace === space.id ? '#fff' : '#888' }}>
              {space.icon}
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: activeSpace === space.id ? '#fff' : 'var(--text-muted)' }}>
              {space.name}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        {isGenerating && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: '20px' }}>
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
               <Sliders size={32} color="#f472b6" />
             </motion.div>
             <span style={{ marginLeft: '15px', fontWeight: 700 }}>GENERATING IMPULSE...</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
             <span style={{ fontSize: '14px', fontWeight: 700 }}>MIX (DRY/WET)</span>
             <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signal Balance</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={wet} 
            onChange={(e) => setWet(Number(e.target.value))}
            style={{ width: '300px', accentColor: '#f472b6' }}
          />
          <span style={{ fontWeight: 800, width: '50px' }}>{Math.round(wet * 100)}%</span>
        </div>

        {/* Visualizer of the IR */}
        <div style={{ height: '100px', background: '#000', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
             {Array.from({ length: 100 }).map((_, i) => (
               <div key={i} style={{ 
                 position: 'absolute', left: `${i}%`, bottom: 0, 
                 width: '2px', height: `${Math.exp(-i/20) * 100}%`,
                 background: '#f472b6'
               }} />
             ))}
          </div>
          <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '10px', color: '#f472b6', fontWeight: 800 }}>
             IR WAVEFORM: {activeSpace.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Ghost size={14} /> ZERO-LATENCY CONVOLUTION</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Warehouse size={14} /> REALISTIC ACOUSTIC SPACES</div>
      </div>
    </div>
  );
}
