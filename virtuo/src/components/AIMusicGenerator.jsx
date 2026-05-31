import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { 
  Brain, Play, Square, Download, Settings, Wand2, 
  Music, Clock, TrendingUp, Sparkles, Zap, Crown, Layers 
} from 'lucide-react';

const AIMusicGenerator = ({ onGenerate, instruments }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    style: 'electronic',
    mood: 'energetic',
    complexity: 'medium',
    duration: 30,
    bpm: 120,
    key: 'C major',
    instruments: ['synth', 'drums', 'bass'],
    variations: 3,
    creativity: 0.7,
    styleTransfer: 'none'
  });

  const styleTransfers = [
    { id: 'none', name: 'None', icon: <Music size={14} /> },
    { id: 'lofi_filter', name: 'Lo-Fi Grit', icon: <Zap size={14} /> },
    { id: '8bit_crush', name: '8-Bit Crush', icon: <Box size={14} /> },
    { id: 'hall_verb', name: 'Massive Hall', icon: <Layers size={14} /> },
    { id: 'acid_resonance', name: 'Acid Res', icon: <Activity size={14} /> }
  ];

  const [generatedCompositions, setGeneratedCompositions] = useState([]);
  const [selectedComposition, setSelectedComposition] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);

  const musicStyles = [
    { id: 'electronic', name: 'Electronic', icon: '⚡', description: 'EDM, synthwave, techno' },
    { id: 'ambient', name: 'Ambient', icon: '🌌', description: 'Atmospheric, relaxing, ethereal' },
    { id: 'lofi', name: 'Lo-Fi', name: 'Lo-Fi', icon: '☕', description: 'Chill, relaxed, nostalgic' },
    { id: 'orchestral', name: 'Orchestral', icon: '🎻', description: 'Cinematic, epic, classical' },
    { id: 'jazz', name: 'Jazz', icon: '🎷', description: 'Improvisational, complex, soulful' },
    { id: 'rock', name: 'Rock', icon: '🎸', description: 'Energetic, powerful, driving' },
    { id: 'hiphop', name: 'Hip Hop', icon: '🎤', description: 'Urban, rhythmic, beat-driven' },
    { id: 'world', name: 'World', icon: '🌍', description: 'Cultural, traditional, ethnic' }
  ];

  const moods = [
    { id: 'energetic', name: 'Energetic', color: '#FF6B6B' },
    { id: 'relaxed', name: 'Relaxed', color: '#4ECDC4' },
    { id: 'melancholic', name: 'Melancholic', color: '#45B7D1' },
    { id: 'happy', name: 'Happy', color: '#FFE66D' },
    { id: 'mysterious', name: 'Mysterious', color: '#9B59B6' },
    { id: 'epic', name: 'Epic', color: '#E74C3C' },
    { id: 'romantic', name: 'Romantic', color: '#FF9FF3' },
    { id: 'dreamy', name: 'Dreamy', color: '#BADCDC' }
  ];

  const complexityLevels = [
    { id: 'simple', name: 'Simple', description: 'Basic patterns, easy to follow' },
    { id: 'medium', name: 'Medium', description: 'Balanced complexity, good variety' },
    { id: 'complex', name: 'Complex', description: 'Intricate patterns, advanced' },
    { id: 'expert', name: 'Expert', description: 'Highly complex, professional level' }
  ];

  // Simulate AI music generation
  const generateMusic = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    const newComposition = {
      id: Date.now().toString(),
      title: `${generationOptions.style} ${generationOptions.mood}`.toUpperCase(),
      style: generationOptions.style,
      mood: generationOptions.mood,
      bpm: generationOptions.bpm,
      key: generationOptions.key,
      duration: generationOptions.duration,
      complexity: generationOptions.complexity,
      instruments: generationOptions.instruments,
      timestamp: new Date().toISOString(),
      data: generateMockCompositionData(),
      rating: Math.random() * 5,
      popularity: Math.random(),
      uniqueness: 0.5 + Math.random() * 0.5
    };

    setGeneratedCompositions(prev => [newComposition, ...prev]);
    setSelectedComposition(newComposition);
    setIsGenerating(false);
    
    // Gain XP in Innovation and Theory
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'innovation', amount: 50 }
    }));
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'theory', amount: 20 }
    }));

    if (onGenerate) {
      onGenerate(newComposition);
    }
  };

  const startQuickJam = async () => {
    await Tone.start();
    Tone.Transport.bpm.value = generationOptions.bpm;
    
    // Dispatch a global randomize event to set up instruments
    window.dispatchEvent(new CustomEvent('virtuo-randomize'));
    
    // Dispatch a specific quick-jam event
    window.dispatchEvent(new CustomEvent('virtuo-quick-jam', {
      detail: {
        style: generationOptions.style,
        mood: generationOptions.mood
      }
    }));

    Tone.Transport.start();
    setIsPlaying(true);
  };

  const stopJam = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  const generateMockCompositionData = () => {
    // This would be replaced with actual AI-generated music data
    return {
      melody: Array(16).fill().map(() => ({
        note: Math.floor(Math.random() * 12) + 60,
        duration: 0.25 + Math.random() * 0.75,
        velocity: 0.7 + Math.random() * 0.3
      })),
      harmony: Array(8).fill().map(() => ({
        chords: ['maj7', 'min7', 'dom7'][Math.floor(Math.random() * 3)],
        rhythm: [0.5, 1, 2][Math.floor(Math.random() * 3)]
      })),
      drums: Array(32).fill().map(() => ({
        kick: Math.random() > 0.7,
        snare: Math.random() > 0.6,
        hihat: Math.random() > 0.4,
        percussion: Math.random() > 0.3
      })),
      structure: {
        intro: 4,
        verse: 16,
        chorus: 8,
        bridge: 8,
        outro: 4
      }
    };
  };

  const playPreview = async (composition) => {
    if (isPlaying) {
      stopPreview();
      return;
    }

    setIsPlaying(true);
    // In real implementation, this would play the generated composition
    // using Web Audio API or Tone.js
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 5000); // Stop after 5 seconds for demo
  };

  const stopPreview = () => {
    setIsPlaying(false);
    // Stop audio playback
  };

  const downloadComposition = (composition) => {
    const data = JSON.stringify(composition, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `virtuo-ai-${composition.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyComposition = (composition) => {
    if (onGenerate) {
      onGenerate(composition);
    }
  };

  return (
    <div className="ai-music-generator">
      <div className="generator-header">
        <div className="header-left">
          <Brain size={28} />
          <h2>AI Music Generator</h2>
          <span className="badge">BETA</span>
        </div>
        <div className="header-stats">
          <div className="stat">
            <Sparkles size={16} />
            <span>AI Powered</span>
          </div>
          <div className="stat">
            <TrendingUp size={16} />
            <span>Machine Learning</span>
          </div>
        </div>
      </div>

      <div className="generator-content">
        <div className="options-panel">
          <div className="option-section">
            <h3>Music Style</h3>
            <div className="style-grid">
              {musicStyles.map(style => (
                <button
                  key={style.id}
                  className={`style-btn ${generationOptions.style === style.id ? 'active' : ''}`}
                  onClick={() => setGenerationOptions(prev => ({ ...prev, style: style.id }))}
                >
                  <span className="style-icon">{style.icon}</span>
                  <span className="style-name">{style.name}</span>
                  <span className="style-desc">{style.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="option-section">
            <h3>Mood & Feel</h3>
            <div className="mood-grid">
              {moods.map(mood => (
                <button
                  key={mood.id}
                  className={`mood-btn ${generationOptions.mood === mood.id ? 'active' : ''}`}
                  onClick={() => setGenerationOptions(prev => ({ ...prev, mood: mood.id }))}
                  style={{ '--mood-color': mood.color }}
                >
                  {mood.name}
                </button>
              ))}
            </div>
          </div>

          <div className="option-section">
            <h3>Style Transfer (BETA)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {styleTransfers.map(st => (
                <button
                  key={st.id}
                  className={`btn-glass ${generationOptions.styleTransfer === st.id ? 'active' : ''}`}
                  onClick={() => setGenerationOptions(prev => ({ ...prev, styleTransfer: st.id }))}
                  style={{ justifyContent: 'center', gap: '8px', fontSize: '0.75rem', padding: '10px' }}
                >
                  {st.icon} {st.name}
                </button>
              ))}
            </div>
          </div>

          <div className="option-section">
            <h3>Complexity Level</h3>
            <div className="complexity-buttons">
              {complexityLevels.map(level => (
                <button
                  key={level.id}
                  className={`complexity-btn ${generationOptions.complexity === level.id ? 'active' : ''}`}
                  onClick={() => setGenerationOptions(prev => ({ ...prev, complexity: level.id }))}
                >
                  {level.name}
                  <span>{level.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="option-section">
            <h3>Technical Settings</h3>
            <div className="tech-settings">
              <label>
                <span>BPM:</span>
                <input
                  type="number"
                  min="40"
                  max="240"
                  value={generationOptions.bpm}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, bpm: parseInt(e.target.value) }))}
                />
              </label>
              
              <label>
                <span>Key:</span>
                <select
                  value={generationOptions.key}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, key: e.target.value }))}
                >
                  {['C major', 'G major', 'D major', 'A major', 'E major', 'B major', 
                    'F# major', 'C# major', 'F major', 'Bb major', 'Eb major', 'Ab major', 
                    'Db major', 'Gb major', 'C minor', 'G minor', 'D minor', 'A minor', 
                    'E minor', 'B minor', 'F# minor', 'C# minor', 'F minor', 'Bb minor', 
                    'Eb minor', 'Ab minor'].map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Duration (s):</span>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={generationOptions.duration}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </label>

              <label>
                <span>Creativity:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={generationOptions.creativity}
                  onChange={(e) => setGenerationOptions(prev => ({ ...prev, creativity: parseFloat(e.target.value) }))}
                />
                <span>{Math.round(generationOptions.creativity * 100)}%</span>
              </label>
            </div>
          </div>

          <div className="option-section">
            <h3>Instruments</h3>
            <div className="instrument-selection">
              {['synth', 'piano', 'guitar', 'bass', 'drums', 'strings', 'brass', 'vocals', 'fx'].map(instrument => (
                <label key={instrument} className="instrument-checkbox">
                  <input
                    type="checkbox"
                    checked={generationOptions.instruments.includes(instrument)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...generationOptions.instruments, instrument]
                        : generationOptions.instruments.filter(i => i !== instrument);
                      setGenerationOptions(prev => ({ ...prev, instruments: updated }));
                    }}
                  />
                  {instrument}
                </label>
              ))}
            </div>
          </div>

          <div className="action-buttons" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button 
              className="generate-btn" 
              onClick={generateMusic} 
              disabled={isGenerating}
              style={{ flex: 2 }}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="spinning" size={20} />
                  Generating Composition...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate AI Composition
                </>
              )}
            </button>

            <button 
              className={`btn-glass ${isPlaying ? 'active' : ''}`}
              onClick={isPlaying ? stopJam : startQuickJam}
              style={{ 
                flex: 1, 
                justifyContent: 'center', 
                gap: '10px', 
                fontSize: '1rem', 
                fontWeight: 700,
                borderColor: isPlaying ? '#ef4444' : 'var(--accent-primary)',
                color: isPlaying ? '#ef4444' : 'var(--accent-primary)'
              }}
            >
              {isPlaying ? <Square size={18} /> : <Play size={18} />}
              {isPlaying ? 'STOP JAM' : 'QUICK JAM'}
            </button>
          </div>
        </div>

        <div className="results-panel">
          <h3>Generated Compositions</h3>
          
          {generatedCompositions.length === 0 ? (
            <div className="empty-state">
              <Zap size={48} />
              <p>No compositions generated yet</p>
              <span>Click "Generate Music" to create your first AI composition</span>
            </div>
          ) : (
            <div className="compositions-list">
              {generatedCompositions.map(composition => (
                <div
                  key={composition.id}
                  className={`composition-card ${selectedComposition?.id === composition.id ? 'selected' : ''}`}
                  onClick={() => setSelectedComposition(composition)}
                >
                  <div className="card-header">
                    <h4>{composition.title}</h4>
                    {composition.rating > 4.5 && <Crown size={16} className="premium-badge" />}
                  </div>
                  
                  <div className="card-details">
                    <span className="bpm">{composition.bpm} BPM</span>
                    <span className="key">{composition.key}</span>
                    <span className="style">{composition.style}</span>
                    <span className="mood">{composition.mood}</span>
                  </div>

                  <div className="card-stats">
                    <div className="stat">
                      <Clock size={12} />
                      {composition.duration}s
                    </div>
                    <div className="stat">
                      <Sparkles size={12} />
                      {Math.round(composition.uniqueness * 100)}%
                    </div>
                    <div className="stat">
                      <TrendingUp size={12} />
                      {Math.round(composition.popularity * 100)}%
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPreview(composition);
                      }}
                      className={isPlaying && selectedComposition?.id === composition.id ? 'playing' : ''}
                    >
                      {isPlaying && selectedComposition?.id === composition.id ? <Square size={14} /> : <Play size={14} />}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        applyComposition(composition);
                      }}
                    >
                      <Music size={14} />
                      Use
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadComposition(composition);
                      }}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedComposition && (
            <div className="composition-details">
              <h4>Composition Details</h4>
              <div className="detail-grid">
                <div className="detail">
                  <strong>Style:</strong> {selectedComposition.style}
                </div>
                <div className="detail">
                  <strong>Mood:</strong> {selectedComposition.mood}
                </div>
                <div className="detail">
                  <strong>BPM:</strong> {selectedComposition.bpm}
                </div>
                <div className="detail">
                  <strong>Key:</strong> {selectedComposition.key}
                </div>
                <div className="detail">
                  <strong>Duration:</strong> {selectedComposition.duration} seconds
                </div>
                <div className="detail">
                  <strong>Complexity:</strong> {selectedComposition.complexity}
                </div>
                <div className="detail">
                  <strong>Instruments:</strong> {selectedComposition.instruments.join(', ')}
                </div>
                <div className="detail">
                  <strong>Uniqueness:</strong> {Math.round(selectedComposition.uniqueness * 100)}%
                </div>
              </div>

              <div className="ai-insights">
                <h5>AI Insights</h5>
                <p>
                  This composition features {selectedComposition.complexity} patterns with 
                  a {selectedComposition.mood} feel. The {selectedComposition.style} style 
                  combines with {selectedComposition.key} tonality to create a unique musical piece.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="generator-footer">
        <div className="footer-info">
          <Settings size={16} />
          <span>Powered by Machine Learning • Real-time Generation • Customizable Parameters</span>
        </div>
        <div className="footer-stats">
          <span>{generatedCompositions.length} compositions generated</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 2s linear infinite;
        }
        .generate-btn {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px var(--accent-glow);
        }
        .generate-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
};

export default AIMusicGenerator;