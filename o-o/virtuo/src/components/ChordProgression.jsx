import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, Plus, Trash2, ArrowRight } from 'lucide-react';
import masterBus from '../audio/masterBus';

const CHORD_OPTIONS = [
  { name: 'C Maj', notes: ['C4', 'E4', 'G4'] },
  { name: 'D Min', notes: ['D4', 'F4', 'A4'] },
  { name: 'E Min', notes: ['E4', 'G4', 'B4'] },
  { name: 'F Maj', notes: ['F4', 'A4', 'C5'] },
  { name: 'G Maj', notes: ['G4', 'B4', 'D5'] },
  { name: 'A Min', notes: ['A4', 'C5', 'E5'] },
  { name: 'B Dim', notes: ['B4', 'D5', 'F5'] },
];

export default function ChordProgression() {
  const [progression, setProgression] = useState(['C Maj', 'F Maj', 'G Maj', 'C Maj']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const synthRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 1 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
      loopRef.current?.dispose();
    };
  }, []);

  const playProgression = async () => {
    await Tone.start();
    if (isPlaying) {
      loopRef.current?.stop();
      setIsPlaying(false);
      setCurrentIndex(-1);
      return;
    }

    if (progression.length === 0) return;

    loopRef.current = new Tone.Loop((time) => {
      Tone.Draw.schedule(() => {
        setCurrentIndex(prev => (prev + 1) % progression.length);
      }, time);

      // We need to access the latest progression inside the loop
      // but loop is created once. Using a ref for the progression state would be better
      // but for simplicity we recreate loop when progression changes or use a trick.
    }, '1m');

    setIsPlaying(true);
    Tone.Transport.start();
    loopRef.current.start(0);
  };

  // Re-sync loop with progression
  useEffect(() => {
    if (isPlaying && currentIndex !== -1) {
      const chordName = progression[currentIndex];
      const chord = CHORD_OPTIONS.find(c => c.name === chordName);
      if (chord) {
        synthRef.current.triggerAttackRelease(chord.notes, '2n');
      }
    }
  }, [currentIndex]);

  const addChord = (name) => {
    setProgression([...progression, name]);
  };

  const removeChord = (index) => {
    const newProg = [...progression];
    newProg.splice(index, 1);
    setProgression(newProg);
  };

  const applyPreset = (preset) => {
    switch(preset) {
      case 'pop': setProgression(['C Maj', 'G Maj', 'A Min', 'F Maj']); break;
      case 'jazz': setProgression(['D Min', 'G Maj', 'C Maj', 'A Min']); break;
      case 'blues': setProgression(['C Maj', 'F Maj', 'C Maj', 'G Maj']); break;
      default: break;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chord Progression</h3>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="btn-glass" onClick={() => applyPreset('pop')} style={{ padding: '2px 6px', fontSize: '0.6rem' }}>Pop</button>
          <button className="btn-glass" onClick={() => applyPreset('jazz')} style={{ padding: '2px 6px', fontSize: '0.6rem' }}>Jazz</button>
          <button className="btn-glass" onClick={() => applyPreset('blues')} style={{ padding: '2px 6px', fontSize: '0.6rem' }}>Blues</button>
          <button 
            className={`btn-glass ${isPlaying ? 'active' : ''}`}
            onClick={playProgression}
            style={{ padding: '5px 15px', fontSize: '0.8rem', marginLeft: '5px' }}
          >
            {isPlaying ? <><Square size={14} /> Stop</> : <><Play size={14} /> Play</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', minHeight: '60px' }}>
        {progression.map((chord, i) => (
          <div 
            key={i} 
            style={{ 
              minWidth: '70px', 
              height: '50px', 
              background: currentIndex === i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: currentIndex === i ? '0 0 15px var(--accent-glow)' : 'none'
            }}
          >
            {chord}
            <button 
              onClick={() => removeChord(i)}
              style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '15px', height: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={10} style={{ transform: 'rotate(45deg)' }} color="white" />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {CHORD_OPTIONS.map(c => (
          <button 
            key={c.name} 
            className="btn-glass" 
            onClick={() => addChord(c.name)}
            style={{ padding: '5px 8px', fontSize: '0.7rem' }}
          >
            + {c.name}
          </button>
        ))}
      </div>

      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Create a loop of chords to practice soloing over!
      </p>
    </div>
  );
}
