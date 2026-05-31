import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Layers, Play, Pause, Save, Trash2, Plus, Minus, Clock, Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const PATTERN_TYPES = [
  { id: 'intro', name: 'Intro', color: '#10b981', duration: 4 },
  { id: 'verse', name: 'Verse', color: '#3b82f6', duration: 8 },
  { id: 'chorus', name: 'Chorus', color: '#ef4444', duration: 8 },
  { id: 'bridge', name: 'Bridge', color: '#8b5cf6', duration: 4 },
  { id: 'outro', name: 'Outro', color: '#f59e0b', duration: 4 },
];

const INSTRUMENTS = [
  { id: 'piano', name: 'Piano', color: '#10b981', sound: 'C4' },
  { id: 'bass', name: 'Bass', color: '#3b82f6', sound: 'C2' },
  { id: 'drums', name: 'Drums', color: '#ef4444', sound: 'C3' },
  { id: 'strings', name: 'Strings', color: '#8b5cf6', sound: 'C5' },
  { id: 'lead', name: 'Lead', color: '#f59e0b', sound: 'C6' },
];

export default function SongBuilder() {
  const synthRef = useRef({});
  const [songStructure, setSongStructure] = useState([]);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(0.7);
  const [currentStep, setCurrentStep] = useState(0);
  const [songName, setSongName] = useState('My Song');
  const [activeInstruments, setActiveInstruments] = useState({});

  useEffect(() => {
    // Initialize synths for each instrument
    INSTRUMENTS.forEach(instrument => {
      synthRef.current[instrument.id] = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
      }).connect(masterBus);
    });

    // Initialize active instruments
    const initialActive = {};
    INSTRUMENTS.forEach(instrument => {
      initialActive[instrument.id] = true;
    });
    setActiveInstruments(initialActive);

    // Load saved song
    const savedSong = localStorage.getItem('virtuo_song');
    if (savedSong) {
      try {
        const parsed = JSON.parse(savedSong);
        setSongStructure(parsed.structure || []);
        setSongName(parsed.name || 'My Song');
        setBpm(parsed.bpm || 120);
      } catch (e) {
        console.error('Failed to load song:', e);
      }
    }

    return () => {
      Object.values(synthRef.current).forEach(synth => synth?.dispose());
    };
  }, []);

  const saveSong = () => {
    const songData = {
      name: songName,
      bpm,
      structure: songStructure,
      instruments: activeInstruments,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('virtuo_song', JSON.stringify(songData));
  };

  const addPattern = (patternType) => {
    const newPattern = {
      id: Date.now(),
      type: patternType.id,
      name: patternType.name,
      color: patternType.color,
      duration: patternType.duration,
      notes: Array(patternType.duration * 4).fill(0).map(() => 
        Math.random() > 0.7 ? 1 : 0
      ),
      instrument: 'piano'
    };
    setSongStructure([...songStructure, newPattern]);
  };

  const removePattern = (id) => {
    setSongStructure(songStructure.filter(pattern => pattern.id !== id));
  };

  const playPattern = async (pattern) => {
    await Tone.start();
    setIsPlaying(true);
    
    const interval = 60000 / bpm / 4; // 16th notes
    const totalSteps = pattern.notes.length;
    
    for (let i = 0; i < totalSteps; i++) {
      setTimeout(() => {
        setCurrentStep(i);
        
        if (pattern.notes[i] === 1 && activeInstruments[pattern.instrument]) {
          const synth = synthRef.current[pattern.instrument];
          if (synth) {
            const instrument = INSTRUMENTS.find(inst => inst.id === pattern.instrument);
            synth.triggerAttackRelease(instrument.sound, '16n');
          }
        }
        
        if (i === totalSteps - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setCurrentStep(0);
          }, interval);
        }
      }, i * interval);
    }
  };

  const playSong = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    await Tone.start();
    
    let totalTime = 0;
    songStructure.forEach((pattern, patternIndex) => {
      const patternDuration = pattern.notes.length * (60000 / bpm / 4);
      
      setTimeout(() => {
        setCurrentPattern(pattern.id);
        playPattern(pattern);
      }, totalTime);
      
      totalTime += patternDuration;
    });
    
    setTimeout(() => {
      setIsPlaying(false);
      setCurrentPattern(null);
    }, totalTime);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPattern(null);
    setCurrentStep(0);
  };

  const clearSong = () => {
    setSongStructure([]);
    localStorage.removeItem('virtuo_song');
  };

  const toggleInstrument = (instrumentId) => {
    setActiveInstruments(prev => ({
      ...prev,
      [instrumentId]: !prev[instrumentId]
    }));
  };

  const updatePatternNotes = (patternId, stepIndex) => {
    setSongStructure(prev => prev.map(pattern => {
      if (pattern.id === patternId) {
        const newNotes = [...pattern.notes];
        newNotes[stepIndex] = newNotes[stepIndex] === 1 ? 0 : 1;
        return { ...pattern, notes: newNotes };
      }
      return pattern;
    }));
  };

  const getSongDuration = () => {
    const totalSteps = songStructure.reduce((sum, pattern) => sum + pattern.notes.length, 0);
    const seconds = (totalSteps * (60 / bpm / 4)).toFixed(1);
    return `${seconds}s`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Song Builder</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Arrange patterns into complete songs. Drag and drop patterns to create your composition.
        </p>
      </div>

      {/* Song Info */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Song Name</label>
          <input
            type="text"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            className="btn-glass"
            style={{ 
              padding: '10px 15px',
              fontSize: '1rem',
              textAlign: 'center',
              minWidth: '200px'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BPM: {bpm}</label>
          <input 
            type="range" min="60" max="200" step="1" 
            value={bpm} 
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration</label>
          <div style={{ 
            padding: '10px 15px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--accent-primary)'
          }}>
            {getSongDuration()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className={`btn-glass ${isPlaying ? 'active' : ''}`}
          onClick={isPlaying ? stopPlayback : playSong}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={songStructure.length === 0}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Stop' : 'Play Song'}
        </button>
        
        <button
          className="btn-glass"
          onClick={saveSong}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={16} /> Save Song
        </button>
        
        <button
          className="btn-glass"
          onClick={clearSong}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Trash2 size={16} /> Clear
        </button>
      </div>

      {/* Pattern Palette */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Add Patterns</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PATTERN_TYPES.map(patternType => (
            <button
              key={patternType.id}
              className="btn-glass"
              onClick={() => addPattern(patternType)}
              style={{ 
                padding: '10px 15px',
                borderColor: patternType.color,
                color: patternType.color,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              {patternType.name}
            </button>
          ))}
        </div>
      </div>

      {/* Song Timeline */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1000px',
        minHeight: '200px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '20px',
        position: 'relative'
      }}>
        {songStructure.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '150px',
            color: 'var(--text-muted)',
            gap: '10px'
          }}>
            <Music size={32} />
            <div>No patterns added yet. Click buttons above to add patterns.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Timeline */}
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '10px'
            }}>
              {songStructure.map((pattern, index) => {
                const isActive = currentPattern === pattern.id;
                
                return (
                  <motion.div
                    key={pattern.id}
                    animate={{
                      borderColor: isActive ? pattern.color : 'var(--glass-border)',
                      boxShadow: isActive ? `0 0 20px ${pattern.color}80` : 'none'
                    }}
                    style={{
                      minWidth: '150px',
                      background: `${pattern.color}20`,
                      border: '2px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => playPattern(pattern)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: pattern.color }}>
                        {pattern.name} {index + 1}
                      </div>
                      <button
                        className="btn-glass"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePattern(pattern.id);
                        }}
                        style={{ 
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          background: '#ef4444',
                          borderColor: '#ef4444'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {pattern.duration} bars • {pattern.instrument}
                    </div>
                    
                    {/* Pattern visualization */}
                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                      {pattern.notes.slice(0, 16).map((note, noteIndex) => (
                        <div
                          key={noteIndex}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            background: note === 1 ? pattern.color : 'rgba(255,255,255,0.1)',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            updatePatternNotes(pattern.id, noteIndex);
                          }}
                          title={`Step ${noteIndex + 1}`}
                        />
                      ))}
                    </div>
                    
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: pattern.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        ▶
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Song info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '15px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {songStructure.length} patterns • {getSongDuration()} • {bpm} BPM
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click patterns to play, click steps to toggle notes
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instrument Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Active Instruments</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {INSTRUMENTS.map(instrument => (
            <button
              key={instrument.id}
              className={`btn-glass ${activeInstruments[instrument.id] ? 'active' : ''}`}
              onClick={() => toggleInstrument(instrument.id)}
              style={{ 
                padding: '10px 15px',
                borderColor: instrument.color,
                color: instrument.color,
                background: activeInstruments[instrument.id] ? `${instrument.color}40` : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Music size={16} />
              {instrument.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
          Build complete songs by arranging patterns. Each pattern can have different instruments and rhythms.
          Save your compositions and play them back anytime.
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
            <div style={{ color: '#10b981', fontWeight: 600 }}>Add Patterns</div>
            <div style={{ color: 'var(--text-muted)' }}>Intro, verse, chorus, etc.</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#3b82f6', fontWeight: 600 }}>Arrange</div>
            <div style={{ color: 'var(--text-muted)' }}>Drag to reorder patterns</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#ef4444', fontWeight: 600 }}>Playback</div>
            <div style={{ color: 'var(--text-muted)' }}>Play entire song</div>
          </div>
        </div>
      </div>
    </div>
  );
}