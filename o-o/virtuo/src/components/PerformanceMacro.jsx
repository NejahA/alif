import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Move, Zap, Activity, Maximize2, SlidersHorizontal } from 'lucide-react';

export default function PerformanceMacro() {
  const [macros, setMacros] = useState(new Array(8).fill(0.5));
  const [xy1, setXy1] = useState({ x: 0.5, y: 0.5 });
  const [xy2, setXy2] = useState({ x: 0.5, y: 0.5 });

  const updateMacro = (idx, val) => {
    const newMacros = [...macros];
    newMacros[idx] = Math.max(0, Math.min(1, val));
    setMacros(newMacros);
  };

  const handleXY = (id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    if (id === 1) setXy1({ x, y });
    else setXy2({ x, y });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <LayoutGrid size={24} color="#8b5cf6" /> Performance Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Multi-Parameter Macro Control</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', width: '100%', maxWidth: '1200px' }}>
        {/* XY Pads */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', gap: '20px' }}>
           {[1, 2].map(id => (
             <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '10px', fontWeight: 700 }}>XY PAD {id}</span>
                   <Move size={14} opacity={0.5} />
                </div>
                <div 
                  onMouseMove={(e) => e.buttons === 1 && handleXY(id, e)}
                  onMouseDown={(e) => handleXY(id, e)}
                  style={{ 
                    aspectRatio: '1/1', background: 'rgba(0,0,0,0.3)', borderRadius: '15px', 
                    border: '1px solid #333', position: 'relative', cursor: 'crosshair', overflow: 'hidden' 
                  }}
                >
                   <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', background: 'rgba(255,255,255,0.05)' }} />
                   <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                   <motion.div 
                     animate={{ 
                       left: `${(id === 1 ? xy1.x : xy2.x) * 100}%`, 
                       top: `${(1 - (id === 1 ? xy1.y : xy2.y)) * 100}%` 
                     }}
                     style={{ 
                       position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', 
                       background: '#8b5cf6', boxShadow: '0 0 15px #8b5cf6', transform: 'translate(-50%, -50%)' 
                     }} 
                   />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                   <span>X: {Math.round((id === 1 ? xy1.x : xy2.x) * 100)}</span>
                   <span>Y: {Math.round((id === 1 ? xy1.y : xy2.y) * 100)}</span>
                </div>
             </div>
           ))}
        </div>

        {/* Macro Knobs */}
        <div className="glass-panel" style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
           {macros.map((val, i) => (
             <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.6 }}>MACRO {i + 1}</span>
                <div 
                  style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', background: '#111', 
                    border: '3px solid #333', position: 'relative', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startVal = val;
                    const onMove = (me) => {
                      const delta = (startY - me.clientY) / 200;
                      updateMacro(i, startVal + delta);
                    };
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove);
                      window.removeEventListener('mouseup', onUp);
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                >
                   <motion.div 
                     animate={{ rotate: val * 270 - 135 }}
                     style={{ position: 'absolute', width: '2px', height: '20px', background: '#8b5cf6', top: '5px', originY: '25px' }} 
                   />
                   <div style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 800 }}>{Math.round(val * 100)}</div>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                   <motion.div animate={{ width: `${val * 100}%` }} style={{ height: '100%', background: '#8b5cf6' }} />
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Zap size={18} color="#facc15" />
               <span style={{ fontSize: '12px', fontWeight: 700 }}>LIVE MODE ACTIVE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <SlidersHorizontal size={18} color="#3b82f6" />
               <span style={{ fontSize: '12px', fontWeight: 700 }}>12 TARGETS MAPPED</span>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-glass" style={{ padding: '10px 20px', fontSize: '11px' }}>LEARN MIDI</button>
            <button className="btn-glass active" style={{ padding: '10px 20px', fontSize: '11px' }}>SAVE DASHBOARD</button>
         </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> ZERO-LATENCY CONTROL</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Maximize2 size={14} /> HIGH-VISIBILITY UI</div>
      </div>
    </div>
  );
}
