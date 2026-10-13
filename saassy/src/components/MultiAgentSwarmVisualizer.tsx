'use client';

import React, { useState } from 'react';
import { Network, Cpu, Play, Pause, RefreshCw, CheckCircle2, AlertCircle, ArrowRight, Plus, Layers, Terminal, Sparkles } from 'lucide-react';

interface AgentNode {
  id: string;
  name: string;
  role: 'planner' | 'researcher' | 'coder' | 'auditor' | 'deployer';
  status: 'idle' | 'running' | 'completed' | 'error';
  model: string;
  tokensUsed: number;
  latencyMs: number;
  outputSnippet?: string;
  x: number;
  y: number;
}

export default function MultiAgentSwarmVisualizer() {
  const [nodes, setNodes] = useState<AgentNode[]>([
    { id: '1', name: 'Master Planner Agent', role: 'planner', status: 'completed', model: 'GPT-4o', tokensUsed: 420, latencyMs: 310, outputSnippet: 'Decomposed user prompt into 4 sub-task execution steps.', x: 50, y: 150 },
    { id: '2', name: 'Web Research Agent', role: 'researcher', status: 'completed', model: 'Claude 3.5 Sonnet', tokensUsed: 1280, latencyMs: 640, outputSnippet: 'Fetched latest documentation & API schemas for endpoint v2.', x: 280, y: 70 },
    { id: '3', name: 'Code Generation Agent', role: 'coder', status: 'running', model: 'DeepSeek V3', tokensUsed: 890, latencyMs: 450, outputSnippet: 'Synthesizing TypeScript interfaces and React hooks...', x: 280, y: 230 },
    { id: '4', name: 'Security & Audit Agent', role: 'auditor', status: 'idle', model: 'Gemini 1.5 Pro', tokensUsed: 0, latencyMs: 0, outputSnippet: 'Awaiting code payload for vulnerability static analysis.', x: 510, y: 150 },
    { id: '5', name: 'Edge Deployment Agent', role: 'deployer', status: 'idle', model: 'Llama 3.3 70B', tokensUsed: 0, latencyMs: 0, outputSnippet: 'Standby for multi-region canary distribution.', x: 740, y: 150 }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'logs'>('graph');
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[00:01] Master Planner Agent initialized task graph.',
    '[00:02] Web Research Agent completed web scraping target APIs.',
    '[00:03] Code Generation Agent spawned sub-worker thread #4.'
  ]);

  const triggerSwarmExecution = () => {
    if (isRunning) return;
    setIsRunning(true);

    // Update node states sequentially
    setNodes(prev => prev.map(n => n.id === '3' ? { ...n, status: 'running' } : n));

    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === '3' ? { ...n, status: 'completed', tokensUsed: 1450, outputSnippet: 'Generated production component with TypeScript types.' } : n));
      setNodes(prev => prev.map(n => n.id === '4' ? { ...n, status: 'running' } : n));
      setExecutionLogs(l => ['[00:04] Security Auditor running AST static vulnerability scan...', ...l]);
    }, 1500);

    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === '4' ? { ...n, status: 'completed', tokensUsed: 520, latencyMs: 280, outputSnippet: 'Passed static security scan. Zero CVE vulnerabilities.' } : n));
      setNodes(prev => prev.map(n => n.id === '5' ? { ...n, status: 'running' } : n));
      setExecutionLogs(l => ['[00:06] Edge Deployment Agent initiating rolling deployment to 14 regions...', ...l]);
    }, 3000);

    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === '5' ? { ...n, status: 'completed', tokensUsed: 310, latencyMs: 190, outputSnippet: 'Deployed to Cloudflare Workers edge network successfully.' } : n));
      setIsRunning(false);
      setExecutionLogs(l => ['[00:08] 🎉 SWARM WORKFLOW EXECUTED SUCCESSFULLY!', ...l]);
    }, 4500);
  };

  const resetSwarm = () => {
    setIsRunning(false);
    setNodes([
      { id: '1', name: 'Master Planner Agent', role: 'planner', status: 'completed', model: 'GPT-4o', tokensUsed: 420, latencyMs: 310, outputSnippet: 'Decomposed user prompt into 4 sub-task execution steps.', x: 50, y: 150 },
      { id: '2', name: 'Web Research Agent', role: 'researcher', status: 'completed', model: 'Claude 3.5 Sonnet', tokensUsed: 1280, latencyMs: 640, outputSnippet: 'Fetched latest documentation & API schemas for endpoint v2.', x: 280, y: 70 },
      { id: '3', name: 'Code Generation Agent', role: 'coder', status: 'idle', model: 'DeepSeek V3', tokensUsed: 0, latencyMs: 0, outputSnippet: 'Standby for synthesis.', x: 280, y: 230 },
      { id: '4', name: 'Security & Audit Agent', role: 'auditor', status: 'idle', model: 'Gemini 1.5 Pro', tokensUsed: 0, latencyMs: 0, outputSnippet: 'Standby for audit.', x: 510, y: 150 },
      { id: '5', name: 'Edge Deployment Agent', role: 'deployer', status: 'idle', model: 'Llama 3.3 70B', tokensUsed: 0, latencyMs: 0, outputSnippet: 'Standby for deployment.', x: 740, y: 150 }
    ]);
    setExecutionLogs(['[00:00] Swarm state reset. Ready for orchestration.']);
  };

  const getRoleColor = (role: AgentNode['role']) => {
    switch (role) {
      case 'planner': return '#6366f1';
      case 'researcher': return '#06b6d4';
      case 'coder': return '#a855f7';
      case 'auditor': return '#f59e0b';
      case 'deployer': return '#10b981';
    }
  };

  return (
    <section id="swarm-visualizer" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Network size={16} />
            <span>Autonomous Orchestration Engine</span>
          </div>
          <h2 className="section-title">
            Multi-Agent <span className="text-gradient">Swarm Visualizer</span>
          </h2>
          <p className="section-desc">
            Design, visualize, and execute complex multi-agent AI topologies. Watch specialized planner, researcher, coder, and auditor agents collaborate in real time.
          </p>
        </div>

        {/* Visualizer Glass Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="#6366f1" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Agents:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>5 Nodes</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#06b6d4" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Tokens:</span>
                <span style={{ fontWeight: 800, color: '#06b6d4' }}>
                  {nodes.reduce((acc, curr) => acc + curr.tokensUsed, 0)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={triggerSwarmExecution} 
                disabled={isRunning}
                className="btn btn-primary"
                style={{ opacity: isRunning ? 0.6 : 1 }}
              >
                <Play size={16} /> {isRunning ? 'Executing Swarm...' : 'Execute Swarm Workflow'}
              </button>
              <button onClick={resetSwarm} className="btn btn-secondary">
                <RefreshCw size={16} /> Reset Topography
              </button>
            </div>
          </div>

          {/* Canvas Topology View */}
          <div style={{ position: 'relative', background: '#060911', borderRadius: '16px', border: '1px solid var(--border-color)', minHeight: '380px', padding: '24px', overflowX: 'auto' }}>
            {/* SVG Connecting Cables */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1="180" y1="170" x2="280" y2="90" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="4" />
              <line x1="180" y1="170" x2="280" y2="250" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="4" />
              <line x1="410" y1="90" x2="510" y2="170" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" />
              <line x1="410" y1="250" x2="510" y2="170" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="2" />
              <line x1="640" y1="170" x2="740" y2="170" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" />
            </svg>

            {/* Nodes Render */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', minWidth: '900px', zIndex: 1, position: 'relative' }}>
              {nodes.map(node => {
                const roleColor = getRoleColor(node.role);
                return (
                  <div
                    key={node.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '14px',
                      border: `1px solid ${node.status === 'running' ? roleColor : node.status === 'completed' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
                      padding: '16px',
                      boxShadow: node.status === 'running' ? `0 0 20px ${roleColor}40` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: `${roleColor}22`, color: roleColor, textTransform: 'uppercase' }}>
                        {node.role}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: node.status === 'completed' ? '#10b981' : node.status === 'running' ? '#f59e0b' : 'var(--text-muted)' }}>
                        {node.status === 'completed' ? '✓ Ready' : node.status === 'running' ? '⚡ Active' : 'Idle'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {node.name}
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Model: {node.model}
                    </div>

                    {node.outputSnippet && (
                      <div style={{ background: '#060911', padding: '8px 10px', borderRadius: '8px', fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                        "{node.outputSnippet}"
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Tokens: {node.tokensUsed}</span>
                      <span>Latency: {node.latencyMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Execution Logs */}
          <div style={{ marginTop: '20px', background: '#060911', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <Terminal size={14} /> LIVE ORCHESTRATION EVENT STREAM
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '4px', color: '#a5b4fc' }}>
              {executionLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
