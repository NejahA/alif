'use client';

import React, { useState } from 'react';
import { GitBranch, Play, CheckCircle2, ArrowRight, Settings, Cpu, Database, Bell, Radio, Loader2 } from 'lucide-react';

export default function PipelineBuilder() {
  const [selectedNode, setSelectedNode] = useState<string>('node-2');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const nodes = [
    { id: 'node-1', label: 'HTTP Webhook', icon: Radio, category: 'Trigger', desc: 'Receives inbound JSON payloads from client apps', config: { endpoint: '/api/v1/events', method: 'POST' } },
    { id: 'node-2', label: 'AI Agent Guard', icon: Cpu, category: 'AI Processing', desc: 'Applies automated schema validation & threat analysis', config: { model: 'gpt-4o-mini', temperature: 0.2 } },
    { id: 'node-3', label: 'Vector Store', icon: Database, category: 'Storage', desc: 'Indexes embeddings into Supabase pgvector table', config: { table: 'embeddings_v2', dimensions: 1536 } },
    { id: 'node-4', label: 'Slack Alert', icon: Bell, category: 'Output Action', desc: 'Dispatches real-time alert to engineering channel', config: { channel: '#prod-alerts', notifyOn: 'success' } },
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode) || nodes[0];

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineName: 'Autonomous Event Pipeline' }),
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({ success: false, error: 'Pipeline execution failed.' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section id="pipeline" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <GitBranch size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Visual Workflow Engine</span>
          </div>
          <h2 className="section-title">Autonomous Agent Pipeline Builder</h2>
          <p className="section-desc">
            Construct, test, and inspect event-driven multi-step AI micro-agent workflows visually.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px' }}>
          
          {/* Top Bar with Run Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Order Fulfillment Agent Pipeline</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: Active (4 Nodes Connected)</span>
            </div>

            <button onClick={handleRunPipeline} disabled={isRunning} className="btn btn-primary">
              {isRunning ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
              {isRunning ? 'Running Simulation...' : 'Test Run Pipeline'}
            </button>
          </div>

          {/* Pipeline Canvas Node Flow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', padding: '16px 0', marginBottom: '32px' }}>
            {nodes.map((node, index) => {
              const IconComp = node.icon;
              const isSelected = selectedNode === node.id;
              const isCompleted = executionResult?.steps?.some((s: any) => s.id === node.id);

              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setSelectedNode(node.id)}
                    style={{
                      flexShrink: 0,
                      width: '200px',
                      padding: '16px',
                      background: isSelected ? 'var(--bg-surface)' : 'rgba(9, 13, 22, 0.6)',
                      border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ background: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)', color: '#fff', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                        <IconComp size={18} />
                      </div>
                      {isCompleted && <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />}
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{node.label}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{node.category}</span>
                  </div>

                  {index < nodes.length - 1 && (
                    <ArrowRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Node Inspector & Output Log split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Inspector */}
            <div style={{ background: '#090d16', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <Settings size={18} style={{ color: 'var(--accent-amber)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Node Settings: {activeNodeData.label}</h4>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {activeNodeData.desc}
              </p>

              <div className="terminal-box" style={{ background: '#060911' }}>
                <div className="terminal-body" style={{ fontSize: '0.8rem', padding: '12px' }}>
                  {JSON.stringify(activeNodeData.config, null, 2)}
                </div>
              </div>
            </div>

            {/* Run Output */}
            <div className="terminal-box">
              <div className="terminal-header">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Execution Telemetry</span>
              </div>
              <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.8rem' }}>
                {!isRunning && !executionResult && (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Click "Test Run Pipeline" to trace execution path across nodes in real-time.
                  </span>
                )}

                {isRunning && (
                  <div style={{ color: 'var(--accent-cyan)' }}>
                    Executing pipeline steps against /api/pipeline...
                  </div>
                )}

                {executionResult && executionResult.success && (
                  <div>
                    <div style={{ color: 'var(--accent-emerald)', marginBottom: '10px', fontWeight: 600 }}>
                      ✔ Pipeline Finished in {executionResult.totalTimeMs}ms (ID: {executionResult.executionId})
                    </div>
                    {executionResult.steps.map((step: any) => (
                      <div key={step.id} style={{ marginBottom: '6px', color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>[{step.name}]</span> {step.output} ({step.durationMs}ms)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
