import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';
import { 
  Music, Disc, Zap, Brain, Play, CheckCircle2, 
  XCircle, Trophy, RefreshCcw, Target
} from 'lucide-react';

const VirtueTraining = () => {
  const [activeGame, setActiveGame] = useState(null); // 'pitch' | 'rhythm' | 'spectral'
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'result'
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth().toDestination();
    return () => synthRef.current?.dispose();
  }, []);

  // --- Pitch Matching Game ---
  const [targetNote, setTargetNote] = useState(null);
  const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

  const startPitchGame = () => {
    setActiveGame('pitch');
    setGameState('playing');
    setScore(0);
    nextPitchRound();
  };

  const nextPitchRound = () => {
    const note = notes[Math.floor(Math.random() * notes.length)];
    setTargetNote(note);
    synthRef.current.triggerAttackRelease(note, '0.5s');
    setMessage('Match the note!');
  };

  const handlePitchGuess = (guess) => {
    if (guess === targetNote) {
      setScore(s => s + 1);
      setMessage('Correct! +10 Harmony XP');
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'harmony', amount: 10 }
      }));
      setTimeout(nextPitchRound, 1000);
    } else {
      setGameState('result');
      setMessage(`Game Over! Final Score: ${score}`);
    }
  };

  // --- Rhythm Tapping Game ---
  const [lastTap, setLastTap] = useState(0);
  const [rhythmTarget, setRhythmTarget] = useState(500); // 500ms intervals

  const startRhythmGame = () => {
    setActiveGame('rhythm');
    setGameState('playing');
    setScore(0);
    setLastTap(Date.now());
    setMessage('Tap to the beat (500ms intervals)');
  };

  const handleRhythmTap = () => {
    const now = Date.now();
    const diff = Math.abs((now - lastTap) - rhythmTarget);
    
    if (diff < 100) { // Accurate enough
      setScore(s => s + 1);
      setMessage('Perfect! +10 Rhythm XP');
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'rhythm', amount: 10 }
      }));
      setLastTap(now);
    } else {
      setGameState('result');
      setMessage(`Off beat! Final Score: ${score}`);
    }
  };

  // --- Spectral (Timbre) Game ---
  const [targetFilter, setTargetFilter] = useState(500);
  const [guessFilter, setGuessFilter] = useState(500);

  const startSpectralGame = () => {
    setActiveGame('spectral');
    setGameState('playing');
    setScore(0);
    nextSpectralRound();
  };

  const nextSpectralRound = () => {
    const freq = 200 + Math.random() * 2000;
    setTargetFilter(freq);
    const filter = new Tone.Filter(freq, "lowpass").toDestination();
    const noise = new Tone.Noise("white").connect(filter).start();
    setTimeout(() => { noise.stop(); filter.dispose(); }, 1000);
    setMessage('Match the filter cutoff!');
  };

  const handleSpectralGuess = () => {
    const diff = Math.abs(guessFilter - targetFilter);
    if (diff < 200) {
      setScore(s => s + 1);
      setMessage('Excellent! +10 Timbre XP');
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'timbre', amount: 10 }
      }));
      setTimeout(nextSpectralRound, 1000);
    } else {
      setGameState('result');
      setMessage(`Too far off! Final Score: ${score}`);
    }
  };

  return (
    <div className="virtue-training-container" style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Virtue Training</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sharpen your musical senses for massive XP boosts</p>
      </header>

      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}
          >
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <Music size={40} color="#3b82f6" style={{ marginBottom: '20px' }} />
              <h3>Pitch Perfect</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Identify and match random notes to build Harmony mastery.
              </p>
              <button className="btn-glass" onClick={startPitchGame} style={{ width: '100%', borderColor: '#3b82f6' }}>
                Start Training
              </button>
            </div>
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <Disc size={40} color="#ef4444" style={{ marginBottom: '20px' }} />
              <h3>Rhythm Master</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Tap a consistent beat to build Rhythm and Timing mastery.
              </p>
              <button className="btn-glass" onClick={startRhythmGame} style={{ width: '100%', borderColor: '#ef4444' }}>
                Start Training
              </button>
            </div>
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <Zap size={40} color="#f59e0b" style={{ marginBottom: '20px' }} />
              <h3>Spectral Match</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Match the filter cutoff frequency to build Timbre mastery.
              </p>
              <button className="btn-glass" onClick={startSpectralGame} style={{ width: '100%', borderColor: '#f59e0b' }}>
                Start Training
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && activeGame === 'pitch' && (
          <motion.div 
            key="pitch-game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div className="glass-panel" style={{ padding: '40px', marginBottom: '20px' }}>
              <Trophy size={48} color="#f59e0b" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.5rem' }}>Score: {score}</h3>
              <p style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', margin: '20px 0' }}>{message}</p>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {notes.map(note => (
                  <button 
                    key={note} 
                    className="btn-glass" 
                    onClick={() => handlePitchGuess(note)}
                    style={{ minWidth: '60px', height: '60px', fontSize: '1.2rem', fontWeight: 800 }}
                  >
                    {note[0]}
                  </button>
                ))}
              </div>
              
              <button 
                className="btn-glass" 
                onClick={() => synthRef.current.triggerAttackRelease(targetNote, '0.5s')}
                style={{ marginTop: '30px' }}
              >
                <RefreshCcw size={16} /> Replay Note
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && activeGame === 'rhythm' && (
          <motion.div 
            key="rhythm-game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div className="glass-panel" style={{ padding: '40px', marginBottom: '20px' }}>
              <Target size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.5rem' }}>Score: {score}</h3>
              <p style={{ fontSize: '1.2rem', color: '#ef4444', margin: '20px 0' }}>{message}</p>
              
              <button 
                className="btn-glass" 
                onMouseDown={handleRhythmTap}
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%', 
                  fontSize: '1.5rem', 
                  fontWeight: 900,
                  borderColor: '#ef4444',
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
                }}
              >
                TAP!
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && activeGame === 'spectral' && (
          <motion.div 
            key="spectral-game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div className="glass-panel" style={{ padding: '40px', marginBottom: '20px' }}>
              <Zap size={48} color="#f59e0b" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.5rem' }}>Score: {score}</h3>
              <p style={{ fontSize: '1.2rem', color: '#f59e0b', margin: '20px 0' }}>{message}</p>
              
              <div style={{ padding: '40px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', marginBottom: '30px' }}>
                <input 
                  type="range" min="200" max="2200" step="10" 
                  value={guessFilter} 
                  onChange={(e) => setGuessFilter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adjust Cutoff: {Math.round(guessFilter)}Hz</div>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button 
                  className="btn-glass" 
                  onClick={nextSpectralRound}
                  style={{ borderColor: '#f59e0b' }}
                >
                  <RefreshCcw size={16} /> Play Reference
                </button>
                <button 
                  className="btn-glass" 
                  onClick={handleSpectralGuess}
                  style={{ background: '#f59e0b', color: 'black' }}
                >
                  <CheckCircle2 size={16} /> Confirm Match
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div className="glass-panel" style={{ padding: '50px' }}>
              <Trophy size={64} color="#f59e0b" style={{ marginBottom: '30px' }} />
              <h3 style={{ fontSize: '2rem', marginBottom: '20px' }}>Training Session End</h3>
              <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '40px' }}>{message}</p>
              
              <button className="btn-glass" onClick={() => setGameState('idle')} style={{ padding: '15px 40px' }}>
                Back to Training Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtueTraining;
