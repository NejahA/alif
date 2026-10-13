'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Code2, Bot, Play, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';

export default function InteractiveDemo() {
  const [prompt, setPrompt] = useState('Build an automated customer refund & verification pipeline');
  const [mode, setMode] = useState<'workflow' | 'code' | 'insights'>('workflow');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const presetPrompts = [
    'Build an automated customer refund & verification pipeline',
    'Generate Next.js API handler for Stripe Webhooks',
    'Analyze customer churn probability for Q4 Enterprise users',
  ];

  const handleRunPrompt = async (selectedPrompt?: string) => {
    const targetPrompt = selectedPrompt || prompt;
    if (!targetPrompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetPrompt, mode }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({
        success: false,
        error: 'Failed to connect to Saassy API endpoint.',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response?.response) {
      navigator.clipboard.writeText(response.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="demo" className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Interactive AI Sandbox</span>
          </div>
          <h2 className="section-title">Test the Saassy Execution Engine</h2>
          <p className="section-desc">
            Experience our autonomous prompt-to-pipeline compiler live in your browser.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
          
          {/* Mode Selector */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setMode('workflow')}
              className={`btn btn-sm ${mode === 'workflow' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Bot size={16} /> Workflow Generator
            </button>
            <button
              onClick={() => setMode('code')}
              className={`btn btn-sm ${mode === 'code' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Code2 size={16} /> Code Synthesis
            </button>
            <button
              onClick={() => setMode('insights')}
              className={`btn btn-sm ${mode === 'insights' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Sparkles size={16} /> Predictive Insights
            </button>
          </div>

          {/* Prompt Input Box */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your desired workflow or backend service..."
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(9, 13, 22, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleRunPrompt()}
            />
            <button 
              onClick={() => handleRunPrompt()} 
              disabled={loading} 
              className="btn btn-primary"
              style={{ padding: '0 24px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing
                </>
              ) : (
                <>
                  Execute <Send size={16} />
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>Try preset:</span>
            {presetPrompts.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(preset);
                  handleRunPrompt(preset);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Output Display Box */}
          <div className="terminal-box">
            <div className="terminal-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="terminal-dot dot-red"></div>
                <div className="terminal-dot dot-yellow"></div>
                <div className="terminal-dot dot-green"></div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                  POST /api/ai-chat ({mode})
                </span>
              </div>
              {response && (
                <button
                  onClick={copyResponse}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            
            <div className="terminal-body" style={{ minHeight: '140px', whiteSpace: 'pre-wrap' }}>
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)' }}>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Synthesizing autonomous agent execution tree...</span>
                </div>
              )}

              {!loading && !response && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  // Click "Execute" or select a preset to test live response payload from /api/ai-chat.
                </span>
              )}

              {!loading && response && response.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    ✔ 200 OK — Processed in 18ms | Tokens Used: {response.tokensUsed}
                  </div>
                  <div>{response.response}</div>
                </div>
              )}

              {!loading && response && !response.success && (
                <div style={{ color: '#ef4444' }}>
                  ❌ Error: {response.error}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
