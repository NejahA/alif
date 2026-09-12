import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Sliders, Waves, Activity, Zap, Volume2, Music, Wind, Layers, Clock } from 'lucide-react';

export const SynthControls = ({ isOpen, onClose }) => {
  const [params, setParams] = useState({
    waveform: audioEngine.params.waveform || 'sawtooth',
    osc2Waveform: audioEngine.params.osc2Waveform || 'square',
    osc2Detune: audioEngine.params.osc2Detune || 12,
    osc2Mix: audioEngine.params.osc2Mix || 0.4,
    subOscGain: audioEngine.params.subOscGain || 0.3,
    unisonVoices: audioEngine.params.unisonVoices || 3,
    attack: audioEngine.params.attack || 0.08,
    decay: audioEngine.params.decay || 0.3,
    sustain: audioEngine.params.sustain || 0.7,
    release: audioEngine.params.release || 1.0,
    filterCutoff: audioEngine.params.filterCutoff || 2500,
    filterResonance: audioEngine.params.filterResonance || 3,
    delayTime: audioEngine.params.delayTime || 0.35,
    delayFeedback: audioEngine.params.delayFeedback || 0.4,
    reverbWet: audioEngine.params.reverbWet || 0.5,
    noiseVolume: audioEngine.params.noiseVolume || 0.05,
    binauralBeat: 4,
    scaleName: audioEngine.params.scaleName || 'cyberpunk',
    tapeSaturation: audioEngine.params.tapeSaturation || 0.2
  });

  const [binauralActive, setBinauralActive] = useState(false);
  const adsrCanvasRef = useRef(null);

  const handleParamChange = (key, val) => {
    const nextParams = { ...params, [key]: val };
    setParams(nextParams);
    audioEngine.updateParam(key, val);
  };

  const toggleBinaural = () => {
    const nextState = !binauralActive;
    setBinauralActive(nextState);
    audioEngine.setBinauralBeats(nextState);
  };

  // Draw ADSR Envelope Curve
  useEffect(() => {
    const canvas = adsrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Calculate Envelope Points
    const totalTime = (params.attack || 0.08) + (params.decay || 0.3) + 0.5 + (params.release || 1.0);
    const attackX = ((params.attack || 0.08) / totalTime) * w;
    const decayX = attackX + ((params.decay || 0.3) / totalTime) * w;
    const sustainX = decayX + (0.5 / totalTime) * w;
    const releaseX = Math.min(w - 5, sustainX + ((params.release || 1.0) / totalTime) * w);

    const peakY = 10;
    const sustainY = h - (params.sustain || 0.7) * (h - 20) - 10;
    const baseY = h - 10;

    // Filled Envelope Area
    const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
    fillGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    fillGrad.addColorStop(1, 'rgba(139, 92, 246, 0.05)');

    ctx.beginPath();
    ctx.moveTo(10, baseY);
    ctx.lineTo(10 + attackX, peakY);
    ctx.lineTo(10 + decayX, sustainY);
    ctx.lineTo(10 + sustainX, sustainY);
    ctx.lineTo(10 + releaseX, baseY);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Glowing Curve Line
    ctx.beginPath();
    ctx.moveTo(10, baseY);
    ctx.lineTo(10 + attackX, peakY);
    ctx.lineTo(10 + decayX, sustainY);
    ctx.lineTo(10 + sustainX, sustainY);
    ctx.lineTo(10 + releaseX, baseY);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Node Handles
    [[10 + attackX, peakY], [10 + decayX, sustainY], [10 + sustainX, sustainY], [10 + releaseX, baseY]].forEach(([nx, ny]) => {
      ctx.beginPath();
      ctx.arc(nx, ny, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();
    });
  }, [params.attack, params.decay, params.sustain, params.release]);

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '80px',
      left: '16px',
      width: '380px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 45,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--accent-purple)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Dual-Oscillator Synthesizer</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {/* ADSR Envelope Graph Canvas */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="var(--accent-pink)" /> ADSR Volume Envelope Curve
          </label>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            A:{Math.round(params.attack * 1000)}ms R:{Math.round(params.release * 1000)}ms
          </span>
        </div>
        <canvas ref={adsrCanvasRef} width={320} height={80} style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', display: 'block' }} />

        {/* ADSR Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '4px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Attack</span>
            <input type="range" min="0.01" max="1.5" step="0.01" value={params.attack} onChange={(e) => handleParamChange('attack', parseFloat(e.target.value))} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Decay</span>
            <input type="range" min="0.05" max="1.5" step="0.01" value={params.decay} onChange={(e) => handleParamChange('decay', parseFloat(e.target.value))} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Sustain</span>
            <input type="range" min="0" max="1" step="0.05" value={params.sustain} onChange={(e) => handleParamChange('sustain', parseFloat(e.target.value))} />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Release</span>
            <input type="range" min="0.1" max="3.5" step="0.05" value={params.release} onChange={(e) => handleParamChange('release', parseFloat(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Primary Osc 1 & Unison */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Waves size={14} color="var(--accent-cyan)" /> Osc 1 Waveform & Unison
          </label>
          <button
            onClick={() => handleParamChange('unisonVoices', params.unisonVoices === 3 ? 1 : 3)}
            className="glass-pill"
            style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              color: params.unisonVoices === 3 ? '#fff' : 'var(--text-muted)',
              background: params.unisonVoices === 3 ? 'var(--accent-pink)' : 'transparent',
              border: '1px solid var(--border-glass)'
            }}
          >
            {params.unisonVoices === 3 ? '⚡ 3-Voice SuperSaw' : 'Single Voice'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {['sawtooth', 'square', 'sine', 'triangle'].map(wave => (
            <button
              key={wave}
              onClick={() => handleParamChange('waveform', wave)}
              className="glass-pill"
              style={{
                padding: '6px 0',
                fontSize: '0.72rem',
                textTransform: 'capitalize',
                color: params.waveform === wave ? '#fff' : 'var(--text-muted)',
                background: params.waveform === wave ? 'var(--accent-purple)' : 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {wave}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Osc 2 & Sub Oscillator */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="var(--accent-pink)" /> Osc 2 (Dual Osc) & Sub Synth
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {['square', 'sawtooth', 'triangle', 'sine'].map(wave => (
            <button
              key={wave}
              onClick={() => handleParamChange('osc2Waveform', wave)}
              className="glass-pill"
              style={{
                padding: '5px 0',
                fontSize: '0.7rem',
                textTransform: 'capitalize',
                color: params.osc2Waveform === wave ? '#fff' : 'var(--text-muted)',
                background: params.osc2Waveform === wave ? 'var(--accent-pink)' : 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {wave}
            </button>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Osc 2 Detune (Cents)</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{params.osc2Detune}¢</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={params.osc2Detune}
            onChange={(e) => handleParamChange('osc2Detune', parseInt(e.target.value, 10))}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Osc 2 Mix Level</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-pink)', fontFamily: 'var(--font-mono)' }}>{Math.round(params.osc2Mix * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.osc2Mix}
            onChange={(e) => handleParamChange('osc2Mix', parseFloat(e.target.value))}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sub-Bass Osc (Octave Down)</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{Math.round(params.subOscGain * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.subOscGain}
            onChange={(e) => handleParamChange('subOscGain', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Filter & Tape Saturation */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} /> Filter Cutoff Frequency
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {params.filterCutoff} Hz
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="50"
            value={params.filterCutoff}
            onChange={(e) => handleParamChange('filterCutoff', parseFloat(e.target.value))}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Analog Tape Saturation Warmth</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{Math.round((params.tapeSaturation || 0.2) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.tapeSaturation || 0.2}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              handleParamChange('tapeSaturation', val);
              audioEngine.updateParam('distortionAmount', val * 0.4);
              audioEngine.updateParam('distortionWet', val * 0.5);
            }}
          />
        </div>
      </div>

      {/* Scale Tuning */}
      <div>
        <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Music size={14} /> Harmonic Scale Tuning
        </label>
        <select
          value={params.scaleName}
          onChange={(e) => handleParamChange('scaleName', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-glass)',
            color: '#fff',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        >
          <option value="cyberpunk">Cyberpunk Dark Minor</option>
          <option value="harmonicMinor">Harmonic Minor</option>
          <option value="phrygian">Phrygian Scale</option>
          <option value="mixolydian">Mixolydian Scale</option>
          <option value="ambientMinor">Ambient Minor Pentatonic</option>
          <option value="pentatonic">Pure Pentatonic</option>
          <option value="dorian">Deep Dorian Scale</option>
          <option value="lydian">Lydian Cosmic Dream</option>
        </select>
      </div>
    </div>
  );
};
