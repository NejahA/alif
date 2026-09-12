import React, { useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Play, Pause, Grid, Music2, Sparkles, Disc } from 'lucide-react';

export const PadMatrix = ({ isOpen, onClose }) => {
  const [activePad, setActivePad] = useState(null);
  const [arpStep, setArpStep] = useState(-1);
  const [isArpPlaying, setIsArpPlaying] = useState(false);
  const [bpm, setBpm] = useState(110);

  const pads = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    label: `Pad ${i + 1}`,
    noteIndex: i % 8,
    isChord: i >= 8
  }));

  const handlePadClick = (pad) => {
    setActivePad(pad.id);
    setTimeout(() => setActivePad(null), 300);

    if (pad.isChord) {
      audioEngine.triggerChord(pad.noteIndex);
    } else {
      const scale = audioEngine.scales[audioEngine.params.scaleName] || audioEngine.scales.ambientMinor;
      const noteMultiplier = scale[pad.noteIndex % scale.length];
      const freq = audioEngine.rootNote * noteMultiplier;
      audioEngine.playNote(freq, 0.9);
    }
  };

  const toggleArpeggiator = () => {
    const playing = audioEngine.toggleArpeggiator((step) => {
      setArpStep(step);
    });
    setIsArpPlaying(playing);
    if (!playing) setArpStep(-1);
  };

  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    setBpm(newBpm);
    audioEngine.arpBpm = newBpm;
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '80px',
      right: '16px',
      width: '380px',
      zIndex: 45,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Grid size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Harmony Pad Matrix</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {/* Arpeggiator & Tempo Controller */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={toggleArpeggiator}
            className={`btn-primary ${isArpPlaying ? 'glow-cyan' : ''}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
          >
            {isArpPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isArpPlaying ? 'Stop Arp' : 'Auto Arp'}</span>
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isArpPlaying ? `Step: ${arpStep + 1}` : 'Generative Clock'}
          </span>
        </div>

        {/* BPM Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{bpm} BPM</span>
          <input 
            type="range" 
            min="60" 
            max="180" 
            value={bpm} 
            onChange={handleBpmChange} 
          />
        </div>
      </div>

      {/* 4x4 Interactive Synth Pads Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        margin: '6px 0'
      }}>
        {pads.map(pad => {
          const isActive = activePad === pad.id || (isArpPlaying && arpStep === pad.noteIndex && !pad.isChord);
          return (
            <button
              key={pad.id}
              onClick={() => handlePadClick(pad)}
              style={{
                height: '70px',
                borderRadius: '12px',
                background: isActive 
                  ? (pad.isChord ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))')
                  : 'rgba(255, 255, 255, 0.05)',
                border: isActive ? '1px solid #fff' : '1px solid var(--border-glass)',
                boxShadow: isActive ? (pad.isChord ? '0 0 20px rgba(236,72,153,0.6)' : '0 0 20px rgba(6,182,212,0.6)') : 'none',
                color: isActive ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'scale(0.95)' : 'scale(1)'
              }}
            >
              {pad.isChord ? <Music2 size={16} /> : <Disc size={16} />}
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                {pad.isChord ? `Chord ${pad.noteIndex + 1}` : `Note ${pad.noteIndex + 1}`}
              </span>
            </button>
          );
        })}
      </div>
      
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Top 2 rows trigger single harmonic scale notes • Bottom 2 rows trigger polyphonic triad chords
      </p>
    </div>
  );
};
