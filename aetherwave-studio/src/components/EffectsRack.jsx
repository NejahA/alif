import React, { useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Zap, Waves, Wind, Volume2, Settings, ArrowLeftRight } from 'lucide-react';

export const EffectsRack = ({ isOpen, onClose }) => {
  const [params, setParams] = useState({
    distortionAmount: 0,
    distortionWet: 0,
    chorusRate: 0.3,
    chorusDepth: 0.02,
    chorusWet: 0,
    flangerRate: 0.5,
    flangerDepth: 0.005,
    flangerFeedback: 0.4,
    flangerWet: 0,
    compressorThreshold: -24,
    compressorRatio: 4,
    compressorAttack: 0.003,
    compressorRelease: 0.25,
    stereoPan: 0
  });

  const handleParamChange = (key, val) => {
    const next = { ...params, [key]: val };
    setParams(next);
    audioEngine.updateParam(key, val);
  };

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
      gap: '18px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} color="var(--accent-pink)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>FX Rack & Master Compressor</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      <div style={{ background: 'rgba(239,68,68,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={15} color="#ef4444" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>Waveshaper Distortion</span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drive Amount</span>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontFamily: 'var(--font-mono)' }}>{Math.round(params.distortionAmount * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={params.distortionAmount}
            onChange={(e) => handleParamChange('distortionAmount', parseFloat(e.target.value))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wet / Mix</span>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontFamily: 'var(--font-mono)' }}>{Math.round(params.distortionWet * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={params.distortionWet}
            onChange={(e) => handleParamChange('distortionWet', parseFloat(e.target.value))} />
        </div>
      </div>

      <div style={{ background: 'rgba(16,185,129,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Waves size={15} color="#10b981" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Ensemble Chorus</span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LFO Rate (Hz)</span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>{params.chorusRate.toFixed(2)} Hz</span>
          </div>
          <input type="range" min="0.05" max="4" step="0.05" value={params.chorusRate}
            onChange={(e) => handleParamChange('chorusRate', parseFloat(e.target.value))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modulation Depth</span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>{(params.chorusDepth * 1000).toFixed(0)} ms</span>
          </div>
          <input type="range" min="0.001" max="0.05" step="0.001" value={params.chorusDepth}
            onChange={(e) => handleParamChange('chorusDepth', parseFloat(e.target.value))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wet Mix</span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>{Math.round(params.chorusWet * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={params.chorusWet}
            onChange={(e) => handleParamChange('chorusWet', parseFloat(e.target.value))} />
        </div>
      </div>

      <div style={{ background: 'rgba(139,92,246,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wind size={15} color="#8b5cf6" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8b5cf6' }}>Stereo Flanger</span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sweep Rate (Hz)</span>
            <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>{params.flangerRate.toFixed(2)} Hz</span>
          </div>
          <input type="range" min="0.05" max="2" step="0.05" value={params.flangerRate}
            onChange={(e) => handleParamChange('flangerRate', parseFloat(e.target.value))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sweep Depth</span>
            <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>{(params.flangerDepth * 1000).toFixed(1)} ms</span>
          </div>
          <input type="range" min="0.001" max="0.02" step="0.001" value={params.flangerDepth}
            onChange={(e) => handleParamChange('flangerDepth', parseFloat(e.target.value))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Feedback Regen</span>
            <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>{Math.round(params.flangerFeedback * 100)}%</span>
          </div>
          <input type="range" min="0" max="0.9" step="0.05" value={params.flangerFeedback}
            onChange={(e) => handleParamChange('flangerFeedback', parseFloat(e.target.value))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wet Mix</span>
            <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>{Math.round(params.flangerWet * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={params.flangerWet}
            onChange={(e) => handleParamChange('flangerWet', parseFloat(e.target.value))} />
        </div>
      </div>

      <div style={{ background: 'rgba(245,158,11,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={15} color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>Dynamics Compressor</span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threshold (dB)</span>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{params.compressorThreshold} dB</span>
          </div>
          <input type="range" min="-60" max="0" step="1" value={params.compressorThreshold}
            onChange={(e) => handleParamChange('compressorThreshold', parseFloat(e.target.value))} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compression Ratio</span>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{params.compressorRatio}:1</span>
          </div>
          <input type="range" min="1" max="20" step="0.5" value={params.compressorRatio}
            onChange={(e) => handleParamChange('compressorRatio', parseFloat(e.target.value))} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Attack (ms)</span>
              <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{(params.compressorAttack * 1000).toFixed(0)}</span>
            </div>
            <input type="range" min="0.001" max="0.1" step="0.001" value={params.compressorAttack}
              onChange={(e) => handleParamChange('compressorAttack', parseFloat(e.target.value))} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Release (s)</span>
              <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{params.compressorRelease.toFixed(2)}</span>
            </div>
            <input type="range" min="0.05" max="1" step="0.05" value={params.compressorRelease}
              onChange={(e) => handleParamChange('compressorRelease', parseFloat(e.target.value))} />
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(6,182,212,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeftRight size={15} color="#06b6d4" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#06b6d4' }}>Stereo Field Pan</span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>L ← → R Position</span>
            <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>
              {params.stereoPan === 0 ? 'C' : params.stereoPan < 0 ? `L${Math.round(Math.abs(params.stereoPan) * 100)}` : `R${Math.round(params.stereoPan * 100)}`}
            </span>
          </div>
          <input type="range" min="-1" max="1" step="0.01" value={params.stereoPan}
            onChange={(e) => handleParamChange('stereoPan', parseFloat(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            <span>Left</span><span>Center</span><span>Right</span>
          </div>
        </div>
      </div>
    </div>
  );
};
