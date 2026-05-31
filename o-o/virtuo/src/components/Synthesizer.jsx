import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Settings, Zap, Waves, Wind } from 'lucide-react';
import masterBus from '../audio/masterBus';

const NOTES = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];

export default function Synthesizer() {
  const [oscType, setOscType] = useState('sine');
  const [cutoff, setCutoff] = useState(2000);
  const [resonance, setResonance] = useState(1);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const synthRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    filterRef.current = new Tone.Filter({
      type: 'lowpass',
      frequency: cutoff,
      rolloff: -24,
      Q: resonance
    }).connect(masterBus);

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: oscType },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 }
    }).connect(filterRef.current);

    // MIDI Listeners
    const onMidiOn = (e) => playNote(e.detail.note);
    const onMidiOff = (e) => releaseNote(e.detail.note);
    window.addEventListener('virtuo-midi-on', onMidiOn);
    window.addEventListener('virtuo-midi-off', onMidiOff);

    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      window.removeEventListener('virtuo-midi-on', onMidiOn);
      window.removeEventListener('virtuo-midi-off', onMidiOff);
    };
  }, []);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '800px', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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
                onClick={() => setOscType(type)}
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
              onChange={(e) => setCutoff(Number(e.target.value))}
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
              onChange={(e) => setResonance(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Mini Keyboard */}
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
