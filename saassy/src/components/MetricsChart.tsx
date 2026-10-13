'use client';

import React, { useState } from 'react';
import { Activity, BarChart3, Clock, Zap, ArrowUpRight } from 'lucide-react';

export default function MetricsChart() {
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '24h' | '7d'>('1h');

  const chartData = {
    '15m': [42, 58, 65, 78, 92, 85, 110, 124, 115, 138, 142, 160],
    '1h': [120, 145, 130, 175, 190, 210, 240, 220, 280, 310, 295, 340],
    '24h': [1200, 1400, 1800, 2100, 2900, 3400, 3100, 4200, 4800, 5200, 5900, 6400],
    '7d': [12400, 15800, 19200, 24500, 28900, 34100, 41200, 49800, 56000, 62400, 71000, 84200],
  };

  const points = chartData[timeframe];
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);

  // Convert points array to SVG path
  const svgWidth = 800;
  const svgHeight = 200;
  const pathD = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * svgWidth;
      const y = svgHeight - ((val - minVal) / (maxVal - minVal || 1)) * (svgHeight - 40) - 20;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <BarChart3 size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Edge Infrastructure Telemetry</span>
          </div>
          <h2 className="section-title">Real-Time Application Throughput</h2>
          <p className="section-desc">
            Monitor API request velocity, cache hit ratio, and serverless edge worker distribution live.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Peak Throughput</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {points[points.length - 1].toLocaleString()} req/s
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Edge Cache Hit Ratio</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  94.8%
                </div>
              </div>
            </div>

            <div className="tabs-header" style={{ margin: 0 }}>
              {(['15m', '1h', '24h', '7d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`tab-btn ${timeframe === tf ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart Graphic */}
          <div style={{ background: '#060911', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path
                d={`${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
                fill="url(#chartGlow)"
              />

              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Point Circle */}
              {points.map((val, idx) => {
                const x = (idx / (points.length - 1)) * svgWidth;
                const y = svgHeight - ((val - minVal) / (maxVal - minVal || 1)) * (svgHeight - 40) - 20;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#ffffff"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>

        </div>

      </div>
    </section>
  );
}
