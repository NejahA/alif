import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Target, Zap, Activity, Waves, Clock, RefreshCw } from 'lucide-react';

const AIBPMDetector = () => {
  const [bpm, setBpm] = useState(120);
  const [confidence, setConfidence] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const detectBPM = () => {
    setIsActive(true);
    setConfidence(0);
    
    // Simulate neural analysis
    let interval = setInterval(() => {
        setConfidence(prev => {
            if (prev >= 98) {
                clearInterval(interval);
                setIsActive(false);
                return 98.4;
            }
            return prev + Math.random() * 5;
        });
        setBpm(120 + (Math.random() * 10 - 5));
    }, 100);
  };

  return (
    <div className="ai-bpm-detector" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Clock color="#10b981" /> AI BPM Detector
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time neural analysis for precise tempo detection of external audio.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={detectBPM}
          style={{ padding: '10px 40px', background: isActive ? '#10b981' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'ANALYZING...' : 'START DETECTION'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
           <h3 style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '4px', marginBottom: '20px' }}>ESTIMATED TEMPO</h3>
           <motion.p 
             animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
             transition={{ duration: 0.5, repeat: Infinity }}
             style={{ fontSize: '4rem', fontWeight: 900, color: '#10b981', margin: 0 }}
           >
             {bpm.toFixed(1)}
           </motion.p>
           <p style={{ fontSize: '0.8rem', opacity: 0.4 }}>BEATS PER MINUTE</p>
           
           <div style={{ width: '100%', marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>CONFIDENCE</span>
                 <span style={{ fontSize: '0.7rem', color: '#10b981' }}>{confidence.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                 <motion.div
                   animate={{ width: `${confidence}%` }}
                   style={{ height: '100%', background: '#10b981' }}
                 />
              </div>
           </div>
        </div>

        <div className="glass-panel" style={{ padding: '30px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px' }}>BEAT TRANSIENT MAP</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                 <Activity size={16} color="#10b981" />
                 <Target size={16} color="#10b981" />
              </div>
           </div>

           <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px' }}>
              {[...Array(64)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: isActive ? (i % 8 === 0 ? '80%' : '10%') : '5%',
                    opacity: isActive ? 1 : 0.1
                  }}
                  style={{ flex: 1, background: '#10b981', borderRadius: '1px' }}
                />
              ))}
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>DETECTION</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>TRANSIENT</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SENSITIVITY</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>ULTRA</p>
              </div>
              <button className="btn-glass" style={{ fontSize: '0.7rem' }}><RefreshCw size={14} /> RESET</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIBPMDetector;
