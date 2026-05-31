import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Activity } from 'lucide-react';

const SpectralAnalyzer = () => {
  const canvasRef = useRef(null);
  const fftRef = useRef(null);
  const reqRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fftRef.current = new Tone.FFT(4096);
    Tone.Destination.connect(fftRef.current);
    
    return () => {
      cancelAnimationFrame(reqRef.current);
      if (fftRef.current) fftRef.current.dispose();
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !fftRef.current || !isActive) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const values = fftRef.current.getValue();
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height - (i * height / 10));
      ctx.lineTo(width, height - (i * height / 10));
      ctx.stroke();
    }
    
    // Draw frequencies
    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
      // Avoid infinite values
      let v = values[i];
      if (v === -Infinity) v = -140;
      
      const normalized = (v + 140) / 140; // Normalize dB from -140..0 to 0..1
      const y = height - (normalized * height);
      
      // Logarithmic scale for X axis
      const logI = Math.log10(i + 1) / Math.log10(values.length);
      const x = logI * width;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill area below line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.fill();

    reqRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isActive) {
      Tone.start();
      draw();
    } else {
      cancelAnimationFrame(reqRef.current);
    }
  }, [isActive]);

  return (
    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.4)', borderRadius: '15px', color: 'white', width: '100%', border: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
          <Activity size={24} color="#a855f7" /> Spectral Analyzer
        </h2>
        <button 
          className="btn-glass"
          onClick={() => setIsActive(!isActive)}
          style={{ background: isActive ? '#a855f7' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isActive ? 'PAUSE' : 'START ANALYSIS'}
        </button>
      </div>
      
      <div style={{ background: '#0a0a0a', borderRadius: '10px', padding: '15px', position: 'relative', border: '1px solid #333' }}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          style={{ width: '100%', height: '400px', borderRadius: '5px', display: 'block' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
          <span>20 Hz</span>
          <span>100 Hz</span>
          <span>1 kHz</span>
          <span>10 kHz</span>
          <span>20 kHz</span>
        </div>
      </div>
    </div>
  );
};

export default SpectralAnalyzer;
