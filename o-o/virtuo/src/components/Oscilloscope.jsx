import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Oscilloscope() {
  const canvasRef = useRef(null);
  const waveformRef = useRef(null);
  const requestRef = useRef(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Create Waveform analyzer connected to the master bus
    waveformRef.current = new Tone.Waveform(1024);
    masterBus.connect(waveformRef.current);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!ctx || !isActive) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Draw CRT background effect with slight fade for phosphor trail
      ctx.fillStyle = 'rgba(0, 10, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid
      ctx.strokeStyle = 'rgba(0, 50, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < width; i += 40) {
        ctx.moveTo(i, 0); ctx.lineTo(i, height);
      }
      for (let i = 0; i < height; i += 40) {
        ctx.moveTo(0, i); ctx.lineTo(width, i);
      }
      ctx.stroke();

      if (waveformRef.current) {
        const values = waveformRef.current.getValue();
        
        ctx.beginPath();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        // CRT glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';

        for (let i = 0; i < values.length; i++) {
          const x = (width * i) / values.length;
          // Scale the value to fit the canvas height
          const y = ((values[i] + 1) / 2) * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Reset shadow for next frame
        ctx.shadowBlur = 0;
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    if (isActive) {
      draw();
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      waveformRef.current?.dispose();
    };
  }, [isActive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      
      <div style={{ display: 'flex', gap: '20px', padding: '10px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => setIsActive(!isActive)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff00', borderColor: '#00ff00' }}
        >
          <Activity size={16} /> {isActive ? 'Running' : 'Paused'}
        </button>
      </div>

      <div style={{ 
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '2px solid #333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
      }}>
        {/* Oscilloscope Screen */}
        <div style={{
           position: 'relative',
           width: '600px',
           height: '400px',
           background: '#000',
           borderRadius: '8px',
           overflow: 'hidden',
           border: '4px solid #444',
           boxShadow: 'inset 0 0 50px rgba(0,255,0,0.1)'
        }}>
           {/* Glass reflection */}
           <div style={{
             position: 'absolute',
             top: 0, left: 0, right: 0, height: '40%',
             background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
             pointerEvents: 'none',
             zIndex: 10
           }} />
           
           <canvas 
             ref={canvasRef} 
             width={600} 
             height={400} 
             style={{ width: '100%', height: '100%' }} 
           />
        </div>
      </div>
    </div>
  );
}
