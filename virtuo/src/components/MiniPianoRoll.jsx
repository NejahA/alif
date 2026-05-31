import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Play, Square, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { getChannel } from '../audio/masterBus';

const STEPS = 16;
const NOTES = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];

export default function MiniPianoRoll() {
  const [grid, setGrid] = useState(() => 
    NOTES.map(() => Array(STEPS).fill(false))
  );
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const synthRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth).connect(getChannel('synth'));
    
    loopRef.current = new Tone.Sequence((time, step) => {
      Tone.Draw.schedule(() => {
        setCurrentStep(step);
      }, time);

      NOTES.forEach((note, noteIndex) => {
        if (grid[noteIndex][step]) {
          synthRef.current.triggerAttackRelease(note, "16n", time);
        }
      });
    }, Array.from({ length: STEPS }, (_, i) => i), "16n");

    return () => {
      synthRef.current?.dispose();
      loopRef.current?.dispose();
    };
  }, [grid]);

  const toggleStep = (noteIndex, stepIndex) => {
    const newGrid = [...grid];
    newGrid[noteIndex] = [...newGrid[noteIndex]];
    newGrid[noteIndex][stepIndex] = !newGrid[noteIndex][stepIndex];
    setGrid(newGrid);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      Tone.Transport.stop();
      loopRef.current.stop();
    } else {
      Tone.Transport.start();
      loopRef.current.start(0);
    }
    setIsPlaying(!isPlaying);
  };

  const clearGrid = () => {
    setGrid(NOTES.map(() => Array(STEPS).fill(false)));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Music size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Mini Piano Roll</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-glass" onClick={clearGrid} title="Clear All">
            <Trash2 size={14} />
          </button>
          <button className={`btn-glass ${isPlaying ? 'active' : ''}`} onClick={togglePlayback}>
            {isPlaying ? <Square size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '5px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '5px' }}>
          {NOTES.map(note => (
            <div key={note} style={{ height: '25px', display: 'flex', alignItems: 'center', fontSize: '0.65rem', fontWeight: 800, opacity: 0.5 }}>
              {note}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {grid.map((row, noteIndex) => (
            <div key={noteIndex} style={{ display: 'flex', gap: '2px' }}>
              {row.map((isActive, stepIndex) => (
                <div 
                  key={stepIndex}
                  onClick={() => toggleStep(noteIndex, stepIndex)}
                  style={{
                    flex: 1,
                    height: '25px',
                    background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    border: currentStep === stepIndex ? '1px solid white' : '1px solid transparent',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 0 8px var(--accent-glow)' : 'none',
                    transition: 'background 0.1s ease'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.4, textAlign: 'center' }}>
        Click to draw notes. Syncs with the global transport.
      </div>
    </div>
  );
}
