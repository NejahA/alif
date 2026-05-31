import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Award, Trophy, Star, Clock, CheckCircle, XCircle, RefreshCw, TrendingUp, HelpCircle } from 'lucide-react';

const QUIZ_CATEGORIES = [
  { id: 'basics', name: 'Music Basics', color: '#10b981', icon: '🎵' },
  { id: 'scales', name: 'Scales & Modes', color: '#3b82f6', icon: '🎼' },
  { id: 'chords', name: 'Chords & Harmony', color: '#ef4444', icon: '🎹' },
  { id: 'rhythm', name: 'Rhythm & Meter', color: '#8b5cf6', icon: '🥁' },
  { id: 'notation', name: 'Music Notation', color: '#f59e0b', icon: '📝' },
  { id: 'history', name: 'Music History', color: '#22c55e', icon: '🏛️' },
];

const QUIZ_QUESTIONS = {
  basics: [
    {
      question: 'What is the distance between two notes called?',
      options: ['Interval', 'Chord', 'Scale', 'Octave'],
      correctAnswer: 'Interval',
      explanation: 'An interval is the distance between two pitches.'
    },
    {
      question: 'How many notes are in an octave?',
      options: ['7', '8', '12', '5'],
      correctAnswer: '12',
      explanation: 'There are 12 semitones (half steps) in an octave in Western music.'
    },
    {
      question: 'What does "forte" mean in music?',
      options: ['Soft', 'Loud', 'Fast', 'Slow'],
      correctAnswer: 'Loud',
      explanation: 'Forte (f) means to play loudly.'
    },
    {
      question: 'What is the symbol for "soft" in music?',
      options: ['f', 'p', 'mf', 'mp'],
      correctAnswer: 'p',
      explanation: 'Piano (p) means to play softly.'
    },
    {
      question: 'What is the time signature 4/4 also known as?',
      options: ['Waltz time', 'Cut time', 'Common time', 'Compound time'],
      correctAnswer: 'Common time',
      explanation: '4/4 time is called common time because it is the most frequently used time signature.'
    }
  ],
  scales: [
    {
      question: 'How many notes are in a major scale?',
      options: ['5', '6', '7', '8'],
      correctAnswer: '7',
      explanation: 'A major scale has 7 different notes before repeating at the octave.'
    },
    {
      question: 'What is the pattern of whole and half steps in a major scale?',
      options: ['W-W-H-W-W-W-H', 'W-H-W-W-H-W-W', 'W-W-H-W-W-H-W', 'W-H-W-W-W-H-W'],
      correctAnswer: 'W-W-H-W-W-W-H',
      explanation: 'Major scale pattern: Whole, Whole, Half, Whole, Whole, Whole, Half.'
    },
    {
      question: 'Which scale has a sad or melancholic sound?',
      options: ['Major scale', 'Minor scale', 'Pentatonic scale', 'Chromatic scale'],
      correctAnswer: 'Minor scale',
      explanation: 'Minor scales typically have a sad or melancholic quality compared to major scales.'
    },
    {
      question: 'What is the relative minor of C major?',
      options: ['A minor', 'E minor', 'G minor', 'D minor'],
      correctAnswer: 'A minor',
      explanation: 'A minor shares the same key signature as C major (no sharps or flats).'
    },
    {
      question: 'How many modes are there in Western music?',
      options: ['5', '6', '7', '8'],
      correctAnswer: '7',
      explanation: 'There are 7 modes: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian.'
    }
  ],
  chords: [
    {
      question: 'What notes make up a C major chord?',
      options: ['C-E-G', 'C-Eb-G', 'C-E-G#', 'C-F-G'],
      correctAnswer: 'C-E-G',
      explanation: 'A major chord consists of root, major third, and perfect fifth.'
    },
    {
      question: 'What is a triad?',
      options: ['A three-note chord', 'A four-note chord', 'A scale with three notes', 'A rhythm pattern'],
      correctAnswer: 'A three-note chord',
      explanation: 'A triad is a three-note chord built in thirds.'
    },
    {
      question: 'What is the dominant chord in the key of C major?',
      options: ['C major', 'F major', 'G major', 'A minor'],
      correctAnswer: 'G major',
      explanation: 'The dominant chord is built on the fifth scale degree (G in C major).'
    },
    {
      question: 'What type of chord is C-E-G#?',
      options: ['Major', 'Minor', 'Diminished', 'Augmented'],
      correctAnswer: 'Augmented',
      explanation: 'An augmented chord has a root, major third, and augmented fifth.'
    },
    {
      question: 'What is a seventh chord?',
      options: ['A chord with 7 notes', 'A chord spanning 7 octaves', 'A four-note chord', 'A chord used in jazz'],
      correctAnswer: 'A four-note chord',
      explanation: 'A seventh chord adds a seventh above the root to a triad.'
    }
  ],
  rhythm: [
    {
      question: 'What is the basic unit of time in music?',
      options: ['Beat', 'Measure', 'Note', 'Rest'],
      correctAnswer: 'Beat',
      explanation: 'The beat is the basic unit of time, the pulse of the music.'
    },
    {
      question: 'How many beats does a whole note get in 4/4 time?',
      options: ['1', '2', '3', '4'],
      correctAnswer: '4',
      explanation: 'A whole note lasts for four beats in 4/4 time.'
    },
    {
      question: 'What is syncopation?',
      options: ['Regular rhythm', 'Off-beat rhythm', 'Fast tempo', 'Slow tempo'],
      correctAnswer: 'Off-beat rhythm',
      explanation: 'Syncopation emphasizes weak beats or off-beats.'
    },
    {
      question: 'What does "andante" mean?',
      options: ['Very fast', 'Walking pace', 'Very slow', 'Moderately fast'],
      correctAnswer: 'Walking pace',
      explanation: 'Andante means at a walking pace (moderately slow).'
    },
    {
      question: 'What is a time signature?',
      options: ['The key of the piece', 'The speed of the music', 'The pattern of beats', 'The melody line'],
      correctAnswer: 'The pattern of beats',
      explanation: 'Time signature indicates how many beats are in each measure and which note value gets one beat.'
    }
  ],
  notation: [
    {
      question: 'What does a sharp symbol (#) do to a note?',
      options: ['Lowers it by a half step', 'Raises it by a half step', 'Lowers it by a whole step', 'Raises it by a whole step'],
      correctAnswer: 'Raises it by a half step',
      explanation: 'A sharp raises a note by one half step (semitone).'
    },
    {
      question: 'What is the symbol for a flat?',
      options: ['#', 'b', '♮', '&'],
      correctAnswer: 'b',
      explanation: 'The flat symbol (♭) lowers a note by one half step.'
    },
    {
      question: 'What does a dot after a note do?',
      options: ['Makes it louder', 'Adds half its value', 'Makes it staccato', 'Changes its pitch'],
      correctAnswer: 'Adds half its value',
      explanation: 'A dotted note increases the duration by half of its original value.'
    },
    {
      question: 'What are ledger lines?',
      options: ['Lines connecting notes', 'Lines above or below the staff', 'Bar lines', 'Time signature lines'],
      correctAnswer: 'Lines above or below the staff',
      explanation: 'Ledger lines extend the staff for notes that are too high or too low.'
    },
    {
      question: 'What does a fermata (𝄐) indicate?',
      options: ['Play louder', 'Hold the note longer', 'Play softer', 'Play faster'],
      correctAnswer: 'Hold the note longer',
      explanation: 'A fermata indicates that a note should be held longer than its normal duration.'
    }
  ],
  history: [
    {
      question: 'Which period followed the Renaissance?',
      options: ['Baroque', 'Classical', 'Romantic', 'Modern'],
      correctAnswer: 'Baroque',
      explanation: 'The Baroque period (1600-1750) followed the Renaissance.'
    },
    {
      question: 'Who composed the "Moonlight Sonata"?',
      options: ['Mozart', 'Beethoven', 'Bach', 'Chopin'],
      correctAnswer: 'Beethoven',
      explanation: 'Ludwig van Beethoven composed the "Moonlight Sonata" (Piano Sonata No. 14).'
    },
    {
      question: 'What instrument did Paganini famously play?',
      options: ['Piano', 'Violin', 'Cello', 'Flute'],
      correctAnswer: 'Violin',
      explanation: 'Niccolò Paganini was a famous violin virtuoso.'
    },
    {
      question: 'Which composer is known for his symphonies and went deaf?',
      options: ['Mozart', 'Beethoven', 'Haydn', 'Schubert'],
      correctAnswer: 'Beethoven',
      explanation: 'Ludwig van Beethoven continued to compose even after becoming deaf.'
    },
    {
      question: 'What is the "Well-Tempered Clavier"?',
      options: ['A piano', 'A composition by Bach', 'A tuning system', 'A music theory book'],
      correctAnswer: 'A composition by Bach',
      explanation: 'The Well-Tempered Clavier is a collection of preludes and fugues by J.S. Bach.'
    }
  ]
};

export default function MusicTheoryQuiz() {
  const [currentCategory, setCurrentCategory] = useState('basics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestions = QUIZ_QUESTIONS[currentCategory];
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = currentQuestions.length;
  const questionsAnswered = Object.keys(userAnswers).length;
  const correctAnswers = Object.values(userAnswers).filter(answer => answer.isCorrect).length;
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

  useEffect(() => {
    let timer;
    if (timerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setQuizCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeRemaining]);

  const startQuiz = () => {
    setQuizStarted(true);
    setTimerActive(true);
    setTimeRemaining(60);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setScore(0);
    setShowExplanation(false);
  };

  const submitAnswer = (answer) => {
    if (userAnswers[currentQuestionIndex]) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    const newUserAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: {
        answer,
        isCorrect,
        timestamp: Date.now()
      }
    };
    
    setUserAnswers(newUserAnswers);
    setShowExplanation(true);
    
    if (isCorrect) {
      setScore(prev => prev + 10);
    }
    
    // Auto-advance after showing explanation
    setTimeout(() => {
      setShowExplanation(false);
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setQuizCompleted(true);
        setTimerActive(false);
      }
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      setTimerActive(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeRemaining(60);
    setTimerActive(false);
    setShowExplanation(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Music Theory Quiz</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Test your knowledge of music theory with interactive quizzes. Learn while you play!
        </p>
      </div>

      {/* Category Selection */}
      {!quizStarted && !quizCompleted && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Select Quiz Category</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {QUIZ_CATEGORIES.map(category => (
              <button
                key={category.id}
                className={`btn-glass ${currentCategory === category.id ? 'active' : ''}`}
                onClick={() => setCurrentCategory(category.id)}
                style={{ 
                  padding: '15px 20px',
                  borderColor: category.color,
                  color: category.color,
                  background: currentCategory === category.id ? `${category.color}40` : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '120px'
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>{category.icon}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{category.name}</div>
              </button>
            ))}
          </div>
          
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '20px', 
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            marginTop: '10px'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
              {QUIZ_CATEGORIES.find(c => c.id === currentCategory)?.name} Quiz
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.8, textAlign: 'center' }}>
              {currentQuestions.length} questions • 60 seconds • Multiple choice
            </div>
          </div>
          
          <button
            className="btn-glass active"
            onClick={startQuiz}
            style={{ 
              padding: '15px 30px',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '10px'
            }}
          >
            <Play size={20} /> Start Quiz
          </button>
        </div>
      )}

      {/* Quiz in Progress */}
      {quizStarted && !quizCompleted && (
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {/* Quiz Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                padding: '8px 15px',
                background: 'rgba(138, 43, 226, 0.1)',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--accent-primary)'
              }}>
                {currentCategory.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={16} color="var(--text-muted)" />
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 700,
                  color: timeRemaining > 30 ? '#22c55e' : timeRemaining > 10 ? '#f59e0b' : '#ef4444'
                }}>
                  {formatTime(timeRemaining)}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Trophy size={16} color="var(--text-muted)" />
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {score}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ 
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            marginBottom: '30px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              style={{
                height: '100%',
                background: 'var(--accent-primary)',
                borderRadius: '3px'
              }}
            />
          </div>

          {/* Question */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '25px',
              lineHeight: 1.4
            }}>
              {currentQuestion.question}
            </div>
            
            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQuestion.options.map((option, index) => {
                const userAnswer = userAnswers[currentQuestionIndex];
                const isSelected = userAnswer?.answer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                
                return (
                  <button
                    key={index}
                    className={`btn-glass ${isSelected ? (isCorrect ? 'active' : 'error') : ''}`}
                    onClick={() => submitAnswer(option)}
                    disabled={!!userAnswers[currentQuestionIndex]}
                    style={{ 
                      padding: '15px 20px',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      borderColor: isSelected ? (isCorrect ? '#22c55e' : '#ef4444') : 'var(--glass-border)',
                      color: isSelected ? (isCorrect ? '#22c55e' : '#ef4444') : 'var(--text-main)',
                      background: isSelected ? (isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)') : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? (isCorrect ? '#22c55e' : '#ef4444') : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: isSelected ? 'white' : 'var(--text-muted)'
                      }}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>{option}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '20px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}
            >
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-main)',
                lineHeight: 1.5
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '10px',
                  color: userAnswers[currentQuestionIndex]?.isCorrect ? '#22c55e' : '#ef4444'
                }}>
                  {userAnswers[currentQuestionIndex]?.isCorrect ? (
                    <>
                      <CheckCircle size={20} />
                      <div style={{ fontWeight: 600 }}>Correct!</div>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      <div style={{ fontWeight: 600 }}>Incorrect</div>
                    </>
                  )}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {currentQuestion.explanation}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn-glass"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ← Previous
            </button>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {questionsAnswered} answered • {correctAnswers} correct • {accuracy}% accuracy
            </div>
            
            <button
              className="btn-glass"
              onClick={nextQuestion}
              disabled={!userAnswers[currentQuestionIndex] || currentQuestionIndex === totalQuestions - 1}
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Quiz Completed */}
      {quizCompleted && (
        <div style={{ 
          width: '100%', 
          maxWidth: '800px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ fontSize: '2rem' }}>🏆</div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>Quiz Complete!</h3>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Score</div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: 'var(--accent-primary)',
                background: 'rgba(138, 43, 226, 0.1)',
                padding: '15px 30px',
                borderRadius: '8px'
              }}>
                {score}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: accuracy > 70 ? '#22c55e' : accuracy > 50 ? '#f59e0b' : '#ef4444',
                background: accuracy > 70 ? 'rgba(34, 197, 94, 0.1)' : accuracy > 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                padding: '15px 30px',
                borderRadius: '8px'
              }}>
                {accuracy}%
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time Remaining</div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: '#3b82f6',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '15px 30px',
                borderRadius: '8px'
              }}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '15px',
            width: '100%',
            maxWidth: '500px',
            marginTop: '10px'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              You answered {correctAnswers} out of {totalQuestions} questions correctly.
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              width: '100%',
              justifyContent: 'center'
            }}>
              <button
                className="btn-glass active"
                onClick={startQuiz}
                style={{ 
                  padding: '12px 25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1
                }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              
              <button
                className="btn-glass"
                onClick={resetQuiz}
                style={{ 
                  padding: '12px 25px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1
                }}
              >
                <Book size={16} /> New Category
              </button>
            </div>
          </div>
          
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-muted)', 
            textAlign: 'center',
            marginTop: '20px',
            lineHeight: 1.5
          }}>
            Keep practicing to improve your music theory knowledge! Regular quizzes will help you master concepts faster.
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for Play icon since it's not imported
const Play = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);