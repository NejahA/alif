import React, { useState } from 'react';
import { timelineEngine } from '../audio/TimelineEngine';
import { Play, Pause, Layers, Trash2, RefreshCw, Volume2, VolumeX } from 'lucide-react';

export const SongTimeline = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(-1);
  const [timeline, setTimeline] = useState([...timelineEngine.timeline.map(row => [...row])]);
  const [mutes, setMutes] = useState([...timelineEngine.mutes]);

  const toggleSequencer = () => {
    const running = timelineEngine.toggleSequencer((block) => {
      setCurrentBlock(block);
    });
    setIsPlaying(running);
    if (!running) setCurrentBlock(-1);
  };

  const handleBlockClick = (trackIdx, blockIdx) => {
    timelineEngine.toggleBlock(trackIdx, blockIdx);
    setTimeline([...timelineEngine.timeline.map(row => [...row])]);
  };

  const handleMuteToggle = (trackIdx) => {
    timelineEngine.toggleMute(trackIdx);
    setMutes([...timelineEngine.mutes]);
  };

  const handleClear = () => {
    timelineEngine.clearTimeline();
    setTimeline([...timelineEngine.timeline.map(row => [...row])]);
  };

  const handleResetPreset = () => {
    timelineEngine.presetFullSong();
    setTimeline([...timelineEngine.timeline.map(row => [...row])]);
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '920px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 48,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      borderRadius: '20px'
    }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleSequencer}
            className={`btn-primary ${isPlaying ? 'glow-pink' : ''}`}
            style={{ padding: '0.5rem 1.2rem' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Stop Song' : 'Play Song Timeline'}</span>
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff' }}>
            Multi-Track Song Arranger Timeline
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleResetPreset}
            className="glass-pill"
            style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--accent-cyan)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} />
            <span>Full Song Preset</span>
          </button>
          <button
            onClick={handleClear}
            className="glass-pill"
            style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '8px' }}>✕</button>
        </div>
      </div>

      {/* Block Column Headers */}
      <div style={{ display: 'flex', gap: '12px', paddingLeft: '160px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', flex: 1 }}>
          {timelineEngine.blocks.map((blockName, i) => (
            <div key={blockName} style={{
              textAlign: 'center',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: currentBlock === i ? 'var(--accent-pink)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              {blockName}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {timelineEngine.tracks.map((track, trackIdx) => (
          <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Track Label & Mute */}
            <div style={{ width: '148px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: track.color }}>{track.name}</span>
              <button 
                onClick={() => handleMuteToggle(trackIdx)} 
                style={{ background: 'none', border: 'none', color: mutes[trackIdx] ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer' }}
              >
                {mutes[trackIdx] ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>

            {/* 8 Block Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', flex: 1 }}>
              {timelineEngine.blocks.map((_, blockIdx) => {
                const isActive = timeline[trackIdx]?.[blockIdx] === 1;
                const isCurrent = currentBlock === blockIdx;

                return (
                  <button
                    key={blockIdx}
                    onClick={() => handleBlockClick(trackIdx, blockIdx)}
                    style={{
                      height: '36px',
                      borderRadius: '6px',
                      background: isActive 
                        ? (isCurrent ? '#fff' : track.color)
                        : (isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'),
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
