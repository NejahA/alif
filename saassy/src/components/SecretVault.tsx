'use client';

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SecretVault() {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/secrets')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSecrets(data.data);
      })
      .catch(() => {});
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Key size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Encrypted Vault</span>
          </div>
          <h2 className="section-title">Environment Variable & Secret Manager</h2>
          <p className="section-desc">
            Securely store, scope, and rotate API keys and secrets with Zero-Trust access control.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {secrets.map((sec) => {
              const isRevealed = !!revealedMap[sec.id];
              return (
                <div key={sec.id} style={{ background: '#090d16', padding: '18px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {sec.key}
                      </span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '10px' }}>
                        {sec.scope}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: isRevealed ? 'var(--accent-cyan)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                      {isRevealed ? (sec.key === 'DATABASE_URL' ? 'postgres://admin:mock_secret_pass@db.saassy.internal:5432/prod' : sec.key === 'STRIPE_SECRET_KEY' ? 'mock_stripe_secret_key_demo_live' : 'mock_openai_api_key_demo_prod') : sec.maskedValue}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => toggleReveal(sec.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      {isRevealed ? 'Hide' : 'Reveal'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
