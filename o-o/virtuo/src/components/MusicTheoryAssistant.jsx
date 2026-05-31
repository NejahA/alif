import { useState, useEffect } from 'react';
import { Lightbulb, Music2, BookOpen, Target, Zap, Copy, Volume2 } from 'lucide-react';
import * as Tone from 'tone';

const MusicTheoryAssistant = () => {
  const [currentChord, setCurrentChord] = useState('C');
  const [scaleType, setScaleType] = useState('major');
  const [suggestions, setSuggestions] = useState([]);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [synth, setSynth] = useState(null);

  const chords = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const chordTypes = ['major', 'minor', '7th', 'maj7', 'm7', 'dim', 'aug'];
  const scales = ['major', 'minor', 'harmonic minor', 'melodic minor', 'pentatonic', 'blues', 'dorian', 'mixolydian'];

  const chordStructures = {
    'C': { notes: ['C', 'E', 'G'], color: '#3b82f6' },
    'D': { notes: ['D', 'F#', 'A'], color: '#8b5cf6' },
    'E': { notes: ['E', 'G#', 'B'], color: '#10b981' },
    'F': { notes: ['F', 'A', 'C'], color: '#f43f5e' },
    'G': { notes: ['G', 'B', 'D'], color: '#f59e0b' },
    'A': { notes: ['A', 'C#', 'E'], color: '#ec4899' },
    'B': { notes: ['B', 'D#', 'F#'], color: '#06b6d4' }
  };

  const scalePatterns = {
    'major': ['W', 'W', 'H', 'W', 'W', 'W', 'H'],
    'minor': ['W', 'H', 'W', 'W', 'H', 'W', 'W'],
    'harmonic minor': ['W', 'H', 'W', 'W', 'H', 'WH', 'H'],
    'melodic minor': ['W', 'H', 'W', 'W', 'W', 'W', 'H'],
    'pentatonic': ['W', 'W', 'WH', 'W', 'WH'],
    'blues': ['WH', 'H', 'H', 'WH', 'W', 'WH'],
    'dorian': ['W', 'H', 'W', 'W', 'W', 'H', 'W'],
    'mixolydian': ['W', 'W', 'H', 'W', 'W', 'H', 'W']
  };

  const generateScaleNotes = (root, scaleType) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = notes.indexOf(root);
    const pattern = scalePatterns[scaleType];
    
    let currentIndex = rootIndex;
    const scaleNotes = [notes[currentIndex]];
    
    pattern.forEach(interval => {
      if (interval === 'W') currentIndex += 2;
      else if (interval === 'H') currentIndex += 1;
      else if (interval === 'WH') currentIndex += 3;
      
      if (currentIndex >= notes.length) currentIndex -= notes.length;
      scaleNotes.push(notes[currentIndex]);
    });
    
    return scaleNotes;
  };

  const getChordSuggestions = () => {
    const commonProgressions = {
      'C': ['G', 'Am', 'F'],
      'D': ['A', 'Bm', 'G'],
      'E': ['B', 'C#m', 'A'],
      'F': ['C', 'Dm', 'Bb'],
      'G': ['D', 'Em', 'C'],
      'A': ['E', 'F#m', 'D'],
      'B': ['F#', 'G#m', 'E']
    };

    const current = currentChord;
    const suggestions = commonProgressions[current] || ['G', 'Am', 'F'];
    
    setSuggestions(suggestions.map(chord => ({
      chord,
      notes: chordStructures[chord]?.notes || ['?', '?', '?'],
      color: chordStructures[chord]?.color || '#6b7280'
    })));
  };

  const playChord = (notes) => {
    if (!synth) {
      const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
      setSynth(newSynth);
    }

    if (synth) {
      const now = Tone.now();
      notes.forEach(note => {
        synth.triggerAttackRelease(note, '2n', now);
      });
    }
  };

  const addPlayedNote = (note) => {
    setPlayedNotes(prev => {
      const newNotes = [...prev, note];
      if (newNotes.length > 6) newNotes.shift();
      return newNotes;
    });
  };

  const analyzeNotes = () => {
    if (playedNotes.length >= 3) {
      // Simple chord detection
      const lastThree = playedNotes.slice(-3);
      const possibleChord = Object.entries(chordStructures).find(([chord, data]) => {
        return lastThree.every(note => data.notes.includes(note));
      });
      
      if (possibleChord) {
        setCurrentChord(possibleChord[0]);
        getChordSuggestions();
      }
    }
  };

  useEffect(() => {
    getChordSuggestions();
  }, [currentChord]);

  useEffect(() => {
    analyzeNotes();
  }, [playedNotes]);

  const scaleNotes = generateScaleNotes(currentChord, scaleType);

  return (
    <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Lightbulb size={24} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Music Theory Assistant</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Current Chord & Scale */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h4 style={{ marginBottom: '15px', fontSize: '0.9rem', opacity: 0.8 }}>Current Chord</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {chords.map(chord => (
                  <button
                    key={chord}
                    onClick={() => setCurrentChord(chord)}
                    className={`btn-glass ${currentChord === chord ? 'active' : ''}`}
                    style={{
                      borderColor: currentChord === chord ? chordStructures[chord].color : 'var(--glass-border)',
                      color: currentChord === chord ? chordStructures[chord].color : 'var(--text-muted)'
                    }}
                  >
                    {chord}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
                {chordTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => {}}
                    className="btn-glass"
                    style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Chord Notes */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>Chord Notes</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {chordStructures[currentChord]?.notes.map((note, i) => (
                  <div
                    key={i}
                    className="btn-glass"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(var(--accent-primary-rgb), 0.1)',
                      borderColor: chordStructures[currentChord].color,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    {note}
                    <button
                      onClick={() => {
                        playChord([note]);
                        addPlayedNote(note);
                      }}
                      className="btn-glass"
                      style={{ padding: '4px', background: 'rgba(255,255,255,0.1)' }}
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => playChord(chordStructures[currentChord].notes)}
                  className="btn-glass active"
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Music2 size={16} />
                  Play Chord
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '15px', fontSize: '0.9rem', opacity: 0.8 }}>Scale Explorer</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {scales.map(scale => (
                <button
                  key={scale}
                  onClick={() => setScaleType(scale)}
                  className={`btn-glass ${scaleType === scale ? 'active' : ''}`}
                >
                  {scale}
                </button>
              ))}
            </div>

            {/* Scale Notes */}
            <div>
              <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>
                {currentChord} {scaleType} Scale
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {scaleNotes.map((note, i) => (
                  <div
                    key={i}
                    className="btn-glass"
                    style={{
                      padding: '10px 14px',
                      background: i === 0 ? 'rgba(var(--accent-primary-rgb), 0.2)' : 'rgba(255,255,255,0.05)',
                      borderColor: i === 0 ? 'var(--accent-primary)' : 'var(--glass-border)',
                      fontSize: '1rem'
                    }}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chord Suggestions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Target size={16} color="var(--accent-primary)" />
            <h4 style={{ fontSize: '0.9rem', opacity: 0.8 }}>Suggested Next Chords</h4>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '20px',
                  flex: 1,
                  border: '1px solid',
                  borderColor: suggestion.color,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: suggestion.color }}>
                  {suggestion.chord}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {suggestion.notes.map((note, j) => (
                    <div
                      key={j}
                      className="btn-glass"
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {note}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    onClick={() => {
                      setCurrentChord(suggestion.chord);
                      playChord(suggestion.notes);
                    }}
                    className="btn-glass"
                    style={{ flex: 1, justifyContent: 'center', gap: '5px' }}
                  >
                    <Music2 size={14} />
                    Play
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(suggestion.chord);
                      alert(`Copied ${suggestion.chord} chord!`);
                    }}
                    className="btn-glass"
                    style={{ flex: 1, justifyContent: 'center', gap: '5px' }}
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Played Notes History */}
        <div>
          <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '15px' }}>Recent Notes</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {playedNotes.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {playedNotes.map((note, i) => (
                    <div
                      key={i}
                      className="btn-glass"
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        opacity: 0.7 + (i * 0.1)
                      }}
                    >
                      {note}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPlayedNotes([])}
                  className="btn-glass"
                  style={{ marginLeft: '10px', padding: '8px 12px' }}
                >
                  Clear
                </button>
              </>
            ) : (
              <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                Play notes to see analysis. The assistant will detect chords and suggest progressions.
              </div>
            )}
          </div>
        </div>

        {/* Theory Tips */}
        <div className="glass-panel" style={{ padding: '20px', background: 'rgba(var(--accent-primary-rgb), 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <BookOpen size={16} color="var(--accent-primary)" />
            <h4 style={{ fontSize: '0.9rem', opacity: 0.9 }}>Theory Tip</h4>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.8 }}>
            The {currentChord} {scaleType} scale works well with {suggestions.map(s => s.chord).join(', ')} chords. 
            Try playing a I-IV-V progression ({currentChord} - {suggestions[0]?.chord || 'IV'} - {suggestions[1]?.chord || 'V'}) 
            for a classic sound.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicTheoryAssistant;