import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Play, RefreshCcw, Dna, Save, Download } from 'lucide-react';
import * as Tone from 'tone';

const SCALES = {
  'C Major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  'A Minor': ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  'D Phrygian': ['D3', 'Eb3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4'],
  'G Lydian': ['G3', 'A3', 'B3', 'C#4', 'D4', 'E4', 'F#4', 'G4'],
  'C Pentatonic': ['C4', 'D4', 'E4', 'G4', 'A4', 'C5']
};

const MOODS = {
  'Happy': { jumps: [1, 2], rhythms: ['8n', '8n', '4n'], range: 1 },
  'Tense': { jumps: [1, 6, 1], rhythms: ['16n', '16n', '8n'], range: 2 },
  'Heroic': { jumps: [4, 3, 2], rhythms: ['4n', '8n.', '16n'], range: 2 },
  'Melancholic': { jumps: [1, -1, 2], rhythms: ['2n', '4n', '4n'], range: 1 }
};

export default function AIMelodicExplorer() {
  const [scale, setScale] = useState('C Major');
  const [mood, setMood] = useState('Happy');
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(null);

  const initSynth = () => {
    if (synthRef.current) return;
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, release: 0.2 }
    }).toDestination();
  };

  useEffect(() => {
    return () => synthRef.current?.dispose();
  }, []);

  const generateRiff = () => {
    const scaleNotes = SCALES[scale];
    const moodConfig = MOODS[mood];
    const newSequence = [];
    let currentNoteIndex = Math.floor(scaleNotes.length / 2);

    for (let i = 0; i < 8; i++) {
      const jump = moodConfig.jumps[Math.floor(Math.random() * moodConfig.jumps.length)];
      currentNoteIndex = Math.max(0, Math.min(scaleNotes.length - 1, currentNoteIndex + jump));
      
      newSequence.push({
        note: scaleNotes[currentNoteIndex],
        duration: moodConfig.rhythms[Math.floor(Math.random() * moodConfig.rhythms.length)],
        time: i * 0.25 // 8th note spacing
      });
    }
    setSequence(newSequence);
  };

  const mutateRiff = () => {
    const scaleNotes = SCALES[scale];
    const newSequence = sequence.map(step => {
      if (Math.random() > 0.7) {
        const jump = (Math.random() > 0.5 ? 1 : -1);
        const currentIndex = scaleNotes.indexOf(step.note);
        const nextIndex = Math.max(0, Math.min(scaleNotes.length - 1, currentIndex + jump));
        return { ...step, note: scaleNotes[nextIndex] };
      }
      return step;
    });
    setSequence(newSequence);
  };

  const playRiff = () => {
    if (isPlaying || sequence.length === 0) return;
    initSynth();
    setIsPlaying(true);

    const now = Tone.now();
    sequence.forEach(step => {
      synthRef.current.triggerAttackRelease(step.note, step.duration, now + step.time);
    });

    setTimeout(() => setIsPlaying(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Dna size={20} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Melodic Explorer</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <select 
            className="btn-glass" 
            value={scale} 
            onChange={(e) => setScale(e.target.value)}
            style={{ flex: 1, fontSize: '0.8rem' }}
          >
            {Object.keys(SCALES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            className="btn-glass" 
            value={mood} 
            onChange={(e) => setMood(e.target.value)}
            style={{ flex: 1, fontSize: '0.8rem' }}
          >
            {Object.keys(MOODS).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-glass" style={{ flex: 1 }} onClick={generateRiff}>
            <RefreshCcw size={14} /> Generate
          </button>
          <button className="btn-glass" style={{ flex: 1 }} onClick={mutateRiff} disabled={sequence.length === 0}>
            <Sparkles size={14} /> Mutate
          </button>
        </div>

        <button 
          className="btn-glass" 
          onClick={playRiff} 
          disabled={isPlaying || sequence.length === 0}
          style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}
        >
          <Play size={16} /> {isPlaying ? 'Playing...' : 'Listen'}
        </button>
      </div>

      {sequence.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '10px 0' }} className="no-scrollbar">
          {sequence.map((step, i) => (
            <div 
              key={i} 
              style={{ 
                minWidth: '35px', 
                height: '50px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                border: '1px solid var(--glass-border)'
              }}
            >
              <span style={{ fontWeight: 800 }}>{step.note}</span>
              <span style={{ opacity: 0.5 }}>{step.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
