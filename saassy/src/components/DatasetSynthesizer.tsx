'use client';

import React, { useState, useEffect } from 'react';
import { Database, Cpu, Play, RefreshCw, Sparkles, TrendingDown, Layers, CheckCircle, BarChart2 } from 'lucide-react';

interface DatasetPair {
  id: string;
  instruction: string;
  chosenOutput: string;
  rejectedOutput: string;
  qualityScore: number;
}

export default function DatasetSynthesizer() {
  const [dataPairs, setDataPairs] = useState<DatasetPair[]>([
    { id: '1', instruction: 'Explain quantum entanglement simply', chosenOutput: 'Quantum entanglement is when two particles become deeply linked, so measuring one instantly determines the state of the other.', rejectedOutput: 'It is a complex quantum phenomenon described by Schrodinger equations.', qualityScore: 98 },
    { id: '2', instruction: 'Write a TypeScript function to debounce API calls', chosenOutput: 'export const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number) => { let timer: ReturnType<typeof setTimeout>; return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };', rejectedOutput: 'use setTimeout inside a function and call it repeatedly.', qualityScore: 95 },
    { id: '3', instruction: 'Format SQL query for indexing high volume user table', chosenOutput: 'CREATE INDEX CONCURRENTLY idx_users_email_status ON users(email, status) WHERE active = true;', rejectedOutput: 'SELECT * FROM users ORDER BY email;', qualityScore: 99 }
  ]);

  const [epochs, setEpochs] = useState(0);
  const [learningRate, setLearningRate] = useState('0.0002');
  const [loraRank, setLoraRank] = useState(16);
  const [trainingLoss, setTrainingLoss] = useState(2.45);
  const [lossHistory, setLossHistory] = useState<number[]>([2.45]);
  const [isTraining, setIsTraining] = useState(false);

  const generateSyntheticPair = () => {
    const newId = (dataPairs.length + 1).toString();
    const topics = [
      { prompt: 'Optimize React Server Component data fetching', chosen: 'Use Suspense with async Server Components to fetch data in parallel without client waterfalls.', rejected: 'Fetch all data inside useEffect hooks on the client.' },
      { prompt: 'Design zero-trust authentication payload', chosen: 'Include short-lived JWTs with asymmetric RS256 signature and PKCE authorization code exchange.', rejected: 'Store plain session tokens in localStorage without expiration.' },
      { prompt: 'Draft Kubernetes horizontal pod auto-scaler config', chosen: 'apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nspec:\n  maxReplicas: 20\n  metrics:\n  - type: Resource\n    resource: { name: cpu, target: { averageUtilization: 75 } }', rejected: 'Set static replica count to 5 forever.' }
    ];
    const item = topics[Math.floor(Math.random() * topics.length)];

    setDataPairs(prev => [
      ...prev,
      { id: newId, instruction: item.prompt, chosenOutput: item.chosen, rejectedOutput: item.rejected, qualityScore: Math.floor(Math.random() * 5) + 94 }
    ]);
  };

  const startTraining = () => {
    if (isTraining) return;
    setIsTraining(true);
    let currentEpoch = 0;
    let currentLoss = 2.45;

    const interval = setInterval(() => {
      currentEpoch += 1;
      currentLoss = Math.max(0.18, currentLoss - (Math.random() * 0.25 + 0.15));

      setEpochs(currentEpoch);
      setTrainingLoss(parseFloat(currentLoss.toFixed(3)));
      setLossHistory(prev => [...prev, parseFloat(currentLoss.toFixed(3))]);

      if (currentEpoch >= 10) {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 600);
  };

  const resetTraining = () => {
    setIsTraining(false);
    setEpochs(0);
    setTrainingLoss(2.45);
    setLossHistory([2.45]);
  };

  return (
    <section id="fine-tuner" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Database size={16} />
            <span>Synthetic Data & LoRA Training Engine</span>
          </div>
          <h2 className="section-title">
            Synthetic Dataset & <span className="text-gradient">LoRA Fine-Tuner</span>
          </h2>
          <p className="section-desc">
            Synthesize high-quality RLHF preference pairs and fine-tune custom open-weights models (LLaMA 3, DeepSeek) with QLoRA hyperparameter tuning.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          {/* Top Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Training Epochs</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1' }}>{epochs} / 10</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Cross-Entropy Loss</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: trainingLoss < 0.5 ? '#10b981' : '#f59e0b' }}>{trainingLoss}</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>LoRA Rank (r)</div>
              <select 
                value={loraRank} 
                onChange={e => setLoraRank(Number(e.target.value))}
                style={{ background: '#060911', border: '1px solid var(--border-color)', color: '#ffffff', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', width: '100%', outline: 'none' }}
              >
                <option value={8}>r = 8 (Fast / Low Memory)</option>
                <option value={16}>r = 16 (Standard QLoRA)</option>
                <option value={32}>r = 32 (High Expressivity)</option>
                <option value={64}>r = 64 (Full Adapter Rank)</option>
              </select>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={startTraining} disabled={isTraining} className="btn btn-primary" style={{ flex: 1 }}>
                  <Play size={16} /> {isTraining ? 'Training...' : 'Start LoRA Fine-Tune'}
                </button>
                <button onClick={resetTraining} className="btn btn-secondary">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Loss Curve Chart Visualization */}
          <div style={{ background: '#060911', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <BarChart2 size={18} color="#06b6d4" /> Real-Time Loss Curve Monitor
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opt: AdamW (lr = {learningRate})</span>
            </div>

            {/* Sparkline Loss Bar Representation */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {lossHistory.map((loss, idx) => {
                const heightPct = Math.min(100, Math.max(10, (loss / 2.5) * 100));
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{loss}</span>
                    <div style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #06b6d4 0%, #6366f1 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s ease'
                    }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>E{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dataset Pair Synthesizer Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Synthesized RLHF Preference Pairs ({dataPairs.length} pairs):
              </h4>
              <button onClick={generateSyntheticPair} className="btn btn-secondary btn-sm">
                <Sparkles size={14} /> Synthesize New Pair
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dataPairs.map(pair => (
                <div
                  key={pair.id}
                  style={{
                    background: '#060911',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#a5b4fc' }}>Prompt: {pair.instruction}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      {pair.qualityScore}% Quality
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', color: '#a7f3d0' }}>
                      <strong style={{ color: '#10b981' }}>✓ Chosen Output:</strong>
                      <div style={{ marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{pair.chosenOutput}</div>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', color: '#fca5a5' }}>
                      <strong style={{ color: '#ef4444' }}>✗ Rejected Output:</strong>
                      <div style={{ marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{pair.rejectedOutput}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
