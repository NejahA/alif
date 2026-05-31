import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, Plus, Trash2, Save, FolderOpen, Copy, Scissors, Layers } from 'lucide-react';

const PatternArranger = () => {
  const [patterns, setPatterns] = useState(() => {
    const saved = localStorage.getItem('virtuo_patterns');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [arrangement, setArrangement] = useState(() => {
    const saved = localStorage.getItem('virtuo_arrangement');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [selectedPattern, setSelectedPattern] = useState(null);
  
  const transportRef = useRef(null);
  const sequenceRef = useRef(null);

  // Initialize Tone.js transport
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
    
    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [bpm]);

  // Save patterns and arrangement to localStorage
  useEffect(() => {
    localStorage.setItem('virtuo_patterns', JSON.stringify(patterns));
    localStorage.setItem('virtuo_arrangement', JSON.stringify(arrangement));
  }, [patterns, arrangement]);

  const createPattern = (instrumentType, name = `Pattern ${patterns.length + 1}`) => {
    const newPattern = {
      id: Date.now(),
      name,
      instrument: instrumentType,
      steps: Array(16).fill(false),
      notes: [],
      createdAt: new Date().toISOString()
    };
    setPatterns(prev => [...prev, newPattern]);
    return newPattern;
  };

  const addToArrangement = (patternId, position) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;
    
    const newEntry = {
      id: Date.now(),
      patternId,
      position,
      length: 4, // 4 bars by default
      muted: false
    };
    
    setArrangement(prev => [...prev, newEntry]);
  };

  const togglePlayback = async () => {
    await Tone.start();
    
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
      setCurrentPosition(0);
    } else {
      setIsPlaying(true);
      Tone.Transport.start();
      
      // Create transport sequence
      sequenceRef.current = new Tone.Sequence((time, pos) => {
        setCurrentPosition(pos);
        
        // Trigger patterns at this position
        arrangement.forEach(entry => {
          if (!entry.muted && pos >= entry.position && pos < entry.position + entry.length) {
            const pattern = patterns.find(p => p.id === entry.patternId);
            if (pattern) {
              // Dispatch event to trigger the pattern
              window.dispatchEvent(new CustomEvent('virtuo-pattern-trigger', {
                detail: { pattern, time }
              }));
            }
          }
        });
        
      }, Array.from({ length: 64 }, (_, i) => i), '16n');
      
      sequenceRef.current.start(0);
    }
  };

  const clearArrangement = () => {
    if (confirm('Are you sure you want to clear the entire arrangement?')) {
      setArrangement([]);
    }
  };

  const exportSong = () => {
    const songData = {
      patterns,
      arrangement,
      bpm,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const data = JSON.stringify(songData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `virtuo_song_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSong = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const songData = JSON.parse(e.target.result);
        if (songData.patterns && songData.arrangement) {
          setPatterns(songData.patterns);
          setArrangement(songData.arrangement);
          if (songData.bpm) setBpm(songData.bpm);
          alert('Song imported successfully!');
        }
      } catch (error) {
        alert('Invalid song file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px', 
      width: '100%', 
      maxWidth: '1200px', 
      padding: '20px' 
    }}>
      {/* Header Controls */}
      <div className="glass-panel" style={{ 
        padding: '15px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={24} color="var(--accent-primary)" />
          <h2 style={{ margin: 0 }}>Pattern Arranger</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* BPM Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BPM:</span>
            <input
              type="number"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(Math.max(40, Math.min(240, Number(e.target.value))))}
              style={{ 
                width: '60px', 
                padding: '4px 8px', 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid var(--glass-border)',
                borderRadius: '4px',
                color: 'var(--text-main)'
              }}
            />
          </div>
          
          <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
          
          <button 
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={togglePlayback}
            style={{ padding: '8px 16px' }}
          >
            {isPlaying ? <Square size={16} /> : <Play size={16} />}
            {isPlaying ? ' Stop' : ' Play'}
          </button>
          
          <button 
            className="btn-glass"
            onClick={clearArrangement}
            style={{ padding: '8px 12px' }}
          >
            <Trash2 size={16} />
            Clear
          </button>
          
          <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
          
          <label className="btn-glass" style={{ cursor: 'pointer', padding: '8px 12px' }}>
            <FolderOpen size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importSong}
              style={{ display: 'none' }}
            />
          </label>
          
          <button 
            className="btn-glass"
            onClick={exportSong}
            style={{ padding: '8px 12px' }}
          >
            <Save size={16} />
            Export
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', height: '500px' }}>
        {/* Patterns Library */}
        <div className="glass-panel" style={{ 
          padding: '15px', 
          width: '250px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '15px'
        }}>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>Patterns</h4>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {patterns.map(pattern => (
              <div
                key={pattern.id}
                className="btn-glass"
                onClick={() => setSelectedPattern(pattern)}
                style={{ 
                  padding: '10px',
                  cursor: 'pointer',
                  border: selectedPattern?.id === pattern.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{pattern.name}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{pattern.instrument}</div>
              </div>
            ))}
            
            {patterns.length === 0 && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: 'var(--text-muted)',
                fontSize: '0.8rem'
              }}>
                No patterns created yet.
                <br />
                Create patterns in individual instruments first.
              </div>
            )}
          </div>
          
          <button 
            className="btn-glass"
            onClick={() => createPattern('drum')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Plus size={16} />
            New Pattern
          </button>
        </div>

        {/* Arrangement Timeline */}
        <div className="glass-panel" style={{ 
          flex: 1, 
          padding: '15px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '15px'
        }}>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>Arrangement Timeline</h4>
          
          <div style={{ 
            flex: 1, 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '6px',
            padding: '10px',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Timeline grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(16, 1fr)', 
              gap: '2px',
              height: '100%'
            }}>
              {Array.from({ length: 64 }, (_, i) => (
                <div
                  key={i}
                  style={{ 
                    background: currentPosition === i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '2px',
                    minHeight: '20px'
                  }}
                  title={`Bar ${Math.floor(i / 4) + 1}, Step ${(i % 4) + 1}`}
                />
              ))}
            </div>
            
            {/* Playhead */}
            {isPlaying && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: `${(currentPosition / 64) * 100}%`,
                  width: '2px',
                  height: 'calc(100% - 20px)',
                  background: 'var(--accent-primary)',
                  transform: 'translateX(-1px)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Drag patterns from the library to the timeline to arrange your song
          </div>
        </div>
      </div>

      {/* Pattern Editor (would be implemented based on selected pattern type) */}
      {selectedPattern && (
        <div className="glass-panel" style={{ padding: '15px' }}>
          <h4 style={{ margin: 0, marginBottom: '15px' }}>Editing: {selectedPattern.name}</h4>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pattern editor would appear here based on the instrument type.
            This would integrate with the existing sequencer components.
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternArranger;