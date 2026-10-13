'use client';

import React, { useState } from 'react';
import { Cpu, Sparkles, Play, CheckCircle2, Settings, Loader2 } from 'lucide-react';

export default function AgentFineTuner() {
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [tuneResult, setTuneResult] = useState<any>(null);

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o (OpenAI)' },
    { id: 'claude-3-5', name: 'Claude 3.5 Sonnet (Anthropic)' },
    { id: 'llama-3-70b', name: 'Llama 3 70B (Meta)' },
    { id: 'deepseek-v3', name: 'DeepSeek V3 (DeepSeek)' },
  ];

  const handleTune = async () => {
    setLoading(true);
    setTuneResult(null);

    try {
      const res = await fetch('/api/agent-tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature, topP }),
      });
      const data = await res.json();
      setTuneResult(data);
    } catch (err) {
      setTuneResult({ success: false, error: 'Fine-tuning failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="agent-tune" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Cpu size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>AI Hyperparameter Studio</span>
          </div>
          <h2 className="section-title">Autonomous Agent Model Fine-Tuning</h2>
          <p className="section-desc">
            Customize model weights, sampling temperatures, and top-p nucleus parameters for micro-agents.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Base AI Model Architecture
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Temperature (Creativity):</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
            </div>

          </div>

          <button onClick={handleTune} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '24px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            {loading ? 'Executing Fine-Tuning Epochs...' : 'Train & Deploy Custom Agent Model'}
          </button>

          <div className="terminal-box">
            <div className="terminal-header">
              <Settings size={14} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Training Loss & Model Artifact Telemetry
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!loading && !tuneResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Adjust parameters and click "Train & Deploy Custom Agent Model".
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Running 4 fine-tuning epochs over 10,000 domain-specific prompt pairs...
                </span>
              )}

              {!loading && tuneResult && tuneResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ Model Trained & Deployed — Model ID: {tuneResult.modelId}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#0d1322', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <div>Final Loss: <strong style={{ color: 'var(--accent-emerald)' }}>{tuneResult.finalLoss}</strong></div>
                    <div>Accuracy: <strong style={{ color: 'var(--accent-cyan)' }}>{tuneResult.accuracy}</strong></div>
                    <div>Status: <strong style={{ color: 'var(--accent-emerald)' }}>{tuneResult.status}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
