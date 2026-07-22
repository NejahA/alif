import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Activity, Disc, Zap, Brain, Eye, EyeOff, RefreshCcw, Info } from 'lucide-react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
  augmented: [0, 3, 4, 7, 8, 11],
};

const CHORD_PATTERNS = {
  major: { name: 'Major', intervals: [0, 4, 7], symbol: '', quality: 'happy' },
  minor: { name: 'Minor', intervals: [0, 3, 7], symbol: 'm', quality: 'sad' },
  diminished: { name: 'Diminished', intervals: [0, 3, 6], symbol: 'dim', quality: 'tense' },
  augmented: { name: 'Augmented', intervals: [0, 4, 8], symbol: 'aug', quality: 'mysterious' },
  sus2: { name: 'Suspended 2', intervals: [0, 2, 7], symbol: 'sus2', quality: 'open' },
  sus4: { name: 'Suspended 4', intervals: [0, 5, 7], symbol: 'sus4', quality: 'open' },
  major7: { name: 'Major 7th', intervals: [0, 4, 7, 11], symbol: 'maj7', quality: 'dreamy' },
  minor7: { name: 'Minor 7th', intervals: [0, 3, 7, 10], symbol: 'm7', quality: 'soulful' },
  dom7: { name: 'Dominant 7th', intervals: [0, 4, 7, 10], symbol: '7', quality: 'bluesy' },
  dim7: { name: 'Diminished 7th', intervals: [0, 3, 6, 9], symbol: 'dim7', quality: 'tense' },
  halfDim7: { name: 'Half Dim. 7th', intervals: [0, 3, 6, 10], symbol: 'm7b5', quality: 'jazzy' },
  minMaj7: { name: 'Minor Major 7th', intervals: [0, 3, 7, 11], symbol: 'mmaj7', quality: 'cinematic' },
};

const QUALITY_COLORS = {
  happy: '#10b981',
  sad: '#3b82f6',
  tense: '#ef4444',
  mysterious: '#8b5cf6',
  open: '#f59e0b',
  dreamy: '#ec4899',
  soulful: '#f97316',
  bluesy: '#eab308',
  jazzy: '#14b8a6',
  cinematic: '#6366f1',
};

const ChordScaleDetector = () => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [detectedChord, setDetectedChord] = useState(null);
  const [detectedScale, setDetectedScale] = useState(null);
  const [history, setHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showPiano, setShowPiano] = useState(true);
  const noteOffTimers = useRef({});

  useEffect(() => {
    const handleNoteOn = (e) => {
      const { note, velocity } = e.detail;
      const midiNum = Tone.Frequency(note).toMidi();
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.add(midiNum % 12);
        return next;
      });

      // Clear existing timer for this note class
      if (noteOffTimers.current[midiNum % 12]) {
        clearTimeout(noteOffTimers.current[midiNum % 12]);
      }

      // Set new removal timer
      noteOffTimers.current[midiNum % 12] = setTimeout(() => {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(midiNum % 12);
          return next;
        });
      }, 2000);

      // Trigger detection on note change
      setIsListening(true);
    };

    const handleNoteOff = (e) => {
      const { note } = e.detail;
      const midiNum = Tone.Frequency(note).toMidi();
      // Keep note in active set for a bit (sustain)
      if (noteOffTimers.current[midiNum % 12]) {
        clearTimeout(noteOffTimers.current[midiNum % 12]);
      }
      noteOffTimers.current[midiNum % 12] = setTimeout(() => {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(midiNum % 12);
          return next;
        });
      }, 1500);
    };

    window.addEventListener('virtuo-midi-on', handleNoteOn);
    window.addEventListener('virtuo-midi-off', handleNoteOff);

    return () => {
      window.removeEventListener('virtuo-midi-on', handleNoteOn);
      window.removeEventListener('virtuo-midi-off', handleNoteOff);
      Object.values(noteOffTimers.current).forEach(t => clearTimeout(t));
    };
  }, []);

  // Detect chord and scale from active notes
  useEffect(() => {
    if (activeNotes.size < 2) {
      setDetectedChord(null);
      setDetectedScale(null);
      return;
    }

    const notes = Array.from(activeNotes).sort((a, b) => a - b);
    
    // Detect chord
    for (const root of notes) {
      const normalized = notes.map(n => ((n - root) + 12) % 12).sort((a, b) => a - b);
      
      for (const [chordId, chord] of Object.entries(CHORD_PATTERNS)) {
        if (normalized.length >= chord.intervals.length) {
          const match = chord.intervals.every(interval => 
            normalized.includes(interval)
          );
          
          // Check it's not a subset unless it's exactly the right size
          const exactMatch = normalized.length === chord.intervals.length || 
                           normalized.length === chord.intervals.length + 1;
          
          if (match && exactMatch) {
            const rootName = NOTE_NAMES[root];
            setDetectedChord({
              root: rootName,
              type: chordId,
              name: chord.name,
              symbol: `${rootName}${chord.symbol}`,
              quality: chord.quality,
              color: QUALITY_COLORS[chord.quality] || '#8a2be2'
            });
            break;
          }
        }
      }
    }

    // Detect scale
    for (const root of notes) {
      const normalized = notes.map(n => ((n - root) + 12) % 12).sort((a, b) => a - b);
      
      for (const [scaleId, pattern] of Object.entries(SCALE_PATTERNS)) {
        const match = normalized.every(n => pattern.includes(n));
        const possibleMatch = pattern.every(p => normalized.includes(p));
        
        if (match && normalized.length >= 3) {
          const rootName = NOTE_NAMES[root];
          setDetectedScale({
            root: rootName,
            type: scaleId,
            name: `${rootName} ${scaleId.charAt(0).toUpperCase() + scaleId.slice(1)}`,
            notes: pattern.map(i => NOTE_NAMES[(root + i) % 12])
          });
          break;
        }
      }
    }
  }, [activeNotes]);

  // Update history when chord changes
  useEffect(() => {
    if (detectedChord && isListening) {
      setHistory(prev => {
        const next = [{
          id: Date.now(),
          chord: detectedChord,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 20);
        return next;
      });
      
      // Trigger XP for theory
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'theory', amount: 3 }
      }));
    }
  }, [detectedChord?.symbol]);

  const clearHistory = () => {
    setHistory([]);
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'innovation', amount: 5 }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel"
      style={{ 
        width: '100%', 
        maxWidth: '700px', 
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={16} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chord & Scale Detector</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Real-time harmonic analysis
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-glass"
            onClick={() => setShowPiano(!showPiano)}
            style={{ padding: '6px 8px' }}
            title="Toggle Note Display"
          >
            {showPiano ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button
            className="btn-glass"
            onClick={clearHistory}
            style={{ padding: '6px 8px', color: '#ef4444' }}
            title="Clear History"
          >
            <RefreshCcw size={12} />
          </button>
        </div>
      </div>

      {/* Active Notes Display */}
      {showPiano && (
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '15px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)'
        }}>
          {NOTE_NAMES.map((note, idx) => {
            const isActive = activeNotes.has(idx);
            const isSharp = note.includes('#');
            return (
              <div
                key={note}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  background: isActive ? 
                    (detectedChord ? detectedChord.color : '#8a2be2') : 
                    (isSharp ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'),
                  color: isActive ? 'white' : 'var(--text-muted)',
                  border: isActive ? 'none' : '1px solid var(--glass-border)',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: isActive ? '0 0 15px var(--accent-glow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {note.replace('#', '♯')}
              </div>
            );
          })}
        </div>
      )}

      {/* Detection Results */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Current Chord */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            background: detectedChord ? `${detectedChord.color}15` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${detectedChord ? detectedChord.color + '40' : 'var(--glass-border)'}`,
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Detected Chord
            </span>
            <AnimatePresence mode="wait">
              {detectedChord ? (
                <motion.div
                  key={detectedChord.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={{ 
                    fontSize: '2.2rem', 
                    fontWeight: 900, 
                    color: detectedChord.color,
                    margin: '10px 0 5px',
                    textShadow: `0 0 20px ${detectedChord.color}40`
                  }}>
                    {detectedChord.symbol}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {detectedChord.name} · <span style={{ color: detectedChord.color, textTransform: 'capitalize' }}>{detectedChord.quality}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', margin: '15px 0', opacity: 0.5 }}>
                    {activeNotes.size === 0 ? 'Play notes to detect' : '...'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scale Match */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            background: detectedScale ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${detectedScale ? 'rgba(139, 92, 246, 0.3)' : 'var(--glass-border)'}`,
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Compatible Scale
            </span>
            <AnimatePresence mode="wait">
              {detectedScale ? (
                <motion.div
                  key={detectedScale.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 800, 
                    color: '#8b5cf6',
                    margin: '10px 0 5px'
                  }}>
                    {detectedScale.name}
                  </div>
                  <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {detectedScale.notes.map(n => (
                      <span key={n} style={{
                        padding: '2px 6px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        color: '#8b5cf6',
                        fontWeight: 600
                      }}>
                        {n.replace('#', '♯')}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', margin: '15px 0', opacity: 0.5 }}>
                    {activeNotes.size === 0 ? 'Play notes to match' : '...'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '12px', 
          padding: '15px',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Detection History
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {history.length}/20
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }} className="no-scrollbar">
            {history.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: `1px solid ${item.chord.color}20`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.chord.color
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.chord.color }}>
                    {item.chord.symbol}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {item.chord.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ 
        fontSize: '0.65rem', 
        color: 'var(--text-muted)', 
        background: 'rgba(255,255,255,0.02)', 
        padding: '10px 15px', 
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <span>🎹 Plays notes from any instrument to detect</span>
        <span>🎯 Detects chords & matching scales</span>
        <span>📊 View detection history below</span>
      </div>
    </motion.div>
  );
};

export default ChordScaleDetector;