'use client';

import React, { useState } from 'react';
import { Database, Search, Sparkles, Cpu, CheckCircle2, Loader2, BarChart2 } from 'lucide-react';

export default function VectorDatabaseVisualizer() {
  const [query, setQuery] = useState('Find enterprise churn risk reports and billing analytics');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleVectorSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearchResults(null);

    try {
      const res = await fetch('/api/vector-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setSearchResults({ success: false, error: 'Vector search failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="vector-db" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Database size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>AI Vector Database Engine</span>
          </div>
          <h2 className="section-title">pgvector Embedding Search Playground</h2>
          <p className="section-desc">
            Perform high-dimensional semantic vector similarity queries in sub-5 milliseconds.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter semantic query..."
                style={{
                  width: '100%',
                  padding: '14px 18px 14px 44px',
                  borderRadius: 'var(--radius-md)',
                  background: '#090d16',
                  border: '1px solid var(--border-glow)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVectorSearch()}
              />
            </div>

            <button onClick={() => handleVectorSearch()} disabled={loading} className="btn btn-primary" style={{ padding: '0 24px' }}>
              {loading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
              {loading ? 'Vectorizing...' : 'Run Vector Search'}
            </button>
          </div>

          {/* Results Output */}
          <div className="terminal-box">
            <div className="terminal-header" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                pgvector Engine // 1536-Dimensional Cosine Similarity
              </span>

              {searchResults && searchResults.success && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                  Execution: {searchResults.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="terminal-body" style={{ minHeight: '160px' }}>
              {!loading && !searchResults && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Run Vector Search" to test 1536-d embedding search live.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Generating 1536-dimensional embeddings for query...
                </span>
              )}

              {!loading && searchResults && searchResults.success && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {searchResults.matches.map((match: any) => (
                    <div key={match.id} style={{ background: '#0d1322', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{match.title}</h4>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                          {(match.similarity * 100).toFixed(1)}% Match
                        </span>
                      </div>

                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Vector Snippet: {match.vectorSnippet}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
