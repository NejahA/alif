import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Waves, Sparkles, Wind, Layers } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function SpectralDelay() {
  const [delays, setDelays] = useState({ low: 0.5, mid: 0.3, high: 0.1 });
  const [feedback, setFeedback] = useState(0.4);
  const [wet, setWet] = useState(0.5);
  
  const nodesRef = useRef({});

  useEffect(() => {
    // Create multiband delay structure
    nodesRef.current.split = new Tone.MultibandSplit({ low: 400, high: 2500 });
    
    nodesRef.current.lowDelay = new Tone.FeedbackDelay({ delayTime: delays.low, feedback, wet: 1 });
    nodesRef.current.midDelay = new Tone.FeedbackDelay({ delayTime: delays.mid, feedback, wet: 1 });
    nodesRef.current.highDelay = new Tone.FeedbackDelay({ delayTime: delays.high, feedback, wet: 1 });
    
    nodesRef.current.merge = new Tone.Gain(wet).connect(masterBus);
    nodesRef.current.dry = new Tone.Gain(1 - wet).connect(masterBus);

    // Routing
    nodesRef.current.split.low.connect(nodesRef.current.lowDelay);
    nodesRef.current.split.mid.connect(nodesRef.current.midDelay);
    nodesRef.current.split.high.connect(nodesRef.current.highDelay);
    
    nodesRef.current.lowDelay.connect(nodesRef.current.merge);
    nodesRef.current.midDelay.connect(nodesRef.current.merge);
    nodesRef.current.highDelay.connect(nodesRef.current.merge);
    
    // Connect input to split and dry
    nodesRef.current.input = new Tone.Gain().connect(nodesRef.current.split);
    nodesRef.current.input.connect(nodesRef.current.dry);
    
    // For this demo, let's connect the master output back into it for effect
    // In a real app, you'd route specific tracks through it.
    masterBus.connect(nodesRef.current.input);

    return () => {
      Object.values(nodesRef.current).forEach(n => n.dispose());
      masterBus.disconnect(nodesRef.current.input);
    };
  }, []);

  useEffect(() => {
    if (nodesRef.current.lowDelay) {
      nodesRef.current.lowDelay.delayTime.rampTo(delays.low, 0.1);
      nodesRef.current.midDelay.delayTime.rampTo(delays.mid, 0.1);
      nodesRef.current.highDelay.delayTime.rampTo(delays.high, 0.1);
      nodesRef.current.lowDelay.feedback.value = feedback;
      nodesRef.current.midDelay.feedback.value = feedback;
      nodesRef.current.highDelay.feedback.value = feedback;
      nodesRef.current.merge.gain.rampTo(wet, 0.1);
      nodesRef.current.dry.gain.rampTo(1 - wet, 0.1);
    }
  }, [delays, feedback, wet]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Sparkles size={24} color="#3b82f6" /> Spectral Delay
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Multi-Band Echo Processor</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%', maxWidth: '900px' }}>
        {[
          { id: 'low', name: 'BASS BAND', color: '#3b82f6', icon: <Waves size={16} /> },
          { id: 'mid', name: 'MID BAND', color: '#10b981', icon: <Layers size={16} /> },
          { id: 'high', name: 'TREBLE BAND', color: '#f97316', icon: <Wind size={16} /> }
        ].map(band => (
          <div key={band.id} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', borderTop: `4px solid ${band.color}` }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: band.color, fontSize: '12px', fontWeight: 800 }}>
               {band.icon} {band.name}
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                 <span>TIME</span>
                 <span>{Math.round(delays[band.id] * 1000)}ms</span>
               </div>
               <input 
                 type="range" min="0.01" max="2" step="0.01" 
                 value={delays[band.id]} 
                 onChange={(e) => setDelays(prev => ({ ...prev, [band.id]: Number(e.target.value) }))}
                 style={{ accentColor: band.color }}
               />
             </div>

             {/* Animated representation of the band activity */}
             <div style={{ height: '60px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
               <motion.div 
                 animate={{ 
                   x: ['-100%', '100%'],
                   opacity: [0, 0.5, 0]
                 }}
                 transition={{ duration: delays[band.id] * 2, repeat: Infinity, ease: 'linear' }}
                 style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${band.color}, transparent)` }}
               />
             </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '20px', display: 'flex', justifyContent: 'center', gap: '50px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>GLOBAL FEEDBACK</span>
            <span>{Math.round(feedback * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="0.9" step="0.01" 
            value={feedback} 
            onChange={(e) => setFeedback(Number(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>DRY / WET</span>
            <span>{Math.round(wet * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={wet} 
            onChange={(e) => setWet(Number(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>
    </div>
  );
}
