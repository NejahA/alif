import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';

// ─── Derangement Filters ───

// Filter 1: Vaporwave Shimmer — interleaves uppercase/lowercase with ° symbols
function vaporwave(str) {
  return str.split('').map((c, i) => {
    if (c === ' ') return '　'; // full-width space
    if (i % 3 === 0) return c.toUpperCase();
    if (i % 3 === 1) return c.toLowerCase();
    return c + '°';
  }).join('');
}

// Filter 2: Hex Vision — converts to hex codes
function hexVision(str) {
  return str.split('').map(c => {
    const code = c.charCodeAt(0).toString(16).toUpperCase();
    return `<span class="hex-char">${`00${code}`.slice(-4)}</span>`;
  }).join(' ');
}

// Filter 3: Glitch — adds random brackets, slashes, and number inserts
function glitch(str) {
  const glitchChars = '⸮‽¿!@#$%^&*/\\';
  return str.split('').map(c => {
    if (c === ' ') return ' ';
    if (Math.random() < 0.25) {
      return c + glitchChars[Math.floor(Math.random() * glitchChars.length)];
    }
    if (Math.random() < 0.1) {
      return `[${c}]`;
    }
    return c;
  }).join('');
}

// Filter 4: Leet Speak
function leet(str) {
  const leetMap = {
    a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', l: '1',
    A: '4', E: '3', I: '1', O: '0', S: '5', T: '7', L: '1',
  };
  return str.split('').map(c => leetMap[c] || c).join('');
}

// Filter 5: Mirror — reverses with flipped chars
function mirror(str) {
  const flipMap = {
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ',
    'g': 'ɓ', 'h': 'ɥ', 'i': 'ı', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l',
    'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ',
    's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
    'y': 'ʎ', 'z': 'z',
    'A': '∀', 'B': 'Ｂ', 'C': 'Ɔ', 'D': 'Ｄ', 'E': 'Ǝ', 'F': 'Ⅎ',
    'G': 'Ｇ', 'H': 'Ｈ', 'I': 'I', 'J': 'Ｊ', 'K': 'Ｋ', 'L': '˥',
    'M': 'Ｍ', 'N': 'Ｎ', 'O': 'O', 'P': 'Ｐ', 'Q': 'Ｑ', 'R': 'Ｒ',
    'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'Ｗ', 'X': 'X',
    'Y': '⅄', 'Z': 'Z',
    '?': '¿', '!': '¡', '.': '˙', ',': "'", "'": ',',
  };
  return str.split('').reverse().map(c => flipMap[c] || c).join('');
}

// Filter 6: Chaos Cascade — each letter gets a random color, size wobble
function chaosCascade(str) {
  return str.split('').map((c, i) => {
    if (c === ' ') return ' ';
    const hue = (i * 37 + Date.now() / 10) % 360;
    const size = 0.8 + Math.sin(i * 2.7) * 0.4;
    return `<span class="chaos-char" style="--chue:${hue};--cscale:${size}">${c}</span>`;
  }).join('');
}

const FILTERS = [
  { id: 'vaporwave', label: 'Vaporwave Shimmer', fn: vaporwave, color: '#ff2d95', desc: '°full·width° aEsThEtIc°' },
  { id: 'hex', label: 'Hex Vision', fn: hexVision, color: '#00f0ff', desc: 'Hexadecimal transcoding' },
  { id: 'glitch', label: 'Glitch Burst', fn: glitch, color: '#39ff14', desc: 'Corruption artifacts injected' },
  { id: 'leet', label: '1337', fn: leet, color: '#ffe600', desc: 'Elite speak encoding' },
  { id: 'mirror', label: 'Mirror Realm', fn: mirror, color: '#bf00ff', desc: 'Upside-down reflection' },
  { id: 'chaos', label: 'Chaos Cascade', fn: chaosCascade, color: '#ff6600', desc: 'Chromatic hallucination' },
];

// ─── Animating background grid ───
function GridBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

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

      const gridSize = 60;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);
      const offset = (time * 0.3) % gridSize;

      ctx.strokeStyle = 'rgba(255, 45, 149, 0.04)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize + offset, 0);
        ctx.lineTo(i * gridSize + offset, canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize + offset);
        ctx.lineTo(canvas.width, i * gridSize + offset);
        ctx.stroke();
      }

      // Intersection dots
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize + offset;
          const y = j * gridSize + offset;
          const alpha = Math.sin(x * 0.01 + y * 0.01 + time * 0.02) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.08})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="grid-bg" />;
}

// ─── Wobble Text Effect for title ───
function WobbleTitle() {
  const text = "⚡ C H O M P A ⚡";
  return (
    <h1 className="de-title">
      {text.split('').map((c, i) => (
        <span
          key={i}
          className="title-char"
          style={{
            '--i': i,
            '--hue': (i * 25) % 360,
            animationDelay: `${i * 0.05}s`,
          }}
        >
          {c}
        </span>
      ))}
    </h1>
  );
}

function ChompaOrb() {
  return (
    <div className="chompa-orb">
      <div className="orb-core" />
      <div className="orb-ring" />
      <div className="orb-ring" style={{ animationDelay: '0.5s' }} />
      <div className="orb-ring" style={{ animationDelay: '1s' }} />
    </div>
  );
}

// ─── Main App ───
function App() {
  const [input, setInput] = useState('');
  const [activeFilters, setActiveFilters] = useState(['vaporwave']);
  const [output, setOutput] = useState('');
  const [isOutputVisible, setIsOutputVisible] = useState(false);

  const toggleFilter = useCallback((id) => {
    setActiveFilters(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== id);
      }
      return [...prev, id];
    });
  }, []);

  const processText = useCallback(() => {
    if (!input.trim()) return;
    const activeFilterFns = FILTERS.filter(f => activeFilters.includes(f.id));
    let result = input;
    activeFilterFns.forEach(f => {
      result = f.fn(result);
    });
    setOutput(result);
    setIsOutputVisible(true);
  }, [input, activeFilters]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processText();
    }
  }, [processText]);

  const copyOutput = useCallback(() => {
    const plain = output.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plain);
  }, [output]);

  const shuffleFilters = useCallback(() => {
    const all = FILTERS.map(f => f.id);
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 2);
    setActiveFilters(shuffled);
  }, []);

  const presets = [
    { name: 'Neon Nightmare', filters: ['glitch', 'vaporwave', 'chaos'] },
    { name: 'Hacker Terminal', filters: ['leet', 'hex'] },
    { name: 'Acid Trip', filters: ['chaos', 'mirror', 'glitch'] },
    { name: 'Cyber Minimal', filters: ['vaporwave', 'leet'] },
  ];

  return (
    <div className="de-app">
      <GridBg />

      <div className="de-content">
        <WobbleTitle />
        <p className="de-subtitle">feed it language · it returns hallucination</p>

        {/* Input */}
        <div className="de-input-area">
          <textarea
            className="de-input"
            placeholder="Type something normal..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            spellCheck={false}
          />
          <div className="de-input-actions">
            <button className="de-btn primary" onClick={processText} disabled={!input.trim()}>
              ⚡ Derange
            </button>
            <button className="de-btn secondary" onClick={shuffleFilters}>
              🎲 Shuffle
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="de-presets">
          <span className="preset-label">Presets:</span>
          {presets.map(p => (
            <button
              key={p.name}
              className="preset-btn"
              onClick={() => setActiveFilters(p.filters)}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Filter Selection */}
        <div className="de-filters">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              className={`filter-chip ${activeFilters.includes(filter.id) ? 'active' : ''}`}
              style={{ '--filter-color': filter.color }}
              onClick={() => toggleFilter(filter.id)}
            >
              <span className="filter-dot" style={{ background: filter.color }} />
              <span className="filter-name">{filter.label}</span>
              <span className="filter-desc">{filter.desc}</span>
            </button>
          ))}
        </div>

        {/* Order */}
        <div className="de-order">
          <span className="order-label">Pipeline order:</span>
          <div className="order-chips">
            {activeFilters.map((id, i) => {
              const f = FILTERS.find(ff => ff.id === id);
              return (
                <span key={id} className="order-chip" style={{ '--filter-color': f?.color }}>
                  {i + 1}. {f?.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Output */}
        {isOutputVisible && output && (
          <div className="de-output-area">
            <div className="de-output-header">
              <h2 className="de-output-label">✦ Deranged Output</h2>
              <button className="copy-btn" onClick={copyOutput}>📋 Copy</button>
            </div>
            <div
              className="de-output"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </div>
        )}
      </div>

      {/* Chompa Orb */}
      <ChompaOrb />

      {/* Footer */}
      <footer className="de-footer">
        <p>⚡ chompa devours your words · spits out neon ⚡</p>
      </footer>
    </div>
  );
}

export default App;