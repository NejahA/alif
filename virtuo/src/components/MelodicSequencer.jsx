import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Play, Square, RefreshCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const STEPS = 16;
const NOTES = ['C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3'];

export default function MelodicSequencer() {
  const isAudioReady = useAudioSafe();
  const [grid, setGrid] = useState(() => 
    NOTES.map(() => Array(STEPS).fill(false))
  );
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [probability, setProbability] = useState(100);
  const [portamento, setPortamento] = useState(0);
  
  const synthRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    if (!isAudioReady) return;
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 0.8 }
    }).connect(getChannel('seq'));

    const handleGlobalRandomize = () => randomize();
    window.addEventListener('virtuo-randomize', handleGlobalRandomize);

    return () => {
      synthRef.current?.dispose();
      loopRef.current?.dispose();
      window.removeEventListener('virtuo-randomize', handleGlobalRandomize);
    };
  }, [isAudioReady]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({ portamento });
    }
  }, [portamento]);

  const toggleStep = (noteIndex, stepIndex) => {
    const newGrid = [...grid];
    newGrid[noteIndex] = [...newGrid[noteIndex]];
    newGrid[noteIndex][stepIndex] = !newGrid[noteIndex][stepIndex];
    setGrid(newGrid);
  };

  const randomize = () => {
    const newGrid = grid.map(() => Array(STEPS).fill(false).map(() => Math.random() > 0.9));
    setGrid(newGrid);
  };

  const shiftLeft = () => {
    const newGrid = grid.map(row => {
      const first = row.shift();
      row.push(first);
      return [...row];
    });
    setGrid(newGrid);
  };

  const shiftRight = () => {
    const newGrid = grid.map(row => {
      const last = row.pop();
      row.unshift(last);
      return [...row];
    });
    setGrid(newGrid);
  };

  const clear = () => {
    setGrid(NOTES.map(() => Array(STEPS).fill(false)));
  };

  const togglePlayback = async () => {
    await Tone.start();
    if (isPlaying) {
      loopRef.current?.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
      Tone.Transport.stop();
    } else {
      loopRef.current = new Tone.Loop((time) => {
        const step = Math.floor(Tone.Transport.ticks / Tone.Time("16n").toTicks()) % STEPS;
        
        Tone.Draw.schedule(() => {
          setCurrentStep(step);
        }, time);

        grid.forEach((row, noteIndex) => {
          if (row[step]) {
            if (Math.random() * 100 < probability) {
              synthRef.current.triggerAttackRelease(NOTES[noteIndex], '16n', time);
            }
          }
        });
      }, '16n');

      setIsPlaying(true);
      Tone.Transport.start();
      loopRef.current.start(0);
    }
  };

  const clearGrid = () => {
    setGrid(NOTES.map(() => Array(STEPS).fill(false)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '900px', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ListMusic size={20} color="var(--accent-primary)" />
          <h3 style={{ margin: 0 }}>Melodic Sequencer</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-glass" onClick={clear} style={{ padding: '5px 12px', fontSize: '0.8rem' }}>Clear</button>
          <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
          <button className="btn-glass" onClick={randomize} title="Randomize" style={{ padding: '6px' }}><RefreshCcw size={14} /></button>
          <button className="btn-glass" onClick={shiftLeft} title="Shift Left" style={{ padding: '6px' }}><ArrowLeft size={14} /></button>
          <button className="btn-glass" onClick={shiftRight} title="Shift Right" style={{ padding: '6px' }}><ArrowRight size={14} /></button>
          <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
          <button 
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={togglePlayback}
            style={{ padding: '5px 20px', fontSize: '0.9rem' }}
          >
            {isPlaying ? <><Square size={16} /> Stop</> : <><Play size={16} /> Play</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '15px', display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Probability</span>
              <span>{probability}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="1" 
              value={probability} 
              onChange={(e) => setProbability(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Portamento (Glide)</span>
              <span>{portamento.toFixed(2)}s</span>
            </div>
            <input 
              type="range" min="0" max="0.5" step="0.01" 
              value={portamento} 
              onChange={(e) => setPortamento(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `50px repeat(${STEPS}, 1fr)`, 
        gap: '5px',
        background: 'rgba(0,0,0,0.2)',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        overflowX: 'auto'
      }}>
        {/* Empty top-left corner */}
        <div />
        {/* Step Numbers */}
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} style={{ 
            textAlign: 'center', 
            fontSize: '0.6rem', 
            color: currentStep === i ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: currentStep === i ? 800 : 400
          }}>
            {i + 1}
          </div>
        ))}

        {NOTES.map((note, noteIndex) => (
          <React.Fragment key={note}>
            <div style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center',
              color: 'var(--text-muted)'
            }}>
              {note}
            </div>
            {grid[noteIndex].map((isActive, stepIndex) => (
              <motion.div
                key={stepIndex}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleStep(noteIndex, stepIndex)}
                style={{
                  aspectRatio: '1/1',
                  background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                  border: currentStep === stepIndex ? '1px solid white' : '1px solid var(--glass-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 10px var(--accent-glow)' : 'none',
                  opacity: (stepIndex % 4 === 0) && !isActive ? 0.8 : 1
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
        * Tempo is synced with the global Session BPM.
      </p>
    </div>
  );
}
