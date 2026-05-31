import React, { useState, useRef, useEffect } from 'react';
import { Scissors, MousePointer2, ZoomIn, ZoomOut, Save, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WaveformEditor() {
  const [selection, setSelection] = useState({ start: 20, end: 60 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Mock waveform data
  const [waveform] = useState(() => 
    Array.from({ length: 200 }, () => Math.random() * 0.8 + 0.1)
  );

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSelection({ start: x, end: x });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setSelection(prev => ({ ...prev, end: x }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Normalize selection
    setSelection(prev => ({
      start: Math.min(prev.start, prev.end),
      end: Math.max(prev.start, prev.end)
    }));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scissors size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Waveform Editor</h3>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="btn-glass" onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}><ZoomIn size={14} /></button>
          <button className="btn-glass" onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}><ZoomOut size={14} /></button>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ 
          height: '120px', 
          background: 'rgba(0,0,0,0.4)', 
          borderRadius: '4px', 
          position: 'relative',
          overflow: 'hidden',
          cursor: 'crosshair',
          border: '1px solid var(--glass-border)'
        }}
      >
        {/* Waveform Drawing */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1px', 
          height: '100%', 
          padding: '0 10px',
          transform: `scaleX(${zoom})`,
          transformOrigin: 'left'
        }}>
          {waveform.map((h, i) => (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                height: `${h * 100}%`, 
                background: 'var(--accent-primary)',
                opacity: 0.6,
                borderRadius: '1px'
              }} 
            />
          ))}
        </div>

        {/* Selection Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: `${Math.min(selection.start, selection.end)}%`, 
          width: `${Math.abs(selection.end - selection.start)}%`, 
          height: '100%', 
          background: 'rgba(255,255,255,0.1)',
          borderLeft: '1px solid white',
          borderRight: '1px solid white',
          pointerEvents: 'none'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-glass"><Play size={14} /> Play Selection</button>
          <button className="btn-glass"><Scissors size={14} /> Trim</button>
        </div>
        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
          {Math.abs(selection.end - selection.start).toFixed(1)}% Selected
        </span>
      </div>
    </div>
  );
}
