import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Cloud, Wind, Sparkles, Play, Square, RefreshCcw } from 'lucide-react';
import { getChannel } from '../audio/masterBus';

export default function CloudMachine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [density, setDensity] = useState(0.5);
  const [morph, setMorph] = useState(0.3);
  const [activeVoices, setActiveVoices] = useState(0);
  
  const voicesRef = useRef([]);
  const lfoRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    // Master FX for the engine
    filterRef.current = new Tone.Filter(1000, "lowpass", -24).connect(getChannel('ambient'));
    lfoRef.current = new Tone.LFO(0.1, 400, 4000).start();
    lfoRef.current.connect(filterRef.current.frequency);

    return () => {
      stopEngine();
      filterRef.current?.dispose();
      lfoRef.current?.dispose();
    };
  }, []);

  const startEngine = async () => {
    await Tone.start();
    setIsPlaying(true);
    
    // Create 4 random voices
    const newVoices = Array.from({ length: 4 }).map(() => {
      const synth = new Tone.MonoSynth({
        oscillator: { type: "sine" },
        envelope: { attack: 4, decay: 2, sustain: 1, release: 4 }
      }).connect(filterRef.current);
      
      const loop = new Tone.Loop(time => {
        if (Math.random() < density) {
          const notes = ["C3", "G3", "C4", "E4", "G4", "B4", "D5"];
          const note = notes[Math.floor(Math.random() * notes.length)];
          synth.triggerAttackRelease(note, "4m", time, 0.2 + Math.random() * 0.3);
        }
      }, "2m").start(0);

      return { synth, loop };
    });

    voicesRef.current = newVoices;
    setActiveVoices(4);
    Tone.Transport.start();
  };

  const stopEngine = () => {
    setIsPlaying(false);
    voicesRef.current.forEach(v => {
      v.synth.dispose();
      v.loop.dispose();
    });
    voicesRef.current = [];
    setActiveVoices(0);
  };

  useEffect(() => {
    if (lfoRef.current) {
      lfoRef.current.frequency.value = 0.05 + (morph * 0.5);
    }
  }, [morph]);

  return (
    <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Cloud size={24} color="var(--accent-primary)" />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Cloud Machine</h2>
        </div>
        <button 
          className={`btn-glass ${isPlaying ? 'active' : ''}`} 
          onClick={isPlaying ? stopEngine : startEngine}
          style={{ padding: '8px 20px' }}
        >
          {isPlaying ? <Square size={16} /> : <Play size={16} />}
          {isPlaying ? 'Disperse' : 'Condense'}
        </button>
      </div>

      <div style={{ position: 'relative', height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Animated Background Clouds */}
        <div style={{ 
          position: 'absolute', 
          width: '200%', 
          height: '100%', 
          background: `radial-gradient(circle at 50% 50%, var(--accent-primary) 0%, transparent 50%)`,
          opacity: isPlaying ? 0.1 : 0,
          filter: 'blur(40px)',
          animation: isPlaying ? 'cloudMove 10s linear infinite' : 'none'
        }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600, zIndex: 1, opacity: 0.6 }}>
          {isPlaying ? `${activeVoices} VOICES ACTIVE` : 'ENGINE IDLE'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Sparkles size={12} /> Density</span>
            <span>{Math.round(density * 100)}%</span>
          </div>
          <input 
            type="range" min="0.1" max="1" step="0.01" 
            value={density} 
            onChange={(e) => setDensity(Number(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Wind size={12} /> Morph</span>
            <span>{Math.round(morph * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={morph} 
            onChange={(e) => setMorph(Number(e.target.value))}
            style={{ accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', opacity: 0.4, textAlign: 'center' }}>
        Generative polyphonic soundscape engine.
      </div>

      <style>{`
        @keyframes cloudMove {
          0% { transform: translateX(-25%) rotate(0deg); }
          100% { transform: translateX(25%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
