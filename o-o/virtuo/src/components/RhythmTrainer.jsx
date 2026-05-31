import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Drum, Timer, Target, Check, X, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const RHYTHM_PATTERNS = [
  { 
    name: 'Basic 4/4', 
    pattern: [1, 0, 1, 0, 1, 0, 1, 0], // Quarter notes
    bpm: 100,
    difficulty: 1,
    description: 'Simple quarter note rhythm',
    color: '#10b981'
  },
  { 
    name: 'Rock Beat', 
    pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], // 8th notes with accents
    bpm: 120,
    difficulty: 2,
    description: 'Classic rock rhythm',
    color: '#3b82f6'
  },
  { 
    name: 'Shuffle', 
    pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], // Triplet feel
    bpm: 90,
    difficulty: 3,
    description: 'Blues shuffle rhythm',
    color: '#8b5cf6'
  },
  { 
    name: 'Funk Groove', 
    pattern: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    bpm: 110,
    difficulty: 4,
    description: 'Syncopated funk pattern',
    color: '#ec4899'
  },
  { 
    name: 'Latin Clave', 
    pattern: [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    bpm: 130,
    difficulty: 5,
    description: '3-2 son clave pattern',
    color: '#f59e0b'
  },
  { 
    name: 'Complex Polyrhythm', 
    pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    bpm: 80,
    difficulty: 5,
    description: '3 against 4 polyrhythm',
    color: '#ef4444'
  },
];

const INSTRUMENTS = [
  { id: 'kick', name: 'Kick', color: '#ef4444', sound: 'C2' },
  { id: 'snare', name: 'Snare', color: '#3b82f6', sound: 'C4' },
  { id: 'hihat', name: 'Hi-Hat', color: '#10b981', sound: 'C6' },
  { id: 'clap', name: 'Clap', color: '#f59e0b', sound: 'C5' },
  { id: 'cowbell', name: 'Cowbell', color: '#8b5cf6', sound: 'G5' },
];

export default function RhythmTrainer() {
  const synthRef = useRef({});
  const [currentPattern, setCurrentPattern] = useState(RHYTHM_PATTERNS[0]);
  const [userPattern, setUserPattern] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState('listen'); // 'listen', 'repeat', 'create'
  const [activeInstrument, setActiveInstrument] = useState('kick');
  const [volume, setVolume] = useState(0.7);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    // Initialize synths for each instrument
    INSTRUMENTS.forEach(instrument => {
      synthRef.current[instrument.id] = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
      }).connect(masterBus);
    });

    // Metronome synth
    synthRef.current.metronome = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(masterBus);

    return () => {
      Object.values(synthRef.current).forEach(synth => synth?.dispose());
    };
  }, []);

  const playStep = async (step, instrumentId = 'kick') => {
    await Tone.start();
    const synth = synthRef.current[instrumentId];
    if (synth) {
      const instrument = INSTRUMENTS.find(i => i.id === instrumentId);
      synth.triggerAttackRelease(instrument.sound, '16n');
    }
  };

  const playMetronome = async () => {
    await Tone.start();
    if (synthRef.current.metronome && metronomeOn) {
      synthRef.current.metronome.triggerAttackRelease('C5', '16n');
    }
  };

  const playPattern = async (pattern, instrumentId = 'kick') => {
    setIsPlaying(true);
    await Tone.start();
    
    const interval = 60000 / bpm / 4; // 16th notes
    
    pattern.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        
        // Play metronome on first beat
        if (index % 4 === 0) {
          playMetronome();
        }
        
        if (step === 1) {
          playStep(index, instrumentId);
        }
        
        // End of pattern
        if (index === pattern.length - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setCurrentStep(0);
          }, interval);
        }
      }, index * interval);
    });
  };

  const startRecording = () => {
    setIsRecording(true);
    setUserPattern([]);
    
    // Start recording timer
    const recordingDuration = (60000 / bpm / 4) * currentPattern.pattern.length;
    
    setTimeout(() => {
      setIsRecording(false);
      checkPattern();
    }, recordingDuration);
  };

  const checkPattern = () => {
    if (userPattern.length !== currentPattern.pattern.length) {
      setStreak(0);
      setGameHistory(prev => [...prev, { pattern: currentPattern.name, correct: false }]);
      return;
    }
    
    let correctCount = 0;
    userPattern.forEach((step, index) => {
      if (step === currentPattern.pattern[index]) {
        correctCount++;
      }
    });
    
    const accuracy = correctCount / currentPattern.pattern.length;
    const isCorrect = accuracy >= 0.8;
    
    if (isCorrect) {
      setScore(prev => prev + Math.round(accuracy * 100));
      setStreak(prev => prev + 1);
      setGameHistory(prev => [...prev, { pattern: currentPattern.name, correct: true, accuracy }]);
      
      // Play success sound
      playStep(0, 'hihat');
      setTimeout(() => playStep(0, 'snare'), 100);
    } else {
      setStreak(0);
      setGameHistory(prev => [...prev, { pattern: currentPattern.name, correct: false, accuracy }]);
      
      // Play error sound
      playStep(0, 'kick');
    }
  };

  const addToUserPattern = (value) => {
    if (isRecording && userPattern.length < currentPattern.pattern.length) {
      setUserPattern(prev => [...prev, value]);
      playStep(userPattern.length, activeInstrument);
    }
  };

  const clearUserPattern = () => {
    setUserPattern([]);
  };

  const getPatternVisualization = (pattern, isCurrent = false) => {
    return (
      <div style={{ 
        display: 'flex', 
        gap: '5px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '600px'
      }}>
        {pattern.map((step, index) => {
          const isActive = isCurrent && index === currentStep;
          const instrument = INSTRUMENTS.find(i => i.id === activeInstrument);
          
          return (
            <motion.div
              key={index}
              animate={{
                scale: isActive ? 1.2 : 1,
                backgroundColor: step === 1 ? (isCurrent ? instrument.color : currentPattern.color) : 'rgba(255,255,255,0.1)',
                borderColor: isActive ? 'var(--accent-primary)' : 'var(--glass-border)'
              }}
              transition={{ duration: 0.1 }}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '2px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
              onClick={() => {
                if (gameMode === 'create') {
                  const newPattern = [...pattern];
                  newPattern[index] = newPattern[index] === 1 ? 0 : 1;
                  if (isCurrent) {
                    setUserPattern(newPattern);
                  } else {
                    // This would update the current pattern in create mode
                  }
                }
              }}
            >
              {step === 1 ? '●' : '○'}
              {isActive && <div style={{
                position: 'absolute',
                top: '-5px',
                fontSize: '0.6rem',
                color: 'var(--accent-primary)'
              }}>↓</div>}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return '#10b981';
    if (accuracy >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Rhythm Trainer</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Develop your rhythm skills. Listen to patterns, repeat them, or create your own.
        </p>
      </div>

      {/* Game Stats */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '15px 20px', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          minWidth: '100px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{score}</div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '15px 20px', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          minWidth: '100px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Streak</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: streak > 0 ? '#10b981' : '#ef4444' }}>{streak}</div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '15px 20px', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          minWidth: '100px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BPM</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>{bpm}</div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '15px 20px', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          minWidth: '100px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Difficulty</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: currentPattern.color }}>
            {currentPattern.difficulty}/5
          </div>
        </div>
      </div>

      {/* Game Mode Selection */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['listen', 'repeat', 'create'].map(mode => (
          <button
            key={mode}
            className={`btn-glass ${gameMode === mode ? 'active' : ''}`}
            onClick={() => setGameMode(mode)}
            style={{ 
              padding: '10px 20px',
              textTransform: 'capitalize',
              background: gameMode === mode ? 'var(--accent-primary)' : undefined
            }}
          >
            {mode === 'listen' && '👂 Listen'}
            {mode === 'repeat' && '🔁 Repeat'}
            {mode === 'create' && '🎵 Create'}
          </button>
        ))}
      </div>

      {/* Pattern Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Rhythm Pattern</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {RHYTHM_PATTERNS.map(pattern => (
            <button
              key={pattern.name}
              className={`btn-glass ${currentPattern.name === pattern.name ? 'active' : ''}`}
              onClick={() => {
                setCurrentPattern(pattern);
                setBpm(pattern.bpm);
              }}
              style={{ 
                padding: '8px 15px',
                borderColor: pattern.color,
                color: pattern.color,
                background: currentPattern.name === pattern.name ? `${pattern.color}40` : undefined
              }}
            >
              {pattern.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Pattern Display */}
      <div style={{ 
        width: '100%', 
        maxWidth: '800px',
        background: 'rgba(255,255,255,0.05)',
        border: `2px solid ${currentPattern.color}80`,
        borderRadius: '16px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: currentPattern.color }}>
            {currentPattern.name}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {currentPattern.description} • {currentPattern.pattern.length} steps • {currentPattern.bpm} BPM
          </div>
        </div>

        {/* Pattern Visualization */}
        {showVisualizer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Target Pattern:
            </div>
            {getPatternVisualization(currentPattern.pattern)}
          </div>
        )}

        {/* User Pattern (for repeat mode) */}
        {gameMode === 'repeat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Your Pattern ({userPattern.length}/{currentPattern.pattern.length}):
            </div>
            {getPatternVisualization(
              [...userPattern, ...Array(currentPattern.pattern.length - userPattern.length).fill(0)], 
              true
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn-glass"
            onClick={() => playPattern(currentPattern.pattern, activeInstrument)}
            disabled={isPlaying}
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Playing...' : 'Play Pattern'}
          </button>
          
          {gameMode === 'repeat' && (
            <button
              className={`btn-glass ${isRecording ? 'active' : ''}`}
              onClick={isRecording ? () => setIsRecording(false) : startRecording}
              style={{ 
                padding: '10px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: isRecording ? '#ef4444' : undefined
              }}
            >
              {isRecording ? '⏺️ Recording...' : '⏺️ Start Recording'}
            </button>
          )}
          
          {gameMode === 'repeat' && (
            <button
              className="btn-glass"
              onClick={checkPattern}
              disabled={userPattern.length === 0}
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Check size={16} /> Check Answer
            </button>
          )}
          
          <button
            className="btn-glass"
            onClick={clearUserPattern}
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <X size={16} /> Clear
          </button>
        </div>
      </div>

      {/* Instrument Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Select Instrument</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {INSTRUMENTS.map(instrument => (
            <button
              key={instrument.id}
              className={`btn-glass ${activeInstrument === instrument.id ? 'active' : ''}`}
              onClick={() => setActiveInstrument(instrument.id)}
              style={{ 
                padding: '10px 15px',
                borderColor: instrument.color,
                color: instrument.color,
                background: activeInstrument === instrument.id ? `${instrument.color}40` : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Drum size={16} />
              {instrument.name}
            </button>
          ))}
        </div>
      </div>

      {/* BPM Control */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tempo: {bpm} BPM</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className="btn-glass"
            onClick={() => setBpm(prev => Math.max(40, prev - 10))}
            style={{ padding: '8px 12px' }}
          >
            -
          </button>
          
          <input 
            type="range" min="40" max="200" step="1" 
            value={bpm} 
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{ width: '200px', accentColor: 'var(--accent-primary)' }}
          />
          
          <button
            className="btn-glass"
            onClick={() => setBpm(prev => Math.min(200, prev + 10))}
            style={{ padding: '8px 12px' }}
          >
            +
          </button>
        </div>
      </div>

      {/* Metronome Control */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Metronome:</label>
        <button
          className={`btn-glass ${metronomeOn ? 'active' : ''}`}
          onClick={() => setMetronomeOn(!metronomeOn)}
          style={{ padding: '8px 15px' }}
        >
          {metronomeOn ? '🔊 On' : '🔇 Off'}
        </button>
      </div>

      {/* Game History */}
      {gameHistory.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Recent Attempts</h4>
          <div style={{ 
            width: '100%', 
            maxWidth: '600px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            padding: '15px'
          }}>
            {gameHistory.slice(-5).map((attempt, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  marginBottom: '5px'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{attempt.pattern}</div>
                <div style={{ 
                  fontSize: '0.8rem',
                  color: attempt.correct ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {attempt.correct ? <Check size={12} /> : <X size={12} />}
                  {attempt.correct ? `Correct ${attempt.accuracy ? `(${Math.round(attempt.accuracy * 100)}%)` : ''}` : 'Incorrect'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Play Pads */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Quick Play</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {INSTRUMENTS.map(instrument => (
            <button
              key={instrument.id}
              className="btn-glass"
              onMouseDown={() => playStep(0, instrument.id)}
              style={{ 
                padding: '15px',
                borderColor: instrument.color,
                color: instrument.color,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Drum size={24} />
              <div style={{ fontSize: '0.8rem' }}>{instrument.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
          Listen to rhythm patterns and try to repeat them. Adjust BPM to change difficulty.
          Use different instruments for variety. Create your own patterns in Create mode.
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
            <div style={{ color: '#10b981', fontWeight: 600 }}>Listen Mode</div>
            <div style={{ color: 'var(--text-muted)' }}>Hear and analyze patterns</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#3b82f6', fontWeight: 600 }}>Repeat Mode</div>
            <div style={{ color: 'var(--text-muted)' }}>Listen then repeat pattern</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#8b5cf6', fontWeight: 600 }}>Create Mode</div>
            <div style={{ color: 'var(--text-muted)' }}>Design your own rhythms</div>
          </div>
        </div>
      </div>
    </div>
  );
}