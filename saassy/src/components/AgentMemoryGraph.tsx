'use client';

import React, { useState } from 'react';
import { Brain, Search, Database, RefreshCw, Plus, Sparkles, Zap, Shield, Filter, Network, ChevronRight } from 'lucide-react';

interface MemoryNode {
  id: string;
  label: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'working';
  embeddingVector: number[];
  similarityScore: number;
  accessCount: number;
  lastAccessed: string;
  details: string;
  connectedTo: string[];
}

export default function AgentMemoryGraph() {
  const [searchQuery, setSearchQuery] = useState('user authentication security tokens');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');

  const [memories, setMemories] = useState<MemoryNode[]>([
    {
      id: 'mem-1',
      label: 'OAuth2 Token Refresh Lifecycle',
      type: 'procedural',
      embeddingVector: [0.84, 0.12, 0.93, 0.45],
      similarityScore: 0.96,
      accessCount: 142,
      lastAccessed: '2 mins ago',
      details: 'Stores exact steps for refreshing JWT access tokens with PKCE flow across distributed edge workers.',
      connectedTo: ['mem-2', 'mem-4']
    },
    {
      id: 'mem-2',
      label: 'User Session Expiry Standard',
      type: 'semantic',
      embeddingVector: [0.77, 0.22, 0.81, 0.51],
      similarityScore: 0.89,
      accessCount: 98,
      lastAccessed: '12 mins ago',
      details: 'Global policy rule defining session timeouts at 15 minutes of inactivity for compliance frameworks.',
      connectedTo: ['mem-1', 'mem-3']
    },
    {
      id: 'mem-3',
      label: 'Incident #402: Rate Limit Spike',
      type: 'episodic',
      embeddingVector: [0.65, 0.45, 0.72, 0.38],
      similarityScore: 0.74,
      accessCount: 34,
      lastAccessed: '1 hour ago',
      details: 'Historical log of rate limiter activation when API gateway was targeted by unauthorized bot requests.',
      connectedTo: ['mem-2', 'mem-5']
    },
    {
      id: 'mem-4',
      label: 'Active User Context: Admin Portal',
      type: 'working',
      embeddingVector: [0.91, 0.15, 0.88, 0.62],
      similarityScore: 0.92,
      accessCount: 210,
      lastAccessed: 'Just now',
      details: 'Transient RAM cache containing current active workspace permissions and feature flag states.',
      connectedTo: ['mem-1']
    },
    {
      id: 'mem-5',
      label: 'Vector Index HNSW Benchmark',
      type: 'procedural',
      embeddingVector: [0.52, 0.82, 0.44, 0.68],
      similarityScore: 0.68,
      accessCount: 56,
      lastAccessed: '3 hours ago',
      details: 'Performance benchmarks comparing Pinecone vs Qdrant vs pgvector for 100M document queries.',
      connectedTo: ['mem-3']
    }
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setMemories(prev =>
      prev.map(mem => ({
        ...mem,
        similarityScore: query.trim() ? Math.min(0.99, Math.max(0.40, Math.round((0.6 + Math.random() * 0.38) * 100) / 100)) : 0.85
      }))
    );
  };

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;
    const newId = `mem-${memories.length + 1}`;
    const newMem: MemoryNode = {
      id: newId,
      label: newMemoryText,
      type: 'working',
      embeddingVector: [0.85, 0.33, 0.90, 0.42],
      similarityScore: 0.95,
      accessCount: 1,
      lastAccessed: 'Just now',
      details: `Dynamically synthesized vector node created from user context injection: "${newMemoryText}"`,
      connectedTo: ['mem-4', 'mem-1']
    };

    setMemories([newMem, ...memories]);
    setSelectedNode(newMem);
    setNewMemoryText('');
  };

  const runGarbageCollection = () => {
    setIsCompressing(true);
    setTimeout(() => {
      setMemories(prev => prev.map(m => ({
        ...m,
        accessCount: Math.round(m.accessCount * 1.1)
      })));
      setIsCompressing(false);
    }, 1200);
  };

  const getTypeColor = (type: MemoryNode['type']) => {
    switch (type) {
      case 'episodic': return '#ec4899';
      case 'semantic': return '#06b6d4';
      case 'procedural': return '#a855f7';
      case 'working': return '#10b981';
    }
  };

  const filteredMemories = memories.filter(
    m => selectedType === 'all' || m.type === selectedType
  );

  return (
    <section id="agent-memory" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#a855f7' }}>
            <Brain size={16} />
            <span>Long-Term Cognitive Architecture</span>
          </div>
          <h2 className="section-title">
            Agent Memory & <span className="text-gradient">Knowledge Graph Visualizer</span>
          </h2>
          <p className="section-desc">
            Explore how autonomous agents query, retrieve, and consolidate vector memory embeddings across Episodic, Semantic, Procedural, and Working memory tiers.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            {/* Search Embeddings */}
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Query semantic memory via vector similarity..."
                className="input-field"
                style={{
                  width: '100%',
                  paddingLeft: '42px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'episodic', 'semantic', 'procedural', 'working'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    background: selectedType === type ? 'var(--accent-primary)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedType === type ? '#ffffff' : 'var(--text-secondary)',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Garbage Collection Action */}
            <button
              onClick={runGarbageCollection}
              disabled={isCompressing}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <RefreshCw size={16} className={isCompressing ? 'spin-icon' : ''} />
              {isCompressing ? 'Compressing Vector Space...' : 'Consolidate Memories'}
            </button>
          </div>

          {/* Canvas & Details Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Graph Visualizer Panel */}
            <div style={{ background: '#060911', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', minHeight: '380px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Network size={16} color="#a855f7" /> SEMANTIC VECTOR COSINE SIMILARITY NODES
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                  ● Vector Index: HNSW Cosine
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
                {filteredMemories.map(node => {
                  const typeColor = getTypeColor(node.type);
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      style={{
                        background: isSelected ? `${typeColor}22` : 'rgba(15, 23, 42, 0.8)',
                        border: `1.5px solid ${isSelected ? typeColor : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        boxShadow: isSelected ? `0 0 15px ${typeColor}35` : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: `${typeColor}22`, color: typeColor, textTransform: 'uppercase' }}>
                          {node.type}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>
                          {Math.round(node.similarityScore * 100)}%
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
                        {node.label}
                      </div>

                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Hits: {node.accessCount}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Memory Injector */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMemoryText}
                  onChange={e => setNewMemoryText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMemory()}
                  placeholder="Inject new observation into agent memory..."
                  style={{
                    flex: 1,
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)'
                  }}
                />
                <button onClick={handleAddMemory} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                  <Plus size={16} /> Inject Memory
                </button>
              </div>
            </div>

            {/* Selected Node Details Inspector */}
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {selectedNode ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: `${getTypeColor(selectedNode.type)}22`, color: getTypeColor(selectedNode.type), textTransform: 'uppercase' }}>
                      {selectedNode.type} Memory Tier
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Accessed: {selectedNode.lastAccessed}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {selectedNode.label}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {selectedNode.details}
                  </p>

                  <div style={{ background: '#060911', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                      1536-DIM EMBEDDING VECTOR (FIRST 4 FLOATS)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6366f1', fontFamily: 'var(--font-mono)' }}>
                      [{selectedNode.embeddingVector.join(', ')}]
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Cosine Match Confidence:</span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>{(selectedNode.similarityScore * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Retrieval Frequency:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedNode.accessCount} queries</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <Brain size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem' }}>Select any memory node to inspect its embedding vectors, access frequencies, and knowledge graph links.</p>
                </div>
              )}

              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Autonomous Agent Knowledge Base v2.4</span>
                <span style={{ color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Full Schema <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
