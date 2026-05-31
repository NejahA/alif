import React, { useState, useEffect } from 'react';
import { Sparkles, Music, Play, Plus, Trash2 } from 'lucide-react';
import * as Tone from 'tone';

const CHORD_PROGRESSIONS = {
  'emotional': [['Am', 'F', 'C', 'G'], ['Dm', 'G', 'C', 'F'], ['F', 'G', 'Em', 'Am']],
  'jazz': [['Cmaj7', 'Am7', 'Dm7', 'G7'], ['Dm7', 'G7', 'Cmaj7', 'A7'], ['Fmaj7', 'Fm7', 'Em7', 'A7']],
  'lofi': [['Dm9', 'G13', 'Cmaj9', 'Fmaj7'], ['Am9', 'D13', 'Gmaj9', 'Cmaj7'], ['Em9', 'A13', 'Dmaj9', 'Gmaj7']],
  'uplifting': [['C', 'G', 'Am', 'F'], ['D', 'A', 'Bm', 'G'], ['E', 'B', 'C#m', 'A']],
  'dark': [['Am', 'E', 'F', 'E'], ['Dm', 'A', 'Bb', 'A'], ['Cm', 'G', 'Ab', 'G']]
};

const CHORD_NOTES = {
  'Am': ['A3', 'C4', 'E4'], 'F': ['F3', 'A3', 'C4'], 'C': ['C3', 'E3', 'G3'], 'G': ['G3', 'B3', 'D4'],
  'Dm': ['D3', 'F3', 'A3'], 'Em': ['E3', 'G3', 'B3'], 'G7': ['G3', 'B3', 'D4', 'F4'],
  'Cmaj7': ['C3', 'E3', 'G3', 'B3'], 'Am7': ['A3', 'C4', 'E4', 'G4'], 'Dm7': ['D3', 'F3', 'A3', 'C4'],
  'A7': ['A3', 'C#4', 'E4', 'G4'], 'Fmaj7': ['F3', 'A3', 'C4', 'E4'], 'Fm7': ['F3', 'Ab3', 'C4', 'Eb4'],
  'Em7': ['E3', 'G3', 'B3', 'D4'], 'Dm9': ['D3', 'F3', 'A3', 'C4', 'E4'], 'G13': ['G3', 'B3', 'D4', 'F4', 'E5'],
  'Cmaj9': ['C3', 'E3', 'G3', 'B3', 'D4'], 'Am9': ['A3', 'C4', 'E4', 'G4', 'B4'], 'D13': ['D3', 'F#3', 'A3', 'C4', 'B4'],
  'Gmaj9': ['G3', 'B3', 'D4', 'F#4', 'A4'], 'Em9': ['E3', 'G3', 'B3', 'D4', 'F#4'], 'A13': ['A3', 'C#4', 'E4', 'G4', 'F#5'],
  'Dmaj9': ['D3', 'F#3', 'A3', 'C#4', 'E4'], 'D': ['D3', 'F#3', 'A3'], 'A': ['A3', 'C#4', 'E4'], 'Bm': ['B2', 'D3', 'F#3'],
  'E': ['E3', 'G#3', 'B3'], 'B': ['B2', 'D#3', 'F#3'], 'C#m': ['C#3', 'E3', 'G#3'], 'Bb': ['Bb2', 'D3', 'F3'],
  'Ab': ['Ab2', 'C3', 'Eb3'], 'Cm': ['C3', 'Eb3', 'G3']
};

export default function AIChordSuggestions() {
  const [selectedMood, setSelectedMood] = useState('emotional');
  const [suggestions, setSuggestions] = useState([]);
  const [currentProgression, setCurrentProgression] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(null);

  const initSynth = () => {
    if (synthRef.current) return;
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }
    }).toDestination();
  };

  useEffect(() => {
    return () => synthRef.current?.dispose();
  }, []);

  const generateSuggestions = () => {
    const moods = Object.keys(CHORD_PROGRESSIONS);
    const progressions = CHORD_PROGRESSIONS[selectedMood];
    const random = progressions[Math.floor(Math.random() * progressions.length)];
    setSuggestions(random);
  };

  const playChord = (chord) => {
    initSynth();
    const notes = CHORD_NOTES[chord];
    if (notes && synthRef.current) {
      synthRef.current.triggerAttackRelease(notes, "2n");
    }
  };

  const playProgression = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    for (const chord of suggestions) {
      playChord(chord);
      await new Promise(r => setTimeout(r, 1500));
    }
    
    setIsPlaying(false);
  };

  const addToProgression = (chord) => {
    setCurrentProgression([...currentProgression, chord]);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={20} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Composer Suggest</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <select 
          className="btn-glass" 
          value={selectedMood} 
          onChange={(e) => setSelectedMood(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        >
          {Object.keys(CHORD_PROGRESSIONS).map(mood => (
            <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
          ))}
        </select>
        <button className="btn-glass" onClick={generateSuggestions}>
          <Music size={16} /> Suggest
        </button>
      </div>

      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Suggested Progressions:</span>
            <button className="btn-glass" onClick={playProgression} disabled={isPlaying}>
              <Play size={14} /> {isPlaying ? 'Playing...' : 'Preview'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {suggestions.map((chord, i) => (
              <div 
                key={i} 
                className="btn-glass" 
                style={{ flex: 1, minWidth: '60px', textAlign: 'center', position: 'relative' }}
                onClick={() => playChord(chord)}
              >
                {chord}
                <button 
                  onClick={(e) => { e.stopPropagation(); addToProgression(chord); }}
                  style={{ position: 'absolute', top: -5, right: -5, background: 'var(--accent-primary)', border: 'none', borderRadius: '50%', width: 15, height: 15, fontSize: 10, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={8} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentProgression.length > 0 && (
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>My Song:</span>
            <button className="btn-glass" onClick={() => setCurrentProgression([])} style={{ color: '#ef4444' }}>
              <Trash2 size={12} /> Clear
            </button>
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {currentProgression.map((chord, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{chord}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
