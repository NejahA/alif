import { useState } from 'react';
import { Brain, Zap, RefreshCw, Download, Play, Pause } from 'lucide-react';
import * as Tone from 'tone';

const AIMusicGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPattern, setGeneratedPattern] = useState(null);
  const [genre, setGenre] = useState('ambient');
  const [complexity, setComplexity] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState(null);

  const genres = [
    { id: 'ambient', name: 'Ambient', color: '#3b82f6' },
    { id: 'techno', name: 'Techno', color: '#8b5cf6' },
    { id: 'lo-fi', name: 'Lo-Fi', color: '#10b981' },
    { id: 'synthwave', name: 'Synthwave', color: '#f43f5e' },
    { id: 'experimental', name: 'Experimental', color: '#f59e0b' }
  ];

  const generateMusicPattern = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with timeout
    setTimeout(() => {
      const patterns = {
        ambient: ['C4', 'E4', 'G4', 'B4', 'D5'],
        techno: ['C2', 'C2', 'G2', 'C2', 'F2', 'G2'],
        'lo-fi': ['F3', 'A3', 'C4', 'F4', 'A4'],
        synthwave: ['D3', 'F#3', 'A3', 'D4', 'F#4'],
        experimental: ['C3', 'D#3', 'F#3', 'A3', 'C4']
      };

      const chords = {
        ambient: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7'],
        techno: ['C5', 'G5', 'F5', 'C5'],
        'lo-fi': ['Fmaj7', 'Dm7', 'Gm7', 'Cmaj7'],
        synthwave: ['Dm', 'F', 'G', 'Am'],
        experimental: ['Cdim', 'D#aug', 'F#m7b5', 'A9']
      };

      const pattern = {
        notes: patterns[genre],
        chords: chords[genre],
        bpm: genre === 'techno' ? 128 : genre === 'lo-fi' ? 85 : 100,
        duration: '16 bars',
        complexity: complexity,
        id: Date.now()
      };

      setGeneratedPattern(pattern);
      setIsGenerating(false);
    }, 1500);
  };

  const playPattern = () => {
    if (!synth) {
      const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
      setSynth(newSynth);
    }

    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      
      if (generatedPattern && synth) {
        const now = Tone.now();
        
        // Play the generated pattern
        generatedPattern.notes.forEach((note, i) => {
          synth.triggerAttackRelease(note, '8n', now + i * 0.5);
        });

        Tone.Transport.start();
      }
    }
  };

  const exportAsMIDI = () => {
    // In a real implementation, this would generate a MIDI file
    alert('MIDI export would be generated here. In a full implementation, this would create a downloadable .mid file.');
  };

  return (
    <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Brain size={24} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>AI Music Generator</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {/* Genre Selection */}
        <div>
          <h4 style={{ marginBottom: '15px', fontSize: '0.9rem', opacity: 0.8 }}>Select Genre</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => setGenre(g.id)}
                className={`btn-glass ${genre === g.id ? 'active' : ''}`}
                style={{
                  borderColor: genre === g.id ? g.color : 'var(--glass-border)',
                  color: genre === g.id ? g.color : 'var(--text-muted)'
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Complexity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', opacity: 0.8 }}>Complexity</h4>
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{complexity}/5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>
            <span>Simple</span>
            <span>Complex</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateMusicPattern}
          disabled={isGenerating}
          className="btn-glass active"
          style={{ width: '100%', justifyContent: 'center', gap: '10px' }}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap size={16} />
              Generate Music Pattern
            </>
          )}
        </button>

        {/* Generated Pattern Display */}
        {generatedPattern && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ padding: '25px', border: '1px solid var(--accent-primary)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Generated Pattern</h3>
              <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{generatedPattern.duration}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>Melody Notes</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {generatedPattern.notes.map((note, i) => (
                    <div
                      key={i}
                      className="btn-glass"
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(var(--accent-primary-rgb), 0.1)',
                        borderColor: 'var(--accent-primary)'
                      }}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>Chord Progression</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {generatedPattern.chords.map((chord, i) => (
                    <div
                      key={i}
                      className="btn-glass"
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(var(--accent-secondary-rgb), 0.1)',
                        borderColor: 'var(--accent-secondary)'
                      }}
                    >
                      {chord}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={playPattern}
                className="btn-glass"
                style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Stop' : 'Play Pattern'}
              </button>

              <button
                onClick={exportAsMIDI}
                className="btn-glass"
                style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
              >
                <Download size={16} />
                Export MIDI
              </button>

              <button
                onClick={() => {
                  // Send to sequencer
                  window.dispatchEvent(new CustomEvent('virtuo-ai-pattern', { 
                    detail: { pattern: generatedPattern } 
                  }));
                  alert('Pattern sent to sequencer!');
                }}
                className="btn-glass"
                style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
              >
                <Upload size={16} />
                Send to Sequencer
              </button>
            </div>
          </motion.div>
        )}

        {/* Info */}
        <div style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, textAlign: 'center', marginTop: '10px' }}>
          <p>AI generates unique musical patterns based on your selected genre and complexity. Perfect for inspiration or starting new tracks.</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AIMusicGenerator;