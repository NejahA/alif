import React, { useState, useEffect } from 'react';
import { TrendingUp, Maximize2, Zap, BarChart2 } from 'lucide-react';

export default function ThroughputChart({ isStreaming, amplification = 1 }) {
  const [dataPoints, setDataPoints] = useState(() =>
    Array.from({ length: 30 }, (_, i) => Math.floor(40 + Math.sin(i * 0.4) * 20 + Math.random() * 15))
  );
  const [activeRange, setActiveRange] = useState('1M');
  const [spectrum, setSpectrum] = useState(() => Array.from({ length: 16 }, () => Math.random() * 80 + 20));

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const nextVal = Math.min(
          98,
          Math.max(15, Math.floor((45 + Math.sin(Date.now() / 800) * 25 + Math.random() * 20) * amplification))
        );
        return [...prev.slice(1), nextVal];
      });

      setSpectrum(() => Array.from({ length: 16 }, () => Math.random() * 75 + 25));
    }, 400);

    return () => clearInterval(interval);
  }, [isStreaming, amplification]);

  const currentVal = dataPoints[dataPoints.length - 1];
  const maxVal = Math.max(...dataPoints);
  const avgVal = Math.round(dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length);

  // Generate SVG path string
  const svgWidth = 600;
  const svgHeight = 180;
  const points = dataPoints.map((val, idx) => {
    const x = (idx / (dataPoints.length - 1)) * svgWidth;
    const y = svgHeight - (val / 100) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,${svgHeight} L ${points.join(' L ')} L ${svgWidth},${svgHeight} Z`;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <TrendingUp style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Orbital Core Throughput</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Real-time Signal Packet Stream (GB/s)</p>
          </div>
        </div>

        {/* Range Buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
          {['10S', '1M', '5M', 'LIVE'].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`btn-cosmo-outline ${activeRange === range ? 'active' : ''}`}
              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metric Display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}>
          {currentVal} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>GB/s</span>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>PEAK: <strong style={{ color: 'var(--text-primary)' }}>{maxVal} GB/s</strong></span>
          <span>AVG: <strong style={{ color: 'var(--text-primary)' }}>{avgVal} GB/s</strong></span>
        </div>
      </div>

      {/* SVG Wave Visualizer */}
      <div style={{ position: 'relative', width: '100%', height: '180px', marginTop: 'auto' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent-cyan)" />
              <stop offset="50%" stopColor="var(--accent-violet)" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={svgHeight * ratio}
              x2={svgWidth}
              y2={svgHeight * ratio}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Gradient Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Smooth Spline Stroke */}
          <path d={pathD} fill="none" stroke="url(#strokeGradient)" strokeWidth="3" strokeLinecap="round" />

          {/* Glowing pulse dot at latest point */}
          {points.length > 0 && (
            <g>
              <circle
                cx={points[points.length - 1].split(',')[0]}
                cy={points[points.length - 1].split(',')[1]}
                r="6"
                fill="var(--accent-cyan)"
                style={{ filter: 'drop-shadow(0 0 8px #06b6d4)' }}
              />
              <circle
                cx={points[points.length - 1].split(',')[0]}
                cy={points[points.length - 1].split(',')[1]}
                r="12"
                fill="none"
                stroke="var(--accent-cyan)"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Spectrum Bar Equalizer Footer */}
      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <BarChart2 style={{ width: '14px', height: '14px' }} /> Spectrum Bands
        </span>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
          {spectrum.map((val, idx) => (
            <div
              key={idx}
              style={{
                width: '6px',
                height: `${val}%`,
                background: idx % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                borderRadius: '2px',
                transition: 'height 0.3s ease',
                opacity: 0.85
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
