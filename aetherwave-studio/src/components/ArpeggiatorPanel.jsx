import React, { useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Play, Pause, ArrowUp, ArrowDown, Shuffle, Clock, Music2, Activity } from 'lucide-react';

export const ArpeggiatorPanel = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(audioEngine.arpBpm);
  const [pattern, setPattern] = useState(audioEngine.arpPattern);
  const [octaves, setOctaves] = useState(audioEngine.arpOctaves);
  const [gate, setGate] = useState(audioEngine.arpGate);
  const [rootFreq, setRootFreq] = useState(audioEngine.rootNote);

  const rootNotes = [
    { name: 'C3', freq: 130.81 },
    { name: 'D3', freq: 146.83 },
    { name: 'E3', freq: 164.81 },
    { name: 'F3', freq: 174.61 },
    { name: 'G3', freq: 196.00 },
    { name: 'A3', freq: 220.00 },
    { name: 'B3', freq: 246.94 },
    { name: 'C4', freq: 261.63 },
    { name: 'D4', freq: 293.66 },
    { name: 'E4', freq: 329.63 },
  ];

  const patterns = [
    { id: 'up', label: 'Ascend', icon: ArrowUp },
    { id: 'down', label: 'Descend', icon: ArrowDown },
    { id: 'updown', label: 'Up/Down', icon: Activity },
    { id: 'random', label: 'Random', icon: Shuffle },
  ];

  const togglePlay = () => {
    audioEngine.arpBpm = bpm;
    audioEngine.arpPattern = pattern;
    audioEngine.arpOctaves = octaves;
    audioEngine.arpGate = gate;
    audioEngine.rootNote = rootFreq;
    const playing = audioEngine.toggleArpeggiator((scaleIdx) => {
      setCurrentStep(scaleIdx);
    });
    setIsPlaying(playing);
    if (!playing) setCurrentStep(-1);
  };

  const handleBpm = (e) => {
    const v = parseInt(e.target.value, 10);
    setBpm(v);
    audioEngine.arpBpm = v;
  };

  const handleOctaves = (e) => {
    const v = parseInt(e.target.value, 10);
    setOctaves(v);
    audioEngine.arpOctaves = v;
  };

  const handleGate = (e) => {
    const v = parseFloat(e.target.value);
    setGate(v);
    audioEngine.arpGate = v;
  };

  const handleRoot = (freq) => {
    setRootFreq(freq);
    audioEngine.rootNote = freq;
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '80px',
      right: '16px',
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
          <Music2 size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Arpeggiator Studio</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      <div style={{ background: 'rgba(6,182,212,0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={togglePlay} className={`btn-primary ${isPlaying ? 'glow-cyan' : ''}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Stop Arp' : 'Start Arp'}</span>
          </button>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: isPlaying ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
            {isPlaying ? `Step ${currentStep >= 0 ? currentStep + 1 : '-'}` : 'Idle'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="var(--accent-cyan)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{bpm} BPM</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} /> Tempo (BPM)
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{bpm}</span>
        </div>
        <input type="range" min="40" max="240" value={bpm} onChange={handleBpm} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
          <span>40 Slow</span><span>140 Medium</span><span>240 Fast</span>
        </div>
      </div>

      <div>
        <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <ArrowUpDown size={14} /> Arpeggio Pattern
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {patterns.map(p => {
            const Icon = p.icon;
            const active = pattern === p.id;
            return (
              <button key={p.id} onClick={() => { setPattern(p.id); audioEngine.arpPattern = p.id; }}
                style={{
                  padding: '8px 4px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  borderRadius: '10px',
                  background: active ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' : 'rgba(255,255,255,0.05)',
                  border: active ? '1px solid #fff' : '1px solid var(--border-glass)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  boxShadow: active ? '0 0 12px rgba(6,182,212,0.5)' : 'none',
                  fontWeight: active ? 600 : 400
                }}>
                <Icon size={16} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label className="label-caps">Octave Range</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>{octaves} oct</span>
          </div>
          <input type="range" min="1" max="5" step="1" value={octaves} onChange={handleOctaves} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label className="label-caps">Note Gate</label>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-pink)', fontFamily: 'var(--font-mono)' }}>{Math.round(gate * 100)}%</span>
          </div>
          <input type="range" min="0.1" max="1" step="0.05" value={gate} onChange={handleGate} />
        </div>
      </div>

      <div>
        <label className="label-caps" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          Root Note Key
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {rootNotes.map(rn => {
            const active = Math.abs(rootFreq - rn.freq) < 0.5;
            return (
              <button key={rn.name} onClick={() => handleRoot(rn.freq)}
                style={{
                  padding: '8px 2px',
                  fontSize: '0.7rem',
                  borderRadius: '8px',
                  background: active ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))' : 'rgba(255,255,255,0.05)',
                  border: active ? '1px solid #fff' : '1px solid var(--border-glass)',
                  color: active ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: active ? 700 : 500,
                  boxShadow: active ? '0 0 12px rgba(236,72,153,0.5)' : 'none'
                }}>
                {rn.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>Tip</h3>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Combine the arpeggiator with the Harmonizer, Drum Machine and FX Rack to build evolving soundscapes. Use Up/Down pattern for classic Berlin-Style sequences.
        </p>
      </div>
    </div>
  );
};
