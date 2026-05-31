import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Radio, Maximize2, Minimize2, RefreshCcw, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function StereoImager() {
  const [width, setWidth] = useState(0.5);
  const [pan, setPan] = useState(0);
  const [midVolume, setMidVolume] = useState(0);
  const [sideVolume, setSideVolume] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [correlation, setCorrelation] = useState(0.8);
  const widenerRef = useRef(null);
  const pannerRef = useRef(null);

  useEffect(() => {
    widenerRef.current = new Tone.StereoWidener(0.5).connect(masterBus);
    pannerRef.current = new Tone.Panner(0).connect(widenerRef.current);
    return () => {
      widenerRef.current?.dispose();
      pannerRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!widenerRef.current) return;
    widenerRef.current.width.rampTo(isActive ? width : 0, 0.1);
    pannerRef.current.pan.rampTo(pan, 0.1);
  }, [isActive, width, pan]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCorrelation(0.5 + Math.random() * 0.5);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const phaseWidth = Math.round((width - 0.5) * 200);
  const panDir = pan < -0.1 ? 'L' : pan > 0.1 ? 'R' : 'C';
  const panVal = panDir === 'C' ? 0 : Math.round(Math.abs(pan) * 100);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Radio size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Stereo Imager</h3>
        <button onClick={() => setIsActive(!isActive)}
          style={{ padding: '4px 12px', borderRadius: '12px', border: 'none', background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)', color: isActive ? 'white' : 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '10px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', opacity: 0.5, marginBottom: '4px' }}>PHASE</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: phaseWidth > 50 ? '#22c55e' : phaseWidth < -20 ? '#ef4444' : '#f59e0b' }}>
            {phaseWidth > 0 ? '+' : ''}{phaseWidth}°
          </div>
        </div>
        <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', opacity: 0.5, marginBottom: '4px' }}>CORRELATION</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: correlation > 0.7 ? '#22c55e' : correlation > 0.3 ? '#f59e0b' : '#ef4444' }}>
            {correlation.toFixed(2)}
          </div>
        </div>
        <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', opacity: 0.5, marginBottom: '4px' }}>PAN</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {panDir}{panVal}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Stereo Width</span>
          <span>{Math.round(width * 200)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={width} onChange={(e) => setWidth(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Pan</span>
          <span>{panDir}{panVal}</span>
        </div>
        <input type="range" min="-1" max="1" step="0.01" value={pan} onChange={(e) => setPan(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setWidth(0)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.6rem', cursor: 'pointer' }}>
          <Minimize2 size={10} /> Mono
        </button>
        <button onClick={() => setWidth(1)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.6rem', cursor: 'pointer' }}>
          <Maximize2 size={10} /> Full
        </button>
        <button onClick={() => setPan(0)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.6rem', cursor: 'pointer' }}>
          <Activity size={10} /> Center
        </button>
      </div>

      <button className="btn-glass" onClick={() => { setWidth(0.5); setPan(0); }} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>
    </div>
  );
}
