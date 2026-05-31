import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Mic, Volume2, Zap, Activity, Music } from 'lucide-react';
import masterBus from '../audio/masterBus';

const BEATBOX_SOUNDS = [
  { id: 'kick', name: 'Kick', key: 'q', icon: '👢', color: '#ef4444' },
  { id: 'snare', name: 'Snare', key: 'w', icon: '🥁', color: '#3b82f6' },
  { id: 'hihat', name: 'Hi-Hat', key: 'e', icon: '🔔', color: '#10b981' },
  { id: 'clap', name: 'Clap', key: 'r', icon: '👏', color: '#f59e0b' },
  { id: 'shaker', name: 'Shaker', key: 't', icon: '🥚', color: '#8b5cf6' },
  { id: 'bass', name: 'Bass', key: 'a', icon: '🎸', color: '#ec4899' },
  { id: 'scratch', name: 'Scratch', key: 's', icon: '🌀', color: '#06b6d4' },
  { id: 'cowbell', name: 'Cowbell', key: 'd', icon: '🔔', color: '#84cc16' },
];

export default function Beatbox() {
  const soundsRef = useRef({});
  const [activeSounds, setActiveSounds] = useState(new Set());
  const [bpm, setBpm] = useState(120);
  const [isLooping, setIsLooping] = useState(false);
  const [loopPattern, setLoopPattern] = useState({});
  const [volume, setVolume] = useState(0.7);
  const [effects, setEffects] = useState({
    distortion: 0,
    reverb: 0.3,
    delay: 0.2,
  });

  useEffect(() => {
    // Initialize beatbox sounds
    soundsRef.current = {
      kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 8,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
      }).connect(masterBus),
      
      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
      }).connect(masterBus),
      
      hihat: new Tone.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000
      }).connect(masterBus),
      
      clap: new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
      }).connect(masterBus),
      
      shaker: new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 }
      }).connect(masterBus),
      
      bass: new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.1 }
      }).connect(masterBus),
      
      scratch: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.05, decay: 0.5, sustain: 0, release: 0.1 }
      }).connect(masterBus),
      
      cowbell: new Tone.MetalSynth({
        frequency: 800,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
        harmonicity: 1.5,
        modulationIndex: 16,
        resonance: 3000
      }).connect(masterBus),
    };

    // Add effects
    const distortion = new Tone.Distortion(effects.distortion).connect(masterBus);
    const reverb = new Tone.Reverb({ decay: 2, wet: effects.reverb }).connect(masterBus);
    const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.3, wet: effects.delay }).connect(masterBus);

    // Connect all sounds to effects
    Object.values(soundsRef.current).forEach(sound => {
      sound.connect(distortion);
      sound.connect(reverb);
      sound.connect(delay);
    });

    // Keyboard listeners
    const handleKeyDown = (e) => {
      const sound = BEATBOX_SOUNDS.find(s => s.key === e.key.toLowerCase());
      if (sound && !activeSounds.has(sound.id)) {
        playSound(sound.id);
      }
    };

    const handleKeyUp = (e) => {
      const sound = BEATBOX_SOUNDS.find(s => s.key === e.key.toLowerCase());
      if (sound) {
        setActiveSounds(prev => {
          const next = new Set(prev);
          next.delete(sound.id);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Loop interval
    let loopInterval;
    if (isLooping) {
      loopInterval = setInterval(() => {
        Object.entries(loopPattern).forEach(([soundId, isActive]) => {
          if (isActive) {
            playSound(soundId);
          }
        });
      }, 60000 / bpm / 4); // 16th notes
    }

    return () => {
      Object.values(soundsRef.current).forEach(sound => sound.dispose());
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (loopInterval) clearInterval(loopInterval);
    };
  }, [isLooping, bpm, loopPattern]);

  const playSound = async (soundId) => {
    await Tone.start();
    const sound = soundsRef.current[soundId];
    
    if (sound) {
      setActiveSounds(prev => new Set(prev).add(soundId));
      
      switch(soundId) {
        case 'kick':
          sound.triggerAttackRelease('C2', '16n');
          break;
        case 'snare':
          sound.triggerAttackRelease('16n');
          break;
        case 'hihat':
          sound.triggerAttackRelease('C6', '16n');
          break;
        case 'clap':
          sound.triggerAttackRelease('16n');
          break;
        case 'shaker':
          sound.triggerAttackRelease('32n');
          break;
        case 'bass':
          sound.triggerAttackRelease('C1', '8n');
          break;
        case 'scratch':
          sound.triggerAttackRelease('8n');
          break;
        case 'cowbell':
          sound.triggerAttackRelease('C5', '16n');
          break;
      }
      
      setTimeout(() => {
        setActiveSounds(prev => {
          const next = new Set(prev);
          next.delete(soundId);
          return next;
        });
      }, 100);
    }
  };

  const toggleLoopCell = (soundId, step) => {
    setLoopPattern(prev => {
      const key = `${soundId}-${step}`;
      return {
        ...prev,
        [key]: !prev[key]
      };
    });
  };

  const clearLoop = () => {
    setLoopPattern({});
  };

  const playDemoBeat = async () => {
    await Tone.start();
    const pattern = [
      ['kick', 0], ['hihat', 0], ['snare', 1], ['hihat', 1],
      ['kick', 2], ['hihat', 2], ['snare', 3], ['hihat', 3],
    ];
    
    pattern.forEach(([soundId, step], i) => {
      setTimeout(() => {
        playSound(soundId);
      }, i * (60000 / bpm / 4));
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Beatbox Studio</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Create beats with vocal percussion sounds. Click pads or use QWERTY keys.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BPM: {bpm}</label>
          <input 
            type="range" min="60" max="200" step="1" 
            value={bpm} 
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volume</label>
          <input 
            type="range" min="0" max="1" step="0.1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className={`btn-glass ${isLooping ? 'active' : ''}`}
            onClick={() => setIsLooping(!isLooping)}
            style={{ padding: '8px 15px' }}
          >
            {isLooping ? '⏸️ Stop Loop' : '▶️ Start Loop'}
          </button>
          <button
            className="btn-glass"
            onClick={playDemoBeat}
            style={{ padding: '8px 15px' }}
          >
            🎵 Demo Beat
          </button>
          <button
            className="btn-glass"
            onClick={clearLoop}
            style={{ padding: '8px 15px' }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Beatbox Pads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', maxWidth: '800px' }}>
        {BEATBOX_SOUNDS.map(sound => {
          const isActive = activeSounds.has(sound.id);
          
          return (
            <motion.div
              key={sound.id}
              onMouseDown={() => playSound(sound.id)}
              animate={{
                scale: isActive ? 0.95 : 1,
                boxShadow: isActive ? `0 0 30px ${sound.color}80` : 'none',
                backgroundColor: isActive ? `${sound.color}40` : 'rgba(255,255,255,0.05)'
              }}
              transition={{ duration: 0.1 }}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                border: `2px solid ${sound.color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '15px'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                {sound.icon}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: 600,
                color: sound.color,
                textAlign: 'center'
              }}>
                {sound.name}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)',
                marginTop: '5px',
                background: 'rgba(0,0,0,0.3)',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                Key: {sound.key.toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Loop Sequencer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Loop Sequencer (16 Steps)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
          {BEATBOX_SOUNDS.map(sound => (
            <div key={sound.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '80px', fontSize: '0.8rem', color: sound.color, fontWeight: 600 }}>
                {sound.name}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {Array.from({ length: 16 }).map((_, step) => {
                  const key = `${sound.id}-${step}`;
                  const isActive = loopPattern[key];
                  
                  return (
                    <button
                      key={step}
                      onClick={() => toggleLoopCell(sound.id, step)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: isActive ? sound.color : 'rgba(255,255,255,0.1)',
                        border: `1px solid ${sound.color}80`,
                        cursor: 'pointer'
                      }}
                      title={`Step ${step + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Effects Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Effects</h4>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(effects).map(([effect, value]) => (
            <div key={effect} style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {effect}: {value.toFixed(2)}
              </label>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={value} 
                onChange={(e) => setEffects(prev => ({ ...prev, [effect]: Number(e.target.value) }))}
                style={{ width: '120px', accentColor: 'var(--accent-primary)' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Click pads or use QWERTY keys to trigger sounds. Create patterns with the loop sequencer.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {BEATBOX_SOUNDS.map(sound => (
            <div key={sound.id} style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              border: `1px solid ${sound.color}40`
            }}>
              <span style={{ color: sound.color, fontWeight: 600 }}>{sound.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>Key: {sound.key.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}