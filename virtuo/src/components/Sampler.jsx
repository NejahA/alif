import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Play, Scissors } from 'lucide-react';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const SAMPLE_BANKS = {
  'Cinematic': [
    { id: 1, name: 'Impact', note: 'C2', type: 'impact' },
    { id: 2, name: 'Riser', note: 'E2', type: 'riser' },
    { id: 3, name: 'Swell', note: 'G2', type: 'swell' },
    { id: 4, name: 'Sub', note: 'C1', type: 'sub' },
  ],
  'Retro': [
    { id: 5, name: 'Beep', note: 'C4', type: 'beep' },
    { id: 6, name: 'Laser', note: 'E4', type: 'laser' },
    { id: 7, name: 'Blip', note: 'G4', type: 'blip' },
    { id: 8, name: 'Jump', note: 'C5', type: 'jump' },
  ],
  'Drums': [
    { id: 9, name: 'Loop 1', note: 'C3', type: 'loop' },
    { id: 10, name: 'Loop 2', note: 'D3', type: 'loop' },
  ]
};

export default function Sampler() {
  const isAudioReady = useAudioSafe();
  const [bank, setBank] = useState('Cinematic');
  const [pitch, setPitch] = useState(0);
  const [isReverse, setIsReverse] = useState(false);
  const [sliceMode, setSliceMode] = useState(false);
  const [activeSlice, setActiveSlice] = useState(null);
  const [crush, setCrush] = useState(16);
  const [shift, setShift] = useState(0);
  const samplerRef = useRef(null);
  const crusherRef = useRef(null);
  const shifterRef = useRef(null);

  useEffect(() => {
    if (!isAudioReady) return;
    crusherRef.current = new Tone.BitCrusher(16).connect(getChannel('sampler'));
    shifterRef.current = new Tone.FrequencyShifter(0).connect(crusherRef.current);
    
    samplerRef.current = new Tone.PolySynth(Tone.FMSynth, {
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }
    }).connect(shifterRef.current);

    return () => {
      samplerRef.current?.dispose();
      crusherRef.current?.dispose();
      shifterRef.current?.dispose();
    };
  }, [isAudioReady]);

  useEffect(() => {
    if (crusherRef.current) crusherRef.current.bits.value = crush;
  }, [crush]);

  useEffect(() => {
    if (shifterRef.current) shifterRef.current.frequency.value = shift;
  }, [shift]);

  const triggerSample = async (note, type, sliceIndex = null) => {
    await Tone.start();
    
    // Shift note by semitones
    const shiftedNote = Tone.Frequency(note).transpose(pitch + (sliceIndex || 0)).toNote();
    
    // Customize the sound based on the sample "type"
    const attack = isReverse ? 1.0 : (type === 'riser' ? 1.5 : 0.01);
    const release = type === 'impact' ? 1.4 : 0.5;

    if (sliceIndex !== null) {
      setActiveSlice(sliceIndex);
      setTimeout(() => setActiveSlice(null), 100);
    }

    if (type === 'impact') {
      samplerRef.current.set({ modulationIndex: 20, envelope: { attack, decay: 0.8, release } });
    } else if (type === 'riser') {
      samplerRef.current.set({ modulationIndex: 5, envelope: { attack, decay: 0.5, release } });
    } else {
      samplerRef.current.set({ modulationIndex: 10, envelope: { attack, decay: 0.2, release } });
    }

    samplerRef.current.triggerAttackRelease(shiftedNote, sliceMode ? '16n' : '1n');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '800px', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {Object.keys(SAMPLE_BANKS).map(b => (
            <button
              key={b}
              className={`btn-glass ${bank === b ? 'active' : ''}`}
              onClick={() => setBank(b)}
            >
              <Music size={16} /> {b} Bank
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pitch: {pitch > 0 ? `+${pitch}` : pitch}</span>
          <input 
            type="range" min="-12" max="12" step="1" 
            value={pitch} 
            onChange={(e) => setPitch(Number(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <button 
          className={`btn-glass ${isReverse ? 'active' : ''}`}
          onClick={() => setIsReverse(!isReverse)}
          style={{ padding: '5px 10px', fontSize: '0.8rem' }}
        >
          Reverse
        </button>

        <button 
          className={`btn-glass ${sliceMode ? 'active' : ''}`}
          onClick={() => setSliceMode(!sliceMode)}
          style={{ padding: '5px 10px', fontSize: '0.8rem' }}
        >
          <Scissors size={14} /> {sliceMode ? 'Manual Slices' : 'One-Shot'}
        </button>
      </div>

      {/* Mangler Section */}
      <div className="glass-panel" style={{ padding: '15px 30px', display: 'flex', gap: '40px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444' }}>CRUSH</span>
          <input 
            type="range" min="1" max="16" step="0.5" 
            value={crush} 
            onChange={(e) => setCrush(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#ef4444' }}
          />
          <span style={{ fontSize: '0.7rem', width: '25px' }}>{crush}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6' }}>SHIFT</span>
          <input 
            type="range" min="-1000" max="1000" step="10" 
            value={shift} 
            onChange={(e) => setShift(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#3b82f6' }}
          />
          <span style={{ fontSize: '0.7rem', width: '45px' }}>{shift}Hz</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sliceMode ? '1fr' : 'repeat(4, 1fr)', gap: '20px' }}>
        {sliceMode ? (
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Beat Slicer</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bank: {bank}</span>
            </div>
            <div style={{ height: '120px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', gap: '2px', padding: '10px' }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => triggerSample(SAMPLE_BANKS[bank][0].note, 'slice', i)}
                  style={{
                    flex: 1,
                    background: activeSlice === i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: `${20 + Math.random() * 60}%`, 
                    background: activeSlice === i ? 'white' : 'var(--accent-primary)',
                    opacity: activeSlice === i ? 0.8 : 0.3
                  }} />
                </motion.div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Click slices to trigger granular playback of the first sample in the bank.
            </p>
          </div>
        ) : (
          SAMPLE_BANKS[bank].map(sample => (
            <motion.div
              key={sample.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => triggerSample(sample.note, sample.type)}
              className="glass-panel"
              style={{
                padding: '30px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                border: '2px solid var(--glass-border)',
                transition: 'border-color 0.3s ease'
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--accent-glow)'
              }}>
                <Play size={24} fill="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{sample.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sample.type}</span>
            </motion.div>
          ))
        )}
      </div>
      
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        * Trigger high-quality sound effects and atmospheric hits.
      </p>
    </div>
  );
}
