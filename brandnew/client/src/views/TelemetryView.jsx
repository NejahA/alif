import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Database, 
  Clock, 
  ShieldCheck, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { logTelemetryEvent } from '../services/api';

export default function TelemetryView({ telemetry, onRefreshTelemetry }) {
  const [filterType, setFilterType] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateEvent = async () => {
    setIsSimulating(true);
    try {
      const sampleEvents = [
        { type: 'AGENT_EXEC', agent: 'CodeCraft Sentinel', detail: 'Generated high-performance WebSocket buffer adapter' },
        { type: 'PROMPT_EVAL', agent: 'Veritas QA', detail: 'Benchmarked prompt v3.1 with 99.1% adherence' },
        { type: 'DOC_ANALYSIS', agent: 'DeepPulse Analyst', detail: 'Indexed 4,120 tokens across distributed consensus docs' }
      ];
      const randomEv = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      await logTelemetryEvent(randomEv);
      onRefreshTelemetry();
    } catch (err) {
      console.error('Failed to log event:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredEvents = telemetry?.recentEvents?.filter(ev => {
    if (filterType === 'ALL') return true;
    return ev.type === filterType;
  }) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>System Telemetry & Event Stream</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time throughput metrics, latency telemetry, token rate, and distributed event log.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleSimulateEvent}
          disabled={isSimulating}
        >
          {isSimulating ? <RefreshCw size={16} className="spin" /> : <Zap size={16} />}
          <span>Simulate Telemetry Pulse</span>
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL EXECUTIONS</span>
            <Activity size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {telemetry?.totalExecutions || 1482}
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)' }}>+14% from last hour</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontWeight: 600 }}>AVG LATENCY</span>
            <Clock size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {telemetry?.avgResponseTimeMs || 468}ms
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Target SLA &lt; 800ms</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontWeight: 600 }}>TOKEN THROUGHPUT</span>
            <Zap size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {telemetry?.tokenThroughputPerSec || 1840} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>tok/s</span>
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)' }}>Optimal cluster load</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontWeight: 600 }}>CACHE HIT RATIO</span>
            <Database size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {telemetry?.cacheHitRatio || '88.4%'}
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)' }}>Embedding memoized</span>
        </div>
      </div>

      {/* Events Log Table */}
      <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Active Event Stream</h3>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'AGENT_EXEC', 'PROMPT_EVAL', 'WORKFLOW_TRIGGER', 'DOC_ANALYSIS'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.725rem' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                <th style={{ padding: '10px 12px' }}>EVENT TYPE</th>
                <th style={{ padding: '10px 12px' }}>ORIGIN ACTOR</th>
                <th style={{ padding: '10px 12px' }}>EVENT DETAILS</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev) => (
                <tr 
                  key={ev.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.785rem', color: 'var(--text-dim)' }}>
                    {ev.time}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{ev.type}</span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                    {ev.agent}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {ev.detail}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#34d399" />
                      <span style={{ fontSize: '0.785rem', color: '#34d399', textTransform: 'capitalize' }}>
                        {ev.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
