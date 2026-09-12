import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Mic, Square, Play, Pause, Trash2, Download, Disc, RefreshCw, Volume2, Clock } from 'lucide-react';

export const LoopRecorder = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoop, setHasLoop] = useState(!!audioEngine.loopBuffer);
  const [recordProgress, setRecordProgress] = useState(0);
  const [loopDuration, setLoopDuration] = useState(4000);
  const [loopVolume, setLoopVolume] = useState(0.8);
  const [countdown, setCountdown] = useState(0);
  const progressIntervalRef = React.useRef(null);

  const durations = [
    { label: '2 Bars', ms: 2000 },
    { label: '4 Bars', ms: 4000 },
    { label: '8 Bars', ms: 8000 },
    { label: '16 Bars', ms: 16000 },
  ];

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    audioEngine.init();
    setIsRecording(true);
    setCountdown(3);
    setRecordProgress(0);

    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(r => setTimeout(r, 800));
    }
    setCountdown(0);

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setRecordProgress(Math.min(100, (elapsed / loopDuration) * 100));
    }, 50);

    const success = await audioEngine.recordLoop(loopDuration);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setIsRecording(false);
    setRecordProgress(100);
    setHasLoop(success);
    setTimeout(() => setRecordProgress(0), 800);
  };

  const stopRecording = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setIsRecording(false);
    setRecordProgress(0);
    setCountdown(0);
  };

  const togglePlayback = () => {
    audioEngine.init();
    const playing = audioEngine.toggleLoopPlayback();
    setIsPlaying(playing);
  };

  const clearLoop = () => {
    audioEngine.clearLoop();
    setHasLoop(false);
    setIsPlaying(false);
  };

  const exportMidi = () => {
    audioEngine.init();
    const url = audioEngine.exportMidi();
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetherwave-arp-${Date.now()}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setLoopVolume(v);
    audioEngine.updateParam('loopVolume', v);
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '720px',
      zIndex: 48,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Disc size={18} color="var(--accent-pink)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Loop Recorder & Sampler</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {countdown > 0 && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(7,9,19,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '16px', zIndex: 10, backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '4rem', fontWeight: 900, fontFamily: 'var(--font-display)',
            boxShadow: '0 0 50px rgba(236,72,153,0.6)', color: '#fff'
          }}>{countdown}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div style={{
          padding: '14px', borderRadius: '12px',
          background: isRecording ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isRecording ? 'rgba(239,68,68,0.4)' : 'var(--border-glass)'}`,
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isRecording ? '#ef4444' : 'var(--text-muted)' }}>
              {isRecording ? 'Recording...' : 'Loop Duration'}
            </span>
            <Clock size={14} color={isRecording ? '#ef4444' : 'var(--text-dim)'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {durations.map(d => (
              <button key={d.ms} onClick={() => !isRecording && setLoopDuration(d.ms)}
                disabled={isRecording}
                style={{
                  padding: '6px 0', fontSize: '0.7rem',
                  borderRadius: '8px',
                  background: loopDuration === d.ms && !isRecording
                    ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))'
                    : 'rgba(0,0,0,0.3)',
                  border: loopDuration === d.ms ? '1px solid #fff' : '1px solid var(--border-glass)',
                  color: loopDuration === d.ms && !isRecording ? '#fff' : 'var(--text-muted)',
                  cursor: isRecording ? 'not-allowed' : 'pointer',
                  opacity: isRecording ? 0.5 : 1,
                  fontWeight: 600
                }}>
                {d.label}
              </button>
            ))}
          </div>
          {isRecording && (
            <div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${recordProgress}%`,
                  background: 'linear-gradient(90deg, #ef4444, var(--accent-pink))',
                  boxShadow: '0 0 10px #ef4444',
                  transition: 'width 0.08s linear'
                }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {Math.round(recordProgress)}% · {((loopDuration * (100 - recordProgress) / 100) / 1000).toFixed(1)}s remaining
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: '14px', borderRadius: '12px',
          background: hasLoop ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hasLoop ? 'rgba(16,185,129,0.35)' : 'var(--border-glass)'}`,
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: hasLoop ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              {hasLoop ? 'Loop Loaded' : 'No Loop'}
            </span>
            <RefreshCw size={14} color={hasLoop ? '#10b981' : 'var(--text-dim)'} style={{
              animation: isPlaying ? 'spin 2s linear infinite' : 'none'
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={13} color="var(--accent-emerald)" />
            <input type="range" min="0" max="1" step="0.01" value={loopVolume} onChange={handleVolume}
              disabled={!hasLoop}
              style={{ flex: 1, opacity: hasLoop ? 1 : 0.4 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', minWidth: '28px' }}>
              {Math.round(loopVolume * 100)}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button onClick={togglePlayback} disabled={!hasLoop}
              className="btn-primary"
              style={{
                padding: '8px 0', fontSize: '0.75rem',
                justifyContent: 'center',
                opacity: hasLoop ? 1 : 0.4,
                cursor: hasLoop ? 'pointer' : 'not-allowed',
                background: isPlaying
                  ? 'linear-gradient(135deg, #ef4444, var(--accent-pink))'
                  : undefined
              }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Stop' : 'Play'}
            </button>
            <button onClick={clearLoop} disabled={!hasLoop}
              style={{
                padding: '8px 0', fontSize: '0.75rem',
                borderRadius: '10px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                cursor: hasLoop ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                opacity: hasLoop ? 1 : 0.4,
                fontWeight: 600
              }}>
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        <div style={{
          padding: '14px', borderRadius: '12px',
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.35)',
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
              Capture & Export
            </span>
            <Download size={14} color="#8b5cf6" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={isRecording ? stopRecording : startRecording}
              style={{
                padding: '10px 0', fontSize: '0.8rem',
                borderRadius: '10px',
                background: isRecording
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #ef4444, var(--accent-pink))',
                color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: isRecording ? '0 0 20px rgba(239,68,68,0.5)' : '0 0 15px rgba(239,68,68,0.35)',
                animation: isRecording ? 'pulse-red 1.2s infinite' : 'none'
              }}>
              {isRecording ? <Square size={15} /> : <Mic size={15} />}
              {isRecording ? 'Abort' : 'Record Loop'}
            </button>
            <button onClick={exportMidi}
              style={{
                padding: '10px 0', fontSize: '0.8rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-purple), #6366f1)',
                color: '#fff', border: 'none',
                cursor: 'pointer', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: '0 0 15px rgba(139,92,246,0.35)'
              }}>
              <Download size={15} />
              Export MIDI File
            </button>
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.4, margin: 0 }}>
            MIDI export generates the current scale arpeggio pattern. Import it into any DAW.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
