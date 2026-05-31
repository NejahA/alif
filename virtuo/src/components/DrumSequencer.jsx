import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, RefreshCcw, ArrowLeft, ArrowRight, Settings2, Sliders } from 'lucide-react';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const STEPS = 16;
const INSTRUMENTS = [
  { name: 'Kick', note: 'C1', color: '#f87171' },
  { name: 'Snare', note: 'D1', color: '#60a5fa' },
  { name: 'HiHat', note: 'F#1', color: '#34d399' },
  { name: 'Clap', note: 'E1', color: '#fbbf24' },
];

const PATTERNS = {
  'empty': [
    Array(16).fill(false), Array(16).fill(false), Array(16).fill(false), Array(16).fill(false)
  ],
  'house': [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  ],
  'hiphop': [
    [true, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  ],
  'techno': [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false]
  ],
  'trap': [
    [true, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false],
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false]
  ]
};

export default function DrumSequencer() {
  const isAudioReady = useAudioSafe();
  const [grid, setGrid] = useState(() => 
    INSTRUMENTS.map(() => Array(STEPS).fill(null).map(() => ({ active: false, probability: 1, velocity: 0.8 })))
  );
  const [currentStep, setCurrentStep] = useState(-1);
  const [editingStep, setEditingStep] = useState(null); // { instIndex, stepIndex }
  
  const synthRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    if (!isAudioReady) return;
    // Drum Synthesizers
    const kick = new Tone.MembraneSynth().connect(getChannel('drums'));
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(getChannel('drums'));
    const hihat = new Tone.MetalSynth({
      frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
    }).connect(getChannel('drums'));
    const clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
    }).connect(getChannel('drums'));

    const synths = [kick, snare, hihat, clap];

    const loop = new Tone.Loop(time => {
      const transportTicks = Tone.Transport.ticks;
      const ticksPer16th = Tone.Time("16n").toTicks();
      const step = Math.floor(transportTicks / ticksPer16th) % STEPS;
      
      Tone.Draw.schedule(() => {
        setCurrentStep(step);
      }, time);

      grid.forEach((row, instIndex) => {
        const cell = row[step];
        if (cell.active && Math.random() < cell.probability) {
          const velocity = cell.velocity;
          if (instIndex === 0) synths[0].triggerAttackRelease('C1', '8n', time, velocity);
          else synths[instIndex].triggerAttackRelease('16n', time, velocity);
        }
      });
      
    }, '16n');

    loop.start(0);

    const handleGlobalRandomize = () => randomize();
    window.addEventListener('virtuo-randomize', handleGlobalRandomize);

    return () => {
      loop.dispose();
      synths.forEach(s => s.dispose());
      window.removeEventListener('virtuo-randomize', handleGlobalRandomize);
    };
  }, [grid]);

  useEffect(() => {
    const handleQuickJam = (e) => {
      const { style, mood } = e.detail;
      // Simple generative pattern based on style
      const newGrid = Array(4).fill(0).map(() => Array(16).fill(false));
      
      // Basic Kick (0) and Snare (1)
      for (let i = 0; i < 16; i++) {
        if (i % 4 === 0) newGrid[0][i] = true; // Kick on 1, 5, 9, 13
        if (i % 8 === 4) newGrid[1][i] = true; // Snare on 5, 13
        
        // Random Hats (2) and Perc (3) based on style
        if (style === 'Techno' || style === 'House') {
          if (i % 2 === 0) newGrid[2][i] = Math.random() > 0.2;
        } else {
          if (i % 4 === 2) newGrid[2][i] = Math.random() > 0.3;
        }
      }
      setGrid(newGrid);
    };

    window.addEventListener('virtuo-quick-jam', handleQuickJam);
    return () => window.removeEventListener('virtuo-quick-jam', handleQuickJam);
  }, []);

  const toggleStep = (instIndex, stepIndex, e) => {
    if (e && e.shiftKey) {
      setEditingStep({ instIndex, stepIndex });
      return;
    }
    
    const newGrid = [...grid];
    newGrid[instIndex] = [...newGrid[instIndex]];
    const wasActive = newGrid[instIndex][stepIndex].active;
    newGrid[instIndex][stepIndex] = { 
      ...newGrid[instIndex][stepIndex], 
      active: !wasActive 
    };
    setGrid(newGrid);

    // Gain XP in Rhythm and Innovation
    if (!wasActive) {
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'rhythm', amount: 5 }
      }));
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'innovation', amount: 2 }
      }));
    }
  };

  const applyPattern = (patternId) => {
    const pattern = PATTERNS[patternId];
    if (!pattern) return;
    
    const newGrid = grid.map((row, i) => 
      row.map((cell, j) => ({
        ...cell,
        active: pattern[i][j]
      }))
    );
    setGrid(newGrid);
  };

  const updateStepValue = (param, value) => {
    if (!editingStep) return;
    const { instIndex, stepIndex } = editingStep;
    const newGrid = [...grid];
    newGrid[instIndex] = [...newGrid[instIndex]];
    newGrid[instIndex][stepIndex] = { ...newGrid[instIndex][stepIndex], [param]: value };
    setGrid(newGrid);
  };

  const applyPreset = (preset) => {
    const newGrid = INSTRUMENTS.map(() => Array(STEPS).fill(null).map(() => ({ active: false, probability: 1, velocity: 0.8 })));
    if (preset === 'rock') {
      newGrid[0][0].active = true; newGrid[0][8].active = true;
      newGrid[1][4].active = true; newGrid[1][12].active = true;
      for (let i = 0; i < 16; i += 2) newGrid[2][i].active = true;
    } else if (preset === 'techno') {
      for (let i = 0; i < 16; i += 4) newGrid[0][i].active = true;
      newGrid[1][4].active = true; newGrid[1][12].active = true;
      for (let i = 2; i < 16; i += 4) newGrid[2][i].active = true;
    } else if (preset === 'trap') {
      newGrid[0][0].active = true; newGrid[0][10].active = true;
      newGrid[1][8].active = true;
      for (let i = 0; i < 16; i++) {
        if (Math.random() > 0.4) newGrid[2][i].active = true;
      }
    }
    setGrid(newGrid);
  };

  const randomize = () => {
    const newGrid = grid.map(() => Array(STEPS).fill(null).map(() => ({ 
      active: Math.random() > 0.8, 
      probability: 0.5 + Math.random() * 0.5, 
      velocity: 0.4 + Math.random() * 0.6 
    })));
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

  const generateEuclidean = (k, n) => {
    const result = Array(n).fill(false);
    if (k <= 0) return result;
    if (k >= n) return Array(n).fill(true);
    let current = 0;
    for (let i = 0; i < k; i++) {
      result[Math.floor(current)] = true;
      current += n / k;
    }
    return result;
  };

  const applyEuclidean = (instIndex) => {
    const k = prompt(`Enter number of hits for ${INSTRUMENTS[instIndex].name} (0-16):`, "4");
    if (k === null) return;
    const pattern = generateEuclidean(parseInt(k), STEPS);
    const newGrid = [...grid];
    newGrid[instIndex] = pattern.map(active => ({ active, probability: 1, velocity: 0.8 }));
    setGrid(newGrid);
  };

  return (
    <div style={{
      padding: '20px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      marginTop: '20px',
      width: '100%',
      maxWidth: '800px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Advanced Drum Sequencer</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button className="btn-glass" onClick={() => Tone.Transport.toggle()} style={{ color: 'var(--accent-primary)', padding: '4px' }}>
            {Tone.Transport.state === 'started' ? <Square size={16} /> : <Play size={16} />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PATTERN</span>
            <select 
              className="btn-glass" 
              onChange={(e) => applyPattern(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            >
              <option value="empty">Clear</option>
              <option value="house">Classic House</option>
              <option value="hiphop">Boom Bap</option>
              <option value="techno">Industrial Techno</option>
              <option value="trap">Trap Heat</option>
            </select>
          </div>
          <div style={{ width: '1px', height: '15px', background: 'var(--glass-border)', margin: '0 5px' }} />
          <button className="btn-glass" onClick={randomize} title="Randomize Pattern" style={{ padding: '4px' }}><RefreshCcw size={12} /></button>
          <button className="btn-glass" onClick={shiftLeft} title="Shift Left" style={{ padding: '4px' }}><ArrowLeft size={12} /></button>
          <button className="btn-glass" onClick={shiftRight} title="Shift Right" style={{ padding: '4px' }}><ArrowRight size={12} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {INSTRUMENTS.map((inst, instIndex) => (
            <div key={instIndex} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <div style={{ width: '80px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{inst.name}</span>
                <button 
                  className="btn-glass" 
                  onClick={() => applyEuclidean(instIndex)}
                  style={{ padding: '2px', borderRadius: '4px' }}
                  title="Euclidean Rhythm"
                >
                  <Sliders size={10} />
                </button>
              </div>
              {grid[instIndex].map((cell, stepIndex) => (
                <div 
                  key={stepIndex}
                  onClick={(e) => toggleStep(instIndex, stepIndex, e)}
                  style={{
                    width: '30px', 
                    height: '30px', 
                    background: cell.active ? inst.color : 'rgba(255,255,255,0.1)',
                    opacity: cell.active ? cell.probability : 1,
                    border: currentStep === stepIndex ? '2px solid white' : (editingStep?.instIndex === instIndex && editingStep?.stepIndex === stepIndex ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)'),
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: cell.active ? `0 0 10px ${inst.color}88` : 'none',
                    transition: 'all 0.1s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {cell.active && cell.velocity < 0.5 && <div style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%' }} />}
                </div>
              ))}
            </div>
          ))}
        </div>

        {editingStep && (
          <div className="glass-panel" style={{ width: '200px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.8rem' }}>Step Edit</h4>
              <button onClick={() => setEditingStep(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
                  <span>Probability</span>
                  <span>{Math.round(grid[editingStep.instIndex][editingStep.stepIndex].probability * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={grid[editingStep.instIndex][editingStep.stepIndex].probability}
                  onChange={(e) => updateStepValue('probability', Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6 }}>
                  <span>Velocity</span>
                  <span>{Math.round(grid[editingStep.instIndex][editingStep.stepIndex].velocity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01"
                  value={grid[editingStep.instIndex][editingStep.stepIndex].velocity}
                  onChange={(e) => updateStepValue('velocity', Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
          * Shift+Click to edit step probability and velocity.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
          * Start the Metronome to play!
        </p>
      </div>
    </div>
  );
}
