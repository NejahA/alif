import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Volume2, Target, Award, Zap, Brain, Headphones, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import masterBus from '../audio/masterBus';

const EXERCISE_TYPES = [
  { id: 'interval', name: 'Interval Recognition', color: '#10b981', description: 'Identify the distance between two notes' },
  { id: 'chord', name: 'Chord Quality', color: '#3b82f6', description: 'Identify major, minor, diminished, augmented chords' },
  { id: 'scale', name: 'Scale Identification', color: '#ef4444', description: 'Recognize different scales by ear' },
  { id: 'melody', name: 'Melodic Dictation', color: '#8b5cf6', description: 'Transcribe short melodies' },
  { id: 'rhythm', name: 'Rhythm Recognition', color: '#f59e0b', description: 'Identify rhythmic patterns' },
];

const INTERVALS = [
  { name: 'Perfect Unison', semitones: 0, difficulty: 1 },
  { name: 'Minor Second', semitones: 1, difficulty: 2 },
  { name: 'Major Second', semitones: 2, difficulty: 2 },
  { name: 'Minor Third', semitones: 3, difficulty: 3 },
  { name: 'Major Third', semitones: 4, difficulty: 3 },
  { name: 'Perfect Fourth', semitones: 5, difficulty: 4 },
  { name: 'Tritone', semitones: 6, difficulty: 5 },
  { name: 'Perfect Fifth', semitones: 7, difficulty: 4 },
  { name: 'Minor Sixth', semitones: 8, difficulty: 5 },
  { name: 'Major Sixth', semitones: 9, difficulty: 5 },
  { name: 'Minor Seventh', semitones: 10, difficulty: 6 },
  { name: 'Major Seventh', semitones: 11, difficulty: 6 },
  { name: 'Perfect Octave', semitones: 12, difficulty: 1 },
];

const CHORDS = [
  { name: 'Major', notes: [0, 4, 7], color: '#10b981' },
  { name: 'Minor', notes: [0, 3, 7], color: '#3b82f6' },
  { name: 'Diminished', notes: [0, 3, 6], color: '#ef4444' },
  { name: 'Augmented', notes: [0, 4, 8], color: '#8b5cf6' },
  { name: 'Major 7th', notes: [0, 4, 7, 11], color: '#f59e0b' },
  { name: 'Minor 7th', notes: [0, 3, 7, 10], color: '#22c55e' },
];

export default function EarTraining() {
  const synthRef = useRef(null);
  const [currentExercise, setCurrentExercise] = useState('interval');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [volume, setVolume] = useState(0.5);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    bestStreak: 0,
  });

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
    }).connect(masterBus);

    // Load stats from localStorage
    const savedStats = localStorage.getItem('virtuo_ear_training_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    }

    generateQuestion();

    return () => {
      synthRef.current?.dispose();
    };
  }, [currentExercise, difficulty]);

  const saveStats = () => {
    localStorage.setItem('virtuo_ear_training_stats', JSON.stringify(stats));
  };

  const generateQuestion = () => {
    setUserAnswer(null);
    setFeedback(null);

    if (currentExercise === 'interval') {
      // Filter intervals by difficulty
      const availableIntervals = INTERVALS.filter(i => i.difficulty <= difficulty);
      const interval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
      
      // Generate random root note (C3 to C5)
      const rootNote = Math.floor(Math.random() * 13) + 48; // MIDI note 48-60 (C3 to C5)
      
      setCurrentQuestion({
        type: 'interval',
        correctAnswer: interval.name,
        rootNote,
        intervalSemitones: interval.semitones,
        options: shuffleArray([
          interval.name,
          ...INTERVALS.filter(i => i.name !== interval.name && i.difficulty <= difficulty)
            .slice(0, 3)
            .map(i => i.name)
        ]),
      });
    } else if (currentExercise === 'chord') {
      const chord = CHORDS[Math.floor(Math.random() * CHORDS.length)];
      const rootNote = Math.floor(Math.random() * 13) + 48;
      
      setCurrentQuestion({
        type: 'chord',
        correctAnswer: chord.name,
        rootNote,
        chordNotes: chord.notes,
        options: shuffleArray([
          chord.name,
          ...CHORDS.filter(c => c.name !== chord.name)
            .slice(0, 3)
            .map(c => c.name)
        ]),
      });
    } else {
      // For other exercise types, generate simple questions
      const rootNote = Math.floor(Math.random() * 13) + 48;
      const scaleType = Math.random() > 0.5 ? 'Major' : 'Minor';
      
      setCurrentQuestion({
        type: currentExercise,
        correctAnswer: scaleType,
        rootNote,
        options: shuffleArray(['Major', 'Minor', 'Diminished', 'Augmented']),
      });
    }
  };

  const playQuestion = async () => {
    if (isPlaying) return;
    
    await Tone.start();
    setIsPlaying(true);
    
    if (currentExercise === 'interval' && currentQuestion) {
      const { rootNote, intervalSemitones } = currentQuestion;
      
      // Play first note
      synthRef.current.triggerAttackRelease(Tone.Midi(rootNote).toFrequency(), '1n');
      
      // Play second note after 1 second
      setTimeout(() => {
        synthRef.current.triggerAttackRelease(Tone.Midi(rootNote + intervalSemitones).toFrequency(), '1n');
        setIsPlaying(false);
      }, 1000);
    } else if (currentExercise === 'chord' && currentQuestion) {
      const { rootNote, chordNotes } = currentQuestion;
      
      // Play chord
      chordNotes.forEach((semitone, index) => {
        setTimeout(() => {
          synthRef.current.triggerAttackRelease(Tone.Midi(rootNote + semitone).toFrequency(), '2n');
        }, index * 100);
      });
      
      setTimeout(() => setIsPlaying(false), chordNotes.length * 100 + 500);
    } else {
      // Play simple scale or melody
      const notes = [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
      notes.forEach((semitone, index) => {
        setTimeout(() => {
          synthRef.current.triggerAttackRelease(Tone.Midi(currentQuestion.rootNote + semitone).toFrequency(), '8n');
        }, index * 200);
      });
      
      setTimeout(() => setIsPlaying(false), notes.length * 200 + 500);
    }
  };

  const submitAnswer = (answer) => {
    if (!currentQuestion || userAnswer !== null) return;
    
    setUserAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      setFeedback({ type: 'correct', message: 'Excellent! Well done!' });
    } else {
      setStreak(0);
      setFeedback({ 
        type: 'incorrect', 
        message: `Incorrect. The answer was ${currentQuestion.correctAnswer}.` 
      });
    }
    
    // Update stats
    const newStats = {
      totalQuestions: stats.totalQuestions + 1,
      correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
      accuracy: Math.round(((stats.correctAnswers + (isCorrect ? 1 : 0)) / (stats.totalQuestions + 1)) * 100),
      bestStreak: Math.max(stats.bestStreak, isCorrect ? streak + 1 : 0),
    };
    
    setStats(newStats);
    saveStats();
    
    // Auto-generate next question after delay
    setTimeout(() => {
      generateQuestion();
    }, 2000);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const resetStats = () => {
    const newStats = {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      bestStreak: 0,
    };
    setStats(newStats);
    setScore(0);
    setStreak(0);
    localStorage.removeItem('virtuo_ear_training_stats');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Ear Training</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Develop your musical ear with interactive exercises. Improve your ability to recognize intervals, chords, and scales.
        </p>
      </div>

      {/* Stats and Score */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score</div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: 'var(--accent-primary)',
            background: 'rgba(138, 43, 226, 0.1)',
            padding: '10px 20px',
            borderRadius: '8px'
          }}>
            {score}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Streak</div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: streak > 0 ? '#22c55e' : '#ef4444',
            background: streak > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '10px 20px',
            borderRadius: '8px'
          }}>
            {streak} 🔥
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: stats.accuracy > 70 ? '#22c55e' : stats.accuracy > 50 ? '#f59e0b' : '#ef4444',
            background: 'rgba(255,255,255,0.05)',
            padding: '10px 20px',
            borderRadius: '8px'
          }}>
            {stats.accuracy}%
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Best Streak</div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#8b5cf6',
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '10px 20px',
            borderRadius: '8px'
          }}>
            {stats.bestStreak}
          </div>
        </div>
      </div>

      {/* Exercise Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Select Exercise</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {EXERCISE_TYPES.map(exercise => (
            <button
              key={exercise.id}
              className={`btn-glass ${currentExercise === exercise.id ? 'active' : ''}`}
              onClick={() => setCurrentExercise(exercise.id)}
              style={{ 
                padding: '10px 15px',
                borderColor: exercise.color,
                color: exercise.color,
                background: currentExercise === exercise.id ? `${exercise.color}40` : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Headphones size={16} />
              {exercise.name}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty and Controls */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Difficulty: {difficulty}/6</label>
          <input 
            type="range" min="1" max="6" step="1" 
            value={difficulty} 
            onChange={(e) => setDifficulty(Number(e.target.value))}
            style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volume</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Volume2 size={14} color="var(--text-muted)" />
            <input 
              type="range" min="0" max="1" step="0.1" 
              value={volume} 
              onChange={(e) => {
                setVolume(Number(e.target.value));
                synthRef.current.volume.value = Tone.gainToDb(Number(e.target.value));
              }}
              style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        <button
          className="btn-glass"
          onClick={resetStats}
          style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} /> Reset Stats
        </button>
      </div>

      {/* Question Area */}
      <div style={{ 
        width: '100%', 
        maxWidth: '800px',
        minHeight: '300px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        {currentQuestion ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {EXERCISE_TYPES.find(e => e.id === currentExercise)?.description}
              </div>
              
              <button
                className={`btn-glass ${isPlaying ? 'active' : ''}`}
                onClick={playQuestion}
                disabled={isPlaying}
                style={{ 
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {isPlaying ? (
                  <>
                    <Zap size={20} /> Playing...
                  </>
                ) : (
                  <>
                    <Headphones size={20} /> Play Question
                  </>
                )}
              </button>
            </div>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '600px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Select your answer:
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`btn-glass ${userAnswer === option ? (option === currentQuestion.correctAnswer ? 'active' : 'error') : ''}`}
                    onClick={() => submitAnswer(option)}
                    disabled={userAnswer !== null}
                    style={{ 
                      padding: '12px 20px',
                      fontSize: '0.9rem',
                      borderColor: option === currentQuestion.correctAnswer && userAnswer ? '#22c55e' : 
                                  userAnswer === option && option !== currentQuestion.correctAnswer ? '#ef4444' : 'var(--glass-border)',
                      color: option === currentQuestion.correctAnswer && userAnswer ? '#22c55e' : 
                            userAnswer === option && option !== currentQuestion.correctAnswer ? '#ef4444' : 'var(--text-main)',
                      flex: '1',
                      minWidth: '120px'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '15px 25px',
                  background: feedback.type === 'correct' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${feedback.type === 'correct' ? '#22c55e' : '#ef4444'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {feedback.type === 'correct' ? (
                  <CheckCircle size={20} color="#22c55e" />
                ) : (
                  <XCircle size={20} color="#ef4444" />
                )}
                <div style={{ 
                  color: feedback.type === 'correct' ? '#22c55e' : '#ef4444',
                  fontSize: '0.9rem'
                }}>
                  {feedback.message}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '200px',
            color: 'var(--text-muted)',
            gap: '10px'
          }}>
            <Brain size={32} />
            <div>Loading exercise...</div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '15px', 
        marginTop: '20px',
        background: 'rgba(0,0,0,0.2)', 
        padding: '20px', 
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px'
      }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Your Progress</h4>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Questions</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
              {stats.totalQuestions}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correct Answers</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#22c55e' }}>
              {stats.correctAnswers}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: stats.accuracy > 70 ? '#22c55e' : '#f59e0b' }}>
              {stats.accuracy}%
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Best Streak</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#8b5cf6' }}>
              {stats.bestStreak}
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', marginTop: '10px' }}>
          Keep practicing to improve your musical ear! Regular training will help you recognize intervals, chords, and scales more quickly.
        </div>
      </div>
    </div>
  );
}