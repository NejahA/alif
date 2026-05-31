import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import masterBus from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function PeakMeter() {
  const isAudioReady = useAudioSafe();
  const [meterValue, setMeterValue] = useState(-60);
  const meterRef = useRef(null);
  const requestRef = useRef(null);  

  useEffect(() => {
    if (!isAudioReady) return;

    meterRef.current = new Tone.Meter();
    masterBus.connect(meterRef.current);

    const updateMeter = () => {
      if (!meterRef.current) return;
      const val = meterRef.current.getValue();
      setMeterValue(val);
      requestRef.current = requestAnimationFrame(updateMeter);
    };

    updateMeter();

    return () => {
      cancelAnimationFrame(requestRef.current);
      meterRef.current?.dispose();
    };
  }, [isAudioReady]);

  // Map dB value to percentage for the bar
  // -60dB is floor, 0dB is full
  const percentage = Math.min(100, Math.max(0, (meterValue + 60) * 1.66));
  
  // Color logic
  let barColor = 'var(--accent-primary)';
  if (meterValue > -3) barColor = '#ef4444'; // Red for clipping
  else if (meterValue > -12) barColor = '#f59e0b'; // Amber

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        <span>MASTER</span>
        <span style={{ color: meterValue > -3 ? '#ef4444' : 'inherit' }}>{Math.round(meterValue)}dB</span>
      </div>
      <div style={{ 
        height: '8px', 
        background: 'rgba(0,0,0,0.4)', 
        borderRadius: '4px', 
        overflow: 'hidden',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: barColor,
          boxShadow: meterValue > -12 ? `0 0 10px ${barColor}` : 'none',
          transition: 'width 0.1s ease, background-color 0.2s ease'
        }} />
      </div>
    </div>
  );
}
