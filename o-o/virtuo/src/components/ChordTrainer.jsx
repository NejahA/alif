import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Target, Check, X, Volume2, Timer, Award } from 'lucide-react';
import masterBus from '../audio/masterBus';

const CHORDS = [
  { name: 'C Major', notes: ['C4', 'E4', 'G4'], difficulty: 1, color: '#10b981' },
  { name: 'G Major', notes: ['G3', 'B3', 'D4'], difficulty: 1, color: '#3b82f6' },
  { name: 'D Minor', notes: ['D3', 'F3', 'A3'], difficulty: 2, color: '#8b5cf6' },
  { name: 'A Minor', notes: ['A3', 'C4', 'E4'], difficulty: 2, color: '#ec4899' },
  { name: 'E Major', notes: ['E3', 'G#3', 'B3'], difficulty: 3, color: '#f59e0b' },
  { name: 'F Major', notes: ['F3', 'A3', 'C4'], difficulty: 3, color: '#ef4444' },
  { name: 'B Minor', notes: ['B3', 'D4', 'F#4'], difficulty: 4, color: '#06b6d4' },
  { name: 'A Major 7th', notes: ['A3', 'C#4', 'E4', 'G#4'], difficulty: 4, color: '#84cc16' },
  { name: 'D Major 7th', notes: ['D3', 'F#3', 'A3', 'C#4'], difficulty: 5, color: '#f97316' },
  { name: 'G Minor 7th', notes: ['G3', 'Bb3', 'D4', 'F4'], difficulty: 5, color: '#8b5cf6' },
];

const CHORD_TYPES = [
  { type: 'major', symbol: 'M', description: 'Happy, bright sound' },
  { type: 'minor', symbol: 'm', description: 'Sad, melancholic sound' },
  { type: '7th', symbol: '7', description: 'Bluesy, jazzy sound' },
  { type: 'maj7', symbol: 'M7', description: 'Dreamy, sophisticated' },
  { type: 'dim', symbol: '°', description: 'Tense, unstable' },
  { type: 'aug', symbol: '+', description: 'Suspenseful, rising' },
];

export default function ChordTrainer() {
  const synthRef = useRef(null);
  const [currentChord, setCurrentChord] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState('identify'); // 'identify' or 'play'
  const [difficulty, setDifficulty] = useState(2); // 1-5
  const [showHint, setShowHint] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
    }).connect(masterBus);

    startNewRound();

    // Timer
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else {
        endGame();
      }
    }, 1000);

    return () => {
      synthRef.current?.dispose();
      clearInterval(timer);
    };
  }, []);

  const startNewRound = () => {
    const filteredChords = CHORDS.filter(c => c.difficulty <= difficulty);
    const randomChord = filteredChords[Math.floor(Math.random() * filteredChords.length)];
    setCurrentChord(randomChord);
    setUserAnswer('');
    setShowHint(false);
  };

  const playChord = async (chordNotes) => {
    await Tone.start();
    if (synthRef.current) {
      chordNotes.forEach((note, i) => {
        setTimeout(() => {
          synthRef.current.triggerAttackRelease(note, '2n');
        }, i * 100);
      });
    }
  };

  const playCurrentChord = async () => {
    if (currentChord) {
      await playChord(currentChord.notes);
    }
  };

  const checkAnswer = () => {
    if (!userAnswer || !currentChord) return;

    const isCorrect = userAnswer.toLowerCase() === currentChord.name.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 10 * difficulty);
      setStreak(prev => prev + 1);
      setGameHistory(prev => [...prev, { chord: currentChord.name, correct: true, time: new Date().toISOString() }]);
      
      // Play success sound
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(['C5', 'E5', 'G5'], '4n');
      }
    } else {
      setStreak(0);
      setGameHistory(prev => [...prev, { chord: currentChord.name, correct: false, time: new Date().toISOString() }]);
      
      // Play error sound
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(['C3', 'D#3', 'F#3'], '8n');
      }
    }

    setTimeout(() => {
      startNewRound();
    }, 1000);
  };

  const endGame = () => {
    setIsPlaying(false);
    // Save high score
    const highScore = localStorage.getItem('virtuo_chord_highscore') || 0;
    if (score > highScore) {
      localStorage.setItem('virtuo_chord_highscore', score.toString());
    }
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setIsPlaying(true);
    startNewRound();
  };

  const getChordProgression = () => {
    const progressions = [
      ['C Major', 'G Major', 'A Minor', 'F Major'],
      ['D Minor', 'G Major', 'C Major', 'A Minor'],
      ['E Major', 'A Major 7th', 'B Minor', 'G Major'],
      ['F Major', 'Bb Major', 'C Major', 'G Minor 7th'],
    ];
    
    return progressions[Math.floor(Math.random() * progressions.length)];
  };

  const playProgression = async (progression) => {
    await Tone.start();
    progression.forEach((chordName, index) => {
      setTimeout(() => {
        const chord = CHORDS.find(c => c.name === chordName);
        if (chord && synthRef.current) {
          chord.notes.forEach(note => {
            synthRef.current.triggerAttackRelease(note, '2n');
          });
        }
      }, index * 1000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Chord Trainer</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Learn to identify and play chords by ear. Improve your musical recognition skills.
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: timeLeft > 10 ? '#10b981' : '#ef4444' }}>{timeLeft}s</div>
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
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>{difficulty}/5</div>
        </div>
      </div>

      {/* Game Controls */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className={`btn-glass ${isPlaying ? 'active' : ''}`}
          onClick={isPlaying ? endGame : startGame}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isPlaying ? '⏹️ Stop Game' : '▶️ Start Game'}
        </button>
        
        <button
          className="btn-glass"
          onClick={playCurrentChord}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={!currentChord}
        >
          <Volume2 size={16} /> Play Chord
        </button>
        
        <button
          className="btn-glass"
          onClick={() => setShowHint(!showHint)}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
        </button>
      </div>

      {/* Difficulty Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Difficulty Level</label>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              className={`btn-glass ${difficulty === level ? 'active' : ''}`}
              onClick={() => setDifficulty(level)}
              style={{ 
                padding: '8px 12px',
                background: difficulty === level ? `hsl(${level * 60}, 70%, 40%)` : undefined
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Current Chord Display */}
      {currentChord && (
        <div style={{ 
          width: '100%', 
          maxWidth: '800px',
          background: 'rgba(255,255,255,0.05)',
          border: `2px solid ${currentChord.color}80`,
          borderRadius: '16px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Listen to this chord:</div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: currentChord.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'white',
                boxShadow: `0 0 20px ${currentChord.color}80`
              }}>
                ?
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>What chord is this?</div>
                
                {showHint && (
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginTop: '5px'
                  }}>
                    Hint: Contains notes {currentChord.notes.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Answer Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '400px' }}>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter chord name (e.g., C Major)"
              className="btn-glass"
              style={{ 
                padding: '12px 20px',
                fontSize: '1rem',
                textAlign: 'center',
                border: '2px solid var(--glass-border)'
              }}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-glass"
                onClick={checkAnswer}
                style={{ 
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  borderColor: '#10b981'
                }}
                disabled={!userAnswer}
              >
                <Check size={16} /> Submit Answer
              </button>
              
              <button
                className="btn-glass"
                onClick={startNewRound}
                style={{ 
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  borderColor: '#ef4444'
                }}
              >
                <X size={16} /> Skip
              </button>
            </div>
          </div>

          {/* Chord Notes Visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Chord contains these notes:
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {currentChord.notes.map((note, index) => (
                <motion.div
                  key={note}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    padding: '10px 20px',
                    background: currentChord.color,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Music size={16} />
                  {note}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chord Types Reference */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Chord Types Reference</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '600px' }}>
          {CHORD_TYPES.map(chordType => (
            <div
              key={chordType.type}
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {chordType.symbol}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                {chordType.type}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {chordType.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Progressions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Common Progressions</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {getChordProgression().map((chord, index) => {
            const chordData = CHORDS.find(c => c.name === chord);
            return (
              <button
                key={index}
                className="btn-glass"
                onClick={() => {
                  if (chordData) {
                    playChord(chordData.notes);
                  }
                }}
                style={{ 
                  padding: '8px 15px',
                  borderColor: chordData?.color || 'var(--glass-border)',
                  color: chordData?.color || 'var(--text-main)'
                }}
              >
                {chord}
              </button>
            );
          })}
        </div>
        <button
          className="btn-glass"
          onClick={() => playProgression(getChordProgression())}
          style={{ padding: '8px 15px', fontSize: '0.9rem' }}
        >
          <Music size={16} /> Play Full Progression
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
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{attempt.chord}</div>
                <div style={{ 
                  fontSize: '0.8rem',
                  color: attempt.correct ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {attempt.correct ? <Check size={12} /> : <X size={12} />}
                  {attempt.correct ? 'Correct' : 'Incorrect'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
          Listen to chords and identify them by name. Higher difficulty includes more complex chords.
          Build your streak for bonus points. Practice common chord progressions.
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
            <div style={{ color: '#10b981', fontWeight: 600 }}>Listen</div>
            <div style={{ color: 'var(--text-muted)' }}>Play chord to hear it</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#3b82f6', fontWeight: 600 }}>Identify</div>
            <div style={{ color: 'var(--text-muted)' }}>Enter chord name</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: '#8b5cf6', fontWeight: 600 }}>Practice</div>
            <div style={{ color: 'var(--text-muted)' }}>Common progressions</div>
          </div>
        </div>
      </div>
    </div>
  );
}