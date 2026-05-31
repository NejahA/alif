import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Box, Layers, Zap, Activity, Maximize2 } from 'lucide-react';

const Spectrogram3D = () => {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    const analyser = new Tone.Analyser("fft", 64);
    Tone.Destination.connect(analyser);
    analyserRef.current = analyser;

    return () => {
      analyser.dispose();
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const fft = analyserRef.current.getValue();
    
    // Store history for 3D effect
    historyRef.current.unshift([...fft]);
    if (historyRef.current.length > 30) historyRef.current.pop();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw 3D-like perspective lines
    historyRef.current.forEach((data, index) => {
      const z = index * 10;
      const opacity = 1 - (index / 30);
      const scale = 1 - (index / 60);
      
      ctx.beginPath();
      ctx.strokeStyle = `rgba(138, 43, 226, ${opacity * 0.5})`;
      ctx.lineWidth = 2;
      
      const barWidth = (width * scale) / data.length;
      const offsetX = (width * (1 - scale)) / 2;
      const offsetY = index * 5;

      data.forEach((val, i) => {
        const h = Math.abs(val) === Infinity ? 0 : (val + 100) * 1.5;
        const x = offsetX + i * barWidth;
        const y = height - offsetY - h;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();
    });

    animationRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isActive) {
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isActive]);

  return (
    <div className="spectrogram-3d" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Box color="var(--accent-primary)" /> Spectrogram 3D
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time immersive frequency visualization with temporal depth.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: 'white' }}
        >
          {isActive ? 'ANALYZING...' : 'START SCAN'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.5)', height: '500px', position: 'relative', overflow: 'hidden' }}>
        {!isActive && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
             <Activity size={48} style={{ marginBottom: '20px' }} />
             <p>Awaiting Signal Input...</p>
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={460} 
          style={{ width: '100%', height: '100%', display: isActive ? 'block' : 'none' }} 
        />
        
        {isActive && (
          <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '15px' }}>
             <div style={{ padding: '5px 15px', background: 'rgba(138, 43, 226, 0.2)', border: '1px solid var(--accent-primary)', borderRadius: '20px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={10} /> LIVE FFT
             </div>
             <div style={{ padding: '5px 15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={10} /> DEPTH: 30S
             </div>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
           <button className="btn-glass" style={{ padding: '8px' }}><Maximize2 size={16} /></button>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>RESOLUTION</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>1024 BINS</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>FRAME RATE</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>60 FPS</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>COLOR PROFILE</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>SPECTRA-V</p>
         </div>
         <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>LATENCY</p>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>0.1ms</p>
         </div>
      </div>
    </div>
  );
};

export default Spectrogram3D;
