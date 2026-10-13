'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Play, Pause, RotateCcw, AlertTriangle, Activity, CheckCircle, Lock } from 'lucide-react';

export default function RateLimitStressTester() {
  const [algorithm, setAlgorithm] = useState<'token_bucket' | 'leaky_bucket' | 'fixed_window'>('token_bucket');
  const [capacity, setCapacity] = useState(100);
  const [refillRate, setRefillRate] = useState(20); // per sec
  const [currentTokens, setCurrentTokens] = useState(100);
  const [burstRps, setBurstRps] = useState(0);
  const [passedReqs, setPassedReqs] = useState(0);
  const [throttledReqs, setThrottledReqs] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const triggerBurst = (amount: number) => {
    setBurstRps(amount);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Refill tokens
      setCurrentTokens(t => Math.min(capacity, t + Math.round(refillRate / 2)));

      if (burstRps > 0) {
        const incoming = Math.floor(burstRps / 2);
        setCurrentTokens(t => {
          if (t >= incoming) {
            setPassedReqs(p => p + incoming);
            return t - incoming;
          } else {
            const passed = t;
            const blocked = incoming - t;
            setPassedReqs(p => p + passed);
            setThrottledReqs(b => b + blocked);
            return 0;
          }
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isSimulating, burstRps, capacity, refillRate]);

  const resetSim = () => {
    setIsSimulating(false);
    setBurstRps(0);
    setCurrentTokens(capacity);
    setPassedReqs(0);
    setThrottledReqs(0);
  };

  return (
    <section id="rate-limiter" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Shield size={16} />
            <span>API Protection & Rate Control</span>
          </div>
          <h2 className="section-title">
            Rate Limiter & <span className="text-gradient">Stress Simulator</span>
          </h2>
          <p className="section-desc">
            Simulate token bucket, leaky bucket, and fixed window algorithms under high-concurrency burst traffic.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Algorithm</div>
              <select
                value={algorithm}
                onChange={e => setAlgorithm(e.target.value as any)}
                style={{ background: '#060911', border: '1px solid var(--border-color)', color: '#ffffff', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', width: '100%', outline: 'none' }}
              >
                <option value="token_bucket">Token Bucket Algorithm</option>
                <option value="leaky_bucket">Leaky Bucket Algorithm</option>
                <option value="fixed_window">Fixed Window Counter</option>
              </select>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Bucket Capacity</div>
              <input
                type="number"
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                style={{ background: '#060911', border: '1px solid var(--border-color)', color: '#ffffff', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', width: '100%', outline: 'none' }}
              />
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Refill Rate (Tokens/sec)</div>
              <input
                type="number"
                value={refillRate}
                onChange={e => setRefillRate(Number(e.target.value))}
                style={{ background: '#060911', border: '1px solid var(--border-color)', color: '#ffffff', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', width: '100%', outline: 'none' }}
              />
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setIsSimulating(!isSimulating)} className="btn btn-primary" style={{ flex: 1 }}>
                <Play size={16} /> {isSimulating ? 'Pause Sim' : 'Start Simulation'}
              </button>
              <button onClick={resetSim} className="btn btn-secondary">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Burst Traffic Generators */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              SIMULATE TRAFFIC BURST:
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => triggerBurst(30)} disabled={!isSimulating} className="btn btn-secondary btn-sm">
                🟢 Normal Load (30 RPS)
              </button>
              <button onClick={() => triggerBurst(90)} disabled={!isSimulating} className="btn btn-secondary btn-sm">
                🟡 Heavy Traffic (90 RPS)
              </button>
              <button onClick={() => triggerBurst(250)} disabled={!isSimulating} className="btn btn-secondary btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                🔴 DDoS Spike (250 RPS)
              </button>
            </div>
          </div>

          {/* Meter Bars & Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: '#060911', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Bucket Token Pool ({currentTokens} / {capacity})</div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${(currentTokens / capacity) * 100}%`, height: '100%', background: '#06b6d4', transition: 'all 0.2s ease' }} />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Allowed Requests (HTTP 200)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{passedReqs}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Throttled Requests (HTTP 429)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{throttledReqs}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
