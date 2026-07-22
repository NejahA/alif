import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(baseHue) {
  const schemes = [
    { name: 'Complementary', hues: [0, 180] },
    { name: 'Triadic', hues: [0, 120, 240] },
    { name: 'Analogous', hues: [0, 30, 60, 90] },
    { name: 'Split Comp', hues: [0, 150, 210] },
    { name: 'Tetradic', hues: [0, 90, 180, 270] },
  ];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  return scheme.hues.map((offset, i) => {
    const h = (baseHue + offset + Math.random() * 20 - 10) % 360;
    const s = 55 + Math.random() * 30;
    const l = 40 + Math.random() * 20;
    return { hex: hslToHex(h, s, l), h, s: Math.round(s), l: Math.round(l), locked: false };
  });
}

export default function ColorPalette() {
  const [colors, setColors] = useLocalStorage('palette-colors', []);
  const [baseHue, setBaseHue] = useState(Math.floor(Math.random() * 360));

  useEffect(() => {
    if (colors.length === 0) {
      setColors(generatePalette(baseHue));
    }
  }, []);

  const regenerate = useCallback(() => {
    const newHue = Math.floor(Math.random() * 360);
    setBaseHue(newHue);
    setColors(prev => {
      const newColors = generatePalette(newHue);
      return prev.map((c, i) => c.locked ? c : (newColors[i] || newColors[0]));
    });
  }, [setColors]);

  const toggleLock = useCallback((index) => {
    setColors(prev => prev.map((c, i) =>
      i === index ? { ...c, locked: !c.locked } : c
    ));
  }, [setColors]);

  const copyColor = useCallback((hex) => {
    navigator.clipboard.writeText(hex);
  }, []);

  return (
    <div className="feature-card palette-card">
      <div className="card-header">
        <h2>🎨 Color Palette Generator</h2>
        <p className="card-subtitle">Generate harmonious color schemes. Lock colors you like, then regenerate.</p>
      </div>

      <div className="palette-grid">
        {colors.map((color, i) => (
          <div key={i} className="color-swatch-wrapper">
            <div
              className="color-swatch"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyColor(color.hex)}
              title="Click to copy hex"
            >
              <button
                className={`lock-btn ${color.locked ? 'locked' : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
              >
                {color.locked ? '🔒' : '🔓'}
              </button>
            </div>
            <div className="color-info">
              <span className="color-hex">{color.hex}</span>
              <span className="color-hsl">{color.h}° {color.s}% {color.l}%</span>
            </div>
          </div>
        ))}
      </div>

      <button className="btn primary" onClick={regenerate}>
        🔄 Regenerate
      </button>
    </div>
  );
}