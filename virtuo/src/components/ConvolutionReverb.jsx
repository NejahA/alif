import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Cloud, Upload, RefreshCcw, Music } from 'lucide-react';
import masterBus from '../audio/masterBus';

const BUILTIN_IRS = [
  { name: 'Medium Hall', url: 'https://tonejs.github.io/audio/impulse-responses/medium_hall.wav', preset: { size: 0.7, wet: 0.3 } },
  { name: 'Large Chamber', url: 'https://tonejs.github.io/audio/impulse-responses/large_chamber.wav', preset: { size: 0.85, wet: 0.25 } },
  { name: 'Small Room', url: 'https://tonejs.github.io/audio/impulse-responses/small_room.wav', preset: { size: 0.3, wet: 0.15 } },
  { name: 'Plate', url: 'https://tonejs.github.io/audio/impulse-responses/plate.wav', preset: { size: 0.5, wet: 0.2 } }
];

export default function ConvolutionReverb() {
  const [wet, setWet] = useState(0.25);
  const [decay, setDecay] = useState(2);
  const [selectedIR, setSelectedIR] = useState(BUILTIN_IRS[0].name);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [preDelay, setPreDelay] = useState(0);
  const [damping, setDamping] = useState(5000);
  const reverbRef = useRef(null);
  const preDelayRef = useRef(null);

  useEffect(() => {
    if (!preDelayRef.current) {
      preDelayRef.current = new Tone.Delay(0, 0.5);
    }
    if (!reverbRef.current) {
      reverbRef.current = new Tone.Reverb(decay).connect(masterBus);
      reverbRef.current.wet.value = wet;
      preDelayRef.current.connect(reverbRef.current);
    }
    return () => {
      reverbRef.current?.dispose();
      preDelayRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.rampTo(isActive ? wet : 0, 0.1);
    }
  }, [isActive, wet]);

  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.decay = decay;
    }
  }, [decay]);

  useEffect(() => {
    if (preDelayRef.current) {
      preDelayRef.current.delayTime.value = preDelay;
    }
  }, [preDelay]);

  const loadIR = async (url) => {
    setIsLoading(true);
    try {
      const buffer = await Tone.Buffer.fromUrl(url);
      if (reverbRef.current) {
        reverbRef.current.dispose();
      }
      reverbRef.current = new Tone.Reverb({ decay, wet }).connect(masterBus);
      preDelayRef.current?.connect(reverbRef.current);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  const handleIRSelect = (name) => {
    setSelectedIR(name);
    const ir = BUILTIN_IRS.find(i => i.name === name);
    if (ir) {
      loadIR(ir.url);
      setWet(ir.preset.wet);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const audioBuffer = await Tone.context.decodeAudioData(event.target.result);
        if (reverbRef.current) reverbRef.current.dispose();
        reverbRef.current = new Tone.Reverb({ decay, wet }).connect(masterBus);
        preDelayRef.current?.connect(reverbRef.current);
        setSelectedIR(file.name);
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '340px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Cloud size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Convolution Reverb</h3>
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

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {BUILTIN_IRS.map(ir => (
          <button
            key={ir.name}
            className={`btn-glass ${selectedIR === ir.name ? 'active' : ''}`}
            onClick={() => handleIRSelect(ir.name)}
            style={{ padding: '4px 10px', fontSize: '0.65rem' }}
          >
            <Music size={10} /> {ir.name}
          </button>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', border: '1px dashed var(--glass-border)' }}>
        <Upload size={14} color="var(--accent-primary)" />
        <span style={{ flex: 1, color: 'var(--text-muted)' }}>Upload custom IR...</span>
        <input type="file" accept="audio/wav,audio/mp3,audio/aiff" onChange={handleFileUpload} style={{ display: 'none' }} />
      </label>

      {isLoading && (
        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textAlign: 'center' }}>Loading IR...</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Mix</span>
          <span>{Math.round(wet * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={wet} onChange={(e) => setWet(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Decay</span>
          <span>{decay.toFixed(1)}s</span>
        </div>
        <input type="range" min="0.1" max="10" step="0.1" value={decay} onChange={(e) => setDecay(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Pre-Delay</span>
          <span>{preDelay}ms</span>
        </div>
        <input type="range" min="0" max="250" step="1" value={preDelay} onChange={(e) => setPreDelay(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <button className="btn-glass" onClick={() => { setWet(0.25); setDecay(2); setPreDelay(0); }} style={{ justifyContent: 'center', fontSize: '0.75rem' }}>
        <RefreshCcw size={12} /> Reset
      </button>
    </div>
  );
}
