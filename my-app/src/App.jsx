import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

// ─── Mood Color Engine ───
const MOOD_KEYWORDS = {
  calm: '#5ce1fc', serene: '#5ce1fc', peaceful: '#5ce1fc', tranquil: '#5ce1fc',
  happy: '#fcb85c', joyful: '#fcb85c', bright: '#fcb85c', elated: '#fcb85c',
  sad: '#6a5a90', melancholy: '#6a5a90', blue: '#6a5a90', somber: '#6a5a90',
  angry: '#fc5c5c', furious: '#fc5c5c', rage: '#fc5c5c', irritated: '#fc5c5c',
  anxious: '#fc5cb0', nervous: '#fc5cb0', worried: '#fc5cb0', tense: '#fc5cb0',
  inspired: '#7c5cfc', creative: '#7c5cfc', visionary: '#7c5cfc', artistic: '#7c5cfc',
  tired: '#4a4a6a', exhausted: '#4a4a6a', sleepy: '#4a4a6a', weary: '#4a4a6a',
  love: '#ff6b9d', passion: '#ff6b9d', affection: '#ff6b9d', tender: '#ff6b9d',
  hope: '#a8e6cf', wishful: '#a8e6cf', optimistic: '#a8e6cf', dreaming: '#a8e6cf',
  chaos: '#ff3366', wild: '#ff3366', crazy: '#ff3366', manic: '#ff3366',
  dark: '#2a0a3a', void: '#2a0a3a', empty: '#2a0a3a', hollow: '#2a0a3a',
};

function analyzeMood(text) {
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (MOOD_KEYWORDS[word]) return MOOD_KEYWORDS[word];
  }
  return null;
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255));
}

function getAuraColor(text) {
  const mood = analyzeMood(text);
  if (mood) return mood;
  // Generate a color from text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const [r, g, b] = hslToRgb(h, 60, 60);
  return `rgb(${r}, ${g}, ${b})`;
}

// ─── Constellation Math ───
function generateConstellation(stars) {
  // Connect nearby stars
  const lines = [];
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180 && stars.length < 20) {
        lines.push({ from: i, to: j, opacity: Math.max(0.1, 1 - dist / 180) });
      }
    }
  }
  return lines;
}

// ─── Star Field Component ───
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    function animate() {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Subtle glow on bigger stars
        if (star.r > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 160, 255, ${alpha * 0.08})`;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field" />;
}

// ─── Falling Star ───
function FallingStar({ color, x }) {
  return (
    <div
      className="falling-star"
      style={{
        left: `${x}%`,
        background: `linear-gradient(to bottom, transparent, ${color})`,
        boxShadow: `0 0 20px ${color}`,
      }}
    />
  );
}

// ─── Note Star ───
function NoteStar({ note, index, total }) {
  const angle = (360 / total) * index;
  const radius = 120 + Math.random() * 60;
  const x = 50 + (radius * Math.cos((angle * Math.PI) / 180)) / 2;
  const y = 45 + (radius * Math.sin((angle * Math.PI) / 180)) / 3;
  const aura = getAuraColor(note.text);

  return (
    <div
      className="note-star"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        '--aura': aura,
        animationDelay: `${index * 0.3}s`,
      }}
      title={note.text}
    >
      <div className="star-core" style={{ background: aura }} />
      <div className="star-aura" style={{ background: `radial-gradient(circle, ${aura}40, transparent)` }} />
    </div>
  );
}

// ─── Void Oracle — Creative Writing Prompts ───
const ORACLE_PROMPTS = [
  "A color that doesn't exist yet",
  "The last conversation you had in a dream",
  "What the moon smells like",
  "A machine that translates silence",
  "The texture of a forgotten memory",
  "A door that only opens when you're not looking",
  "The sound of one hand clapping in zero gravity",
  "What stars dream about",
  "A key that unlocks nothing",
  "The taste of the color purple",
  "A whisper that travels backward through time",
  "The shape of loneliness",
  "An alphabet made of shadows",
  "The weight of a thought",
  "A mirror that remembers faces you've forgotten",
  "The temperature of déjà vu",
  "A plant that grows only in moonlight",
  "The echo of a word before it's spoken",
  "A compass that points to nowhere",
  "The smell of rain on a planet you've never visited",
  "A clock that measures regret",
  "The sound frequencies of nostalgia",
  "A language with no words for goodbye",
  "The geometry of a sigh",
  "A constellation that only appears in your peripheral vision",
  "The recipe for a sunset",
  "The velocity of a whisper",
  "A photograph taken with your eyes closed",
  "The architecture of a daydream",
  "A wavelength that carries forgotten lullabies",
];

function getRandomOracle() {
  return ORACLE_PROMPTS[Math.floor(Math.random() * ORACLE_PROMPTS.length)];
}

// ─── Nebula Ripple ───
function NebulaRipple({ ripples }) {
  return (
    <>
      {ripples.map(r => (
        <div
          key={r.id}
          className="nebula-ripple"
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            '--ripple-color': r.color,
            animation: `rippleOut 1.2s ease-out forwards`,
          }}
        >
          <div className="ripple-ring" />
          <div className="ripple-ring" style={{ animationDelay: '0.15s' }} />
          <div className="ripple-ring" style={{ animationDelay: '0.3s' }} />
        </div>
      ))}
    </>
  );
}

// ─── Main App ───
function App() {
  const [notes, setNotes] = useLocalStorage('void-notes', []);
  const [currentText, setCurrentText] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [fallingStars, setFallingStars] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [oraclePrompt, setOraclePrompt] = useState(null);
  const [moodColor, setMoodColor] = useState(null);
  const textareaRef = useRef(null);
  const starIdRef = useRef(0);

  // Analyze mood as user types
  useEffect(() => {
    if (currentText.trim()) {
      const color = analyzeMood(currentText);
      if (color) setMoodColor(color);
      else setMoodColor(null);
    } else {
      setMoodColor(null);
    }
  }, [currentText]);

  const launchStar = useCallback(() => {
    const text = currentText.trim();
    if (!text) return;

    const newNote = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString(),
      color: getAuraColor(text),
    };

    setNotes(prev => [...prev, newNote]);
    setCurrentText('');

    // Trigger falling star animation
    const id = ++starIdRef.current;
    setFallingStars(prev => [...prev, { id, color: newNote.color, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setFallingStars(prev => prev.filter(s => s.id !== id));
    }, 2000);

    // Trigger nebula ripple
    const rippleId = ++starIdRef.current;
    const ripple = { id: rippleId, color: newNote.color, x: Math.random() * 60 + 20, y: Math.random() * 40 + 30 };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 1400);
  }, [currentText, setNotes]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      launchStar();
    }
  }, [launchStar]);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [setNotes]);

  const clearAll = useCallback(() => {
    if (notes.length > 0 && window.confirm('Release all thoughts into the void?')) {
      setNotes([]);
    }
  }, [notes, setNotes]);

  // Generate constellation lines
  const constellation = generateConstellation(notes);

  return (
    <div className="void-scribbler" style={moodColor ? { '--mood-glow': moodColor } : {}}>
      <StarField />

      {/* Falling stars */}
      {fallingStars.map(s => (
        <FallingStar key={s.id} color={s.color} x={s.x} />
      ))}

      {/* Nebula ripple effects */}
      <NebulaRipple ripples={ripples} />

      {/* Header */}
      <header className="void-header">
        <div className="void-brand">
          <h1 className="void-title">✦ Void Scribbler</h1>
          <p className="void-tagline">cast your thoughts among the stars</p>
        </div>
        <div className="void-stats">
          <span className="stat">{notes.length} stars</span>
          {moodColor && (
            <span className="mood-badge" style={{ background: moodColor }}>
              {Object.entries(MOOD_KEYWORDS).find(([, c]) => c === moodColor)?.[0] || 'mood'}
            </span>
          )}
        </div>
      </header>

      {/* Scribbler Input */}
      <div className={`scribbler-area ${isWriting ? 'writing' : ''}`}
        style={moodColor ? { borderColor: moodColor, boxShadow: `0 0 30px ${moodColor}30` } : {}}
      >
        <div className="scribbler-glow" style={moodColor ? { background: `radial-gradient(ellipse, ${moodColor}20, transparent 70%)` } : {}} />
        <textarea
          ref={textareaRef}
          className="scribbler-input"
          placeholder="What drifts across your mind?"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsWriting(true)}
          onBlur={() => setIsWriting(false)}
          maxLength={280}
        />
        <div className="scribbler-toolbar">
          <button
            className="oracle-btn"
            onClick={() => setOraclePrompt(getRandomOracle())}
            title="Ask the Void Oracle for inspiration"
          >
            🔮 Need inspiration?
          </button>
          {oraclePrompt && (
            <div className="oracle-prompt" onClick={() => { setCurrentText(oraclePrompt); setOraclePrompt(null); }}>
              <span className="oracle-icon">🔮</span>
              <span className="oracle-text">{oraclePrompt}</span>
              <span className="oracle-hint">click to use</span>
            </div>
          )}
        </div>
        <div className="scribbler-actions">
          <span className="char-count">{currentText.length}/280</span>
          <button className="launch-btn" onClick={launchStar} disabled={!currentText.trim()}>
            ✦ Launch into Void
          </button>
        </div>
      </div>

      {/* Constellation Canvas */}
      {notes.length > 0 && (
        <div className="constellation-section">
          <div className="constellation-header">
            <h2>✦ Your Constellation</h2>
            <button className="clear-btn" onClick={clearAll}>Release All</button>
          </div>

          <div className="constellation-map">
            <svg className="constellation-svg" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
              {constellation.map((line, i) => (
                <line
                  key={i}
                  x1={notes[line.from] ? (50 + (120 + Math.random() * 60) * Math.cos((360 / notes.length) * line.from * Math.PI / 180) / 2) : 50}
                  y1={notes[line.from] ? (45 + (120 + Math.random() * 60) * Math.sin((360 / notes.length) * line.from * Math.PI / 180) / 3) : 45}
                  x2={notes[line.to] ? (50 + (120 + Math.random() * 60) * Math.cos((360 / notes.length) * line.to * Math.PI / 180) / 2) : 50}
                  y2={notes[line.to] ? (45 + (120 + Math.random() * 60) * Math.sin((360 / notes.length) * line.to * Math.PI / 180) / 3) : 45}
                  stroke="var(--constellation)"
                  strokeWidth={0.3}
                  opacity={line.opacity}
                />
              ))}
            </svg>

            {/* Star markers */}
            {notes.map((note, i) => (
              <NoteStar key={note.id} note={note} index={i} total={notes.length} />
            ))}
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 && (
        <div className="notes-list">
          <h2 className="notes-title">✦ Starlight Archive</h2>
          {[...notes].reverse().map(note => (
            <div key={note.id} className="note-card" style={{ borderLeftColor: note.color }}>
              <div className="note-card-header">
                <span className="note-time">{note.timestamp}</span>
                <button className="note-delete" onClick={() => deleteNote(note.id)}>✕</button>
              </div>
              <p className="note-text">{note.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="void-empty">
          <div className="empty-icon">✦</div>
          <p>The void is silent...</p>
          <p className="empty-hint">Write something above to cast the first star</p>
        </div>
      )}

      {/* Footer */}
      <footer className="void-footer">
        <p>✦ thoughts become stars · stars shape constellations · all is preserved in the void ✦</p>
      </footer>
    </div>
  );
}

export default App;