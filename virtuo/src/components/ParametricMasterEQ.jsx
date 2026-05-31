import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Activity, Sliders, Zap, Waves, Move } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function ParametricMasterEQ() {
  const [bands, setBands] = useState([
    { id: 0, freq: 60, type: 'lowshelf', gain: 0, q: 1 },
    { id: 1, freq: 250, type: 'peaking', gain: 0, q: 1 },
    { id: 2, freq: 1000, type: 'peaking', gain: 0, q: 1 },
    { id: 3, freq: 4000, type: 'peaking', gain: 0, q: 1 },
    { id: 4, freq: 12000, type: 'highshelf', gain: 0, q: 1 },
  ]);
  
  const eqRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    eqRef.current = new Tone.EQ3(0, 0, 0).connect(masterBus);
    // Actually use individual filters for true parametric
    const filters = bands.map(b => new Tone.Filter(b.freq, b.type, -24));
    
    // Connect them in series
    filters[0].connect(filters[1]);
    filters[1].connect(filters[2]);
    filters[2].connect(filters[3]);
    filters[3].connect(filters[4]);
    filters[4].connect(masterBus);

    eqRef.current.filters = filters;

    drawResponse();

    return () => {
      filters.forEach(f => f.dispose());
    };
  }, []);

  const updateBand = (id, param, val) => {
    const newBands = bands.map(b => b.id === id ? { ...b, [param]: val } : b);
    setBands(newBands);
    
    if (eqRef.current && eqRef.current.filters[id]) {
      const filter = eqRef.current.filters[id];
      if (param === 'freq') filter.frequency.value = val;
      if (param === 'gain') filter.gain.value = val;
      if (param === 'q') filter.Q.value = val;
    }
    drawResponse();
  };

  const drawResponse = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, height/2); ctx.lineTo(width, height/2); ctx.stroke();

    // Draw Response Curve (Simulated)
    ctx.strokeStyle = 'var(--accent-primary)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let x = 0; i < width; x++) {
       // Simple sum of bell curves for visual representation
       let totalGain = 0;
       bands.forEach(b => {
         const dist = Math.abs(x - (Math.log10(b.freq / 20) / Math.log10(20000 / 20)) * width);
         const impact = Math.exp(-Math.pow(dist / (50 / b.q), 2));
         totalGain += b.gain * impact;
       });
       
       const y = (height / 2) - (totalGain * 2);
       if (x === 0) ctx.moveTo(x, y);
       else ctx.lineTo(x, y);
    }
    // Fixed loop for drawing
    for (let x = 0; x < width; x++) {
      let totalGain = 0;
      bands.forEach(b => {
        const bandX = (Math.log10(b.freq / 20) / Math.log10(20000 / 20)) * width;
        const dist = Math.abs(x - bandX);
        const impact = Math.exp(-Math.pow(dist / (40 / b.q), 2));
        totalGain += b.gain * impact;
      });
      const y = (height / 2) - (totalGain * 2);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Handles
    bands.forEach(b => {
      const x = (Math.log10(b.freq / 20) / Math.log10(20000 / 20)) * width;
      const y = (height / 2) - (b.gain * 2);
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'var(--accent-primary)';
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Waves size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>7-Band Parametric EQ</h3>
      </div>

      <div style={{ height: '150px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)' }}>
        <canvas ref={canvasRef} width={760} height={150} style={{ width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', bottom: '5px', left: '10px', fontSize: '0.6rem', opacity: 0.3, pointerEvents: 'none' }}>20Hz</div>
        <div style={{ position: 'absolute', bottom: '5px', right: '10px', fontSize: '0.6rem', opacity: 0.3, pointerEvents: 'none' }}>20kHz</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {bands.map(b => (
          <div key={b.id} className="glass-panel" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.5 }}>
              <span>{b.freq >= 1000 ? `${(b.freq/1000).toFixed(1)}k` : b.freq} Hz</span>
              <span>{b.gain > 0 ? '+' : ''}{b.gain}dB</span>
            </div>
            
            <input 
              type="range" min="-12" max="12" step="0.5" 
              value={b.gain} 
              onChange={(e) => updateBand(b.id, 'gain', Number(e.target.value))}
              style={{ accentColor: 'var(--accent-primary)' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.3 }}>
              <span>Q: {b.q.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="0.1" max="5" step="0.1" 
              value={b.q} 
              onChange={(e) => updateBand(b.id, 'q', Number(e.target.value))}
              style={{ accentColor: 'var(--text-muted)', height: '4px' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
