import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Skull, AlertTriangle, Zap, Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function BitcrusherEffect() {
  const [bits, setBits] = useState(16);
  const [wet, setWet] = useState(0.5);
  const [grit, setGrit] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const crusherRef = useRef(null);
  const chebyRef = useRef(null);
  const analyzerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    crusherRef.current = new Tone.BitCrusher(bits).connect(masterBus);
    chebyRef.current = new Tone.Chebyshev(1).connect(crusherRef.current);
    analyzerRef.current = new Tone.Waveform(128);
    crusherRef.current.connect(analyzerRef.current);

    return () => {
      crusherRef.current?.dispose();
      chebyRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (crusherRef.current) {
      crusherRef.current.bits.value = bits;
      crusherRef.current.wet.value = isActive ? wet : 0;
    }
    if (chebyRef.current) {
      chebyRef.current.order = Math.max(1, Math.round(grit * 50));
    }
  }, [bits, wet, grit, isActive]);

  useEffect(() => {
    let animationFrame;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      if (!isActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      
      const values = analyzerRef.current.getValue();
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / values.length;
      const pixelSize = Math.max(2, 20 - bits); // More pixelated at lower bits
      
      ctx.fillStyle = `hsl(${280 + grit * 100}, 100%, 50%)`;
      
      for (let i = 0; i < values.length; i++) {
        const x = i * barWidth;
        const v = values[i] * canvas.height / 2;
        const y = canvas.height / 2 + v;
        
        // Pixelated draw
        const px = Math.floor(x / pixelSize) * pixelSize;
        const py = Math.floor(y / pixelSize) * pixelSize;
        
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
      
      animationFrame = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, bits, grit]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Skull size={24} color="#f43f5e" /> Redux Bitcrusher
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Lo-Fi Audio Destruction</p>
      </div>

      <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '800px', padding: '30px',
        display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px',
        background: 'rgba(0,0,0,0.4)', borderRadius: '20px', border: '1px solid rgba(244, 63, 94, 0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <button 
            className={`btn-glass ${isActive ? 'active' : ''}`}
            onClick={() => setIsActive(!isActive)}
            style={{ 
              padding: '20px', fontSize: '1.2rem', fontWeight: 800, 
              border: isActive ? '2px solid #f43f5e' : '2px solid #333',
              color: isActive ? '#f43f5e' : '#888'
            }}
          >
            {isActive ? 'DESTRUCTION ACTIVE' : 'BYPASS'}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#f43f5e' }}>RESOLUTION</span>
              <span>{bits} BITS</span>
            </div>
            <input 
              type="range" min="1" max="16" step="0.5" 
              value={bits} 
              onChange={(e) => setBits(Number(e.target.value))}
              style={{ accentColor: '#f43f5e' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#f43f5e' }}>GRIT (HARMONICS)</span>
              <span>{Math.round(grit * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={grit} 
              onChange={(e) => setGrit(Number(e.target.value))}
              style={{ accentColor: '#f43f5e' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#f43f5e' }}>DRY / WET</span>
              <span>{Math.round(wet * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={wet} 
              onChange={(e) => setWet(Number(e.target.value))}
              style={{ accentColor: '#f43f5e' }}
            />
          </div>
        </div>

        <div style={{ position: 'relative', background: '#000', borderRadius: '12px', border: '2px solid #222', overflow: 'hidden', height: '100%' }}>
          <canvas ref={canvasRef} width="400" height="300" style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', top: '10px', left: '10px', pointerEvents: 'none' }}>
            <div style={{ color: '#f43f5e', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertTriangle size={12} /> SIGNAL DEGRADED
            </div>
          </div>
          {isActive && (
             <motion.div 
               animate={{ opacity: [0.1, 0.3, 0.1] }}
               transition={{ duration: 0.1, repeat: Infinity }}
               style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%', pointerEvents: 'none' }} 
             />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={14} /> ZERO LATENCY</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Volume2 size={14} /> NON-DESTRUCTIVE</div>
      </div>
    </div>
  );
}
