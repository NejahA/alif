import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { BookOpen, Play, Square, Music, Sparkles } from 'lucide-react';
import masterBus from '../audio/masterBus';

const PROGRESSIONS = {
  "Jazz/Soul": [
    { name: "Dm9", notes: ["D3", "F3", "A3", "C4", "E4"] },
    { name: "G13", notes: ["G2", "F3", "B3", "E4"] },
    { name: "Cmaj9", notes: ["C3", "E3", "G3", "B3", "D4"] },
    { name: "A7b13", notes: ["A2", "G3", "C#4", "F4"] }
  ],
  "Lo-Fi Chill": [
    { name: "Am7", notes: ["A2", "C3", "E3", "G3"] },
    { name: "D7", notes: ["D3", "F#3", "A3", "C4"] },
    { name: "Gmaj7", notes: ["G2", "B2", "D3", "F#3"] },
    { name: "Cmaj7", notes: ["C3", "E3", "G3", "B3"] }
  ],
  "Epic/Dark": [
    { name: "Fm", notes: ["F2", "Ab2", "C3"] },
    { name: "Db", notes: ["Db2", "F2", "Ab2"] },
    { name: "Bbm", notes: ["Bb1", "Db2", "F2"] },
    { name: "C", notes: ["C2", "E2", "G2"] }
  ],
  "Pop Anthem": [
    { name: "C", notes: ["C3", "E3", "G3"] },
    { name: "G", notes: ["G2", "B2", "D3"] },
    { name: "Am", notes: ["A2", "C3", "E3"] },
    { name: "F", notes: ["F2", "A2", "C3"] }
  ]
};

export default function ChordProgressionGenerator() {
  const [currentCategory, setCurrentCategory] = useState("Jazz/Soul");
  const [activeChord, setActiveChord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const synthRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
      loopRef.current?.dispose();
    };
  }, []);

  const playChord = (chord) => {
    if (Tone.context.state !== 'running') Tone.start();
    synthRef.current.triggerAttackRelease(chord.notes, '2n');
    setActiveChord(chord.name);
    setTimeout(() => setActiveChord(null), 1000);
  };

  const toggleSequence = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
      setActiveChord(null);
      if (loopRef.current) loopRef.current.dispose();
    } else {
      const chords = PROGRESSIONS[currentCategory];
      let step = 0;
      
      loopRef.current = new Tone.Loop(time => {
        const chord = chords[step % chords.length];
        synthRef.current.triggerAttackRelease(chord.notes, '2n', time);
        Tone.Draw.schedule(() => setActiveChord(chord.name), time);
        step++;
      }, "2n").start(0);

      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <BookOpen size={24} color="#8a2be2" /> Chord Progressions
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Intelligent Harmonic Engine</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {Object.keys(PROGRESSIONS).map(cat => (
            <button
              key={cat}
              className={`btn-glass ${currentCategory === cat ? 'active' : ''}`}
              onClick={() => { setCurrentCategory(cat); setIsPlaying(false); Tone.Transport.stop(); }}
              style={{ padding: '10px 20px', borderRadius: '30px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {PROGRESSIONS[currentCategory].map((chord, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playChord(chord)}
              style={{
                height: '150px', background: activeChord === chord.name ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                borderRadius: '20px', border: '1px solid var(--glass-border)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer', transition: 'background 0.3s'
              }}
            >
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: activeChord === chord.name ? '#fff' : 'var(--text-main)' }}>{chord.name}</span>
              <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                 {chord.notes.map(n => <div key={n} style={{ width: '4px', height: '4px', borderRadius: '50%', background: activeChord === chord.name ? 'rgba(255,255,255,0.5)' : 'var(--accent-primary)' }} />)}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={toggleSequence}
            style={{ padding: '15px 40px', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {isPlaying ? <Square size={20} /> : <Play size={20} />}
            {isPlaying ? 'STOP PROGRESSION' : 'AUTO-PLAY CYCLE'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={14} /> JAZZ & SOUL VOICINGS</div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Music size={14} /> POLYPHONIC ENGINE</div>
      </div>
    </div>
  );
}
