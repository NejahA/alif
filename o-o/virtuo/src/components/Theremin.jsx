import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Zap, Volume2, Waves, Target } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Theremin() {
  const synthRef = useRef(null);
  const [frequency, setFrequency] = useState(440); // A4
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveType, setWaveType] = useState('sine');
  const [pitchRange, setPitchRange] = useState(4); // octaves
  const [vibratoDepth, setVibratoDepth] = useState(0.1);
  const [vibratoRate, setVibratoRate] = useState(5);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    // Initialize theremin synth
    synthRef.current = new Tone.Synth({
      oscillator: { type: waveType },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.1 }
    }).connect(masterBus);

    // Add vibrato
    const vibrato = new Tone.Vibrato({
      depth: vibratoDepth,
      frequency: vibratoRate,
      wet: 0.5
    }).connect(masterBus);
    synthRef.current.connect(vibrato);

    // Mouse movement listener
    const handleMouseMove = (e) => {
      if (!isPlaying) return;
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
      
      // Map X position to frequency (pitch)
      const minFreq = 110; // A2
      const maxFreq = minFreq * Math.pow(2, pitchRange);
      const freq = minFreq * Math.pow(2, pitchRange * x);
      setFrequency(freq);
      
      // Map Y position to volume
      const vol = 1 - y;
      setVolume(vol);
      
      // Update synth
      if (synthRef.current) {
        synthRef.current.frequency.rampTo(freq, 0.05);
        synthRef.current.volume.rampTo(Tone.gainToDb(vol), 0.05);
      }
    };

    const handleMouseDown = () => {
      startPlaying();
    };

    const handleMouseUp = () => {
      stopPlaying();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      synthRef.current?.dispose();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlaying, pitchRange, waveType, vibratoDepth, vibratoRate]);

  const startPlaying = async () => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(frequency, Tone.now(), volume);
      setIsPlaying(true);
    }
  };

  const stopPlaying = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setIsPlaying(false);
    }
  };

  const playNote = async (note) => {
    await Tone.start();
    const freq = Tone.Frequency(note).toFrequency();
    setFrequency(freq);
    
    if (synthRef.current) {
      if (isPlaying) {
        synthRef.current.frequency.rampTo(freq, 0.1);
      } else {
        synthRef.current.triggerAttack(freq, Tone.now(), volume);
        setIsPlaying(true);
      }
    }
  };

  const presetNotes = [
    { note: 'C4', name: 'Do', color: '#ef4444' },
    { note: 'D4', name: 'Re', color: '#f59e0b' },
    { note: 'E4', name: 'Mi', color: '#10b981' },
    { note: 'F4', name: 'Fa', color: '#3b82f6' },
    { note: 'G4', name: 'Sol', color: '#8b5cf6' },
    { note: 'A4', name: 'La', color: '#ec4899' },
    { note: 'B4', name: 'Ti', color: '#06b6d4' },
    { note: 'C5', name: 'Do', color: '#84cc16' },
  ];

  const waveTypes = [
    { id: 'sine', name: 'Sine', desc: 'Pure tone' },
    { id: 'triangle', name: 'Triangle', desc: 'Mellow' },
    { id: 'sawtooth', name: 'Sawtooth', desc: 'Bright' },
    { id: 'square', name: 'Square', desc: 'Hollow' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Electronic Theremin</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          The first electronic instrument. Move mouse horizontally for pitch, vertically for volume.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wave Type</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            {waveTypes.map(wave => (
              <button
                key={wave.id}
                className={`btn-glass ${waveType === wave.id ? 'active' : ''}`}
                onClick={() => setWaveType(wave.id)}
                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                title={wave.desc}
              >
                {wave.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pitch Range: {pitchRange} octaves</label>
          <input 
            type="range" min="1" max="6" step="0.5" 
            value={pitchRange} 
            onChange={(e) => setPitchRange(Number(e.target.value))}
            style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Vibrato: {vibratoDepth.toFixed(2)} depth, {vibratoRate}Hz rate
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="range" min="0" max="0.5" step="0.01" 
              value={vibratoDepth} 
              onChange={(e) => setVibratoDepth(Number(e.target.value))}
              style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
            />
            <input 
              type="range" min="1" max="10" step="0.5" 
              value={vibratoRate} 
              onChange={(e) => setVibratoRate(Number(e.target.value))}
              style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Theremin Visualization */}
      <div 
        style={{ 
          position: 'relative', 
          width: '600px', 
          height: '400px',
          background: 'radial-gradient(circle at center, rgba(138, 43, 226, 0.1) 0%, transparent 70%)',
          border: '2px solid var(--glass-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'crosshair'
        }}
        onMouseDown={startPlaying}
        onMouseUp={stopPlaying}
        onMouseLeave={stopPlaying}
      >
        {/* Pitch axis (horizontal) */}
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '0',
          right: '0',
          height: '2px',
          background: 'linear-gradient(90deg, #ef4444, #8b5cf6, #06b6d4)',
          opacity: 0.5
        }} />
        
        {/* Volume axis (vertical) */}
        <div style={{
          position: 'absolute',
          left: '50px',
          top: '0',
          bottom: '0',
          width: '2px',
          background: 'linear-gradient(0deg, #10b981, #f59e0b, #ef4444)',
          opacity: 0.5
        }} />
        
        {/* Current position indicator */}
        <motion.div
          animate={{
            x: mousePosition.x * 600 - 15,
            y: mousePosition.y * 400 - 15,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            position: 'absolute',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: isPlaying ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            boxShadow: isPlaying ? '0 0 20px var(--accent-glow)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'white',
            zIndex: 10
          }}
        >
          {isPlaying ? '🎵' : '○'}
        </motion.div>
        
        {/* Frequency lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i / 11) * 100}%`,
              top: '0',
              bottom: '0',
              width: '1px',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }}
          />
        ))}
        
        {/* Labels */}
        <div style={{ position: 'absolute', bottom: '30px', left: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Low Pitch
        </div>
        <div style={{ position: 'absolute', bottom: '30px', right: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          High Pitch
        </div>
        <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Soft
        </div>
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Loud
        </div>
        
        {/* Current values display */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.5)',
          padding: '10px 15px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={12} />
            <span>Pitch: {frequency.toFixed(1)} Hz</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={12} />
            <span>Volume: {(volume * 100).toFixed(0)}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Waves size={12} />
            <span>Note: {Tone.Frequency(frequency).toNote()}</span>
          </div>
        </div>
      </div>

      {/* Preset Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Scale Notes</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {presetNotes.map(({ note, name, color }) => (
            <button
              key={note}
              className="btn-glass"
              onMouseDown={() => playNote(note)}
              onMouseUp={stopPlaying}
              style={{ 
                padding: '10px 15px',
                fontSize: '0.9rem',
                borderColor: color,
                color: color,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span style={{ fontWeight: 600 }}>{name}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
        <button
          className={`btn-glass ${isPlaying ? 'active' : ''}`}
          onMouseDown={startPlaying}
          onMouseUp={stopPlaying}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isPlaying ? '⏸️ Release' : '🎤 Hold to Play'}
        </button>
        
        <button
          className="btn-glass"
          onClick={stopPlaying}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ⏹️ Stop
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
          Click and drag in the box above to control pitch and volume. Use preset buttons for scale notes.
          The theremin is played without physical contact - move mouse horizontally for pitch, vertically for volume.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          background: 'rgba(0,0,0,0.2)', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#ef4444', fontWeight: 600 }}>Mouse X → Pitch</div>
            <div style={{ color: 'var(--text-muted)' }}>Horizontal movement</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#10b981', fontWeight: 600 }}>Mouse Y → Volume</div>
            <div style={{ color: 'var(--text-muted)' }}>Vertical movement</div>
          </div>
        </div>
      </div>
    </div>
  );
}