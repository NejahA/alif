import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Zap, Activity, Shield, ArrowUp, RefreshCcw } from 'lucide-react';
import { setMasterLimiterThreshold, getMasterReduction } from '../audio/masterBus';

export default function MasteringLimiter() {
  const [threshold, setThreshold] = useState(-1);
  const [gain, setGain] = useState(0);
  const [reduction, setReduction] = useState(0);
  const requestRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const red = getMasterReduction();
      setReduction(red);
      requestRef.current = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    setMasterLimiterThreshold(threshold);
  }, [threshold]);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Shield size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Mastering Limiter</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Gain Reduction Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
            <span>GAIN REDUCTION</span>
            <span style={{ color: reduction > 6 ? '#ef4444' : 'inherit' }}>{reduction.toFixed(1)} dB</span>
          </div>
          <div style={{ height: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <motion.div 
              animate={{ width: `${Math.min(100, reduction * 10)}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ 
                height: '100%', 
                background: reduction > 6 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'var(--accent-primary)',
                boxShadow: reduction > 0 ? '0 0 10px var(--accent-glow)' : 'none'
              }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', opacity: 0.4, padding: '0 2px' }}>
            <span>0</span>
            <span>3</span>
            <span>6</span>
            <span>9</span>
            <span>12+</span>
          </div>
        </div>

        {/* Threshold Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Zap size={12} /> Ceiling</span>
            <span>{threshold.toFixed(1)} dB</span>
          </div>
          <input 
            type="range" min="-12" max="0" step="0.1" 
            value={threshold} 
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: 0 }}>
            Sets the maximum output level.
          </p>
        </div>

        {/* Info Box */}
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '10px', 
          borderRadius: '8px', 
          fontSize: '0.7rem',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Activity size={14} style={{ marginTop: '2px' }} />
            <span>
              The limiter prevents digital clipping by capping the signal at the ceiling. 
              Aim for 2-3dB of reduction for a transparent sound.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
