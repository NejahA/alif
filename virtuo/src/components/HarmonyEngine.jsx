import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Music, Play, Square, RefreshCw, Heart, Sparkles, ArrowRight, Activity } from 'lucide-react';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CHORD_TYPES = {
  major: { intervals: [0, 4, 7], name: 'Major', symbol: '' },
  minor: { intervals: [0, 3, 7], name: 'Minor', symbol: 'm' },
  diminished: { intervals: [0, 3, 6], name: 'Dim', symbol: 'dim' },
  augmented: { intervals: [0, 4, 8], name: 'Aug', symbol: 'aug' },
  sus2: { intervals: [0, 2, 7], name: 'Sus2', symbol: 'sus2' },
  sus4: { intervals: [0, 5, 7], name: 'Sus4', symbol: 'sus4' },
  maj7: { intervals: [0, 4, 7, 11], name: 'Maj7', symbol: 'maj7' },
  min7: { intervals: [0, 3, 7, 10], name: 'Min7', symbol: 'm7' },
  dom7: { intervals: [0, 4, 7, 10], name: 'Dom7', symbol: '7' },
  dim7: { intervals: [0, 3, 6, 9], name: 'Dim7', symbol: 'dim7' },
  mMaj7: { intervals: [0, 3, 7, 11], name: 'mMaj7', symbol: 'mMaj7' },
  aug7: { intervals: [0, 4, 8, 10], name: 'Aug7', symbol: 'aug7' },
};

const SCALE_PATTERNS = {
  'C Major': [0, 2, 4, 5, 7, 9, 11],
  'A Minor': [0, 2, 3, 5, 7, 8, 10],
  'G Major': [0, 2, 4, 6, 7, 9, 11],
  'E Minor': [0, 2, 4, 5, 7, 9, 10],
  'D Major': [2, 4, 6, 7, 9, 11, 1],
  'B Minor': [2, 4, 5, 7, 9, 11, 0],
  'F Major': [5, 7, 9, 10, 0, 2, 3],
};

const PROGRESSIONS = {
  'I-IV-V-I': { chords: ['I', 'IV', 'V', 'I'], description: 'Classic rock/pop foundation' },
  'ii-V-I': { chords: ['ii', 'V', 'I'], description: 'Essential jazz progression' },
  'I-V-vi-IV': { chords: ['I', 'V', 'vi', 'IV'], description: 'Pop music standard' },
  'I-vi-IV-V': { chords: ['I', 'vi', 'IV', 'V'], description: '50s progression / doo-wop' },
  'I-IV-vi-V': { chords: ['I', 'IV', 'vi', 'V'], description: 'Modern pop variation' },
  'vi-IV-I-V': { chords: ['vi', 'IV', 'I', 'V'], description: 'Minor pop progression' },
  'I-iii-IV-V': { chords: ['I', 'iii', 'IV', 'V'], description: 'Classical standard' },
};

const HarmonyEngine = () => {
  const [rootNote, setRootNote] = useState('C');
  const [scale, setScale] = useState('C Major');
  const [chordType, setChordType] = useState('major');
  const [progression, setProgression] = useState('I-IV-V-I');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChord, setCurrentChord] = useState(0);
  const [chordInversion, setChordInversion] = useState(0);
  const [voicing, setVoicing] = useState('close');
  const [arpeggiate, setArpeggiate] = useState(false);
  const [mood, setMood] = useState('bright');
  const [generatedChords, setGeneratedChords] = useState([]);
  const [activeView, setActiveView] = useState('chords');

  const synthRef = useRef(null);
  const arpRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: mood === 'bright' ? 'sine' : mood === 'warm' ? 'triangle' : 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.8 }
    }).toDestination();
    
    return () => {
      synthRef.current?.dispose();
      clearInterval(intervalRef.current);
    };
  }, [mood]);

  const getScaleNotes = () => {
    const pattern = SCALE_PATTERNS[scale];
    if (!pattern) return [];
    return pattern.map(interval => NOTES[interval]);
  };

  const getChordNotes = (scaleDegree) => {
    const scaleNotes = getScaleNotes();
    if (scaleNotes.length === 0) return [];
    
    const progressionsData = PROGRESSIONS[progression];
    const progIndex = progressionsData.chords.indexOf(scaleDegree);
    if (progIndex === -1) return [];
    
    const romanToIndex = { 'I': 0, 'ii': 1, 'ii': 1, 'III': 2, 'iii': 2, 'IV': 3, 'V': 4, 'v': 4, 'vi': 5, 'VII': 6, 'vii': 6 };
    const idx = romanToIndex[scaleDegree];
    if (idx === undefined) return [];
    
    const rootIndex = NOTES.indexOf(scaleNotes[idx % scaleNotes.length]);
    const intervals = CHORD_TYPES[chordType]?.intervals || [0, 4, 7];
    
    return intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTES[noteIndex];
    });
  };

  const generateProgression = () => {
    const data = PROGRESSIONS[progression];
    if (!data) return;
    
    const chords = data.chords.map(degree => ({
      degree,
      notes: getChordNotes(degree),
      type: chordType
    }));
    
    setGeneratedChords(chords);
    return chords;
  };

  const playProgression = async () => {
    await Tone.start();
    setIsPlaying(true);
    setCurrentChord(0);
    
    const chords = generateProgression();
    if (!chords || chords.length === 0) return;
    
    const now = Tone.now();
    const chordDuration = 2;
    
    chords.forEach((chord, index) => {
      if (chord.notes && chord.notes.length > 0) {
        const playTime = now + index * chordDuration;
        
        chord.notes.forEach((note, noteIndex) => {
          const octave = 4 + (chordInversion === 1 && noteIndex > 0 ? 1 : chordInversion === 2 && noteIndex > 1 ? 1 : 0);
          const noteStr = `${note}${octave}`;
          
          if (arpeggiate) {
            const arpTime = playTime + noteIndex * 0.1;
            synthRef.current.triggerAttackRelease(noteStr, '8n', arpTime);
          } else {
            synthRef.current.triggerAttackRelease(noteStr, chordDuration * 0.9, playTime);
          }
        });
      }
      
      setTimeout(() => {
        setCurrentChord(index);
      }, (index + 1) * chordDuration * 1000);
    });
    
    setTimeout(() => {
      setIsPlaying(false);
      setCurrentChord(0);
    }, chords.length * chordDuration * 1000);
  };

  const stopPlayback = () => {
    synthRef.current?.releaseAll();
    setIsPlaying(false);
    setCurrentChord(0);
    clearInterval(intervalRef.current);
  };

  const previewChord = async (notes) => {
    await Tone.start();
    notes.forEach((note, i) => {
      const octave = 4;
      setTimeout(() => {
        synthRef.current?.triggerAttackRelease(`${note}${octave}`, '2n');
      }, i * 50);
    });
  };

  const renderChordView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Root & Type Selection */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          value={rootNote}
          onChange={(e) => setRootNote(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            padding: '4px 8px',
            fontSize: '0.9rem',
            fontWeight: 700
          }}
        >
          {NOTES.map(note => <option key={note} value={note}>{note}</option>)}
        </select>
        
        <select
          value={chordType}
          onChange={(e) => setChordType(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            padding: '4px 8px',
            fontSize: '0.8rem',
            flex: 1
          }}
        >
          {Object.entries(CHORD_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.name} ({val.symbol || 'M'})</option>
          ))}
        </select>
      </div>

      {/* Generated Chord Display */}
      {(() => {
        const testNotes = getChordNotes('I');
        return testNotes.length > 0 ? (
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              {rootNote}{CHORD_TYPES[chordType].symbol} - {CHORD_TYPES[chordType].name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {testNotes.map((note, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const octave = 4 + (chordInversion === 1 && i > 0 ? 1 : 0);
                    synthRef.current?.triggerAttackRelease(`${note}${octave}`, '4n');
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid #8b5cf640',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#8b5cf6',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* Inversion & Voicing */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Inversion</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map(inv => (
              <button
                key={inv}
                className={`btn-glass ${chordInversion === inv ? 'active' : ''}`}
                onClick={() => setChordInversion(inv)}
                style={{ padding: '3px 8px', fontSize: '0.65rem', flex: 1 }}
              >
                {inv === 0 ? 'Root' : inv === 1 ? '1st' : '2nd'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Voicing</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['close', 'open'].map(v => (
              <button
                key={v}
                className={`btn-glass ${voicing === v ? 'active' : ''}`}
                onClick={() => setVoicing(v)}
                style={{ padding: '3px 8px', fontSize: '0.65rem', flex: 1, textTransform: 'capitalize' }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgressionView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Progression Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Select Progression</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {Object.keys(PROGRESSIONS).map(prog => (
            <button
              key={prog}
              className={`btn-glass ${progression === prog ? 'active' : ''}`}
              onClick={() => {
                setProgression(prog);
                setGeneratedChords([]);
              }}
              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
            >
              {prog}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Progression */}
      {generatedChords.length > 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '12px',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {PROGRESSIONS[progression]?.description}
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {generatedChords.map((chord, i) => (
              <button
                key={i}
                onClick={() => previewChord(chord.notes)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: currentChord === i && isPlaying ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0,0,0,0.2)',
                  border: currentChord === i && isPlaying ? '1px solid #8b5cf6' : '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: currentChord === i && isPlaying ? '#8b5cf6' : 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>{chord.degree}</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                  {chord.notes.join(' ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mood Selector */}
      <div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Mood</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['bright', 'warm', 'dark'].map(m => (
            <button
              key={m}
              className={`btn-glass ${mood === m ? 'active' : ''}`}
              onClick={() => setMood(m)}
              style={{ padding: '4px 8px', fontSize: '0.65rem', flex: 1, textTransform: 'capitalize' }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Arpeggiate Toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={arpeggiate}
          onChange={(e) => setArpeggiate(e.target.checked)}
          style={{ accentColor: 'var(--accent-primary)' }}
        />
        Arpeggiate chords
      </label>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Harmony Engine</h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn-glass"
            onClick={generateProgression}
            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
          >
            <RefreshCw size={10} /> Generate
          </button>
          <button
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={isPlaying ? stopPlayback : playProgression}
            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
          >
            {isPlaying ? <Square size={10} /> : <Play size={10} />}
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {['chords', 'progressions'].map(view => (
          <button
            key={view}
            className={`btn-glass ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
            style={{ padding: '3px 10px', fontSize: '0.65rem', textTransform: 'capitalize' }}
          >
            {view}
          </button>
        ))}
      </div>

      {activeView === 'chords' && renderChordView()}
      {activeView === 'progressions' && renderProgressionView()}

      {/* Scale Reference */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '8px',
        borderRadius: '6px',
        fontSize: '0.65rem'
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
          <Music size={10} /> {scale} Scale
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {getScaleNotes().map((note, i) => (
            <span key={i} style={{
              padding: '2px 6px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}>
              {note}
            </span>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        <Sparkles size={10} /> Click on individual chord buttons to preview them
      </div>
    </div>
  );
};

export default HarmonyEngine;