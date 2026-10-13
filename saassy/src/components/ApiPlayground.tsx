'use client';

import React, { useState } from 'react';
import { Terminal, Send, Check, Copy, Code2, Loader2 } from 'lucide-react';

export default function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/stats');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [requestBody, setRequestBody] = useState<string>('{\n  "prompt": "Optimize database queries for multi-tenant users",\n  "mode": "code"\n}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    { path: '/api/stats', method: 'GET', label: 'Cluster Telemetry' },
    { path: '/api/ai-chat', method: 'POST', label: 'AI Agent Inference' },
    { path: '/api/integrations', method: 'GET', label: 'Integrations Catalog' },
    { path: '/api/pipeline', method: 'POST', label: 'Pipeline Execution' },
    { path: '/api/ping', method: 'GET', label: 'Edge Ping Benchmark' },
  ];

  const handleSelectEndpoint = (ep: any) => {
    setSelectedEndpoint(ep.path);
    setMethod(ep.method);
    setResponse(null);
  };

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);

    const startTime = performance.now();
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (method === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint, options);
      const data = await res.json();
      const endTime = performance.now();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs: Math.round(endTime - startTime),
        data,
      });
    } catch (err: any) {
      setResponse({
        status: 500,
        statusText: 'Error',
        timeMs: 0,
        data: { error: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response?.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="api-sandbox" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Code2 size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Developer API Console</span>
          </div>
          <h2 className="section-title">Interactive API Endpoint Explorer</h2>
          <p className="section-desc">
            Test backend REST endpoints live in your browser and inspect response payloads.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          {/* Endpoint Selector Buttons */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
            {endpoints.map((ep) => (
              <button
                key={ep.path}
                onClick={() => handleSelectEndpoint(ep)}
                className={`btn btn-sm ${selectedEndpoint === ep.path ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexShrink: 0 }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: ep.method === 'GET' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)', color: ep.method === 'GET' ? 'var(--accent-emerald)' : 'var(--accent-primary)' }}>
                  {ep.method}
                </span>
                {ep.path}
              </button>
            ))}
          </div>

          {/* Request Header Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <span style={{ background: '#090d16', border: '1px solid var(--border-color)', color: method === 'GET' ? 'var(--accent-emerald)' : 'var(--accent-primary)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '0.9rem' }}>
              {method}
            </span>
            
            <input
              type="text"
              readOnly
              value={selectedEndpoint}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#090d16',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
              }}
            />

            <button onClick={executeRequest} disabled={loading} className="btn btn-primary" style={{ padding: '0 24px' }}>
              {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              {loading ? 'Sending' : 'Send Request'}
            </button>
          </div>

          {/* Request Body (If POST) */}
          {method === 'POST' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Request Body (JSON)
              </label>
              <textarea
                rows={4}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#060911',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#e2e8f0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Response Inspector */}
          <div className="terminal-box">
            <div className="terminal-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Response Output</span>
              </div>

              {response && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: response.status === 200 ? 'var(--accent-emerald)' : '#ef4444' }}>
                    {response.status} OK ({response.timeMs}ms)
                  </span>
                  <button onClick={copyResponse} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            <div className="terminal-body" style={{ minHeight: '160px', whiteSpace: 'pre-wrap', fontSize: '0.825rem' }}>
              {!loading && !response && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Send Request" to test endpoint response in real-time.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Dispatching request to {selectedEndpoint}...
                </span>
              )}

              {!loading && response && (
                <code>{JSON.stringify(response.data, null, 2)}</code>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
