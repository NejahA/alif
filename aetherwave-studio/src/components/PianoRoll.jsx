import React, { useState } from 'react';
import { pianoRollEngine } from '../audio/PianoRollEngine';
import { Play, Pause, Trash2, Shuffle, Music, Sliders } from 'lucide-react';

export const PianoRoll = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [grid, setGrid] = useState([...pianoRollEngine.grid.map(row => [...row])]);

  const toggleSequencer = () => {
    const running = pianoRollEngine.toggleSequencer((step) => {
      setCurrentStep(step);
    });
    setIsPlaying(running);
    if (!running) setCurrentStep(-1);
  };

  const handleCellClick = (rowIdx, stepIdx) => {
    pianoRollEngine.toggleCell(rowIdx, stepIdx);
    setGrid([...pianoRollEngine.grid.map(row => [...row])]);
  };

  const handleClear = () => {
    pianoRollEngine.clearGrid();
    setGrid([...pianoRollEngine.grid.map(row => [...row])]);
  };

  const handleRandomize = () => {
    pianoRollEngine.randomizeGrid();
    setGrid([...pianoRollEngine.grid.map(row => [...row])]);
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '920px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 48,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      borderRadius: '20px'
    }}>
      {/* Header & Play Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleSequencer}
            className={`btn-primary ${isPlaying ? 'glow-pink' : ''}`}
            style={{ padding: '0.5rem 1.2rem' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Stop Melody' : 'Play Melody Loop'}</span>
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff' }}>
            Interactive DAW Piano Roll Sequencer
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRandomize}
            className="glass-pill"
            style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--accent-cyan)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Shuffle size={14} />
            <span>Randomize</span>
          </button>
          <button
            onClick={handleClear}
            className="glass-pill"
            style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '8px' }}>✕</button>
        </div>
      </div>

      {/* Grid Canvas Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {pianoRollEngine.notes.map((noteObj, rowIdx) => (
          <div key={noteObj.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Pitch Key Label */}
            <div style={{
              width: '60px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              background: noteObj.isBlack ? '#121629' : 'rgba(255,255,255,0.85)',
              color: noteObj.isBlack ? '#fff' : '#0f172a',
              textAlign: 'center',
              border: '1px solid var(--border-glass)'
            }}>
              {noteObj.name}
            </div>

            {/* 16 Step Note Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '4px', flex: 1 }}>
              {Array.from({ length: 16 }).map((_, stepIdx) => {
                const isActive = grid[rowIdx]?.[stepIdx] === 1;
                const isCurrent = currentStep === stepIdx;

                return (
                  <button
                    key={stepIdx}
                    onClick={() => handleCellClick(rowIdx, stepIdx)}
                    style={{
                      height: '24px',
                      borderRadius: '4px',
                      background: isActive 
                        ? (isCurrent ? '#fff' : 'var(--accent-purple)')
                        : (isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.04)'),
                      border: isCurrent ? '1px solid #fff' : '1px solid var(--border-glass)',
                      boxShadow: isActive ? '0 0 8px var(--accent-purple)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.08s ease'
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
