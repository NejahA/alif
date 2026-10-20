import React, { useState } from 'react';
import { 
  Play, 
  Workflow, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  Settings2,
  Cpu,
  ChevronRight,
  Database
} from 'lucide-react';
import { runWorkflow } from '../services/api';

export default function WorkflowsView({ workflows, agents, onRefreshWorkflows }) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || 'wf-1');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeRunningNodeIdx, setActiveRunningNodeIdx] = useState(-1);
  const [initialInputText, setInitialInputText] = useState('Build an asynchronous event streaming bus for high-volume agent telemetry');

  const currentWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];
  const selectedNode = currentWorkflow?.nodes.find(n => n.id === selectedNodeId) || currentWorkflow?.nodes[0];

  const handleRunPipeline = async () => {
    if (!currentWorkflow || isRunning) return;
    setIsRunning(true);

    // Animate through nodes sequentially
    for (let i = 0; i < currentWorkflow.nodes.length; i++) {
      setActiveRunningNodeIdx(i);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      await runWorkflow(currentWorkflow.id, initialInputText);
      onRefreshWorkflows();
    } catch (err) {
      console.error('Failed to run workflow:', err);
    } finally {
      setIsRunning(false);
      setActiveRunningNodeIdx(-1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Pipeline Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Interactive Workflow Canvas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Visual multi-agent pipeline orchestrator. Chain reasoning steps, test transitions, and inspect node state.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select 
            className="input-field"
            style={{ width: 'auto', minWidth: '260px' }}
            value={selectedWorkflowId}
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
          >
            {workflows.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <button 
            className="btn btn-primary"
            onClick={handleRunPipeline}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <div className="live-indicator" />
                <span>Running Node {activeRunningNodeIdx + 1}/{currentWorkflow?.nodes?.length}...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Run Entire Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input Ingestion Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
          Pipeline Ingress Payload:
        </span>
        <input 
          className="input-field"
          value={initialInputText}
          onChange={(e) => setInitialInputText(e.target.value)}
          placeholder="Enter the trigger input specification for this workflow chain..."
          disabled={isRunning}
        />
      </div>

      {/* Main Canvas Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Canvas Area */}
        <div className="glass-panel" style={{
          padding: '30px',
          minHeight: '480px',
          background: 'radial-gradient(circle at 10px 10px, rgba(255, 255, 255, 0.05) 1px, transparent 1px) 0 0 / 24px 24px, rgba(14, 19, 31, 0.8)',
          position: 'relative',
          overflowX: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Workflow description badge */}
          <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-indigo">{currentWorkflow?.category}</span>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>{currentWorkflow?.description}</span>
          </div>

          {/* Sequential Chain of Nodes */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '28px',
            padding: '40px 10px',
            overflowX: 'auto'
          }}>
            {currentWorkflow?.nodes.map((node, index) => {
              const assignedAgent = agents.find(a => a.id === node.agentId);
              const isSelected = selectedNode?.id === node.id;
              const isNodeRunning = activeRunningNodeIdx === index;
              const isCompleted = node.status === 'completed';

              return (
                <React.Fragment key={node.id}>
                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      width: '240px',
                      padding: '16px',
                      background: isSelected 
                        ? 'rgba(30, 41, 69, 0.95)' 
                        : isNodeRunning 
                          ? 'rgba(99, 102, 241, 0.25)' 
                          : 'rgba(18, 24, 38, 0.85)',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected 
                        ? '2px solid var(--accent-primary)' 
                        : isNodeRunning 
                          ? '2px solid var(--accent-cyan)' 
                          : '1px solid var(--border-medium)',
                      boxShadow: isNodeRunning 
                        ? '0 0 24px rgba(6, 182, 212, 0.5)' 
                        : isSelected 
                          ? '0 8px 24px rgba(99, 102, 241, 0.35)' 
                          : '0 4px 16px rgba(0, 0, 0, 0.4)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    {/* Status Pip */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--text-dim)'
                      }}>
                        Step 0{index + 1}
                      </span>
                      {isNodeRunning ? (
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Active</span>
                      ) : isCompleted ? (
                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Done</span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Idle</span>
                      )}
                    </div>

                    {/* Node Title */}
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', lineHeight: 1.3 }}>
                      {node.label}
                    </h4>

                    {/* Agent Attribution */}
                    {assignedAgent ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem'
                      }}>
                        <span>{assignedAgent.avatar}</span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{assignedAgent.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)'
                      }}>
                        <Database size={13} />
                        <span>Input Ingress</span>
                      </div>
                    )}
                  </div>

                  {/* Connection arrow between nodes */}
                  {index < currentWorkflow.nodes.length - 1 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isNodeRunning ? 'var(--accent-cyan)' : 'var(--text-dim)',
                      transition: 'color var(--transition-fast)'
                    }}>
                      <ArrowRight size={22} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Drawer */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <Settings2 size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Node Inspector</h3>
          </div>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Selected Node</span>
                <h4 style={{ fontSize: '1rem', marginTop: '2px' }}>{selectedNode.label}</h4>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Node Type</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                  {selectedNode.type} Node
                </p>
              </div>

              {selectedNode.agentId && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Assigned Agent</span>
                  <div style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    background: 'rgba(10, 14, 25, 0.8)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}>
                    {agents.find(a => a.id === selectedNode.agentId)?.name || 'Custom Agent'}
                  </div>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Output State</span>
                <div style={{
                  marginTop: '4px',
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {selectedNode.output || 'No output recorded yet. Run pipeline to trigger.'}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Select a node to inspect its state.</p>
          )}
        </div>
      </div>
    </div>
  );
}
