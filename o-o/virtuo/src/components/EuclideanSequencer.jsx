import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Play, Square, RefreshCcw, Music } from 'lucide-react';
import masterBus from '../audio/masterBus';

// Bjorklund algorithm for Euclidean rhythms
const getEuclideanRhythm = (steps, pulses) => {
  if (pulses > steps) pulses = steps;
  if (pulses === 0) return Array(steps).fill(0);
  
  let pattern = [];
  for (let i = 0; i < steps; i++) {
    pattern.push([i < pulses ? 1 : 0]);
  }

  let count = steps;
  let remainder = pulses;
  let divisor = steps - pulses;
  
  while (remainder > 1) {
    let t = Math.min(remainder, divisor);
    for (let i = 0; i < t; i++) {
      pattern[i] = [...pattern[i], ...pattern[count - 1 - i]];
    }
    count -= t;
    divisor = Math.abs(remainder - divisor);
    remainder = t;
  }
  
  return pattern.flat();
};

const CHANNEL_CONFIG = [
  { id: 'kick', name: 'Kick', color: '#f87171', note: 'C1', synth: 'MembraneSynth' },
  { id: 'snare', name: 'Snare', color: '#60a5fa', note: 'D2', synth: 'NoiseSynth' },
  { id: 'hihat', name: 'HiHat', color: '#fbbf24', note: 'G3', synth: 'MetalSynth' },
  { id: 'perc', name: 'Perc', color: '#34d399', note: 'E4', synth: 'MonoSynth' }
];

export default function EuclideanSequencer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [channels, setChannels] = useState({
    kick: { steps: 16, pulses: 4, rotate: 0 },
    snare: { steps: 16, pulses: 2, rotate: 0 },
    hihat: { steps: 16, pulses: 8, rotate: 0 },
    perc: { steps: 16, pulses: 3, rotate: 0 }
  });
  const [currentStep, setCurrentStep] = useState(0);
  
  const synthsRef = useRef({});
  const sequenceRef = useRef(null);

  useEffect(() => {
    // Initialize synths
    synthsRef.current.kick = new Tone.MembraneSynth().connect(masterBus);
    synthsRef.current.snare = new Tone.NoiseSynth({
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
    }).connect(masterBus);
    synthsRef.current.hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, sustain: 0 }
    }).connect(masterBus);
    synthsRef.current.perc = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0 }
    }).connect(masterBus);

    return () => {
      Object.values(synthsRef.current).forEach(s => s.dispose());
      if (sequenceRef.current) sequenceRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (sequenceRef.current) sequenceRef.current.dispose();

    sequenceRef.current = new Tone.Sequence((time, step) => {
      setCurrentStep(step);
      
      CHANNEL_CONFIG.forEach(config => {
        const { id, note } = config;
        const channel = channels[id];
        const rhythm = getEuclideanRhythm(channel.steps, channel.pulses);
        
        // Handle rotation
        const rotatedIndex = (step + channel.rotate) % channel.steps;
        if (rhythm[rotatedIndex]) {
          if (id === 'snare') {
            synthsRef.current[id].triggerAttackRelease('8n', time);
          } else {
            synthsRef.current[id].triggerAttackRelease(note, '16n', time);
          }
        }
      });
    }, Array.from({ length: 16 }, (_, i) => i), "16n");

    if (isPlaying) {
      sequenceRef.current.start(0);
    }
  }, [channels, isPlaying]);

  const togglePlay = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const updateChannel = (id, field, value) => {
    setChannels(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: Math.max(0, value) }
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="icon-pulse" style={{ background: 'var(--accent-primary)', padding: '10px', borderRadius: '12px' }}>
            <Music size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Euclidean Sequencer</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bjorklund Algorithm Rhythms</p>
          </div>
        </div>
        <button 
          className={`btn-glass ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
          style={{ padding: '12px 30px', fontSize: '1.1rem', borderRadius: '15px' }}
        >
          {isPlaying ? <Square size={20} style={{ marginRight: '10px' }} /> : <Play size={20} style={{ marginRight: '10px' }} />}
          {isPlaying ? 'STOP' : 'PLAY'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {CHANNEL_CONFIG.map(config => {
          const channel = channels[config.id];
          const rhythm = getEuclideanRhythm(channel.steps, channel.pulses);
          
          return (
            <div key={config.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: config.color }}>{config.name}</span>
                <RefreshCcw size={14} style={{ opacity: 0.5 }} />
              </div>

              {/* Steps/Pulses controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Steps: {channel.steps}</span>
                  <input type="range" min="1" max="16" value={channel.steps} onChange={(e) => updateChannel(config.id, 'steps', parseInt(e.target.value))} style={{ width: '100px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Pulses: {channel.pulses}</span>
                  <input type="range" min="0" max={channel.steps} value={channel.pulses} onChange={(e) => updateChannel(config.id, 'pulses', parseInt(e.target.value))} style={{ width: '100px' }} />
                </div>
              </div>

              {/* Visual Ring */}
              <div style={{ height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                {rhythm.map((active, i) => {
                  const angle = (i / channel.steps) * Math.PI * 2 - Math.PI / 2;
                  const x = Math.cos(angle) * 50;
                  const y = Math.sin(angle) * 50;
                  const isCurrent = (currentStep % channel.steps) === i;
                  
                  return (
                    <motion.div
                      key={i}
                      animate={{ scale: isCurrent && active ? 1.5 : 1 }}
                      style={{
                        position: 'absolute',
                        left: `calc(50% + ${x}px - 4px)`,
                        top: `calc(50% + ${y}px - 4px)`,
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: active ? config.color : 'rgba(255,255,255,0.1)',
                        boxShadow: isCurrent && active ? `0 0 10px ${config.color}` : 'none'
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          The Euclidean algorithm produces rhythms where the pulses are distributed as evenly as possible among the steps. 
          This principle is found in many traditional music styles across the world.
        </p>
      </div>
    </div>
  );
}
