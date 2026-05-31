import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STEPS = 16;
const INSTRUMENTS = [
  { id: 'kick', name: 'BD', color: '#ef4444' }, // Bass Drum
  { id: 'snare', name: 'SD', color: '#f97316' }, // Snare Drum
  { id: 'hihat_c', name: 'CH', color: '#eab308' }, // Closed Hihat
  { id: 'hihat_o', name: 'OH', color: '#eab308' }, // Open Hihat
  { id: 'clap', name: 'CP', color: '#8b5cf6' }   // Clap
];

export default function TR808() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState(-5);
  
  // 2D Array: [instrumentIndex][stepIndex] -> boolean
  const [pattern, setPattern] = useState(
    Array(INSTRUMENTS.length).fill().map(() => Array(STEPS).fill(false))
  );

  const synthsRef = useRef({});

  useEffect(() => {
    // 808 Synth Emulations
    const master = new Tone.Volume(volume).connect(masterBus);

    synthsRef.current = {
      kick: new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4 }).connect(master),
      snare: new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 } }).connect(master),
      hihat_c: new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).connect(master),
      hihat_o: new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.3, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).connect(master),
      clap: new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0 } }).connect(master)
    };

    return () => {
      Object.values(synthsRef.current).forEach(synth => synth.dispose());
      master.dispose();
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  // Update volume
  useEffect(() => {
    Object.values(synthsRef.current).forEach(synth => {
        if(synth.volume) synth.volume.rampTo(volume, 0.1);
    });
  }, [volume]);

  // Sequencer Logic
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;

    const loop = new Tone.Sequence((time, step) => {
      setCurrentStep(step);
      
      pattern.forEach((track, i) => {
        if (track[step]) {
          const instId = INSTRUMENTS[i].id;
          if (instId === 'kick') synthsRef.current.kick.triggerAttackRelease('C1', '8n', time);
          if (instId === 'snare') synthsRef.current.snare.triggerAttackRelease('8n', time);
          if (instId === 'hihat_c') synthsRef.current.hihat_c.triggerAttackRelease('32n', time);
          if (instId === 'hihat_o') synthsRef.current.hihat_o.triggerAttackRelease('8n', time);
          if (instId === 'clap') synthsRef.current.clap.triggerAttackRelease('8n', time);
        }
      });
    }, Array.from({ length: STEPS }, (_, i) => i), "16n");

    if (isPlaying) {
      Tone.start();
      loop.start(0);
      Tone.Transport.start();
    } else {
      loop.stop();
      Tone.Transport.stop();
      setCurrentStep(0);
    }

    return () => {
      loop.dispose();
    };
  }, [isPlaying, pattern, tempo]);

  const toggleStep = (instIndex, stepIndex) => {
    const newPattern = [...pattern];
    newPattern[instIndex] = [...newPattern[instIndex]];
    newPattern[instIndex][stepIndex] = !newPattern[instIndex][stepIndex];
    setPattern(newPattern);
  };

  const togglePlay = async () => {
    await Tone.start();
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '800px' }}>
      
      {/* 808 Top Panel */}
      <div style={{ 
          display: 'flex', justifyContent: 'space-between', padding: '20px', 
          background: '#27272a', borderRadius: '10px 10px 0 0', width: '100%',
          borderTop: '5px solid #ea580c', // Classic 808 Orange line
          borderBottom: '2px solid #111'
      }}>
        <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>
            <span style={{ color: '#ea580c' }}>TR</span>-808
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button 
                onClick={togglePlay}
                style={{ 
                    padding: '10px 20px', background: isPlaying ? '#ea580c' : '#3f3f46',
                    color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'
                }}
            >
                {isPlaying ? <Square size={16} /> : <Play size={16} />} {isPlaying ? 'STOP' : 'START'}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: '#888', fontSize: '10px' }}>
                <label>TEMPO</label>
                <input 
                    type="range" min="60" max="200" step="1" 
                    value={tempo} onChange={(e) => setTempo(Number(e.target.value))}
                    style={{ width: '100px', accentColor: '#ea580c' }}
                />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: '#888', fontSize: '10px' }}>
                <label>LEVEL</label>
                <input 
                    type="range" min="-30" max="0" step="1" 
                    value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                    style={{ width: '100px', accentColor: '#fff' }}
                />
            </div>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div style={{ width: '100%', background: '#18181b', padding: '20px', borderRadius: '0 0 10px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {INSTRUMENTS.map((inst, i) => (
            <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', color: inst.color, fontWeight: 'bold', fontSize: '14px' }}>{inst.name}</div>
                <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                    {pattern[i].map((isActive, j) => (
                        <div 
                            key={j}
                            onClick={() => toggleStep(i, j)}
                            style={{ 
                                flex: 1, height: '40px', 
                                background: isActive ? inst.color : (j % 4 === 0 ? '#3f3f46' : '#27272a'),
                                borderRadius: '3px', cursor: 'pointer',
                                border: currentStep === j ? '2px solid #fff' : '2px solid transparent',
                                boxShadow: isActive ? `0 0 10px ${inst.color}` : 'none',
                                transition: 'all 0.05s'
                            }}
                        />
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Classic 16-step drum machine. Program your pattern and hit START.</p>
    </div>
  );
}
