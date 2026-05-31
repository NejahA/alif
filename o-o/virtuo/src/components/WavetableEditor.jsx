import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Edit3, Play, Square, Save, Trash2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function WavetableEditor() {
  const [points, setPoints] = useState(new Array(128).fill(0));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState('C3');
  
  const canvasRef = useRef(null);
  const synthRef = useRef(null);
  const bufferRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.Sampler({
      urls: { "C3": "" }, // We will set the buffer manually
      release: 1
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
      bufferRef.current?.dispose();
    };
  }, []);

  const updateBuffer = () => {
    if (bufferRef.current) bufferRef.current.dispose();
    
    // Create a single cycle buffer
    const buffer = Tone.context.createBuffer(1, 1024, Tone.context.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Interpolate points to 1024 samples
    for (let i = 0; i < 1024; i++) {
      const idx = (i / 1024) * points.length;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx) % points.length;
      const frac = idx - lower;
      channelData[i] = points[lower] * (1 - frac) + points[upper] * frac;
    }
    
    bufferRef.current = new Tone.ToneAudioBuffer(buffer);
    synthRef.current.add("C3", bufferRef.current);
  };

  useEffect(() => {
    updateBuffer();
  }, [points]);

  const handleDraw = (e) => {
    if (e.buttons !== 1) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * points.length), points.length - 1);
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    
    const newPoints = [...points];
    newPoints[Math.floor(x)] = -y;
    setPoints(newPoints);
  };

  const togglePlay = async (note) => {
    await Tone.start();
    if (isPlaying && currentNote === note) {
      synthRef.current.triggerRelease(note);
      setIsPlaying(false);
    } else {
      if (isPlaying) synthRef.current.triggerRelease(currentNote);
      synthRef.current.triggerAttack(note);
      setCurrentNote(note);
      setIsPlaying(true);
    }
  };

  const clearWave = () => {
    setPoints(new Array(128).fill(0));
  };

  const generatePreset = (type) => {
    const newPoints = new Array(128).fill(0);
    for (let i = 0; i < 128; i++) {
      if (type === 'sine') newPoints[i] = Math.sin((i / 128) * Math.PI * 2);
      if (type === 'saw') newPoints[i] = 1 - (i / 128) * 2;
      if (type === 'square') newPoints[i] = i < 64 ? 1 : -1;
    }
    setPoints(newPoints);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Edit3 size={24} color="#10b981" /> Wavetable Editor
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Draw Your Own Oscillator Shape</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-glass" onClick={() => generatePreset('sine')}>Sine</button>
            <button className="btn-glass" onClick={() => generatePreset('saw')}>Saw</button>
            <button className="btn-glass" onClick={() => generatePreset('square')}>Square</button>
          </div>
          <button className="btn-glass" onClick={clearWave} style={{ color: '#f43f5e' }}>
            <Trash2 size={16} /> Clear
          </button>
        </div>

        <div 
          style={{ 
            height: '300px', background: '#000', borderRadius: '12px', border: '1px solid #333',
            position: 'relative', overflow: 'hidden', cursor: 'crosshair'
          }}
          onMouseMove={handleDraw}
          onMouseDown={handleDraw}
        >
          <canvas 
            ref={canvasRef} 
            width="800" height="300" 
            style={{ width: '100%', height: '100%' }} 
          />
          <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          
          {/* Custom SVG Drawing for smoothness */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path 
              d={`M 0 150 ${points.map((p, i) => `L ${(i / 127) * 900} ${150 - p * 150}`).join(' ')}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />
          </svg>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['C2', 'G2', 'C3', 'E3', 'G3', 'C4'].map(note => (
            <button
              key={note}
              className={`btn-glass ${currentNote === note && isPlaying ? 'active' : ''}`}
              onMouseDown={() => togglePlay(note)}
              onMouseUp={() => { synthRef.current.triggerRelease(note); setIsPlaying(false); }}
              style={{ padding: '15px 30px', borderRadius: '12px' }}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> 1024 SAMPLE CYCLE</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={14} /> SESSION PERSISTENT</div>
      </div>
    </div>
  );
}
