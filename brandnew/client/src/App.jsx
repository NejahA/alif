import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AgentsView from './views/AgentsView';
import WorkflowsView from './views/WorkflowsView';
import PromptWorkbenchView from './views/PromptWorkbenchView';
import DocumentAnalystView from './views/DocumentAnalystView';
import TelemetryView from './views/TelemetryView';
import { 
  fetchHealth, 
  fetchAgents, 
  fetchWorkflows, 
  fetchPrompts, 
  fetchDocuments, 
  fetchTelemetry 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('agents');
  const [isConnected, setIsConnected] = useState(false);

  const [agents, setAgents] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial data loading
  const loadInitialData = async () => {
    try {
      const [healthRes, agentsRes, workflowsRes, promptsRes, docsRes, telemetryRes] = await Promise.all([
        fetchHealth().catch(() => ({ status: 'offline' })),
        fetchAgents().catch(() => ({ agents: [] })),
        fetchWorkflows().catch(() => ({ workflows: [] })),
        fetchPrompts().catch(() => ({ prompts: [] })),
        fetchDocuments().catch(() => ({ documents: [] })),
        fetchTelemetry().catch(() => ({ telemetry: null }))
      ]);

      setIsConnected(healthRes.status === 'online');
      if (agentsRes.agents) setAgents(agentsRes.agents);
      if (workflowsRes.workflows) setWorkflows(workflowsRes.workflows);
      if (promptsRes.prompts) setPrompts(promptsRes.prompts);
      if (docsRes.documents) setDocuments(docsRes.documents);
      if (telemetryRes.telemetry) setTelemetry(telemetryRes.telemetry);
    } catch (err) {
      console.error('Data loading error:', err);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // Periodic heartbeat sync
    const interval = setInterval(async () => {
      try {
        const health = await fetchHealth();
        setIsConnected(health.status === 'online');
        const tel = await fetchTelemetry();
        if (tel.telemetry) setTelemetry(tel.telemetry);
      } catch (err) {
        setIsConnected(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshAgents = async () => {
    const res = await fetchAgents();
    if (res.agents) setAgents(res.agents);
  };

  const refreshWorkflows = async () => {
    const res = await fetchWorkflows();
    if (res.workflows) setWorkflows(res.workflows);
  };

  const refreshDocuments = async () => {
    const res = await fetchDocuments();
    if (res.documents) setDocuments(res.documents);
  };

  const refreshTelemetry = async () => {
    const res = await fetchTelemetry();
    if (res.telemetry) setTelemetry(res.telemetry);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isConnected={isConnected}
        telemetry={telemetry}
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px 64px 24px'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: '16px'
          }}>
            <div className="live-indicator" style={{ width: '16px', height: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Booting BrandNew Synapse cluster & connecting to backend...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'agents' && (
              <AgentsView 
                agents={agents} 
                onRefreshAgents={refreshAgents} 
              />
            )}

            {activeTab === 'workflows' && (
              <WorkflowsView 
                workflows={workflows} 
                agents={agents} 
                onRefreshWorkflows={refreshWorkflows} 
              />
            )}

            {activeTab === 'prompts' && (
              <PromptWorkbenchView 
                prompts={prompts} 
              />
            )}

            {activeTab === 'documents' && (
              <DocumentAnalystView 
                documents={documents} 
                onRefreshDocuments={refreshDocuments} 
              />
            )}

            {activeTab === 'telemetry' && (
              <TelemetryView 
                telemetry={telemetry} 
                onRefreshTelemetry={refreshTelemetry} 
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(8, 11, 17, 0.9)',
        padding: '20px 24px',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <span>BrandNew Synapse Engine</span> • <span>Node.js v20.19.4 Backend (:5050)</span> • <span>React 18 + Vite Frontend</span>
          </div>
          <div>
            <span>Cluster Status: <strong style={{ color: isConnected ? '#34d399' : '#f87171' }}>{isConnected ? 'Optimal' : 'Connecting'}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
