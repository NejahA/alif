import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Music, RefreshCcw, Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function PitchShifter() {
  const [semitones, setSemitones] = useState(0);
  const [cents, setCents] = useState(0);
  const [wet, setWet] = useState(1);
  const [windowSize, setWindowSize] = useState(0.1);
  const [isActive, setIsActive] = useState(true);
  const pitchRef = useRef(null);

  useEffect(() => {
    pitchRef.current = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      wet: 1
    }).connect(masterBus);
    return () => pitchRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (!pitchRef.current) return;
    const total = semitones + (cents / 100);
    pitchRef.current.pitch = total;
    pitchRef.current.wet.value = isActive ? wet : 0;
    pitchRef.current.windowSize = windowSize;
  }, [semitones, cents, wet, isActive, windowSize]);

  const formatPitch = () => {
    const total = semitones + (cents / 100);
    if (total === 0) return 'Unison';
    const sign = total > 0 ? '+' : '';
    return `${sign}${total.toFixed(2)} st`;
  };

  const getIntervalName = (st) => {
    const names = ['Unison', 'm2', 'M2', 'm3', 'M3', 'P4', 'Tritone', 'P5', 'm6', 'M6', 'm7', 'M7', 'Octave'];
    const abs = Math.abs(st);
    return abs <= 12 ? names[abs] || `${st}st` : `${st}st`;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Music size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Pitch Shifter</h3>
        <button onClick={() => setIsActive(!isActive)}
          style={{ padding: '4px 12px', borderRadius: '12px', border: 'none', background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)', color: isActive ? 'white' : 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', textShadow: '0 0 15px var(--accent-glow)' }}>
          {getIntervalName(semitones + Math.round(cents / 100))}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '4px' }}>
          {formatPitch()}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Semitones</span>
          <span>{semitones > 0 ? '+' : ''}{semitones}</span>
        </div>
        <input type="range" min="-12" max="12" step="1" value={semitones} onChange={(e) => setSemitones(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Cents Fine</span>
          <span>{cents > 0 ? '+' : ''}{cents}¢</span>
        </div>
        <input type="range" min="-50" max="50" step="1" value={cents} onChange={(e) => setCents(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Mix</span>
          <span>{Math.round(wet * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={wet} onChange={(e) => setWet(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Window Size</span>
          <span>{windowSize.toFixed(2)}s</span>
        </div>
        <input type="range" min="0.02" max="0.5" step="0.01" value={windowSize} onChange={(e) => setWindowSize(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <button className="btn-glass" onClick={() => { setSemitones(0); setCents(0); setWet(1); setWindowSize(0.1); }} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>
    </div>
  );
}
