import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { getChannel } from '../audio/masterBus';
import PresetManager from './PresetManager';
import InstrumentFXChain from './InstrumentFXChain';
import { Save, Activity, Wind, Zap, Sliders, SlidersHorizontal } from 'lucide-react';
import { useAudioSafe } from '../hooks/useAudioSafe';

const NOTES = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];

export default function Synthesizer() {
  const isAudioReady = useAudioSafe();
  const [oscType, setOscType] = useState('sine');
  const [cutoff, setCutoff] = useState(2000);
  const [resonance, setResonance] = useState(1);
  const [lfoRate, setLfoRate] = useState(0.5);
  const [lfoDepth, setLfoDepth] = useState(0);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [showFX, setShowFX] = useState(false);
  
  const synthRef = useRef(null);
  const bridgeRef = useRef(null);
  const filterRef = useRef(null);
  const lfoRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const handleAutomation = (e) => {
      const { instrumentId, paramId, value } = e.detail;
      if (instrumentId === 'synth') {
        if (paramId === 'oscType') setOscType(value);
        if (paramId === 'cutoff') setCutoff(value);
        if (paramId === 'resonance') setResonance(value);
        if (paramId === 'lfoRate') setLfoRate(value);
        if (paramId === 'lfoDepth') setLfoDepth(value);
      }
    };
    window.addEventListener('virtuo-automation-play', handleAutomation);
    return () => window.removeEventListener('virtuo-automation-play', handleAutomation);
  }, []);

  const updateParam = (id, val, setter) => {
    setter(val);
    window.dispatchEvent(new CustomEvent('virtuo-param-change', {
      detail: { instrumentId: 'synth', paramId: id, value: val }
    }));

    // Gain XP in Timbre
    window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
      detail: { virtue: 'timbre', amount: 2 }
    }));
  };

  useEffect(() => {
    if (!isAudioReady) return;
    analyserRef.current = new Tone.Analyser('waveform', 256);
    bridgeRef.current = new Tone.Gain(1);

    filterRef.current = new Tone.Filter({
      type: 'lowpass',
      frequency: cutoff,
      rolloff: -24,
      Q: resonance
    }).connect(analyserRef.current);

    lfoRef.current = new Tone.LFO(lfoRate, 0, 1000).start();
    lfoRef.current.connect(filterRef.current.frequency);

    analyserRef.current.connect(bridgeRef.current);

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: oscType },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
    }).connect(filterRef.current);

    // Draw Loop
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      const values = analyserRef.current.getValue();

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#8a2be2';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < values.length; i++) {
        const x = (i / values.length) * width;
        const y = (0.5 + values[i] / 2) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      requestRef.current = requestAnimationFrame(draw);
    };
    draw();

    // MIDI Listeners
    const onMidiOn = (e) => playNote(e.detail.note);
    const onMidiOff = (e) => releaseNote(e.detail.note);
    window.addEventListener('virtuo-midi-on', onMidiOn);
    window.addEventListener('virtuo-midi-off', onMidiOff);

    const handleGlobalRandomize = () => {
      const types = ['sine', 'square', 'sawtooth', 'triangle'];
      setOscType(types[Math.floor(Math.random() * types.length)]);
      setCutoff(Math.floor(Math.random() * 4000) + 100);
      setResonance(Math.random() * 15);
      setLfoRate(Math.random() * 10);
      setLfoDepth(Math.random());
    };
    window.addEventListener('virtuo-randomize', handleGlobalRandomize);

    return () => {
      synthRef.current?.dispose();
      bridgeRef.current?.dispose();
      filterRef.current?.dispose();
      lfoRef.current?.dispose();
      analyserRef.current?.dispose();
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('virtuo-midi-on', onMidiOn);
      window.removeEventListener('virtuo-midi-off', onMidiOff);
      window.removeEventListener('virtuo-randomize', handleGlobalRandomize);
    };
  }, []);

  useEffect(() => {
    if (lfoRef.current) {
      lfoRef.current.frequency.rampTo(lfoRate, 0.1);
      lfoRef.current.amplitude.rampTo(lfoDepth, 0.1);
    }
  }, [lfoRate, lfoDepth]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({ oscillator: { type: oscType } });
    }
  }, [oscType]);

  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.rampTo(cutoff, 0.1);
      filterRef.current.Q.rampTo(resonance, 0.1);
    }
  }, [cutoff, resonance]);

  const playNote = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveNotes(prev => new Set(prev).add(note));
    }
  };

  const releaseNote = (note) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  const handleLoadPreset = (settings) => {
    setOscType(settings.oscType);
    setCutoff(settings.cutoff);
    setResonance(settings.resonance);
    setLfoRate(settings.lfoRate || 0.5);
    setLfoDepth(settings.lfoDepth || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '1000px', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {/* Presets Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PresetManager 
            instrumentType="synth"
            currentSettings={{ oscType, cutoff, resonance, lfoRate, lfoDepth }}
            onLoadPreset={handleLoadPreset}
          />
          <button 
            className={`btn-glass ${showFX ? 'active' : ''}`}
            onClick={() => setShowFX(!showFX)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <SlidersHorizontal size={14} /> {showFX ? 'Hide FX Chain' : 'Show FX Chain'}
          </button>
        </div>

        {/* Oscillator Type */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Waves size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Oscillator</h4>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['sine', 'square', 'sawtooth', 'triangle'].map(type => (
              <button
                key={type}
                className={`btn-glass ${oscType === type ? 'active' : ''}`}
                onClick={() => updateParam('oscType', type, setOscType)}
                style={{ padding: '5px 12px', fontSize: '0.8rem', textTransform: 'capitalize' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Filter</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Cutoff</span>
              <span>{cutoff}Hz</span>
            </div>
            <input
              type="range"
              min="20"
              max="5000"
              value={cutoff}
              onChange={(e) => updateParam('cutoff', Number(e.target.value), setCutoff)}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Resonance</span>
              <span>{resonance}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={resonance}
              onChange={(e) => updateParam('resonance', Number(e.target.value), setResonance)}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        {/* LFO Modulation */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Modulation (LFO)</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Rate</span>
              <span>{lfoRate}Hz</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={lfoRate}
              onChange={(e) => updateParam('lfoRate', Number(e.target.value), setLfoRate)}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Depth</span>
              <span>{Math.round(lfoDepth * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={lfoDepth}
              onChange={(e) => updateParam('lfoDepth', Number(e.target.value), setLfoDepth)}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            LFO modulates the Filter Cutoff for vibrato/wobble effects.
          </p>
        </div>

        {/* Waveform Monitor */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Monitor</h4>
          </div>
          <div style={{ height: '80px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', overflow: 'hidden' }}>
            <canvas ref={canvasRef} width={300} height={80} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>

      <div style={{ display: showFX ? 'block' : 'none', width: '100%' }}>
        <InstrumentFXChain 
          instrumentId="synth" 
          inputNode={bridgeRef.current} 
          outputNode={getChannel('synth')} 
        />
      </div>

      {/* Keyboard */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
        {NOTES.map(note => (
          <motion.div
            key={note}
            onMouseDown={() => playNote(note)}
            onMouseUp={() => releaseNote(note)}
            onMouseLeave={() => releaseNote(note)}
            animate={{
              scale: activeNotes.has(note) ? 0.95 : 1,
              backgroundColor: activeNotes.has(note) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              boxShadow: activeNotes.has(note) ? '0 0 20px var(--accent-glow)' : 'none'
            }}
            style={{
              width: '45px',
              height: '120px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '10px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              border: '1px solid var(--glass-border)',
              userSelect: 'none'
            }}
          >
            {note}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
