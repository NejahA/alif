import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Book, Play, Square, Info, Lightbulb, BookOpen, Target, Music, Activity, Zap } from 'lucide-react';

const MUSIC_THEORY_DATA = {
  scales: {
    major: {
      name: 'Major Scale',
      formula: [0, 2, 4, 5, 7, 9, 11],
      description: 'Happy and bright sounding scale. The foundation of Western music.',
      pattern: 'W-W-H-W-W-W-H',
      emotions: ['Happy', 'Bright', 'Joyful', 'Optimistic']
    },
    minor: {
      name: 'Natural Minor Scale',
      formula: [0, 2, 3, 5, 7, 8, 10],
      description: 'Sad and melancholic scale. Often used in emotional music.',
      pattern: 'W-H-W-W-H-W-W',
      emotions: ['Sad', 'Melancholic', 'Mysterious', 'Thoughtful']
    },
    pentatonic: {
      name: 'Pentatonic Scale',
      formula: [0, 2, 4, 7, 9],
      description: 'Five-note scale used in many musical traditions worldwide.',
      pattern: 'W-W-min3-W-min3',
      emotions: ['Universal', 'Simple', 'Melodic', 'Versatile']
    },
    blues: {
      name: 'Blues Scale',
      formula: [0, 3, 5, 6, 7, 10],
      description: 'Essential for blues, rock, and jazz music with its characteristic "blue notes".',
      pattern: 'min3-W-H-H-min3-W',
      emotions: ['Soulful', 'Expressive', 'Gritty', 'Emotional']
    }
  },
  
  chords: {
    major: {
      name: 'Major Chord',
      formula: [0, 4, 7],
      description: 'Happy and stable chord. The building block of major keys.',
      symbol: 'C, D, E, etc.',
      emotion: 'Happy/Stable'
    },
    minor: {
      name: 'Minor Chord',
      formula: [0, 3, 7],
      description: 'Sad and melancholic chord. Creates emotional depth.',
      symbol: 'Cm, Dm, Em, etc.',
      emotion: 'Sad/Emotional'
    },
    seventh: {
      name: 'Dominant 7th',
      formula: [0, 4, 7, 10],
      description: 'Adds tension that wants to resolve. Essential in blues and jazz.',
      symbol: 'C7, D7, E7, etc.',
      emotion: 'Tense/Bluesy'
    },
    maj7: {
      name: 'Major 7th',
      formula: [0, 4, 7, 11],
      description: 'Dreamy and sophisticated chord. Common in jazz and R&B.',
      symbol: 'Cmaj7, Dmaj7, etc.',
      emotion: 'Dreamy/Sophisticated'
    }
  },
  
  progressions: {
    pop: {
      name: 'Pop Progression',
      chords: ['I', 'V', 'vi', 'IV'],
      example: 'C - G - Am - F',
      description: 'The most common chord progression in pop music.',
      songs: ['Let It Be', 'Don\'t Stop Believin\'', 'With or Without You']
    },
    blues: {
      name: '12-Bar Blues',
      chords: ['I', 'IV', 'V'],
      pattern: 'I-I-I-I | IV-IV-I-I | V-IV-I-I',
      description: 'The foundation of blues, rock, and jazz music.',
      songs: ['Sweet Home Chicago', 'Hoochie Coochie Man', 'Crossroads']
    },
    jazz: {
      name: 'Jazz Standard',
      chords: ['ii', 'V', 'I'],
      example: 'Dm7 - G7 - Cmaj7',
      description: 'The most important progression in jazz music.',
      songs: ['Autumn Leaves', 'All The Things You Are', 'Take The A Train']
    }
  }
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MusicTheoryGuide = () => {
  const [activeCategory, setActiveCategory] = useState('scales');
  const [selectedItem, setSelectedItem] = useState('major');
  const [rootNote, setRootNote] = useState('C');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVisualization, setShowVisualization] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(0);
  
  const synthRef = useRef(null);
  const sequenceRef = useRef(null);

  const lessons = [
    {
      title: 'Understanding Scales',
      content: 'Scales are collections of notes that create specific moods. Major scales sound happy, while minor scales sound sad.',
      icon: <Music size={20} />
    },
    {
      title: 'Chord Construction',
      content: 'Chords are built by stacking notes from scales. Major chords use the 1st, 3rd, and 5th notes of the major scale.',
      icon: <Piano size={20} />
    },
    {
      title: 'Chord Progressions',
      content: 'Progressions are sequences of chords that create musical stories. The I-IV-V progression is used in countless songs.',
      icon: <Guitar size={20} />
    },
    {
      title: 'Practice Tips',
      content: 'Start slowly, use a metronome, and practice regularly. Muscle memory is key to mastering music theory!',
      icon: <Target size={20} />
    }
  ];

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 }
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
      sequenceRef.current?.dispose();
    };
  }, []);

  const getNotesForScale = (scaleType, root) => {
    const scaleData = MUSIC_THEORY_DATA.scales[scaleType];
    const rootIndex = NOTES.indexOf(root);
    
    return scaleData.formula.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTES[noteIndex];
    });
  };

  const getNotesForChord = (chordType, root) => {
    const chordData = MUSIC_THEORY_DATA.chords[chordType];
    const rootIndex = NOTES.indexOf(root);
    
    return chordData.formula.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return NOTES[noteIndex];
    });
  };

  const playScale = async (scaleType, root) => {
    await Tone.start();
    setIsPlaying(true);
    
    const notes = getNotesForScale(scaleType, root);
    const now = Tone.now();
    
    notes.forEach((note, index) => {
      synthRef.current.triggerAttackRelease(note + '4', '8n', now + index * 0.3);
    });
    
    setTimeout(() => setIsPlaying(false), notes.length * 300);
  };

  const playChord = async (chordType, root) => {
    await Tone.start();
    setIsPlaying(true);
    
    const notes = getNotesForChord(chordType, root);
    const now = Tone.now();
    
    notes.forEach(note => {
      synthRef.current.triggerAttackRelease(note + '4', '2n', now);
    });
    
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const playProgression = async (progressionType, root) => {
    await Tone.start();
    setIsPlaying(true);
    
    const progression = MUSIC_THEORY_DATA.progressions[progressionType];
    const chords = progression.chords;
    const now = Tone.now();
    
    chords.forEach((chordSymbol, index) => {
      const chordType = chordSymbol.toLowerCase().includes('m') ? 'minor' : 'major';
      const chordRoot = root; // Simplified - in real implementation, calculate actual root
      const notes = getNotesForChord(chordType, chordRoot);
      
      notes.forEach(note => {
        synthRef.current.triggerAttackRelease(note + '4', '2n', now + index * 1.5);
      });
    });
    
    setTimeout(() => setIsPlaying(false), chords.length * 1500);
  };

  const playCurrentSelection = () => {
    if (activeCategory === 'scales') {
      playScale(selectedItem, rootNote);
    } else if (activeCategory === 'chords') {
      playChord(selectedItem, rootNote);
    } else if (activeCategory === 'progressions') {
      playProgression(selectedItem, rootNote);
    }
  };

  const stopPlayback = () => {
    synthRef.current?.releaseAll();
    setIsPlaying(false);
  };

  const renderScaleVisualization = () => {
    const scaleData = MUSIC_THEORY_DATA.scales[selectedItem];
    const notes = getNotesForScale(selectedItem, rootNote);
    
    return (
      <div style={{ marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Scale Notes: {notes.join(' - ')}
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '5px',
          marginBottom: '15px'
        }}>
          {notes.map((note, index) => (
            <div 
              key={index}
              style={{
                padding: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              {note}
              <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px' }}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '10px', 
          borderRadius: '6px',
          fontSize: '0.8rem'
        }}>
          <div><strong>Pattern:</strong> {scaleData.pattern}</div>
          <div><strong>Emotions:</strong> {scaleData.emotions.join(', ')}</div>
        </div>
      </div>
    );
  };

  const renderChordVisualization = () => {
    const chordData = MUSIC_THEORY_DATA.chords[selectedItem];
    const notes = getNotesForChord(selectedItem, rootNote);
    
    return (
      <div style={{ marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Chord Notes: {notes.join(' - ')}
        </h4>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '15px',
          justifyContent: 'center'
        }}>
          {notes.map((note, index) => (
            <div 
              key={index}
              style={{
                padding: '15px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: '600',
                minWidth: '50px'
              }}
            >
              {note}
            </div>
          ))}
        </div>
        
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '10px', 
          borderRadius: '6px',
          fontSize: '0.8rem'
        }}>
          <div><strong>Symbol:</strong> {rootNote}{selectedItem !== 'major' ? selectedItem : ''}</div>
          <div><strong>Emotion:</strong> {chordData.emotion}</div>
        </div>
      </div>
    );
  };

  const renderProgressionVisualization = () => {
    const progressionData = MUSIC_THEORY_DATA.progressions[selectedItem];
    
    return (
      <div style={{ marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Chord Progression: {progressionData.example}
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
          gap: '8px',
          marginBottom: '15px'
        }}>
          {progressionData.chords.map((chord, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              {chord}
              <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px' }}>
                Step {index + 1}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '10px', 
          borderRadius: '6px',
          fontSize: '0.8rem'
        }}>
          <div><strong>Pattern:</strong> {progressionData.pattern || progressionData.example}</div>
          <div><strong>Famous Songs:</strong> {progressionData.songs.join(', ')}</div>
        </div>
      </div>
    );
  };

  const nextLesson = () => {
    setCurrentLesson((prev) => (prev + 1) % lessons.length);
  };

  const currentData = MUSIC_THEORY_DATA[activeCategory][selectedItem];

  return (
    <div className="glass-panel" style={{ 
      padding: '20px', 
      width: '400px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px' 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Book size={24} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Music Theory Guide</h3>
      </div>

      {/* Interactive Lesson */}
      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <BookOpen size={16} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Quick Lesson</h4>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
            {lessons[currentLesson].title}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '5px' }}>
            {lessons[currentLesson].content}
          </div>
        </div>
        
        <button 
          className="btn-glass" 
          onClick={nextLesson}
          style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
        >
          Next Lesson
        </button>
      </div>

      {/* Category Selection */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {Object.keys(MUSIC_THEORY_DATA).map(category => (
          <button
            key={category}
            className={`btn-glass ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
            style={{ 
              padding: '6px 10px', 
              fontSize: '0.8rem',
              textTransform: 'capitalize',
              flex: 1
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Item Selection */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {Object.keys(MUSIC_THEORY_DATA[activeCategory]).map(item => (
          <button
            key={item}
            className={`btn-glass ${selectedItem === item ? 'active' : ''}`}
            onClick={() => setSelectedItem(item)}
            style={{ 
              padding: '5px 8px', 
              fontSize: '0.7rem',
              textTransform: 'capitalize'
            }}
          >
            {MUSIC_THEORY_DATA[activeCategory][item].name}
          </button>
        ))}
      </div>

      {/* Root Note Selection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Root Note:</span>
        <select
          value={rootNote}
          onChange={(e) => setRootNote(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid var(--glass-border)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            padding: '4px 8px',
            fontSize: '0.8rem'
          }}
        >
          {NOTES.map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
      </div>

      {/* Play Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          className={`btn-glass ${isPlaying ? 'active' : ''}`}
          onClick={isPlaying ? stopPlayback : playCurrentSelection}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isPlaying ? <Square size={16} /> : <Play size={16} />}
          {isPlaying ? ' Stop' : ' Play'}
        </button>
        
        <button 
          className="btn-glass"
          onClick={() => setShowVisualization(!showVisualization)}
          style={{ padding: '8px' }}
          title={showVisualization ? 'Hide visualization' : 'Show visualization'}
        >
          <Info size={16} />
        </button>
      </div>

      {/* Description */}
      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '12px', 
        borderRadius: '6px',
        fontSize: '0.8rem',
        marginBottom: '10px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '5px', color: 'var(--accent-primary)' }}>
          {currentData.name}
        </div>
        <div style={{ opacity: 0.9 }}>
          {currentData.description}
        </div>
      </div>

      {/* Interactive Visualization */}
      {showVisualization && (
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '15px', 
          borderRadius: '8px'
        }}>
          {activeCategory === 'scales' && renderScaleVisualization()}
          {activeCategory === 'chords' && renderChordVisualization()}
          {activeCategory === 'progressions' && renderProgressionVisualization()}
        </div>
      )}

      {/* Tips */}
      <div style={{ 
        fontSize: '0.7rem', 
        color: 'var(--text-muted)', 
        textAlign: 'center',
        marginTop: '10px',
        padding: '8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '6px'
      }}>
        <Lightbulb size={12} style={{ marginRight: '4px' }} />
        Tip: Practice these patterns in different keys to master music theory!
      </div>
    </div>
  );
};

export default MusicTheoryGuide;