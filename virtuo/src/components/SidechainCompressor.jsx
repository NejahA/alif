import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Waves, Volume2, Activity, RefreshCcw, Radio } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function SidechainCompressor() {
  const [threshold, setThreshold] = useState(-24);
  const [ratio, setRatio] = useState(4);
  const [attack, setAttack] = useState(0.003);
  const [release, setRelease] = useState(0.25);
  const [isActive, setIsActive] = useState(false);
  const [reduction, setReduction] = useState(0);
  const [sidechainFreq, setSidechainFreq] = useState(2);
  const [sidechainGain, setSidechainGain] = useState(-6);
  const [mode, setMode] = useState('auto');
  const compressorRef = useRef(null);
  const sidechainSynthRef = useRef(null);
  const metronomeRef = useRef(null);

  useEffect(() => {
    if (!compressorRef.current) {
      compressorRef.current = new Tone.Compressor({
        threshold,
        ratio,
        attack,
        release
      }).connect(masterBus);
    }
    return () => {
      compressorRef.current?.dispose();
      sidechainSynthRef.current?.dispose();
      metronomeRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!compressorRef.current) return;
    compressorRef.current.threshold.value = threshold;
    compressorRef.current.ratio.value = ratio;
    compressorRef.current.attack.value = attack;
    compressorRef.current.release.value = release;
  }, [threshold, ratio, attack, release]);

  useEffect(() => {
    if (!compressorRef.current) return;
    if (!isActive) {
      compressorRef.current.set({ bypass: true });
      sidechainSynthRef.current?.dispose();
      sidechainSynthRef.current = null;
      metronomeRef.current?.dispose();
      metronomeRef.current = null;
      return;
    }
    compressorRef.current.set({ bypass: false });

    if (mode === 'sidechain') {
      sidechainSynthRef.current = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, release: 0.1 }
      }).connect(compressorRef.current);
      sidechainSynthRef.current.volume.value = sidechainGain;
      metronomeRef.current = new Tone.Loop(time => {
        sidechainSynthRef.current?.triggerAttackRelease('C1', '16n', time);
      }, `${sidechainFreq}n`);
      metronomeRef.current.start(0);
    }
    return () => {
      sidechainSynthRef.current?.dispose();
      metronomeRef.current?.dispose();
    };
  }, [isActive, mode, sidechainFreq, sidechainGain]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (compressorRef.current) {
        setReduction(Math.min(0, Math.round(compressorRef.current.reduction * 10) / 10));
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '340px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Waves size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Sidechain Compressor</h3>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            border: 'none',
            background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)',
            color: isActive ? 'white' : 'var(--text-muted)',
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          className={`btn-glass ${mode === 'auto' ? 'active' : ''}`}
          onClick={() => setMode('auto')}
          style={{ padding: '4px 10px', fontSize: '0.65rem', flex: 1 }}
        >
          <Activity size={12} /> Auto
        </button>
        <button
          className={`btn-glass ${mode === 'sidechain' ? 'active' : ''}`}
          onClick={() => setMode('sidechain')}
          style={{ padding: '4px 10px', fontSize: '0.65rem', flex: 1 }}
        >
          <Radio size={12} /> Sidechain
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Threshold</span>
          <span>{threshold} dB</span>
        </div>
        <input type="range" min="-60" max="0" step="1" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Ratio</span>
          <span>{ratio}:1</span>
        </div>
        <input type="range" min="1" max="20" step="0.5" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Attack</span>
          <input type="range" min="0.001" max="0.1" step="0.001" value={attack} onChange={(e) => setAttack(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{(attack * 1000).toFixed(0)}ms</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Release</span>
          <input type="range" min="0.01" max="1" step="0.01" value={release} onChange={(e) => setRelease(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{(release * 1000).toFixed(0)}ms</span>
        </div>
      </div>

      {mode === 'sidechain' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
              <span>Sidechain Rate</span>
              <span>1/{sidechainFreq} note</span>
            </div>
            <input type="range" min="1" max="16" step="1" value={sidechainFreq} onChange={(e) => setSidechainFreq(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
              <span>Sidechain Level</span>
              <span>{sidechainGain} dB</span>
            </div>
            <input type="range" min="-30" max="0" step="1" value={sidechainGain} onChange={(e) => setSidechainGain(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
          </div>
        </>
      )}

      <div style={{ height: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
        <motion.div
          animate={{ width: `${Math.min(100, Math.abs(reduction) * 5)}%` }}
          style={{
            height: '100%',
            background: reduction < -10 ? '#ef4444' : reduction < -5 ? '#f59e0b' : '#22c55e',
            borderRadius: '4px',
            transition: 'width 0.1s ease'
          }}
        />
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', textShadow: '0 0 4px rgba(0,0,0,0.5)' }}>
          {reduction} dB Reduction
        </span>
      </div>

      <button className="btn-glass" onClick={() => { setThreshold(-24); setRatio(4); setAttack(0.003); setRelease(0.25); setSidechainFreq(2); setSidechainGain(-6); }} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>
    </div>
  );
}
