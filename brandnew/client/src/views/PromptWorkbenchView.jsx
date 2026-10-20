import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Sparkles, 
  Play, 
  Gauge, 
  DollarSign, 
  Clock, 
  Layers, 
  Copy, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { substitutePrompt, benchmarkPrompt } from '../services/api';

export default function PromptWorkbenchView({ prompts }) {
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id || 'prompt-1');
  const activePrompt = prompts.find(p => p.id === selectedPromptId) || prompts[0];

  const [variables, setVariables] = useState({});
  const [compiledPrompt, setCompiledPrompt] = useState('');
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize variable inputs when prompt selection changes
  useEffect(() => {
    if (activePrompt) {
      setVariables(activePrompt.sampleInputs || {});
      setBenchmarkResults(null);
    }
  }, [selectedPromptId]);

  // Live variable compilation
  useEffect(() => {
    if (!activePrompt) return;
    let text = activePrompt.template;
    for (const [key, val] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      text = text.replace(regex, val || `{{${key}}}`);
    }
    setCompiledPrompt(text);
    setEstimatedTokens(Math.ceil(text.length / 4));
  }, [variables, activePrompt]);

  const handleBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await benchmarkPrompt(compiledPrompt);
      if (res.success) {
        setBenchmarkResults(res.results);
      }
    } catch (err) {
      console.error('Benchmarking error:', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Prompt Workbench & Model Matrix</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Author parameterized prompt templates, inject live test variables, and benchmark against top frontier LLMs.
          </p>
        </div>

        {/* Template Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="input-field"
            style={{ width: 'auto', minWidth: '280px' }}
            value={selectedPromptId}
            onChange={(e) => setSelectedPromptId(e.target.value)}
          >
            {prompts.map(p => (
              <option key={p.id} value={p.id}>{p.title} ({p.version})</option>
            ))}
          </select>

          <button 
            className="btn btn-primary"
            onClick={handleBenchmark}
            disabled={isBenchmarking}
          >
            {isBenchmarking ? (
              <>
                <div className="live-indicator" />
                <span>Running Matrix Benchmark...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Benchmark All Models</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Two Column Layout: Editor & Variable Injector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Template & Compiled View */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Compiled Prompt Preview</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-indigo">~{estimatedTokens} Tokens</span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleCopyPrompt}
              >
                {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <pre style={{
            background: 'rgba(10, 14, 24, 0.85)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            minHeight: '220px',
            maxHeight: '340px',
            overflowY: 'auto'
          }}>
            {compiledPrompt}
          </pre>
        </div>

        {/* Right: Variable Substitution Fields */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <SlidersHorizontal size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Template Variables</h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Edit test variables below to evaluate live prompt behavior:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '320px', overflowY: 'auto' }}>
            {activePrompt?.variables?.map((varName) => (
              <div key={varName}>
                <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '5px', fontFamily: 'var(--font-mono)' }}>
                  &#123;&#123;{varName}&#125;&#125;
                </label>
                <input
                  className="input-field"
                  value={variables[varName] || ''}
                  onChange={(e) => setVariables({ ...variables, [varName]: e.target.value })}
                  placeholder={`Value for ${varName}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Model Benchmark Matrix (Appears when benchmarked) */}
      {benchmarkResults && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Side-by-Side Model Benchmark Matrix</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Direct performance, token economy, and reasoning depth comparison across frontier AI engines.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {benchmarkResults.map((result, idx) => (
              <div 
                key={idx}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${result.color}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', margin: 0, color: '#fff' }}>{result.model}</h4>
                    <span className="badge badge-indigo">{result.reasoningScore}/100 Score</span>
                  </div>

                  {/* Metrics Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '12px',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)' }}>
                      <Clock size={13} color={result.color} />
                      <span>{result.latencyMs}ms</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)' }}>
                      <DollarSign size={13} color="#34d399" />
                      <span>{result.costEstimate}</span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.785rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    fontStyle: 'italic'
                  }}>
                    "{result.outputSummary}"
                  </p>
                </div>

                <div style={{
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.725rem',
                  color: 'var(--text-dim)'
                }}>
                  <span>Tokens: <strong>{result.tokensUsed}</strong></span>
                  <span style={{ color: result.color, fontWeight: 600 }}>Active Test</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
