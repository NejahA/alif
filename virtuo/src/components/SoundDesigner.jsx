import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Zap, Play, Square, Sliders, AudioWaveform, Sparkles, RotateCcw, Save, Music } from 'lucide-react';

const OSCILLATOR_TYPES = ['sine', 'triangle', 'sawtooth', 'square', 'pwm', 'fmsine', 'pulse', 'amsine'];
const FILTER_TYPES = ['lowpass', 'highpass', 'bandpass', 'notch', 'peaking', 'allpass'];
const ENVELOPE_PRESETS = {
  'Piano': { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
  'Organ': { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.3 },
  'Pluck': { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 },
  'Pad': { attack: 0.5, decay: 0.5, sustain: 0.7, release: 2.0 },
  'Bass': { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.5 },
  'Lead': { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 },
};

const SoundDesigner = () => {
  const [oscType, setOscType] = useState('sine');
  const [filterType, setFilterType] = useState('lowpass');
  const [filterFreq, setFilterFreq] = useState(1000);
  const [filterQ, setFilterQ] = useState(1);
  const [filterGain, setFilterGain] = useState(0);
  const [attack, setAttack] = useState(0.1);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.5);
  const [release, setRelease] = useState(0.5);
  const [lfoFreq, setLfoFreq] = useState(2);
  const [lfoDepth, setLfoDepth] = useState(0);
  const [lfoTarget, setLfoTarget] = useState('pitch');
  const [volume, setVolume] = useState(-6);
  const [detune, setDetune] = useState(0);
  const [polyphony, setPolyphony] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState('Custom');
  const [isDirty, setIsDirty] = useState(false);
  const [savedPresets, setSavedPresets] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const lfoRef = useRef(null);
  const testNoteRef = useRef(null);

  useEffect(() => {
    buildSynth();
    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      lfoRef.current?.dispose();
    };
  }, [oscType, filterType, filterFreq, filterQ, filterGain, attack, decay, sustain, release, lfoFreq, lfoDepth, lfoTarget, volume, detune, polyphony]);

  const buildSynth = () => {
    if (synthRef.current) {
      synthRef.current.dispose();
    }
    if (filterRef.current) {
      filterRef.current.dispose();
    }
    if (lfoRef.current) {
      lfoRef.current.dispose();
    }

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: oscType },
      envelope: { attack, decay, sustain, release },
      volume,
      detune
    });

    const filter = new Tone.Filter({
      type: filterType,
      frequency: filterFreq,
      Q: filterQ,
      gain: filterGain
    });

    const lfo = new Tone.LFO(lfoFreq, 0, lfoDepth);
    lfo.start();

    if (lfoTarget === 'pitch') {
      lfo.connect(synth.frequency);
    } else if (lfoTarget === 'filter') {
      lfo.connect(filter.frequency);
    } else if (lfoTarget === 'volume') {
      lfo.connect(synth.volume);
    }

    synth.connect(filter);
    filter.toDestination();

    synthRef.current = synth;
    filterRef.current = filter;
    lfoRef.current = lfo;
  };

  const playTestNote = async () => {
    await Tone.start();
    setIsPlaying(true);
    
    const notes = ['C4', 'E4', 'G4'];
    const now = Tone.now();
    
    notes.forEach((note, i) => {
      synthRef.current?.triggerAttackRelease(note, '4n', now + i * 0.2);
    });
    
    setTimeout(() => setIsPlaying(false), 1500);
  };

  const playScale = async () => {
    await Tone.start();
    setIsPlaying(true);
    
    const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const now = Tone.now();
    
    scale.forEach((note, i) => {
      synthRef.current?.triggerAttackRelease(note, '8n', now + i * 0.15);
    });
    
    setTimeout(() => setIsPlaying(false), scale.length * 150 + 200);
  };

  const applyPreset = (presetName) => {
    const preset = ENVELOPE_PRESETS[presetName];
    if (preset) {
      setAttack(preset.attack);
      setDecay(preset.decay);
      setSustain(preset.sustain);
      setRelease(preset.release);
      setActivePreset(presetName);
      setIsDirty(false);
    }
  };

  const savePreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;
    
    const preset = {
      id: Date.now(),
      name,
      oscType,
      filterType,
      filterFreq,
      filterQ,
      filterGain,
      attack,
      decay,
      sustain,
      release,
      lfoFreq,
      lfoDepth,
      lfoTarget,
      volume,
      detune,
      polyphony
    };
    
    setSavedPresets(prev => [...prev, preset]);
    localStorage.setItem('virtuo_sound_presets', JSON.stringify([...savedPresets, preset]));
  };

  useEffect(() => {
    const saved = localStorage.getItem('virtuo_sound_presets');
    if (saved) {
      setSavedPresets(JSON.parse(saved));
    }
  }, []);

  const loadSavedPreset = (preset) => {
    setOscType(preset.oscType);
    setFilterType(preset.filterType);
    setFilterFreq(preset.filterFreq);
    setFilterQ(preset.filterQ);
    setFilterGain(preset.filterGain);
    setAttack(preset.attack);
    setDecay(preset.decay);
    setSustain(preset.sustain);
    setRelease(preset.release);
    setLfoFreq(preset.lfoFreq);
    setLfoDepth(preset.lfoDepth);
    setLfoTarget(preset.lfoTarget);
    setVolume(preset.volume);
    setDetune(preset.detune);
    setPolyphony(preset.polyphony);
    setActivePreset(preset.name);
  };

  const renderOscillatorSection = () => (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        <AudioWaveform size={10} /> Oscillator
      </div>
      <select
        value={oscType}
        onChange={(e) => { setOscType(e.target.value); setActivePreset('Custom'); setIsDirty(true); }}
        style={{
          width: '100%',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--glass-border)',
          borderRadius: '4px',
          color: 'var(--text-main)',
          padding: '4px 8px',
          fontSize: '0.75rem',
          marginBottom: '6px'
        }}
      >
        {OSCILLATOR_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>Detune</span>
          <span>{detune}¢</span>
        </div>
        <input type="range" min="-100" max="100" step="1" value={detune}
          onChange={(e) => setDetune(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
    </div>
  );

  const renderFilterSection = () => (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        <Sliders size={10} /> Filter
      </div>
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--glass-border)',
          borderRadius: '4px',
          color: 'var(--text-main)',
          padding: '4px 8px',
          fontSize: '0.75rem',
          marginBottom: '6px'
        }}
      >
        {FILTER_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>Frequency</span>
          <span>{filterFreq} Hz</span>
        </div>
        <input type="range" min="20" max="20000" step="1" value={filterFreq}
          onChange={(e) => setFilterFreq(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>Resonance</span>
          <span>{filterQ.toFixed(1)}</span>
        </div>
        <input type="range" min="0.1" max="20" step="0.1" value={filterQ}
          onChange={(e) => setFilterQ(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
    </div>
  );

  const renderEnvelopeSection = () => (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Envelope
      </div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {Object.keys(ENVELOPE_PRESETS).map(preset => (
          <button
            key={preset}
            className={`btn-glass ${activePreset === preset ? 'active' : ''}`}
            onClick={() => applyPreset(preset)}
            style={{ padding: '2px 6px', fontSize: '0.6rem' }}
          >
            {preset}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>A</span><span>{attack.toFixed(2)}s</span>
        </div>
        <input type="range" min="0.001" max="2" step="0.001" value={attack}
          onChange={(e) => { setAttack(Number(e.target.value)); setActivePreset('Custom'); }}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>D</span><span>{decay.toFixed(2)}s</span>
        </div>
        <input type="range" min="0.001" max="2" step="0.001" value={decay}
          onChange={(e) => { setDecay(Number(e.target.value)); setActivePreset('Custom'); }}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>S</span><span>{sustain.toFixed(2)}</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={sustain}
          onChange={(e) => { setSustain(Number(e.target.value)); setActivePreset('Custom'); }}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>R</span><span>{release.toFixed(2)}s</span>
        </div>
        <input type="range" min="0.01" max="5" step="0.01" value={release}
          onChange={(e) => { setRelease(Number(e.target.value)); setActivePreset('Custom'); }}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
    </div>
  );

  const renderLfoSection = () => (
    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        LFO
      </div>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>Rate</span><span>{lfoFreq.toFixed(1)} Hz</span>
        </div>
        <input type="range" min="0.1" max="20" step="0.1" value={lfoFreq}
          onChange={(e) => setLfoFreq(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>Depth</span><span>{lfoDepth.toFixed(0)}%</span>
        </div>
        <input type="range" min="0" max="100" step="1" value={lfoDepth}
          onChange={(e) => setLfoDepth(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>
      <div>
        <div style={{ fontSize: '0.6rem', marginBottom: '2px' }}>Target</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['pitch', 'filter', 'volume'].map(target => (
            <button
              key={target}
              className={`btn-glass ${lfoTarget === target ? 'active' : ''}`}
              onClick={() => setLfoTarget(target)}
              style={{ padding: '2px 6px', fontSize: '0.6rem', flex: 1, textTransform: 'capitalize' }}
            >
              {target}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Sound Designer</h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-glass" onClick={playTestNote} style={{ padding: '4px 8px', fontSize: '0.65rem' }}>
            <Play size={10} /> Chord
          </button>
          <button className="btn-glass" onClick={playScale} style={{ padding: '4px 8px', fontSize: '0.65rem' }}>
            <Music size={10} /> Scale
          </button>
          <button className="btn-glass" onClick={savePreset} style={{ padding: '4px 8px', fontSize: '0.65rem' }}>
            <Save size={10} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {renderOscillatorSection()}
        {renderFilterSection()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {renderEnvelopeSection()}
        {renderLfoSection()}
      </div>

      {/* Volume */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '2px' }}>
          <span>Volume</span><span>{volume} dB</span>
        </div>
        <input type="range" min="-40" max="6" step="0.5" value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
      </div>

      {/* Saved Presets */}
      {savedPresets.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Saved Presets</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {savedPresets.map(preset => (
              <button
                key={preset.id}
                className="btn-glass"
                onClick={() => loadSavedPreset(preset)}
                style={{ padding: '2px 6px', fontSize: '0.6rem' }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Preset Indicator */}
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {activePreset !== 'Custom' ? `Preset: ${activePreset}` : 'Custom patch'}
      </div>
    </div>
  );
};

export default SoundDesigner;