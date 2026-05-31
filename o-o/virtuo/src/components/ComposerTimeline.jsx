import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Music, Calendar, BookOpen, Award, Users, Globe, TrendingUp } from 'lucide-react';

const COMPOSERS = [
  {
    id: 'bach',
    name: 'Johann Sebastian Bach',
    period: 'Baroque',
    years: '1685-1750',
    country: 'Germany',
    color: '#8b5cf6',
    keyWorks: ['Brandenburg Concertos', 'Mass in B minor', 'The Well-Tempered Clavier'],
    description: 'Master of counterpoint and harmony, known for complex polyphonic compositions.',
    image: '🎹'
  },
  {
    id: 'mozart',
    name: 'Wolfgang Amadeus Mozart',
    period: 'Classical',
    years: '1756-1791',
    country: 'Austria',
    color: '#3b82f6',
    keyWorks: ['The Marriage of Figaro', 'Requiem', 'Eine kleine Nachtmusik'],
    description: 'Child prodigy who composed over 600 works across all musical genres.',
    image: '🎼'
  },
  {
    id: 'beethoven',
    name: 'Ludwig van Beethoven',
    period: 'Classical/Romantic',
    years: '1770-1827',
    country: 'Germany',
    color: '#ef4444',
    keyWorks: ['Symphony No. 9', 'Moonlight Sonata', 'Für Elise'],
    description: 'Transitional figure who expanded classical forms despite progressive hearing loss.',
    image: '🎵'
  },
  {
    id: 'chopin',
    name: 'Frédéric Chopin',
    period: 'Romantic',
    years: '1810-1849',
    country: 'Poland/France',
    color: '#10b981',
    keyWorks: ['Nocturnes', 'Preludes', 'Ballades'],
    description: 'Virtuoso pianist known for expressive, poetic piano compositions.',
    image: '🎹'
  },
  {
    id: 'tchaikovsky',
    name: 'Pyotr Ilyich Tchaikovsky',
    period: 'Romantic',
    years: '1840-1893',
    country: 'Russia',
    color: '#f59e0b',
    keyWorks: ['Swan Lake', 'The Nutcracker', '1812 Overture'],
    description: 'Master of ballet and orchestral music with rich emotional expression.',
    image: '🩰'
  },
  {
    id: 'debussy',
    name: 'Claude Debussy',
    period: 'Impressionist',
    years: '1862-1918',
    country: 'France',
    color: '#22c55e',
    keyWorks: ['Clair de Lune', 'La Mer', 'Prelude to the Afternoon of a Faun'],
    description: 'Pioneer of musical impressionism, using non-traditional scales and harmonies.',
    image: '🌊'
  },
  {
    id: 'stravinsky',
    name: 'Igor Stravinsky',
    period: 'Modern',
    years: '1882-1971',
    country: 'Russia/France/USA',
    color: '#8b5cf6',
    keyWorks: ['The Rite of Spring', 'The Firebird', 'Petrushka'],
    description: 'Revolutionary composer known for rhythmic complexity and changing styles.',
    image: '🔥'
  },
  {
    id: 'copland',
    name: 'Aaron Copland',
    period: '20th Century',
    years: '1900-1990',
    country: 'USA',
    color: '#3b82f6',
    keyWorks: ['Appalachian Spring', 'Fanfare for the Common Man', 'Rodeo'],
    description: 'Created distinctly American sound using folk melodies and open harmonies.',
    image: '🇺🇸'
  }
];

const MUSIC_PERIODS = [
  { name: 'Medieval', years: '500-1400', color: '#6b7280', description: 'Gregorian chant, early polyphony' },
  { name: 'Renaissance', years: '1400-1600', color: '#8b5cf6', description: 'Madrigals, motets, early instruments' },
  { name: 'Baroque', years: '1600-1750', color: '#3b82f6', description: 'Ornate, complex counterpoint, opera' },
  { name: 'Classical', years: '1750-1820', color: '#10b981', description: 'Balance, clarity, sonata form' },
  { name: 'Romantic', years: '1820-1900', color: '#ef4444', description: 'Emotion, expression, program music' },
  { name: 'Modern', years: '1900-1950', color: '#f59e0b', description: 'Experimentation, atonality, new forms' },
  { name: 'Contemporary', years: '1950-Present', color: '#22c55e', description: 'Electronic, minimalism, fusion' }
];

export default function ComposerTimeline() {
  const [selectedComposer, setSelectedComposer] = useState('bach');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  const currentComposer = COMPOSERS.find(c => c.id === selectedComposer);
  const filteredComposers = selectedPeriod === 'all' 
    ? COMPOSERS 
    : COMPOSERS.filter(c => c.period === selectedPeriod);

  useEffect(() => {
    // Auto-scroll timeline
    const interval = setInterval(() => {
      setTimelinePosition(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const startQuiz = () => {
    setQuizMode(true);
    generateQuizQuestion();
  };

  const generateQuizQuestion = () => {
    const randomComposer = COMPOSERS[Math.floor(Math.random() * COMPOSERS.length)];
    const wrongComposers = COMPOSERS.filter(c => c.id !== randomComposer.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [
      randomComposer.name,
      ...wrongComposers.map(c => c.name)
    ].sort(() => Math.random() - 0.5);

    setQuizQuestion({
      composer: randomComposer,
      options,
      correctAnswer: randomComposer.name
    });
  };

  const submitQuizAnswer = (answer) => {
    if (!quizQuestion) return;
    
    const isCorrect = answer === quizQuestion.correctAnswer;
    if (isCorrect) {
      setQuizScore(prev => prev + 10);
    }
    
    // Generate new question after delay
    setTimeout(() => {
      generateQuizQuestion();
    }, 1500);
  };

  const exitQuiz = () => {
    setQuizMode(false);
    setQuizScore(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Music History Timeline</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Explore the evolution of classical music through great composers and historical periods.
        </p>
      </div>

      {/* Period Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Music Periods</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className={`btn-glass ${selectedPeriod === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('all')}
            style={{ 
              padding: '10px 15px',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)'
            }}
          >
            All Periods
          </button>
          {MUSIC_PERIODS.map(period => (
            <button
              key={period.name}
              className={`btn-glass ${selectedPeriod === period.name ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period.name)}
              style={{ 
                padding: '10px 15px',
                borderColor: period.color,
                color: period.color,
                background: selectedPeriod === period.name ? `${period.color}40` : undefined
              }}
            >
              {period.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Mode */}
      {quizMode ? (
        <div style={{ 
          width: '100%', 
          maxWidth: '800px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Composer Quiz</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Score:</div>
              <div style={{ 
                fontSize: '1.2rem', 
                fontWeight: 700, 
                color: 'var(--accent-primary)',
                background: 'rgba(138, 43, 226, 0.1)',
                padding: '5px 15px',
                borderRadius: '20px'
              }}>
                {quizScore}
              </div>
            </div>
          </div>

          {quizQuestion && (
            <>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 600,
                color: 'var(--text-main)',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                Which composer is known for: "{quizQuestion.composer.keyWorks[0]}"?
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {quizQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className="btn-glass"
                    onClick={() => submitQuizAnswer(option)}
                    style={{ 
                      padding: '15px 20px',
                      textAlign: 'left',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)'
                      }}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>{option}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            className="btn-glass"
            onClick={exitQuiz}
            style={{ 
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px'
            }}
          >
            Exit Quiz
          </button>
        </div>
      ) : (
        <>
          {/* Timeline Visualization */}
          <div style={{ 
            width: '100%', 
            maxWidth: '1000px',
            height: '100px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '30px'
          }}>
            <div style={{ 
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '2px',
              background: 'var(--glass-border)',
              transform: 'translateY(-50%)'
            }} />
            
            {MUSIC_PERIODS.map((period, index) => {
              const position = (index / MUSIC_PERIODS.length) * 100;
              const composersInPeriod = COMPOSERS.filter(c => c.period === period.name);
              
              return (
                <div
                  key={period.name}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: period.color,
                      border: '2px solid white',
                      cursor: 'pointer'
                    }}
                    title={`${period.name} (${period.years})`}
                    onClick={() => setSelectedPeriod(period.name)}
                  />
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: period.color,
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {period.name}
                  </div>
                </div>
              );
            })}
            
            {/* Timeline cursor */}
            <div
              style={{
                position: 'absolute',
                left: `${timelinePosition}%`,
                top: '0',
                bottom: '0',
                width: '2px',
                background: 'var(--accent-primary)',
                boxShadow: '0 0 10px var(--accent-primary)'
              }}
            />
          </div>

          {/* Composer Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Select Composer</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredComposers.map(composer => (
                <button
                  key={composer.id}
                  className={`btn-glass ${selectedComposer === composer.id ? 'active' : ''}`}
                  onClick={() => setSelectedComposer(composer.id)}
                  style={{ 
                    padding: '10px 15px',
                    borderColor: composer.color,
                    color: composer.color,
                    background: selectedComposer === composer.id ? `${composer.color}40` : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '1.2rem' }}>{composer.image}</div>
                  <div>{composer.name.split(' ').pop()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Composer Details */}
          {currentComposer && (
            <div style={{ 
              width: '100%', 
              maxWidth: '800px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '2rem' }}>{currentComposer.image}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: currentComposer.color }}>
                      {currentComposer.name}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {currentComposer.years} • {currentComposer.country}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  padding: '5px 15px',
                  background: `${currentComposer.color}40`,
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: currentComposer.color
                }}>
                  {currentComposer.period} Period
                </div>
              </div>
              
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {currentComposer.description}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Key Works:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {currentComposer.keyWorks.map((work, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px 15px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${currentComposer.color}`,
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: currentComposer.color
                      }}
                    >
                      {work}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '15px', 
                borderRadius: '8px',
                fontSize: '0.8rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
                  <Calendar size={16} color={currentComposer.color} />
                  <div style={{ color: 'var(--text-muted)' }}>Lifespan</div>
                  <div style={{ color: currentComposer.color, fontWeight: 600 }}>{currentComposer.years}</div>
                </div>
                <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
                  <Globe size={16} color={currentComposer.color} />
                  <div style={{ color: 'var(--text-muted)' }}>Nationality</div>
                  <div style={{ color: currentComposer.color, fontWeight: 600 }}>{currentComposer.country}</div>
                </div>
                <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
                  <Music size={16} color={currentComposer.color} />
                  <div style={{ color: 'var(--text-muted)' }}>Period</div>
                  <div style={{ color: currentComposer.color, fontWeight: 600 }}>{currentComposer.period}</div>
                </div>
                <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
                  <BookOpen size={16} color={currentComposer.color} />
                  <div style={{ color: 'var(--text-muted)' }}>Works</div>
                  <div style={{ color: currentComposer.color, fontWeight: 600 }}>{currentComposer.keyWorks.length}+</div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Button */}
          <button
            className="btn-glass active"
            onClick={startQuiz}
            style={{ 
              padding: '15px 30px',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px'
            }}
          >
            <Award size={20} /> Start Composer Quiz
          </button>
        </>
      )}

      {/* Periods Summary */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '15px', 
        marginTop: '30px',
        background: 'rgba(0,0,0,0.2)', 
        padding: '20px', 
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px'
      }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Music History Overview</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {MUSIC_PERIODS.map(period => (
            <div
              key={period.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '10px 15px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                borderLeft: `4px solid ${period.color}`
              }}
            >
              <div style={{ 
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: period.color
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: period.color }}>
                  {period.name} ({period.years})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {period.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px', marginTop: '10px' }}>
          Music has evolved through distinct historical periods, each with its own characteristics, forms, and innovations.
        </div>
      </div>
    </div>
  );
}