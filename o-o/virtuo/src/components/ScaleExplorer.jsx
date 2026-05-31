import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { BookOpen, Play } from 'lucide-react';
import masterBus from '../audio/masterBus';

const SCALES = {
  Major: [0, 2, 4, 5, 7, 9, 11, 12],
  Minor: [0, 2, 3, 5, 7, 8, 10, 12],
  Dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  Phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  Lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  Locrian: [0, 1, 3, 5, 6, 8, 10, 12],
  'Pentatonic Major': [0, 2, 4, 7, 9, 12],
  'Pentatonic Minor': [0, 3, 5, 7, 10, 12],
  'Blues Scale': [0, 3, 5, 6, 7, 10, 12],
};

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function ScaleExplorer() {
  const [root, setRoot] = useState('C');
  const [scaleType, setScaleType] = useState('Major');
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 0.8 }
    }).connect(masterBus);

    return () => synthRef.current?.dispose();
  }, []);

  const getNotes = () => {
    const intervals = SCALES[scaleType];
    const rootFreq = Tone.Frequency(`${root}4`).toMidi();
    return intervals.map(i => Tone.Frequency(rootFreq + i, 'midi').toNote());
  };

  const playScale = async () => {
    await Tone.start();
    const notes = getNotes();
    const now = Tone.now();
    notes.forEach((note, i) => {
      synthRef.current.triggerAttackRelease(note, '8n', now + i * 0.25);
    });
  };

  const playNote = async (note) => {
    await Tone.start();
    synthRef.current.triggerAttackRelease(note, '4n');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '800px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '20px', flex: 1, minWidth: '300px' }}>
          <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} /> Configuration
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Root Note</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {ROOTS.map(r => (
                  <button
                    key={r}
                    className={`btn-glass ${root === r ? 'active' : ''}`}
                    onClick={() => setRoot(r)}
                    style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Scale Type</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.keys(SCALES).map(s => (
                  <button
                    key={s}
                    className={`btn-glass ${scaleType === s ? 'active' : ''}`}
                    onClick={() => setScaleType(s)}
                    style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <h4 style={{ margin: 0 }}>{root} {scaleType}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {getNotes().map((note, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playNote(note)}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px var(--accent-glow)'
                }}
              >
                {note.replace(/\d/, '')}
              </motion.div>
            ))}
          </div>
          <button className="btn-glass active" onClick={playScale} style={{ width: '100%', justifyContent: 'center' }}>
            <Play size={18} /> Play Sequence
          </button>
        </div>
      </div>
    </div>
  );
}
