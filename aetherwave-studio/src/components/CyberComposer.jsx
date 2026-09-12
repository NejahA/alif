import React, { useState } from 'react';
import { generativeComposer } from '../audio/GenerativeComposer';
import { Sparkles, Play, Pause, Wand2, RefreshCw, Cpu, Music } from 'lucide-react';

export const CyberComposer = ({ isOpen, onClose, setActiveTheme }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState('cyberpunk');
  const [chaos, setChaos] = useState(0.3);
  const [density, setDensity] = useState(0.7);

  const moods = [
    { id: 'cyberpunk', name: 'Cyberpunk 2077', color: '#ec4899', bpm: 124, desc: 'Aggressive basslines & synth stabs' },
    { id: 'synthwave', name: 'Synthwave 84', color: '#8b5cf6', bpm: 118, desc: 'Melodic retro 80s synth harmonies' },
    { id: 'vaporwave', name: 'Vaporwave Dream', color: '#06b6d4', bpm: 95, desc: 'Lush extended 7th & 9th chords' },
    { id: 'techno', name: 'Dark Techno', color: '#10b981', bpm: 132, desc: 'Driving minimalist pulse & syncopated drops' }
  ];

  const handleTogglePlay = () => {
    generativeComposer.currentMood = selectedMood;
    generativeComposer.chaos = chaos;
    generativeComposer.density = density;

    const running = generativeComposer.toggleComposition((step) => {
      setCurrentStep(step);
    });
    setIsPlaying(running);

    if (running && setActiveTheme) {
      if (selectedMood === 'cyberpunk') setActiveTheme('cyberGrid');
      else if (selectedMood === 'synthwave') setActiveTheme('pumpHyperSpace');
      else if (selectedMood === 'vaporwave') setActiveTheme('cosmic');
      else if (selectedMood === 'techno') setActiveTheme('tunnel');
    }
  };

  const handleGenerateNew = (moodId) => {
    setSelectedMood(moodId);
    generativeComposer.generateTrack(moodId);
    if (isPlaying) {
      generativeComposer.toggleComposition();
      setIsPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '640px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 48,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      borderRadius: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="glow-purple" style={{ padding: '8px', borderRadius: '10px', background: 'var(--accent-purple)' }}>
            <Wand2 size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Cyber-Composer Engine</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Generative Algorithmic Music & Chord Progression Studio</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {/* Mood Selector Grid */}
      <div>
        <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Sparkles size={14} color="var(--accent-pink)" /> Algorithmic Mood Presets
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {moods.map(m => {
            const isSelected = selectedMood === m.id;
            return (
              <div
                key={m.id}
                onClick={() => handleGenerateNew(m.id)}
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${m.color}` : '1px solid var(--border-glass)',
                  background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                  boxShadow: isSelected ? `0 0 15px ${m.color}` : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: m.color }}>{m.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.bpm} BPM</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sliders for Chaos & Density */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Harmonic Chaos & Inversion:</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-pink)', fontFamily: 'var(--font-mono)' }}>{Math.round(chaos * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={chaos}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setChaos(val);
              generativeComposer.chaos = val;
            }} 
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Melody Note Density:</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{Math.round(density * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.05"
            value={density}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setDensity(val);
              generativeComposer.density = val;
            }} 
          />
        </div>
      </div>

      {/* Big Auto-Play Button */}
      <button
        onClick={handleTogglePlay}
        className={`btn-primary ${isPlaying ? 'glow-pink' : 'glow-purple'}`}
        style={{
          padding: '14px',
          fontSize: '0.95rem',
          fontWeight: 800,
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        <span>{isPlaying ? 'PAUSE COMPOSITION' : 'GENERATE & START AUTO-COMPOSITION'}</span>
      </button>
    </div>
  );
};
