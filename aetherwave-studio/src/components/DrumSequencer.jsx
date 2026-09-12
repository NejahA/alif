import React, { useState } from 'react';
import { drumEngine } from '../audio/DrumEngine';
import { Play, Pause, Volume2, VolumeX, Disc, Sparkles, Zap, RefreshCw } from 'lucide-react';

export const DrumSequencer = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [grid, setGrid] = useState({ ...drumEngine.grid });
  const [mutes, setMutes] = useState({ ...drumEngine.mutes });

  const tracks = [
    { id: 'kick', name: 'Kick Drum', color: '#ec4899' },
    { id: 'snare', name: 'Cyber Snare', color: '#8b5cf6' },
    { id: 'hihat', name: 'Metallic HiHat', color: '#06b6d4' },
    { id: 'tom', name: 'Sub Tom', color: '#f59e0b' },
    { id: 'clap', name: 'Hand Clap', color: '#10b981' },
    { id: 'openhat', name: 'Open HiHat', color: '#3b82f6' }
  ];

  const toggleSequencer = () => {
    const running = drumEngine.toggleSequencer((step) => {
      setCurrentStep(step);
    });
    setIsPlaying(running);
    if (!running) setCurrentStep(-1);
  };

  const handleCellClick = (trackId, stepIdx) => {
    drumEngine.toggleCell(trackId, stepIdx);
    setGrid({ ...drumEngine.grid });
  };

  const handleMuteToggle = (trackId) => {
    drumEngine.toggleMute(trackId);
    setMutes({ ...drumEngine.mutes });
  };

  const handleLoadPreset = (presetKey) => {
    drumEngine.loadPreset(presetKey);
    setGrid({ ...drumEngine.grid });
  };

  const handleTriggerFill = () => {
    drumEngine.triggerFill();
    setGrid({ ...drumEngine.grid });
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '920px',
      zIndex: 48,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header & Master Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleSequencer}
            className={`btn-primary ${isPlaying ? 'glow-pink' : ''}`}
            style={{ padding: '0.5rem 1.2rem' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Stop Rhythm' : 'Play Rhythm Loop'}</span>
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff' }}>
            6-Track Procedural Drum Synthesizer
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {/* Beat Preset Bar & Fill Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '8px 14px', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="var(--accent-amber)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Beat Presets:</span>
          {['cyberpump', 'synthwave', 'techno', 'discofunk'].map(p => (
            <button
              key={p}
              onClick={() => handleLoadPreset(p)}
              className="glass-pill"
              style={{
                padding: '4px 10px',
                fontSize: '0.7rem',
                textTransform: 'capitalize',
                color: '#fff',
                border: '1px solid var(--border-glass)'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={handleTriggerFill}
          className="glass-pill glow-pink"
          style={{
            padding: '4px 12px',
            fontSize: '0.72rem',
            color: '#fff',
            background: 'var(--accent-pink)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Zap size={12} />
          <span>Generate Fill</span>
        </button>
      </div>

      {/* 16-Step Grid Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tracks.map(track => (
          <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Track Info & Mute */}
            <div style={{ width: '150px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: track.color }}>{track.name}</span>
              <button 
                onClick={() => handleMuteToggle(track.id)} 
                style={{ background: 'none', border: 'none', color: mutes[track.id] ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer' }}
              >
                {mutes[track.id] ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>

            {/* 16 Step Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '5px', flex: 1 }}>
              {Array.from({ length: 16 }).map((_, stepIdx) => {
                const isActive = grid[track.id]?.[stepIdx] === 1;
                const isCurrent = currentStep === stepIdx;

                return (
                  <button
                    key={stepIdx}
                    onClick={() => handleCellClick(track.id, stepIdx)}
                    style={{
                      height: '32px',
                      borderRadius: '5px',
                      background: isActive 
                        ? (isCurrent ? '#fff' : track.color)
                        : (isCurrent ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.05)'),
                      border: isCurrent ? '1px solid #fff' : '1px solid var(--border-glass)',
                      boxShadow: isActive ? `0 0 10px ${track.color}` : 'none',
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
