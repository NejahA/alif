import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Music, Play, Pause, RefreshCw, Wand2 } from 'lucide-react';

export const ChordGen = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIdx, setCurrentChordIdx] = useState(0);
  const [tempo, setTempo] = useState(75);
  const [progressionType, setProgressionType] = useState('ambient');
  const [intervalId, setIntervalId] = useState(null);

  // Common Harmonic Chord Progressions
  const progressions = {
    ambient: [
      { name: 'I (A Minor)', notes: [0, 2, 4] },
      { name: 'VI (F Major)', notes: [5, 0, 2] },
      { name: 'III (C Major)', notes: [2, 4, 6] },
      { name: 'VII (G Major)', notes: [6, 1, 3] }
    ],
    cyberpunk: [
      { name: 'i (D Minor)', notes: [1, 3, 5] },
      { name: 'VI (Bb Major)', notes: [4, 6, 1] },
      { name: 'iv (G Minor)', notes: [3, 5, 0] },
      { name: 'V (A Major)', notes: [0, 2, 4] }
    ],
    dream: [
      { name: 'Imaj7 (C Major7)', notes: [0, 2, 4, 6] },
      { name: 'IVmaj7 (F Major7)', notes: [3, 5, 0, 2] },
      { name: 'ii7 (D Minor7)', notes: [1, 3, 5, 0] },
      { name: 'V7 (G Dom7)', notes: [4, 6, 1, 3] }
    ]
  };

  const currentProg = progressions[progressionType] || progressions.ambient;

  const toggleAutoHarmonizer = () => {
    if (isPlaying) {
      clearInterval(intervalId);
      setIsPlaying(false);
      setCurrentChordIdx(0);
      return;
    }

    audioEngine.init();
    setIsPlaying(true);
    const msPerChord = (60 / tempo) * 2000; // 2 beats per chord

    let step = 0;
    const timer = setInterval(() => {
      const chordObj = currentProg[step % currentProg.length];
      // Play triad notes
      chordObj.notes.forEach((nIdx, i) => {
        const scale = audioEngine.scales[audioEngine.params.scaleName] || audioEngine.scales.ambientMinor;
        const mult = scale[nIdx % scale.length];
        audioEngine.playNote(audioEngine.rootNote * mult, 1.8, i % 2 === 0 ? 'sine' : 'triangle');
      });

      setCurrentChordIdx(step % currentProg.length);
      step++;
    }, msPerChord);

    setIntervalId(timer);
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '80px',
      right: '16px',
      width: '420px',
      zIndex: 47,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wand2 size={18} color="var(--accent-pink)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Ambient Chord Harmonizer</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {/* Play Controls & Mode Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px' }}>
        <button 
          onClick={toggleAutoHarmonizer}
          className={`btn-primary ${isPlaying ? 'glow-pink' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlaying ? 'Pause Harmonizer' : 'Start Auto Harmonizer'}</span>
        </button>

        <select 
          value={progressionType} 
          onChange={(e) => {
            setProgressionType(e.target.value);
            if (isPlaying) toggleAutoHarmonizer();
          }}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border-glass)',
            color: '#fff',
            fontSize: '0.8rem'
          }}
        >
          <option value="ambient">Ambient Pentatonic</option>
          <option value="cyberpunk">Cyberpunk Dark Minor</option>
          <option value="dream">Lydian Dream 7ths</option>
        </select>
      </div>

      {/* Active Progression Card Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {currentProg.map((chord, idx) => {
          const isActive = isPlaying && currentChordIdx === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                chord.notes.forEach((nIdx) => {
                  const scale = audioEngine.scales[audioEngine.params.scaleName] || audioEngine.scales.ambientMinor;
                  audioEngine.playNote(audioEngine.rootNote * scale[nIdx % scale.length], 1.5);
                });
              }}
              style={{
                padding: '12px 8px',
                borderRadius: '10px',
                background: isActive ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))' : 'rgba(255,255,255,0.05)',
                border: isActive ? '1px solid #fff' : '1px solid var(--border-glass)',
                boxShadow: isActive ? '0 0 15px var(--accent-pink)' : 'none',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? '#fff' : 'var(--text-muted)' }}>
                {chord.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.65rem', color: isActive ? '#fff' : 'var(--text-dim)', marginTop: '4px' }}>
                {chord.name.split(' ')[1] || ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
