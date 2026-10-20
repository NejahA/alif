import React from 'react';
import { 
  Bot, 
  Workflow, 
  Terminal, 
  FileText, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isConnected, telemetry }) {
  const tabs = [
    { id: 'agents', label: 'Agent Orchestrator', icon: Bot, badge: telemetry?.activeAgents || '4' },
    { id: 'workflows', label: 'Workflow Canvas', icon: Workflow, badge: 'Active' },
    { id: 'prompts', label: 'Prompt Workbench', icon: Terminal, badge: 'Matrix' },
    { id: 'documents', label: 'Document Analyst', icon: FileText, badge: 'RAG' },
    { id: 'telemetry', label: 'Telemetry & Logs', icon: Activity, badge: `${telemetry?.avgResponseTimeMs || 468}ms` }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 11, 17, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        gap: '20px'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setActiveTab('agents')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                letterSpacing: '-0.03em',
                color: '#ffffff' 
              }}>
                BrandNew <span className="gradient-text">Synapse</span>
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>v2.4 Core</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
              Autonomous AI Workflow Hub & Prompt Engine
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <Icon size={16} color={isActive ? '#818cf8' : 'currentColor'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#a5b4fc' : 'var(--text-dim)',
                    fontWeight: 600
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Connection status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(20, 27, 45, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem'
          }}>
            <div className="live-indicator" style={{
              backgroundColor: isConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              boxShadow: isConnected ? '0 0 8px var(--accent-emerald)' : '0 0 8px var(--accent-rose)'
            }} />
            <span style={{ color: isConnected ? '#34d399' : '#f87171', fontWeight: 600 }}>
              {isConnected ? 'API Connected (5050)' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
