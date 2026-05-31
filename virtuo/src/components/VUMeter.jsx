import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { BarChart2 } from 'lucide-react';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function VUMeter() {
  const isAudioReady = useAudioSafe();
  const [level, setLevel] = useState(-60);
  const meterRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (!isAudioReady) return;

    meterRef.current = new Tone.Meter();
    Tone.Destination.connect(meterRef.current);

    const update = () => {
      if (meterRef.current) {
        const val = meterRef.current.getValue();
        setLevel(Array.isArray(val) ? val[0] : val);
        requestRef.current = requestAnimationFrame(update);
      }
    };
    update();

    return () => {
      cancelAnimationFrame(requestRef.current);
      meterRef.current?.dispose();
    };
  }, [isAudioReady]);

  const getWidth = () => {
    // Normalize -60dB to 0dB to 0-100%
    const normalized = Math.max(0, (level + 60) / 60) * 100;
    return `${normalized}%`;
  };

  const getColor = () => {
    if (level > -3) return '#ef4444'; // Red
    if (level > -12) return '#f59e0b'; // Yellow
    return '#22c55e'; // Green
  };

  return (
    <div className="glass-panel" style={{ padding: '15px 20px', width: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart2 size={16} color="var(--accent-primary)" />
        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Master Level</h4>
      </div>
      
      <div style={{ 
        height: '12px', 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: '6px', 
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{
          width: getWidth(),
          height: '100%',
          background: getColor(),
          transition: 'width 0.1s ease-out',
          boxShadow: `0 0 10px ${getColor()}`
        }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
        <span>-60dB</span>
        <span>-30dB</span>
        <span>0dB</span>
      </div>
    </div>
  );
}
