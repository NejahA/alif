import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Clock, Timer, Zap, Play, Square, Activity, RefreshCw, Disc, TrendingUp } from 'lucide-react';

const SmartTempo = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tapHistory, setTapHistory] = useState([]);
  const [detectedTempo, setDetectedTempo] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [swingAmount, setSwingAmount] = useState(0);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [beatIndicator, setBeatIndicator] = useState(0);
  const [tempoHistory, setTempoHistory] = useState([]);
  const [mode, setMode] = useState('manual');
  const [autoDetectThreshold, setAutoDetectThreshold] = useState(0.6);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const lastTapRef = useRef(0);
  const tapCountRef = useRef(0);
  const beatIntervalRef = useRef(null);

  const validTimeSignatures = ['4/4', '3/4', '6/8', '2/4', '5/4', '7/8', '12/8'];

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    if (isPlaying) {
      Tone.Transport.start();
      let beat = 0;
      beatIntervalRef.current = setInterval(() => {
        setBeatIndicator(beat % 4);
        beat++;
      }, (60 / bpm) * 1000);
    } else {
      Tone.Transport.stop();
      clearInterval(beatIntervalRef.current);
      setBeatIndicator(-1);
    }
    return () => clearInterval(beatIntervalRef.current);
  }, [isPlaying, bpm]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    
    if (lastTapRef.current > 0) {
      const interval = now - lastTapRef.current;
      
      if (interval > 300 && interval < 2000) {
        const newTap = { time: now, interval };
        setTapHistory(prev => {
          const updated = [...prev, newTap].slice(-8);
          
          // Calculate average BPM from taps
          if (updated.length > 1) {
            const avgInterval = updated.reduce((sum, t) => sum + t.interval, 0) / updated.length;
            const calculatedBpm = Math.round(60000 / avgInterval);
            
            if (calculatedBpm >= 30 && calculatedBpm <= 300) {
              setDetectedTempo(calculatedBpm);
              
              // Calculate confidence based on consistency
              const intervals = updated.map(t => t.interval);
              const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
              const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
              const consistency = Math.max(0, 1 - (variance / (mean * mean)));
              
              const conf = Math.min(1, consistency * updated.length * 0.2);
              setConfidence(conf);
              
              if (conf > autoDetectThreshold && mode === 'auto') {
                setBpm(calculatedBpm);
              }
              
              setTempoHistory(prev => [...prev.slice(-19), { bpm: calculatedBpm, confidence: conf, time: Date.now() }]);
            }
          }
          return updated;
        });
      } else {
        setTapHistory([{ time: now, interval: 0 }]);
      }
    } else {
      setTapHistory([{ time: now, interval: 0 }]);
    }
    
    lastTapRef.current = now;
    tapCountRef.current += 1;
  }, [mode, autoDetectThreshold]);

  const applyTempo = () => {
    if (detectedTempo > 0) {
      setBpm(detectedTempo);
    }
  };

  const handleMidiInput = useCallback((e) => {
    if (!isAutoDetecting) return;
    // Simple MIDI-based tempo detection
    handleTap();
  }, [isAutoDetecting, handleTap]);

  useEffect(() => {
    if (isAutoDetecting) {
      window.addEventListener('virtuo-midi-on', handleMidiInput);
      return () => window.removeEventListener('virtuo-midi-on', handleMidiInput);
    }
  }, [isAutoDetecting, handleMidiInput]);

  const getTimeSignatureBeats = () => {
    const [top] = timeSignature.split('/').map(Number);
    return top;
  };

  const renderBeatGrid = () => {
    const beats = getTimeSignatureBeats();
    return (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', padding: '10px 0' }}>
        {Array.from({ length: beats }).map((_, i) => (
          <div key={i} style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: beatIndicator === i ? (i === 0 ? '#f59e0b' : 'var(--accent-primary)') : 'rgba(255,255,255,0.05)',
            border: beatIndicator === i ? 'none' : '1px solid var(--glass-border)',
            transition: 'all 0.1s ease',
            boxShadow: beatIndicator === i ? `0 0 10px ${i === 0 ? '#f59e0b80' : 'var(--accent-glow)'}` : 'none'
          }} />
        ))}
      </div>
    );
  };

  const renderTapTempo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button
        className="btn-glass"
        onClick={handleTap}
        style={{
          padding: '15px',
          fontSize: '0.9rem',
          borderColor: detectedTempo > 0 ? '#22c55e' : 'var(--glass-border)',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <Disc size={20} /> TAP HERE ({tapCountRef.current})
      </button>

      {detectedTempo > 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '12px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Detected</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: confidence > 0.7 ? '#22c55e' : '#f59e0b' }}>
                {detectedTempo} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>BPM</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Confidence</div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{(confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
          
          {confidence < 0.7 && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Tap more consistently to increase confidence
            </div>
          )}
          
          <button
            className="btn-glass"
            onClick={applyTempo}
            style={{ marginTop: '8px', width: '100%', fontSize: '0.75rem', justifyContent: 'center' }}
          >
            <Zap size={12} /> Apply Tempo
          </button>
        </div>
      )}
    </div>
  );

  const renderTempoHistory = () => (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Tempo History</div>
      <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
        {tempoHistory.map((point, i) => {
          const height = ((point.bpm - 60) / 240) * 100;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              <div style={{
                height: `${Math.max(2, height)}%`,
                width: '100%',
                background: point.confidence > 0.7 ? '#22c55e' : '#f59e0b',
                opacity: 0.5 + (i / tempoHistory.length) * 0.5,
                borderRadius: '1px 1px 0 0'
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSwingControls = () => (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
          <Activity size={12} /> Swing
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: swingAmount > 0 ? '#f59e0b' : 'var(--text-main)' }}>
          {swingAmount}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={swingAmount}
        onChange={(e) => setSwingAmount(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
        <span>Straight</span>
        <span>Shuffle</span>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Smart Tempo</h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
          >
            {isPlaying ? <Square size={10} /> : <Play size={10} />}
          </button>
          <button
            className={`btn-glass ${isAutoDetecting ? 'active' : ''}`}
            onClick={() => setIsAutoDetecting(!isAutoDetecting)}
            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
          >
            <TrendingUp size={10} /> Auto
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {['manual', 'tap', 'auto'].map(m => (
          <button
            key={m}
            className={`btn-glass ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
            style={{ padding: '3px 10px', fontSize: '0.65rem', textTransform: 'capitalize' }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* BPM Display & Control */}
      {mode === 'manual' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-primary), #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {bpm}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px' }}>BEATS PER MINUTE</div>
          <input
            type="range"
            min="40"
            max="280"
            step="1"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            <span>40</span>
            <span>160</span>
            <span>280</span>
          </div>
        </div>
      )}

      {mode === 'tap' && renderTapTempo()}

      {mode === 'auto' && (
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{bpm} BPM</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {isAutoDetecting ? 'Listening for MIDI input...' : 'Enable auto-detect'}
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Detection Threshold</div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={autoDetectThreshold}
              onChange={(e) => setAutoDetectThreshold(Number(e.target.value))}
              style={{ width: '80%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>
      )}

      {/* Time Signature */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Time Sig:</span>
        <select
          value={timeSignature}
          onChange={(e) => setTimeSignature(e.target.value)}
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            padding: '4px 8px',
            fontSize: '0.8rem'
          }}
        >
          {validTimeSignatures.map(ts => (
            <option key={ts} value={ts}>{ts}</option>
          ))}
        </select>
      </div>

      {/* Beat Indicator */}
      {renderBeatGrid()}

      {/* Swing Controls */}
      {renderSwingControls()}

      {/* Tempo History */}
      {tempoHistory.length > 0 && renderTempoHistory()}
    </div>
  );
};

export default SmartTempo;