import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Database, 
  Layers, 
  Tag, 
  ArrowRight,
  Plus,
  X
} from 'lucide-react';
import { queryDocument, createDocument } from '../services/api';

export default function DocumentAnalystView({ documents, onRefreshDocuments }) {
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || 'doc-1');
  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const [searchQuery, setSearchQuery] = useState('What are the invariants and network partition rules?');
  const [isSearching, setIsSearching] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  // New Document modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  const handleRunSearch = async () => {
    if (!activeDoc || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await queryDocument(activeDoc.id, searchQuery);
      if (res.success) {
        setQueryResult(res);
      }
    } catch (err) {
      console.error('Failed to query document:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newDocName || !newDocContent) return;

    try {
      await createDocument({ name: newDocName, content: newDocContent });
      setShowUploadModal(false);
      setNewDocName('');
      setNewDocContent('');
      onRefreshDocuments();
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Document & Context Analyst (RAG)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ingest structured technical documents, calculate semantic token boundaries, and execute vector-grounded Q&A with verifiable citations.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={16} />
          <span>Ingest Document</span>
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Document List */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <Database size={17} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Corpus Files ({documents.length})</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {documents.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setQueryResult(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <FileText size={16} color={isSelected ? '#818cf8' : 'var(--text-dim)'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-main)', wordBreak: 'break-all' }}>
                      {doc.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                    <span>{doc.size}</span> • <span>{doc.tokenCount} tokens</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Document Viewer & Semantic Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Semantic Search Box */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Semantic Q&A Over Selected Context</h3>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask any technical question about this document..."
                onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
              />
              <button 
                className="btn btn-cyan"
                onClick={handleRunSearch}
                disabled={isSearching}
                style={{ whiteSpace: 'nowrap' }}
              >
                {isSearching ? <div className="live-indicator" /> : <Search size={16} />}
                <span>Retrieve</span>
              </button>
            </div>

            {/* Query Result & Citations */}
            {queryResult && (
              <div style={{
                background: 'rgba(10, 14, 25, 0.8)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Synthesized Context Answer:
                  </span>
                  <p style={{ marginTop: '4px', fontSize: '0.875rem', color: '#f1f5f9', lineHeight: 1.6 }}>
                    {queryResult.answer}
                  </p>
                </div>

                {/* Citations List */}
                {queryResult.citations?.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Exact Grounded Citations:
                    </span>
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {queryResult.citations.map((cite) => (
                        <div 
                          key={cite.citationId}
                          style={{
                            padding: '8px 12px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderLeft: '3px solid var(--accent-cyan)',
                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>"{cite.text}"</span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                            {Math.round(cite.relevanceScore * 100)}% match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Document Content Preview */}
          <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Document Source: {activeDoc?.name}</h3>
              </div>
              <span className="badge badge-indigo">{activeDoc?.type}</span>
            </div>

            <pre style={{
              background: 'rgba(10, 14, 25, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              fontSize: '0.825rem',
              lineHeight: 1.6,
              color: '#cbd5e1',
              whiteSpace: 'pre-wrap',
              maxHeight: '380px',
              overflowY: 'auto'
            }}>
              {activeDoc?.content}
            </pre>
          </div>
        </div>
      </div>

      {/* Ingest Document Modal */}
      {showUploadModal && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Ingest Technical Document</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Document Filename</label>
                <input 
                  className="input-field"
                  placeholder="e.g. system_architecture_rfc.md"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Document Content (Markdown or JSON)</label>
                <textarea 
                  className="input-field"
                  rows={8}
                  placeholder="Paste documentation, specifications, or schema content here..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process & Index Tokens</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
