import React, { useState, useRef } from 'react';
import * as Tone from 'tone';
import { Zap, Play, Square, RefreshCcw, Music, Dice5 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RiffGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scale, setScale] = useState('major');
  const [root, setRoot] = useState('C');
  const synthRef = useRef(null);
  const partRef = useRef(null);

  const scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10]
  };

  const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const generateRiff = () => {
    const riff = [];
    const scaleNotes = scales[scale];
    const baseOctave = 3;
    
    for (let i = 0; i < 16; i++) {
      if (Math.random() > 0.3) {
        const randomInterval = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
        const note = Tone.Frequency(`${root}${baseOctave}`).transpose(randomInterval).toNote();
        riff.push({ time: { "16n": i }, note, duration: "16n", velocity: 0.5 + Math.random() * 0.5 });
      }
    }
    return riff;
  };

  const togglePlayback = () => {
    if (isPlaying) {
      Tone.Transport.stop();
      if (partRef.current) partRef.current.stop();
      setIsPlaying(false);
    } else {
      if (!synthRef.current) {
        synthRef.current = new Tone.MonoSynth({
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();
      }

      const riff = generateRiff();
      
      if (partRef.current) partRef.current.dispose();
      
      partRef.current = new Tone.Part((time, value) => {
        synthRef.current.triggerAttackRelease(value.note, value.duration, time, value.velocity);
      }, riff).start(0);
      
      partRef.current.loop = true;
      partRef.current.loopEnd = "1m";
      
      Tone.Transport.start();
      setIsPlaying(false); // Fix: set state to true
      setIsPlaying(true);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Zap size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Quick Riff</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <select 
          value={root} 
          onChange={(e) => setRoot(e.target.value)}
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '5px', borderRadius: '4px' }}
        >
          {roots.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select 
          value={scale} 
          onChange={(e) => setScale(e.target.value)}
          style={{ flex: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '5px', borderRadius: '4px' }}
        >
          {Object.keys(scales).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          className={`btn-glass ${isPlaying ? 'active' : ''}`} 
          onClick={togglePlayback}
          style={{ flex: 2 }}
        >
          {isPlaying ? <Square size={14} /> : <Play size={14} />} {isPlaying ? 'Stop' : 'Generate & Play'}
        </button>
        <button 
          className="btn-glass" 
          onClick={() => { if(isPlaying) togglePlayback(); togglePlayback(); }}
          style={{ flex: 1 }}
        >
          <Dice5 size={14} />
        </button>
      </div>

      <div style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'center' }}>
        Generates random patterns in the selected scale.
      </div>
    </div>
  );
}
