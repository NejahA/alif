import React, { useState, useEffect } from 'react';
import { Disc, Play, Pause, RotateCcw, FastForward, Film } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function FlightRecorderTimeline({ soundEnabled = true }) {
  const [isRecording, setIsRecording] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelinePos, setTimelinePos] = useState(85);
  const [frameCount, setFrameCount] = useState(4280);

  useEffect(() => {
    let interval;
    if (isRecording && !isPlaying) {
      interval = setInterval(() => {
        setFrameCount((prev) => prev + 1);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPlaying]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelinePos((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleRecord = () => {
    setIsRecording(!isRecording);
    if (soundEnabled) playBeep(800, 'sine', 0.05);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (soundEnabled) playBeep(1100, 'sine', 0.05);
  };

  const handleReset = () => {
    setTimelinePos(0);
    setIsPlaying(false);
    if (soundEnabled) playBeep(600, 'sine', 0.05);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
            <Film style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Telemetry Flight Recorder</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Black Box Event Timeline</p>
          </div>
        </div>

        <button
          onClick={toggleRecord}
          className="btn-cosmo-outline"
          style={{
            padding: '3px 8px',
            fontSize: '0.7rem',
            borderColor: isRecording ? 'var(--accent-rose)' : undefined,
            color: isRecording ? '#ffffff' : undefined,
            background: isRecording ? 'rgba(244, 63, 94, 0.2)' : undefined,
          }}
        >
          <Disc style={{ width: '12px', height: '12px', color: isRecording ? 'var(--accent-rose)' : 'var(--text-muted)' }} />
          {isRecording ? 'REC ACTIVE' : 'REC PAUSED'}
        </button>
      </div>

      {/* Frame Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
        <div>
          FRAMES LOGGED: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{frameCount}</strong>
        </div>
        <div>
          TIMELINE: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-violet)' }}>{timelinePos}%</strong>
        </div>
      </div>

      {/* Timeline Scrubber Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="range"
          min="0"
          max="100"
          value={timelinePos}
          onChange={(e) => setTimelinePos(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
        />
      </div>

      {/* Playback Action Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button onClick={handleReset} className="btn-cosmo-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
          <RotateCcw style={{ width: '14px', height: '14px' }} /> REWIND
        </button>
        <button onClick={togglePlay} className="btn-cosmo" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
          {isPlaying ? <Pause style={{ width: '14px', height: '14px' }} /> : <Play style={{ width: '14px', height: '14px' }} />}
          {isPlaying ? 'PAUSE PLAYBACK' : 'REPLAY FLIGHT'}
        </button>
      </div>

    </div>
  );
}
