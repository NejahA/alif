import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Activity, Zap, BarChart3, Waves, Shield } from 'lucide-react';
import masterBus, { getMasterReduction } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function MasterMetering() {
  const isAudioReady = useAudioSafe();
  const [peak, setPeak] = useState(-Infinity);
  const [rms, setRms] = useState(-Infinity);
  const [phase, setPhase] = useState(0);
  const [reduction, setReduction] = useState(0);
  
  const meterRef = useRef(null);
  const analyserRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (!isAudioReady) return;

    // Meter for Peak and RMS
    meterRef.current = new Tone.Meter({ smoothing: 0.8 });
    // Analyser for Phase (L/R comparison)
    analyserRef.current = new Tone.Analyser('waveform', 1024);
    
    masterBus.connect(meterRef.current);
    masterBus.connect(analyserRef.current);

    const update = () => {
      if (meterRef.current) {
        const val = meterRef.current.getValue();
        setPeak(val);
        // Simulate RMS
        setRms(val - 3);
      }

      if (analyserRef.current) {
        const data = analyserRef.current.getValue();
        // Simple phase correlation estimation
        let correlation = 0;
        for (let i = 0; i < data.length; i += 2) {
          correlation += data[i] * data[i+1];
        }
        setPhase(Math.max(-1, Math.min(1, correlation * 10)));
      }

      setReduction(getMasterReduction());

      requestRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(requestRef.current);
      meterRef.current?.dispose();
      analyserRef.current?.dispose();
    };
  }, [isAudioReady]);

  const getMeterColor = (val) => {
    if (val > -3) return '#ef4444';
    if (val > -12) return '#f59e0b';
    return 'var(--accent-primary)';
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <BarChart3 size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Master Metering</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Peak Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
            <span>PEAK</span>
            <span>{peak === -Infinity ? '-∞' : peak.toFixed(1)} dB</span>
          </div>
          <div style={{ height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ 
              height: '100%', 
              width: `${Math.max(0, (peak + 60) / 60 * 100)}%`, 
              background: getMeterColor(peak),
              transition: 'width 0.1s ease-out',
              boxShadow: peak > -3 ? '0 0 10px #ef4444' : 'none'
            }} />
          </div>
        </div>

        {/* RMS Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
            <span>RMS</span>
            <span>{rms === -Infinity ? '-∞' : rms.toFixed(1)} dB</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${Math.max(0, (rms + 60) / 60 * 100)}%`, 
              background: 'var(--accent-primary)',
              opacity: 0.6,
              transition: 'width 0.2s ease-out'
            }} />
          </div>
        </div>

        {/* Gain Reduction Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
            <span>GAIN REDUCTION</span>
            <span style={{ color: reduction > 4 ? '#ef4444' : 'var(--text-muted)' }}>{reduction.toFixed(1)} dB</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', direction: 'rtl' }}>
            <div style={{ 
              height: '100%', 
              width: `${Math.min(100, reduction * 10)}%`, 
              background: '#ef4444',
              transition: 'width 0.1s ease-out'
            }} />
          </div>
        </div>

        {/* Phase Correlation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
            <span>PHASE CORRELATION</span>
            <span>{phase > 0 ? '+' : ''}{phase.toFixed(2)}</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', position: 'relative' }}>
            <div style={{ 
              position: 'absolute',
              left: '50%',
              width: '2px',
              height: '100%',
              background: 'rgba(255,255,255,0.2)'
            }} />
            <div style={{ 
              position: 'absolute',
              left: `${50 + (phase * 50)}%`,
              width: '6px',
              height: '10px',
              top: '-3px',
              background: 'var(--accent-primary)',
              borderRadius: '3px',
              transform: 'translateX(-50%)',
              transition: 'left 0.1s ease-out'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.3 }}>
            <span>-1 (OUT)</span>
            <span>0</span>
            <span>+1 (IN)</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.4, textAlign: 'center', marginTop: '5px' }}>
        Monitor signal levels and stereo phase alignment.
      </div>
    </div>
  );
}
