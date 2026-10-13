'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/utils/sound';
import { 
  Cpu, 
  Database, 
  Code2, 
  Play, 
  RotateCcw, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Server,
  Zap,
  Activity,
  Layers,
  Terminal
} from 'lucide-react';

interface RaftNode {
  id: string;
  name: string;
  role: 'Leader' | 'Follower' | 'Candidate' | 'Dead';
  term: number;
  votes: number;
  logCount: number;
  isPartitioned: boolean;
}

export default function EngineeringLab() {
  const [activeTab, setActiveTab] = useState<'raft' | 'cache' | 'ast'>('raft');

  // --- 1. Raft Consensus Simulator State ---
  const [raftNodes, setRaftNodes] = useState<RaftNode[]>([
    { id: '1', name: 'Node-α (Alpha)', role: 'Leader', term: 4, votes: 0, logCount: 142, isPartitioned: false },
    { id: '2', name: 'Node-β (Beta)', role: 'Follower', term: 4, votes: 0, logCount: 142, isPartitioned: false },
    { id: '3', name: 'Node-γ (Gamma)', role: 'Follower', term: 4, votes: 0, logCount: 142, isPartitioned: false },
    { id: '4', name: 'Node-δ (Delta)', role: 'Follower', term: 4, votes: 0, logCount: 142, isPartitioned: false },
    { id: '5', name: 'Node-ε (Epsilon)', role: 'Follower', term: 4, votes: 0, logCount: 142, isPartitioned: false },
  ]);
  const [raftLogs, setRaftLogs] = useState<string[]>([
    '[INIT] Raft cluster initialized with 5 peers in term 4.',
    '[HEARTBEAT] Leader Node-α broadcasted AppendEntries RPC to 4 followers.',
  ]);

  // Raft Heartbeat loop
  useEffect(() => {
    const interval = setInterval(() => {
      setRaftNodes((prev) => {
        const leader = prev.find((n) => n.role === 'Leader');
        if (!leader) return prev;
        return prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const killLeader = () => {
    sound.playPulse();
    setRaftNodes((prev) => {
      const leaderIndex = prev.findIndex((n) => n.role === 'Leader');
      if (leaderIndex === -1) return prev;

      const newNodes = [...prev];
      newNodes[leaderIndex] = { ...newNodes[leaderIndex], role: 'Dead' };

      // Find an active follower to become candidate
      const candidateIndex = newNodes.findIndex((n) => n.role === 'Follower' && !n.isPartitioned);
      if (candidateIndex !== -1) {
        newNodes[candidateIndex] = {
          ...newNodes[candidateIndex],
          role: 'Candidate',
          term: newNodes[candidateIndex].term + 1,
          votes: 1,
        };

        // Election victory after small delay
        setTimeout(() => {
          sound.playSuccess();
          setRaftNodes((current) => {
            const cIndex = current.findIndex((n) => n.role === 'Candidate');
            if (cIndex === -1) return current;
            const updated = [...current];
            updated[cIndex] = {
              ...updated[cIndex],
              role: 'Leader',
              votes: 3, // Quorum reached!
            };
            return updated;
          });
          setRaftLogs((l) => [
            `[ELECTION] Quorum achieved (3/5). Node-${newNodes[candidateIndex].name.split(' ')[0]} elected Leader in term ${newNodes[candidateIndex].term + 1}!`,
            ...l.slice(0, 7),
          ]);
        }, 1200);
      }

      setRaftLogs((l) => [
        `[KILL] Leader killed! Election timeout triggered in active followers.`,
        ...l.slice(0, 7),
      ]);

      return newNodes;
    });
  };

  const triggerPartition = () => {
    sound.playChirp(440, 0.15, 'sawtooth');
    setRaftNodes((prev) =>
      prev.map((n, i) => (i >= 3 ? { ...n, isPartitioned: !n.isPartitioned } : n))
    );
    setRaftLogs((l) => [
      `[NETWORK] Partition toggled for Node-δ and Node-ε. Isolating minority slice.`,
      ...l.slice(0, 7),
    ]);
  };

  const appendEntry = () => {
    sound.playClick();
    const cmdId = Math.random().toString(36).substring(2, 7);
    setRaftNodes((prev) => {
      const leader = prev.find((n) => n.role === 'Leader');
      if (!leader) {
        setRaftLogs((l) => [`[ERROR] Cannot commit: No Leader present! Trigger election first.`, ...l.slice(0, 7)]);
        return prev;
      }
      return prev.map((n) => {
        if (n.role === 'Dead' || n.isPartitioned) return n;
        return { ...n, logCount: n.logCount + 1 };
      });
    });
    setRaftLogs((l) => [
      `[COMMIT] Tx #${cmdId} replicated across quorum (3+ peers). State machine updated.`,
      ...l.slice(0, 7),
    ]);
  };

  const resetRaft = () => {
    sound.playClick();
    setRaftNodes([
      { id: '1', name: 'Node-α (Alpha)', role: 'Leader', term: 5, votes: 0, logCount: 143, isPartitioned: false },
      { id: '2', name: 'Node-β (Beta)', role: 'Follower', term: 5, votes: 0, logCount: 143, isPartitioned: false },
      { id: '3', name: 'Node-γ (Gamma)', role: 'Follower', term: 5, votes: 0, logCount: 143, isPartitioned: false },
      { id: '4', name: 'Node-δ (Delta)', role: 'Follower', term: 5, votes: 0, logCount: 143, isPartitioned: false },
      { id: '5', name: 'Node-ε (Epsilon)', role: 'Follower', term: 5, votes: 0, logCount: 143, isPartitioned: false },
    ]);
    setRaftLogs(['[RESET] Cluster re-synchronized. All peers nominal in Term 5.']);
  };

  // --- 2. Cache Invalidation Simulator State ---
  const [cacheL1, setCacheL1] = useState<{ [key: string]: string }>({ 'user:101': 'Alif (Architect)', 'config:ttl': '3600' });
  const [cacheL2, setCacheL2] = useState<{ [key: string]: string }>({ 'user:101': 'Alif (Architect)', 'config:ttl': '3600', 'session:99': 'active_token' });
  const [dbData, setDbData] = useState<{ [key: string]: string }>({ 'user:101': 'Alif (Architect)', 'config:ttl': '3600', 'session:99': 'active_token', 'audit:log': 'nominal' });
  const [lastQueryInfo, setLastQueryInfo] = useState<{ key: string; tier: string; latency: string; status: 'HIT' | 'MISS' | 'WRITE' }>({
    key: 'user:101',
    tier: 'L1 In-Memory',
    latency: '0.12ms',
    status: 'HIT',
  });

  const handleCacheRead = (key: string) => {
    sound.playClick();
    if (cacheL1[key]) {
      setLastQueryInfo({ key, tier: 'L1 In-Memory', latency: '0.08ms', status: 'HIT' });
      sound.playChirp(1200, 0.04);
    } else if (cacheL2[key]) {
      // populate L1
      setCacheL1((prev) => ({ ...prev, [key]: cacheL2[key] }));
      setLastQueryInfo({ key, tier: 'L2 Redis Cache (populated L1)', latency: '1.8ms', status: 'HIT' });
      sound.playChirp(800, 0.06);
    } else if (dbData[key]) {
      // populate L2 and L1
      setCacheL2((prev) => ({ ...prev, [key]: dbData[key] }));
      setCacheL1((prev) => ({ ...prev, [key]: dbData[key] }));
      setLastQueryInfo({ key, tier: 'Postgres DB (Hydrated L1 & L2)', latency: '32.4ms', status: 'MISS' });
      sound.playPulse();
    } else {
      setLastQueryInfo({ key, tier: 'Not Found in Any Tier', latency: '40.2ms', status: 'MISS' });
    }
  };

  const handleCacheWrite = (key: string, val: string) => {
    sound.playClick();
    // Cache-Aside with Write-Invalidation
    setDbData((prev) => ({ ...prev, [key]: val }));
    setCacheL2((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setCacheL1((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setLastQueryInfo({ key, tier: 'Postgres + Bus Invalidation Event Broadcasted', latency: '18.6ms', status: 'WRITE' });
    sound.playSuccess();
  };

  const handleEvictL1 = () => {
    sound.playClick();
    setCacheL1({});
    setLastQueryInfo({ key: 'ALL', tier: 'L1 Cache Evicted', latency: '0.01ms', status: 'WRITE' });
  };

  // --- 3. AST & Lexer Visualizer State ---
  const [sampleCode, setSampleCode] = useState<string>('const stream = pipeline.ingest({ rate: 450000 });');
  const [tokens, setTokens] = useState<Array<{ text: string; type: string }>>([]);

  useEffect(() => {
    // Simple custom tokenizer for demonstration
    const regex = /\b(const|let|var|function|return|if|else|import|export)\b|([a-zA-Z_$][a-zA-Z0-9_$]*)|(\d+)|([+\-*/=<>!&|]+)|([{}()[\];,.:])/g;
    const result: Array<{ text: string; type: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(sampleCode)) !== null) {
      if (match[1]) result.push({ text: match[1], type: 'KEYWORD' });
      else if (match[2]) result.push({ text: match[2], type: 'IDENTIFIER' });
      else if (match[3]) result.push({ text: match[3], type: 'NUMERIC_LITERAL' });
      else if (match[4]) result.push({ text: match[4], type: 'OPERATOR' });
      else if (match[5]) result.push({ text: match[5], type: 'PUNCTUATION' });
    }
    setTokens(result);
  }, [sampleCode]);

  return (
    <section id="lab" className="section-wrapper">
      <div className="section-header">
        <div className="section-tag">Interactive Simulation Sandbox</div>
        <h2 className="section-title">
          Live <span className="text-gradient-cyan">Engineering Lab</span>
        </h2>
        <p className="section-desc">
          Test real distributed systems mechanics right in the browser. Select an interactive engine below to simulate consensus failover, multi-tier cache invalidation, or lexical AST processing.
        </p>
      </div>

      {/* Lab Nav Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { id: 'raft', label: '1. Distributed Raft Consensus Cluster', icon: <Cpu size={16} /> },
          { id: 'cache', label: '2. Multi-Tier Cache & Invalidation Bus', icon: <Database size={16} /> },
          { id: 'ast', label: '3. AST Parser & Lexer Tokenizer', icon: <Code2 size={16} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as 'raft' | 'cache' | 'ast');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '10px',
                cursor: 'pointer',
                background: isActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid var(--cyan-neon)' : '1px solid var(--border-subtle)',
                color: isActive ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RAFT CONSENSUS */}
      {activeTab === 'raft' && (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            border: '1px solid rgba(0, 240, 255, 0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--cyan-neon)" />
                5-Node Raft Consensus Engine
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                Simulating heartbeat ticks, log replication quorum (N/2 + 1), and dynamic leader election timeout.
              </p>
            </div>

            {/* Raft Control Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              <button
                onClick={appendEntry}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
              >
                <Zap size={14} />
                <span>Append Log RPC</span>
              </button>

              <button
                onClick={killLeader}
                className="btn-secondary"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.78rem',
                  color: '#f43f5e',
                  borderColor: 'rgba(244, 63, 94, 0.4)',
                }}
              >
                <Flame size={14} />
                <span>Kill Current Leader</span>
              </button>

              <button
                onClick={triggerPartition}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
              >
                <AlertTriangle size={14} color="var(--amber-neon)" />
                <span>Toggle Partition (δ, ε)</span>
              </button>

              <button
                onClick={resetRaft}
                className="btn-secondary"
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.78rem' }}
                title="Reset Cluster"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Node Cards Visualizer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {raftNodes.map((node) => {
              const isLeader = node.role === 'Leader';
              const isDead = node.role === 'Dead';
              const isCandidate = node.role === 'Candidate';

              let borderColor = 'rgba(255, 255, 255, 0.1)';
              let roleBadgeColor = 'var(--text-muted)';
              let roleBg = 'rgba(255, 255, 255, 0.05)';

              if (isLeader) {
                borderColor = 'var(--cyan-neon)';
                roleBadgeColor = 'var(--cyan-neon)';
                roleBg = 'rgba(0, 240, 255, 0.15)';
              } else if (isCandidate) {
                borderColor = 'var(--amber-neon)';
                roleBadgeColor = 'var(--amber-neon)';
                roleBg = 'rgba(245, 158, 11, 0.15)';
              } else if (isDead) {
                borderColor = '#f43f5e';
                roleBadgeColor = '#f43f5e';
                roleBg = 'rgba(244, 63, 94, 0.15)';
              }

              return (
                <div
                  key={node.id}
                  style={{
                    background: 'rgba(10, 14, 24, 0.8)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    border: `1px solid ${borderColor}`,
                    boxShadow: isLeader ? '0 0 25px rgba(0, 240, 255, 0.2)' : 'none',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {node.isPartitioned && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '0.2rem 0.5rem',
                        background: 'rgba(244, 63, 94, 0.2)',
                        border: '1px solid #f43f5e',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: '#f43f5e',
                      }}
                    >
                      PARTITIONED
                    </div>
                  )}

                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#fff',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {node.name}
                  </div>

                  <div
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: roleBg,
                      color: roleBadgeColor,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}
                  >
                    {node.role}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div>Term: <span style={{ color: '#fff' }}>#{node.term}</span></div>
                    <div>Committed Logs: <span style={{ color: 'var(--cyan-neon)' }}>{node.logCount}</span></div>
                    <div>State: <span style={{ color: isDead ? '#f43f5e' : 'var(--emerald-neon)' }}>{isDead ? 'OFFLINE' : 'SYNCHRONIZED'}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Raft Terminal Logs */}
          <div
            style={{
              background: '#04060a',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
            }}
          >
            <div
              style={{
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Terminal size={12} color="var(--cyan-neon)" />
              <span>CLUSTER EXECUTION LOG STREAM (REPLICATED STATE MACHINE):</span>
            </div>
            {raftLogs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  color: log.includes('[ERROR]') || log.includes('[KILL]')
                    ? '#f43f5e'
                    : log.includes('[ELECTION]')
                    ? 'var(--amber-neon)'
                    : log.includes('[COMMIT]')
                    ? 'var(--emerald-neon)'
                    : 'var(--text-secondary)',
                  padding: '0.15rem 0',
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-TIER CACHE */}
      {activeTab === 'cache' && (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            border: '1px solid rgba(168, 85, 247, 0.25)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="var(--violet-neon)" />
                Multi-Tier Cache & Invalidation Event Bus
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                Simulating L1 Memory (sub-ms), L2 Redis (2ms), and durable Postgres DB with Cache-Aside invalidation.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={handleEvictL1}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
              >
                Evict L1 Cache
              </button>
            </div>
          </div>

          {/* Interactive Query Simulator Panel */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                LAST QUERY TELEMETRY:
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#fff',
                  marginTop: '0.2rem',
                }}
              >
                Key: <span style={{ color: 'var(--cyan-neon)' }}>{lastQueryInfo.key}</span> | Resolved Tier: <span style={{ color: 'var(--violet-neon)' }}>{lastQueryInfo.tier}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  background: lastQueryInfo.status === 'HIT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: lastQueryInfo.status === 'HIT' ? '1px solid var(--emerald-neon)' : '1px solid #f43f5e',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: lastQueryInfo.status === 'HIT' ? 'var(--emerald-neon)' : '#f43f5e',
                  fontWeight: 700,
                }}
              >
                {lastQueryInfo.status}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--cyan-neon)',
                }}
              >
                {lastQueryInfo.latency}
              </div>
            </div>
          </div>

          {/* 3 Tiers Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* L1 Cache */}
            <div
              style={{
                background: 'rgba(14, 20, 36, 0.65)',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(0, 240, 255, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--cyan-neon)' }}>
                  L1 In-Memory Cache
                </span>
                <span className="code-chip">0.1ms Avg</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Node.js process RAM (LRU Map)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.keys(cacheL1).length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    [Cache Empty]
                  </div>
                ) : (
                  Object.entries(cacheL1).map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: 'var(--cyan-neon)' }}>{k}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
                    </div>
                  ))
                )}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => handleCacheRead('user:101')}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem' }}
                >
                  Read &apos;user:101&apos;
                </button>
              </div>
            </div>

            {/* L2 Redis */}
            <div
              style={{
                background: 'rgba(14, 20, 36, 0.65)',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(168, 85, 247, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--violet-neon)' }}>
                  L2 Distributed Redis
                </span>
                <span className="code-chip">1.8ms Avg</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Clustered Redis with Pub/Sub invalidation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(cacheL2).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: 'var(--violet-neon)' }}>{k}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => handleCacheRead('session:99')}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem' }}
                >
                  Read &apos;session:99&apos;
                </button>
              </div>
            </div>

            {/* L3 Postgres Database */}
            <div
              style={{
                background: 'rgba(14, 20, 36, 0.65)',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--emerald-neon)' }}>
                  L3 Postgres Storage
                </span>
                <span className="code-chip">35ms Avg</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                ACID Durable Storage & Event Log
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(dbData).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: 'var(--emerald-neon)' }}>{k}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => handleCacheWrite('user:101', `Updated @ ${new Date().toLocaleTimeString()}`)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem' }}
                >
                  Write & Invalidate user:101
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AST & TOKENIZER */}
      {activeTab === 'ast' && (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={20} color="var(--emerald-neon)" />
              Real-Time Lexer & Abstract Syntax Tree Tokenizer
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              Type any code expression below to see lexical token decomposition and node hierarchy.
            </p>
          </div>

          {/* Code input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.4rem',
                display: 'block',
              }}
            >
              SOURCE CODE INPUT:
            </label>
            <input
              type="text"
              value={sampleCode}
              onChange={(e) => setSampleCode(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Token Visualizer Chips */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              LEXICAL TOKEN STREAM ({tokens.length} TOKENS GENERATED):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tokens.map((tok, i) => {
                let badgeColor = '#94a3b8';
                let badgeBg = 'rgba(255, 255, 255, 0.05)';

                if (tok.type === 'KEYWORD') {
                  badgeColor = 'var(--violet-neon)';
                  badgeBg = 'rgba(168, 85, 247, 0.15)';
                } else if (tok.type === 'IDENTIFIER') {
                  badgeColor = 'var(--cyan-neon)';
                  badgeBg = 'rgba(0, 240, 255, 0.15)';
                } else if (tok.type === 'NUMERIC_LITERAL') {
                  badgeColor = 'var(--amber-neon)';
                  badgeBg = 'rgba(245, 158, 11, 0.15)';
                } else if (tok.type === 'OPERATOR') {
                  badgeColor = '#ec4899';
                  badgeBg = 'rgba(236, 72, 153, 0.15)';
                }

                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      background: badgeBg,
                      border: `1px solid ${badgeColor}`,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span style={{ color: '#fff', fontWeight: 600 }}>{tok.text}</span>
                    <span style={{ color: badgeColor, fontSize: '0.65rem' }}>[{tok.type}]</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
