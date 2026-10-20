import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Plus, 
  Cpu, 
  Flame, 
  Sliders, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Code2, 
  ExternalLink,
  X
} from 'lucide-react';
import { executeAgent, createAgent } from '../services/api';

export default function AgentsView({ agents, onRefreshAgents }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [taskPrompt, setTaskPrompt] = useState('Analyze system requirements and design an event-driven telemetry ingestion engine.');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Agent Form state
  const [newAgentData, setNewAgentData] = useState({
    name: '',
    role: '',
    avatar: '⚡',
    model: 'Gemini 2.0 Flash (Reasoning)',
    temperature: 0.3,
    systemPrompt: '',
    tools: 'Code Sandbox, AST Parser, Vector Indexer'
  });

  const handleTestAgent = (agent) => {
    setSelectedAgent(agent);
    setExecutionResult(null);
  };

  const handleRunExecution = async () => {
    if (!selectedAgent || !taskPrompt.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executeAgent(selectedAgent.id, taskPrompt);
      if (res.success) {
        setExecutionResult(res);
        onRefreshAgents();
      }
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCreateAgentSubmit = async (e) => {
    e.preventDefault();
    if (!newAgentData.name || !newAgentData.role) return;

    try {
      await createAgent({
        ...newAgentData,
        tools: newAgentData.tools.split(',').map(t => t.trim())
      });
      setShowCreateModal(false);
      setNewAgentData({
        name: '',
        role: '',
        avatar: '⚡',
        model: 'Gemini 2.0 Flash (Reasoning)',
        temperature: 0.3,
        systemPrompt: '',
        tools: 'Code Sandbox, AST Parser'
      });
      onRefreshAgents();
    } catch (err) {
      console.error('Failed to create agent:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Autonomous Agent Orchestrator</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Configure reasoning agents, assign system instructions, adjust model temperatures, and run test executions.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          <span>Deploy New Agent</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {agents.map((agent) => (
          <div 
            key={agent.id} 
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top decorative bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${agent.color || 'var(--accent-primary)'}, transparent)`
            }} />

            <div>
              {/* Header with avatar & model */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: `${agent.color || '#6366f1'}20`,
                    border: `1px solid ${agent.color || '#6366f1'}50`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                  }}>
                    {agent.avatar || '🤖'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{agent.name}</h3>
                    <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>{agent.role}</p>
                  </div>
                </div>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                  {agent.status}
                </span>
              </div>

              {/* Model & Temperature info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '10px',
                background: 'rgba(10, 14, 25, 0.5)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '14px',
                fontSize: '0.75rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <Cpu size={14} color="#818cf8" />
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{agent.model}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <Flame size={14} color="#f59e0b" />
                  <span>Temp: <strong style={{ color: 'var(--text-main)' }}>{agent.temperature}</strong></span>
                </div>
              </div>

              {/* System Prompt snippet */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  System Directive
                </span>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {agent.systemPrompt}
                </p>
              </div>

              {/* Equipped Tools */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {agent.tools?.map((tool, idx) => (
                    <span 
                      key={idx} 
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--text-dim)'
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics & Test Button */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span>{agent.metrics?.tasksCompleted || 0} tasks</span> • <span>{agent.metrics?.avgLatency || '450ms'}</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleTestAgent(agent)}
              >
                <Play size={13} fill="currentColor" />
                <span>Test Live</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Drawer / Modal */}
      {selectedAgent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(10, 14, 25, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>{selectedAgent.avatar}</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Execute {selectedAgent.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Model: {selectedAgent.model} | Temp: {selectedAgent.temperature}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgent(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                  Task Input Prompt:
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={taskPrompt}
                  onChange={(e) => setTaskPrompt(e.target.value)}
                  placeholder="Enter specific instructions or code for this agent to process..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedAgent(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleRunExecution}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <div className="live-indicator" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>Execute Agent</span>
                    </>
                  )}
                </button>
              </div>

              {/* Execution Result */}
              {executionResult && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: 'rgba(10, 14, 24, 0.9)',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)'
                }}>
                  {/* Traces */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Reasoning Chain Traces:
                    </span>
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {executionResult.thinkingTraces?.map((trace, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.785rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          <CheckCircle2 size={12} color="#10b981" />
                          <span>{trace}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Output Artifact */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Generated Solution Artifact:
                    </span>
                    <pre style={{
                      marginTop: '6px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.825rem',
                      color: '#e2e8f0',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {executionResult.output}
                    </pre>
                  </div>

                  {/* Metrics Footer */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px'
                  }}>
                    <span>⏱ Latency: <strong style={{ color: '#fff' }}>{executionResult.metrics?.executionTimeMs}ms</strong></span>
                    <span>📊 Tokens: <strong style={{ color: '#fff' }}>{executionResult.metrics?.tokensUsed}</strong></span>
                    <span>💰 Cost: <strong style={{ color: '#34d399' }}>{executionResult.metrics?.costEstimate}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Deploy Custom Agent</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAgentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Agent Name</label>
                <input 
                  className="input-field"
                  placeholder="e.g. DataForge Optimizer"
                  value={newAgentData.name}
                  onChange={(e) => setNewAgentData({ ...newAgentData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Role / Specialization</label>
                <input 
                  className="input-field"
                  placeholder="e.g. Database Indexing & Sharding Specialist"
                  value={newAgentData.role}
                  onChange={(e) => setNewAgentData({ ...newAgentData, role: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>AI Model</label>
                  <select 
                    className="input-field"
                    value={newAgentData.model}
                    onChange={(e) => setNewAgentData({ ...newAgentData, model: e.target.value })}
                  >
                    <option value="Gemini 2.0 Flash (Reasoning)">Gemini 2.0 Flash</option>
                    <option value="Claude 3.7 Sonnet (Hybrid)">Claude 3.7 Sonnet</option>
                    <option value="GPT-4o (Multimodal)">GPT-4o</option>
                    <option value="DeepSeek R1 (Chain of Thought)">DeepSeek R1</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Temperature: {newAgentData.temperature}</label>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    style={{ width: '100%', marginTop: '8px' }}
                    value={newAgentData.temperature}
                    onChange={(e) => setNewAgentData({ ...newAgentData, temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>System Directive</label>
                <textarea 
                  className="input-field"
                  rows={3}
                  placeholder="Instructions guiding this agent's behavioral persona and constraints..."
                  value={newAgentData.systemPrompt}
                  onChange={(e) => setNewAgentData({ ...newAgentData, systemPrompt: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Equipped Tools (comma separated)</label>
                <input 
                  className="input-field"
                  value={newAgentData.tools}
                  onChange={(e) => setNewAgentData({ ...newAgentData, tools: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Deploy to Cluster</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
