import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Book, Play, Save, Trash2, Download, Upload } from 'lucide-react';
import masterBus from '../audio/masterBus';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [3, 4, 5];
const DURATIONS = [
  { value: '1n', name: 'Whole', symbol: '𝅝' },
  { value: '2n', name: 'Half', symbol: '𝅗𝅥' },
  { value: '4n', name: 'Quarter', symbol: '𝅘𝅥' },
  { value: '8n', name: 'Eighth', symbol: '𝅘𝅥𝅮' },
  { value: '16n', name: '16th', symbol: '𝅘𝅥𝅯' },
];

export default function MusicNotation() {
  const synthRef = useRef(null);
  const [score, setScore] = useState([]);
  const [currentNote, setCurrentNote] = useState({ note: 'C', octave: 4, duration: '4n' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [clef, setClef] = useState('treble'); // 'treble' or 'bass'
  const [timeSignature, setTimeSignature] = useState('4/4');

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.5 },
    }).connect(masterBus);

    // Load saved score
    const savedScore = localStorage.getItem('virtuo_score');
    if (savedScore) {
      try {
        setScore(JSON.parse(savedScore));
      } catch (e) {
        console.error('Failed to load score:', e);
      }
    }

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const saveScore = () => {
    localStorage.setItem('virtuo_score', JSON.stringify(score));
  };

  const clearScore = () => {
    setScore([]);
    localStorage.removeItem('virtuo_score');
  };

  const addNote = () => {
    setScore([...score, { ...currentNote, id: Date.now() }]);
  };

  const removeNote = (id) => {
    setScore(score.filter(note => note.id !== id));
  };

  const playNote = async (noteObj) => {
    await Tone.start();
    const note = `${noteObj.note}${noteObj.octave}`;
    synthRef.current.triggerAttackRelease(note, noteObj.duration);
  };

  const playScore = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    await Tone.start();
    
    Tone.Transport.bpm.value = tempo;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    let time = 0;
    score.forEach((noteObj, i) => {
      const note = `${noteObj.note}${noteObj.octave}`;
      Tone.Transport.schedule(() => {
        synthRef.current.triggerAttackRelease(note, noteObj.duration);
      }, time);
      
      // Add duration to time
      const durationInSeconds = Tone.Time(noteObj.duration).toSeconds();
      time += durationInSeconds;
    });
    
    Tone.Transport.start();
    Tone.Transport.schedule(() => {
      Tone.Transport.stop();
      setIsPlaying(false);
    }, time);
  };

  const stopPlayback = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  const exportMIDI = () => {
    // Simple export as JSON that could be converted to MIDI
    const data = {
      score,
      tempo,
      clef,
      timeSignature,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `virtuo-score-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getNotePosition = (note, octave) => {
    // Simplified staff position calculation
    const noteIndex = NOTES.indexOf(note.replace('#', ''));
    const isSharp = note.includes('#');
    const basePosition = (octave - 3) * 7 + noteIndex;
    
    return {
      line: basePosition % 5,
      space: Math.floor(basePosition / 5) % 2,
      isSharp
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Music Notation</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Compose music with standard notation. Add notes, play back your composition, and export.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Note</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <select
              value={currentNote.note}
              onChange={(e) => setCurrentNote({ ...currentNote, note: e.target.value })}
              className="btn-glass"
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            >
              {NOTES.map(note => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
            
            <select
              value={currentNote.octave}
              onChange={(e) => setCurrentNote({ ...currentNote, octave: Number(e.target.value) })}
              className="btn-glass"
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            >
              {OCTAVES.map(octave => (
                <option key={octave} value={octave}>Octave {octave}</option>
              ))}
            </select>
            
            <select
              value={currentNote.duration}
              onChange={(e) => setCurrentNote({ ...currentNote, duration: e.target.value })}
              className="btn-glass"
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            >
              {DURATIONS.map(dur => (
                <option key={dur.value} value={dur.value}>{dur.name} ({dur.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tempo: {tempo} BPM</label>
          <input 
            type="range" min="40" max="200" step="1" 
            value={tempo} 
            onChange={(e) => setTempo(Number(e.target.value))}
            style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clef & Time</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <select
              value={clef}
              onChange={(e) => setClef(e.target.value)}
              className="btn-glass"
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            >
              <option value="treble">Treble Clef</option>
              <option value="bass">Bass Clef</option>
            </select>
            
            <select
              value={timeSignature}
              onChange={(e) => setTimeSignature(e.target.value)}
              className="btn-glass"
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
              <option value="2/4">2/4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notation Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className="btn-glass"
          onClick={addNote}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Music size={16} /> Add Note
        </button>
        
        <button
          className={`btn-glass ${isPlaying ? 'active' : ''}`}
          onClick={isPlaying ? stopPlayback : playScore}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isPlaying ? <span>⏸️ Stop</span> : <><Play size={16} /> Play Score</>}
        </button>
        
        <button
          className="btn-glass"
          onClick={saveScore}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={16} /> Save
        </button>
        
        <button
          className="btn-glass"
          onClick={clearScore}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Trash2 size={16} /> Clear
        </button>
        
        <button
          className="btn-glass"
          onClick={exportMIDI}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* Staff Display */}
      <div style={{ 
        width: '100%', 
        maxWidth: '900px', 
        minHeight: '200px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '30px',
        position: 'relative',
        overflowX: 'auto'
      }}>
        {/* Staff lines */}
        <div style={{ position: 'relative', height: '100px' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${i * 20}px`,
                left: '0',
                right: '0',
                height: '2px',
                background: 'var(--text-main)',
                opacity: 0.3
              }}
            />
          ))}
          
          {/* Clef symbol */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '10px',
            fontSize: '3rem',
            opacity: 0.7
          }}>
            {clef === 'treble' ? '𝄞' : '𝄢'}
          </div>
          
          {/* Time signature */}
          <div style={{
            position: 'absolute',
            left: '80px',
            top: '30px',
            fontSize: '1.5rem',
            opacity: 0.7
          }}>
            {timeSignature}
          </div>
          
          {/* Notes */}
          {score.map((noteObj, index) => {
            const pos = getNotePosition(noteObj.note, noteObj.octave);
            const durationSymbol = DURATIONS.find(d => d.value === noteObj.duration)?.symbol || '𝅘𝅥';
            const leftPosition = 120 + (index * 60);
            
            return (
              <motion.div
                key={noteObj.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  left: `${leftPosition}px`,
                  top: `${pos.line * 20}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
                onClick={() => playNote(noteObj)}
                onDoubleClick={() => removeNote(noteObj.id)}
              >
                {pos.isSharp && (
                  <div style={{
                    fontSize: '1.2rem',
                    position: 'absolute',
                    left: '-15px',
                    top: '0',
                    color: 'var(--accent-primary)'
                  }}>
                    ♯
                  </div>
                )}
                
                <div style={{
                  fontSize: '2rem',
                  color: 'var(--accent-primary)'
                }}>
                  {durationSymbol}
                </div>
                
                {/* Note stem */}
                {noteObj.duration !== '1n' && (
                  <div style={{
                    position: 'absolute',
                    left: '18px',
                    top: pos.line > 2 ? '-20px' : '20px',
                    width: '2px',
                    height: '20px',
                    background: 'var(--accent-primary)',
                    transform: 'rotate(0deg)'
                  }} />
                )}
                
                {/* Hover info */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0',
                  background: 'rgba(0,0,0,0.8)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}>
                  {noteObj.note}{noteObj.octave} • {DURATIONS.find(d => d.value === noteObj.duration)?.name}
                  <br />
                  Click to play, double-click to remove
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Score info */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {score.length} notes • {clef} clef • {timeSignature} • {tempo} BPM
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click notes to play, double-click to remove
          </div>
        </div>
      </div>

      {/* Note Palette */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Quick Add Notes</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {NOTES.slice(0, 7).map(note => (
            <button
              key={note}
              className="btn-glass"
              onClick={() => {
                setCurrentNote({ ...currentNote, note });
                addNote();
              }}
              style={{ padding: '8px 15px', fontSize: '0.9rem' }}
            >
              {note}4
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
          Create musical scores with standard notation. Add notes, adjust tempo and time signature,
          play back your composition, and export as JSON. Double-click notes to remove them.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          background: 'rgba(0,0,0,0.2)', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Add Notes</div>
            <div style={{ color: 'var(--text-muted)' }}>Select note, octave, duration</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Playback</div>
            <div style={{ color: 'var(--text-muted)' }}>Click Play to hear score</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Export</div>
            <div style={{ color: 'var(--text-muted)' }}>Save as JSON for later</div>
          </div>
        </div>
      </div>
    </div>
  );
}