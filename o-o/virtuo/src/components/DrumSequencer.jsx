import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import masterBus from '../audio/masterBus';

const STEPS = 16;
const INSTRUMENTS = ['Kick', 'Snare', 'HiHat'];

export default function DrumSequencer() {
  const [grid, setGrid] = useState(() => 
    INSTRUMENTS.map(() => Array(STEPS).fill(false))
  );
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Drum Synthesizers
    const kick = new Tone.MembraneSynth().connect(masterBus);
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(masterBus);
    const hihat = new Tone.MetalSynth({
      frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
    }).connect(masterBus);

    const synths = [kick, snare, hihat];
    const notes = ['C1', null, null]; // Snare/Hihat don't strictly need a pitch note

    const loop = new Tone.Loop(time => {
      // Find current step based on Tone.Transport position
      // The exact step is calculated on loop schedule
      Tone.Draw.schedule(() => {
        // Calculate the current step by keeping state and advancing it
        // This is tricky inside Tone loop, so we let the loop just play matching the outer state index
        // To be safe we read Transport position to derive the 16th note index
        const transportTicks = Tone.Transport.ticks;
        const ticksPer16th = Tone.Time("16n").toTicks();
        const step = Math.floor(transportTicks / ticksPer16th) % STEPS;
        setCurrentStep(step);

        if (grid[0][step]) synths[0].triggerAttackRelease('C1', '8n');
        if (grid[1][step]) synths[1].triggerAttackRelease('16n');
        if (grid[2][step]) synths[2].triggerAttackRelease('32n');
      }, time);
      
    }, '16n');

    loop.start(0);

    return () => {
      loop.dispose();
      synths.forEach(s => s.dispose());
    };
  }, [grid]);

  const toggleStep = (instIndex, stepIndex) => {
    const newGrid = [...grid];
    newGrid[instIndex] = [...newGrid[instIndex]];
    newGrid[instIndex][stepIndex] = !newGrid[instIndex][stepIndex];
    setGrid(newGrid);
  };

  const applyPreset = (preset) => {
    const newGrid = INSTRUMENTS.map(() => Array(STEPS).fill(false));
    if (preset === 'rock') {
      // Kick on 1, 9
      newGrid[0][0] = true; newGrid[0][8] = true;
      // Snare on 5, 13
      newGrid[1][4] = true; newGrid[1][12] = true;
      // Hihat on all 8ths
      for (let i = 0; i < 16; i += 2) newGrid[2][i] = true;
    } else if (preset === 'techno') {
      // Kick on every 4
      for (let i = 0; i < 16; i += 4) newGrid[0][i] = true;
      // Snare on 5, 13
      newGrid[1][4] = true; newGrid[1][12] = true;
      // Hihat on offbeats
      for (let i = 2; i < 16; i += 4) newGrid[2][i] = true;
    } else if (preset === 'trap') {
      newGrid[0][0] = true; newGrid[0][10] = true;
      newGrid[1][8] = true;
      for (let i = 0; i < 16; i++) {
        if (Math.random() > 0.4) newGrid[2][i] = true;
      }
    }
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
      maxWidth: '600px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Drum Sequencer</h3>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="btn-glass" onClick={() => applyPreset('rock')} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Rock</button>
          <button className="btn-glass" onClick={() => applyPreset('techno')} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Techno</button>
          <button className="btn-glass" onClick={() => applyPreset('trap')} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Trap</button>
          <button className="btn-glass" onClick={() => applyPreset('clear')} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Clear</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {INSTRUMENTS.map((inst, instIndex) => (
          <div key={inst} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span style={{ width: '50px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{inst}</span>
            {grid[instIndex].map((isActive, stepIndex) => (
              <div 
                key={stepIndex}
                onClick={() => toggleStep(instIndex, stepIndex)}
                style={{
                  width: '25px', 
                  height: '25px', 
                  background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                  border: currentStep === stepIndex ? '2px solid white' : '1px solid var(--glass-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 10px var(--accent-glow)' : 'none',
                  transition: 'background 0.1s ease'
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        * Start the Metronome to play the sequence!
      </p>
    </div>
  );
}
