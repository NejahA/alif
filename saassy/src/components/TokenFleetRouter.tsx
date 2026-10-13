'use client';

import React, { useState } from 'react';
import { Sliders, Cpu, Zap, DollarSign, Layers, Sparkles, Check, ArrowRight, Shield } from 'lucide-react';

interface ModelRoute {
  id: string;
  name: string;
  provider: string;
  costPer1k: number;
  latencyAvgMs: number;
  qualityScore: number;
  trafficWeight: number; // 0 - 100%
  tier: 'Fast' | 'Balanced' | 'Reasoning';
}

export default function TokenFleetRouter() {
  const [models, setModels] = useState<ModelRoute[]>([
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', costPer1k: 0.005, latencyAvgMs: 240, qualityScore: 98, trafficWeight: 40, tier: 'Reasoning' },
    { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', costPer1k: 0.003, latencyAvgMs: 310, qualityScore: 97, trafficWeight: 35, tier: 'Reasoning' },
    { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', costPer1k: 0.0007, latencyAvgMs: 180, qualityScore: 94, trafficWeight: 15, tier: 'Balanced' },
    { id: 'llama-3-3', name: 'Llama 3.3 70B', provider: 'Groq Edge', costPer1k: 0.0004, latencyAvgMs: 85, qualityScore: 91, trafficWeight: 10, tier: 'Fast' }
  ]);

  const [monthlyRequestVolume, setMonthlyRequestVolume] = useState(5000000); // 5M requests

  const handleSliderChange = (id: string, newWeight: number) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, trafficWeight: newWeight } : m));
  };

  // Calculate stats
  const totalWeight = models.reduce((acc, m) => acc + m.trafficWeight, 0) || 1;
  const weightedCost = models.reduce((acc, m) => acc + (m.costPer1k * (m.trafficWeight / totalWeight)), 0);
  const weightedLatency = Math.round(models.reduce((acc, m) => acc + (m.latencyAvgMs * (m.trafficWeight / totalWeight)), 0));
  const weightedQuality = (models.reduce((acc, m) => acc + (m.qualityScore * (m.trafficWeight / totalWeight)), 0)).toFixed(1);

  const totalMonthlyCost = ((monthlyRequestVolume * 1.2 / 1000) * weightedCost).toFixed(2);
  const baselineCost = ((monthlyRequestVolume * 1.2 / 1000) * 0.005).toFixed(2); // If 100% GPT-4o
  const savings = Math.max(0, parseFloat(baselineCost) - parseFloat(totalMonthlyCost)).toFixed(2);

  return (
    <section id="token-router" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Sliders size={16} />
            <span>Smart LLM Traffic Router</span>
          </div>
          <h2 className="section-title">
            Token Fleet & <span className="text-gradient">LLM Router Optimizer</span>
          </h2>
          <p className="section-desc">
            Dynamically route AI traffic based on cost, latency, and quality thresholds. Blend frontier reasoning models with fast edge LLMs for maximum ROI.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Est. Monthly Spend</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>${totalMonthlyCost}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>vs ${baselineCost} un-optimized</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Monthly Cost Savings</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>${savings}</div>
              <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>⚡ {Math.round((parseFloat(savings)/Math.max(1, parseFloat(baselineCost))) * 100)}% cost reduction</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Blended Avg Latency</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4' }}>{weightedLatency} ms</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>sub-300ms SLA compliant</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Blended Quality Score</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{weightedQuality} / 100</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Benchmark evaluation score</div>
            </div>
          </div>

          {/* Model Routing Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Adjust Model Traffic Weights (% Total Volume):
            </h4>

            {models.map(model => (
              <div
                key={model.id}
                style={{
                  background: '#060911',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cpu size={18} color="#6366f1" />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{model.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({model.provider})</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Cost: <strong>${model.costPer1k}/1k tok</strong></span>
                    <span>Latency: <strong>{model.latencyAvgMs}ms</strong></span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>{model.trafficWeight}% Traffic</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={model.trafficWeight}
                  onChange={e => handleSliderChange(model.id, parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
