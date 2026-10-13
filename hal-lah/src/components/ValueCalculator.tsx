'use client';

import React, { useState } from 'react';
import { sound } from '@/utils/sound';
import { 
  Calculator, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function ValueCalculator() {
  const [cloudSpend, setCloudSpend] = useState(45000); // $ / month
  const [dau, setDau] = useState(350000); // DAU
  const [latency, setLatency] = useState(160); // ms

  // Projections
  const annualSpend = cloudSpend * 12;
  const estimatedSavings = Math.round(annualSpend * 0.42); // 42% cloud savings from zero-alloc runtime + caching
  const targetLatency = Math.max(8, Math.round(latency * 0.1)); // 90% latency reduction
  const mttrReduction = 88; // %

  return (
    <section id="calculator" className="section-wrapper">
      <div className="section-header">
        <div className="section-tag">ROI & Performance Projection</div>
        <h2 className="section-title">
          Engineering <span className="text-gradient-cyan">Impact Calculator</span>
        </h2>
        <p className="section-desc">
          Estimate potential cloud infrastructure cost reductions, P99 latency acceleration, and reliability gains achieved through custom distributed system re-architecting.
        </p>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2.5rem',
          }}
          className="calc-grid"
        >
          {/* Sliders Input Column */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} color="var(--amber-neon)" />
              Input Current Infrastructure Baseline
            </h3>

            {/* Slider 1: Cloud Spend */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly Cloud Spend:</span>
                <span style={{ fontSize: '1rem', color: 'var(--amber-neon)', fontWeight: 700 }}>
                  ${cloudSpend.toLocaleString()} / mo
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={cloudSpend}
                onChange={(e) => {
                  setCloudSpend(Number(e.target.value));
                  sound.playChirp(600 + Number(e.target.value) / 500, 0.015);
                }}
                style={{
                  width: '100%',
                  accentColor: 'var(--amber-neon)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>$5,000</span>
                <span>$250,000+</span>
              </div>
            </div>

            {/* Slider 2: DAU */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Active Users (DAU):</span>
                <span style={{ fontSize: '1rem', color: 'var(--cyan-neon)', fontWeight: 700 }}>
                  {dau.toLocaleString()} DAU
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="2000000"
                step="20000"
                value={dau}
                onChange={(e) => {
                  setDau(Number(e.target.value));
                  sound.playChirp(700 + Number(e.target.value) / 5000, 0.015);
                }}
                style={{
                  width: '100%',
                  accentColor: 'var(--cyan-neon)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>20k</span>
                <span>2,000,000+</span>
              </div>
            </div>

            {/* Slider 3: Current P99 Latency */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current P99 Response Latency:</span>
                <span style={{ fontSize: '1rem', color: 'var(--violet-neon)', fontWeight: 700 }}>
                  {latency} ms
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={latency}
                onChange={(e) => {
                  setLatency(Number(e.target.value));
                  sound.playChirp(800 + Number(e.target.value) * 2, 0.015);
                }}
                style={{
                  width: '100%',
                  accentColor: 'var(--violet-neon)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>30ms</span>
                <span>500ms</span>
              </div>
            </div>
          </div>

          {/* Results Projection Column */}
          <div
            style={{
              background: 'rgba(5, 7, 12, 0.65)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--emerald-neon)',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                :: PROJECTED SYSTEM OPTIMIZATION GAINS
              </div>

              {/* Stat 1 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Annual Cloud Savings:</div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                    fontWeight: 900,
                    color: 'var(--emerald-neon)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  ${estimatedSavings.toLocaleString()}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / yr</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Achieved by eliminating GC pressure, implementing memory rings, and introducing multi-tier caching.
                </div>
              </div>

              {/* Stat 2 */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Projected P99 Latency:</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--cyan-neon)',
                    }}
                  >
                    &lt; {targetLatency} ms
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--emerald-neon)' }}>
                    -{Math.round(((latency - targetLatency) / latency) * 100)}% faster response
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MTTR Downtime Reduction:</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--violet-neon)',
                    }}
                  >
                    -{mttrReduction}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Autonomous consensus failover
                  </div>
                </div>
              </div>
            </div>

            <a
              href="#contact"
              onClick={() => sound.playSuccess()}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.85rem',
              }}
            >
              <span>Schedule Architecture Audit</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .calc-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
