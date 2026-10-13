'use client';

import React, { useState } from 'react';
import { Cpu, ShieldCheck, Zap, Globe, GitBranch, Terminal, CheckCircle2 } from 'lucide-react';

export default function Features() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'analytics' | 'security' | 'global'>('workflows');

  const codeSnippets = {
    workflows: `// Define autonomous micro-agent workflow
import { createWorkflow } from '@saassy/core';

export const agentPipeline = createWorkflow({
  name: 'code-review-bot',
  trigger: 'pull_request.opened',
  steps: [
    { action: 'analyze_ast', depth: 'deep' },
    { action: 'run_security_audit', rules: ['OWASP-2026'] },
    { action: 'auto_remediate_lint' }
  ]
});`,
    analytics: `// Query real-time edge telemetry
const metrics = await saassy.telemetry.getAggregates({
  cluster: 'global-edge',
  metric: 'p99_latency_ms',
  timeframe: '5m'
});

console.log("Edge Response Time:", metrics.p99); // 12.4ms`,
    security: `// Enforce Zero-Trust Encryption & Token Guard
import { createZeroTrustShield } from '@saassy/security';

export const config = {
  matcher: '/api/v1/:path*',
  security: createZeroTrustShield({
    mTLS: true,
    jwtValidation: 'RS256',
    rateLimit: { requestsPerMin: 5000 }
  })
};`,
    global: `// Deploy edge nodes across 32 regions automatically
saassy deploy --env production --regions ["us-east", "eu-west", "ap-northeast"]
✔ Build artifact compiled (1.2s)
✔ Edge routes propagated worldwide in 420ms`
  };

  return (
    <section id="features" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Cpu size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Architecture & Capabilities</span>
          </div>
          <h2 className="section-title">Engineered for Enterprise Velocity</h2>
          <p className="section-desc">
            Everything your product needs to scale seamlessly from 1,000 to 100,000,000 monthly active users.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="tabs-header">
          <button 
            onClick={() => setActiveTab('workflows')} 
            className={`tab-btn ${activeTab === 'workflows' ? 'active' : ''}`}
          >
            <GitBranch size={16} /> Autonomous AI
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <Zap size={16} /> Real-Time Edge
          </button>
          <button 
            onClick={() => setActiveTab('security')} 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} /> Zero-Trust Security
          </button>
          <button 
            onClick={() => setActiveTab('global')} 
            className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`}
          >
            <Globe size={16} /> Global CDN & API
          </button>
        </div>

        {/* Split Grid: Features List & Live Terminal Code Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center' }}>
          
          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Self-Healing AI Workflows</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.5' }}>
                    Micro-agents automatically intercept system errors, generate diagnostic tracebacks, and push hotfixes to production.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-cyan)' }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Instant Edge Propagation</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.5' }}>
                    Execute Next.js API routes and serverless edge functions within 10ms of any end user globally.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Bank-Grade Compliance</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.5' }}>
                    SOC2 Type II certified, GDPR compliant, and end-to-end payload encryption by default.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Code Display */}
          <div className="terminal-box">
            <div className="terminal-header">
              <div className="terminal-dot dot-red"></div>
              <div className="terminal-dot dot-yellow"></div>
              <div className="terminal-dot dot-green"></div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                {activeTab}.ts — Saassy Engine API
              </span>
            </div>
            <pre className="terminal-body">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
}
