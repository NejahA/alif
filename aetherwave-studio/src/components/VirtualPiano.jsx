import React, { useEffect, useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Music, Sliders, Zap } from 'lucide-react';

export const VirtualPiano = ({ isVisible }) => {
  const [activeKey, setActiveKey] = useState(null);
  const [octaveShift, setOctaveShift] = useState(0); // -2 to +2
  const [pitchBend, setPitchBend] = useState(0); // -100 to +100
  const [modWheel, setModWheel] = useState(0); // 0 to 100
  const [isSustainOn, setIsSustainOn] = useState(false);

  // QWERTY Key mapping to MIDI Notes (C4 to C5 base)
  const baseKeyMap = {
    'a': { note: 'C', baseFreq: 261.63, isBlack: false, keyChar: 'A' },
    'w': { note: 'C#', baseFreq: 277.18, isBlack: true, keyChar: 'W' },
    's': { note: 'D', baseFreq: 293.66, isBlack: false, keyChar: 'S' },
    'e': { note: 'D#', baseFreq: 311.13, isBlack: true, keyChar: 'E' },
    'd': { note: 'E', baseFreq: 329.63, isBlack: false, keyChar: 'D' },
    'f': { note: 'F', baseFreq: 349.23, isBlack: false, keyChar: 'F' },
    't': { note: 'F#', baseFreq: 369.99, isBlack: true, keyChar: 'T' },
    'g': { note: 'G', baseFreq: 392.00, isBlack: false, keyChar: 'G' },
    'y': { note: 'G#', baseFreq: 415.30, isBlack: true, keyChar: 'Y' },
    'h': { note: 'A', baseFreq: 440.00, isBlack: false, keyChar: 'H' },
    'u': { note: 'A#', baseFreq: 466.16, isBlack: true, keyChar: 'U' },
    'j': { note: 'B', baseFreq: 493.88, isBlack: false, keyChar: 'J' },
    'k': { note: 'C+1', baseFreq: 523.25, isBlack: false, keyChar: 'K' }
  };

  const getFreq = (baseFreq) => {
    const octMult = Math.pow(2, octaveShift);
    const bendMult = Math.pow(2, (pitchBend * 2) / 1200);
    return baseFreq * octMult * bendMult;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();

      if (baseKeyMap[k]) {
        const freq = getFreq(baseKeyMap[k].baseFreq);
        const duration = isSustainOn ? 2.5 : 0.8;
        audioEngine.playNote(freq, duration);
        setActiveKey(k);
      } else if (k === 'z') {
        setOctaveShift((prev) => Math.max(-2, prev - 1));
      } else if (k === 'x') {
        setOctaveShift((prev) => Math.min(2, prev + 1));
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (baseKeyMap[k]) {
        if (!isSustainOn) setActiveKey(null);
        else setTimeout(() => setActiveKey(null), 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [octaveShift, pitchBend, isSustainOn]);

  const playKey = (kData, keyChar) => {
    const freq = getFreq(kData.baseFreq);
    const duration = isSustainOn ? 2.5 : 0.8;
    audioEngine.playNote(freq, duration);
    setActiveKey(keyChar.toLowerCase());
    setTimeout(() => setActiveKey(null), 300);
  };

  const playPresetChord = (chordType) => {
    const rootFreq = getFreq(261.63); // C
    let intervals = [1, 1.25, 1.5]; // Major
    if (chordType === 'min7') intervals = [1, 1.2, 1.5, 1.8];
    else if (chordType === 'maj7') intervals = [1, 1.25, 1.5, 1.875];
    else if (chordType === 'cyber9') intervals = [1, 1.2, 1.5, 1.8, 2.25];
    else if (chordType === 'power') intervals = [1, 1.5, 2.0];

    intervals.forEach(mult => {
      audioEngine.playNote(rootFreq * mult, isSustainOn ? 2.8 : 1.2);
    });
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      zIndex: 42
    }}>
      {/* Top Controls Bar */}
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 16px',
        borderRadius: '12px',
        fontSize: '0.75rem'
      }}>
        {/* Octave Shift */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Octave [Z/X]:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[-2, -1, 0, 1, 2].map(oct => (
              <button
                key={oct}
                onClick={() => setOctaveShift(oct)}
                className="glass-pill"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: octaveShift === oct ? '#fff' : 'var(--text-muted)',
                  background: octaveShift === oct ? 'var(--accent-purple)' : 'transparent',
                  border: 'none'
                }}
              >
                C{4 + oct}
              </button>
            ))}
          </div>
        </div>

        {/* Sustain Pedal */}
        <button
          onClick={() => setIsSustainOn(!isSustainOn)}
          className="glass-pill"
          style={{
            padding: '4px 10px',
            fontSize: '0.72rem',
            color: isSustainOn ? '#fff' : 'var(--text-muted)',
            background: isSustainOn ? 'var(--accent-cyan)' : 'transparent',
            border: '1px solid var(--border-glass)'
          }}
        >
          {isSustainOn ? '🔴 Sustain ON' : '⚪ Sustain OFF'}
        </button>

        {/* Quick Chords */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Chords:</span>
          {['maj7', 'min7', 'cyber9', 'power'].map(ch => (
            <button
              key={ch}
              onClick={() => playPresetChord(ch)}
              className="glass-pill"
              style={{
                padding: '3px 8px',
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                color: 'var(--accent-pink)',
                border: '1px solid rgba(236,72,153,0.3)'
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Main Keyboard Body */}
      <div className="glass-panel" style={{
        padding: '12px 20px',
        display: 'flex',
        gap: '4px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Wheels Column */}
        <div style={{ display: 'flex', gap: '8px', marginRight: '12px', paddingRight: '12px', borderRight: '1px solid var(--border-glass)' }}>
          {/* Pitch Bend */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>BEND</span>
            <input 
              type="range" 
              min="-100" 
              max="100" 
              value={pitchBend}
              onChange={(e) => setPitchBend(parseInt(e.target.value, 10))}
              onMouseUp={() => setPitchBend(0)}
              style={{ width: '40px', height: '90px', writingMode: 'bt-lr', appearance: 'slider-vertical' }}
            />
          </div>

          {/* Mod Wheel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>MOD</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={modWheel}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setModWheel(val);
                audioEngine.updateParam('filterCutoff', 1000 + val * 60);
              }}
              style={{ width: '40px', height: '90px', writingMode: 'bt-lr', appearance: 'slider-vertical' }}
            />
          </div>
        </div>

        {/* Piano Keys */}
        {Object.entries(baseKeyMap).map(([char, data]) => {
          const isActive = activeKey === char;
          const currentOctaveNum = 4 + octaveShift;
          const displayNote = `${data.note}${currentOctaveNum}`;
          return (
            <button
              key={char}
              onClick={() => playKey(data, char)}
              style={{
                width: data.isBlack ? '32px' : '44px',
                height: data.isBlack ? '90px' : '130px',
                zIndex: data.isBlack ? 2 : 1,
                borderRadius: '0 0 8px 8px',
                background: data.isBlack 
                  ? (isActive ? 'var(--accent-pink)' : '#121629')
                  : (isActive ? 'linear-gradient(to bottom, #fff, var(--accent-cyan))' : 'rgba(255,255,255,0.92)'),
                border: '1px solid var(--border-glass)',
                color: data.isBlack ? '#fff' : '#0f172a',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingBottom: '8px',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: isActive ? (data.isBlack ? '0 0 15px var(--accent-pink)' : '0 0 15px var(--accent-cyan)') : 'none',
                transform: isActive ? 'translateY(2px)' : 'none',
                transition: 'all 0.08s ease'
              }}
            >
              <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{displayNote}</span>
              <span>[{data.keyChar}]</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
