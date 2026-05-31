import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Activity, Zap, Wind } from 'lucide-react';
import { getChannel } from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

const BASS_NOTES = ['E1', 'F1', 'G1', 'A1', 'B1', 'C2', 'D2', 'E2'];

export default function BassSynth() {
  const isAudioReady = useAudioSafe();
  const [cutoff, setCutoff] = useState(400);
  const [resonance, setResonance] = useState(5);
  const [drive, setDrive] = useState(0.2);
  const [activeNote, setActiveNote] = useState(null);
  
  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const distortionRef = useRef(null);

  useEffect(() => {
    if (!isAudioReady) return;
    distortionRef.current = new Tone.Distortion(drive).connect(getChannel('bass'));
    
    filterRef.current = new Tone.Filter({
      type: 'lowpass',
      frequency: cutoff,
      Q: resonance,
      rolloff: -48
    }).connect(distortionRef.current);

    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 },
      filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.8, baseFrequency: 200, octaves: 2.6 }
    }).connect(filterRef.current);

    // MIDI Listeners
    const onMidiOn = (e) => playNote(e.detail.note);
    window.addEventListener('virtuo-midi-on', onMidiOn);

    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      distortionRef.current?.dispose();
      window.removeEventListener('virtuo-midi-on', onMidiOn);
    };
  }, [isAudioReady]);

  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.rampTo(cutoff, 0.1);
      filterRef.current.Q.rampTo(resonance, 0.1);
    }
  }, [cutoff, resonance]);

  useEffect(() => {
    if (distortionRef.current) {
      distortionRef.current.distortion = drive;
    }
  }, [drive]);

  useEffect(() => {
    const handleQuickJam = (e) => {
      const { style, mood } = e.detail;
      // Trigger a random bass sequence
      Tone.start();
      
      // Simple generative logic: play a root note every bar or 8th notes
      const loop = new Tone.Loop(time => {
        const root = 'C1';
        const fifth = 'G1';
        const note = Math.random() > 0.7 ? fifth : root;
        synthRef.current?.triggerAttackRelease(note, '16n', time);
      }, '8n').start(0);

      return () => loop.dispose();
    };

    window.addEventListener('virtuo-quick-jam', handleQuickJam);
    return () => window.removeEventListener('virtuo-quick-jam', handleQuickJam);
  }, []);

  const playNote = async (note) => {
    await Tone.start();
    synthRef.current.triggerAttackRelease(note, '4n');
    setActiveNote(note);
    setTimeout(() => setActiveNote(null), 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '800px', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Sub Filter</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Cutoff</span>
              <span>{cutoff}Hz</span>
            </div>
            <input type="range" min="20" max="1000" value={cutoff} onChange={(e) => setCutoff(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Resonance</span>
              <span>{resonance}</span>
            </div>
            <input type="range" min="0" max="20" step="0.5" value={resonance} onChange={(e) => setResonance(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>Drive</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Distortion</span>
              <span>{Math.round(drive * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={drive} onChange={(e) => setDrive(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {BASS_NOTES.map(note => (
          <motion.div
            key={note}
            whileTap={{ scale: 0.9 }}
            onMouseDown={() => playNote(note)}
            animate={{
              background: activeNote === note ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              boxShadow: activeNote === note ? '0 0 30px var(--accent-glow)' : 'none',
              y: activeNote === note ? 5 : 0
            }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              border: '2px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
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
