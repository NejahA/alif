'use client';

import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, Plus, Search, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Integrations() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({
    github: true,
    stripe: true,
    openai: true,
    datadog: true,
  });

  useEffect(() => {
    fetch('/api/integrations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setIntegrations(data.data);
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'AI', 'Payments', 'CI/CD', 'Database', 'Cloud', 'Monitoring'];

  const toggleConnection = (id: string) => {
    setConnectedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filtered = integrations.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="integrations" className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Developer Ecosystem</span>
          </div>
          <h2 className="section-title">Integrate with Your Tech Stack in 1 Click</h2>
          <p className="section-desc">
            Seamlessly bridge Saassy with your existing cloud tools, databases, and continuous deployment workflows.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

        </div>

        {/* Integrations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {filtered.map((item) => {
            const isConnected = !!connectedMap[item.id];
            return (
              <div key={item.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '10px' }}>
                    {item.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>
                  Edge Latency: {item.latency}
                </span>

                <button
                  onClick={() => toggleConnection(item.id)}
                  className={`btn btn-sm ${isConnected ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isConnected ? (
                    <>
                      <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} /> Connected
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Connect Tool
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
