'use client';

import React, { useState } from 'react';
import { Lock, Key, RefreshCw, Eye, EyeOff, ShieldCheck, Check, AlertTriangle } from 'lucide-react';

interface SecretItem {
  id: string;
  name: string;
  keyMasked: string;
  rawKey: string;
  lastRotated: string;
  rotationDays: number;
}

export default function SecretVaultHub() {
  const [secrets, setSecrets] = useState<SecretItem[]>([
    { id: '1', name: 'OPENAI_API_KEY', keyMasked: 'mock-ai-••••••••••••••••3f8a', rawKey: 'mock-ai-key-demo-891273918273f8a', lastRotated: '2 days ago', rotationDays: 30 },
    { id: '2', name: 'AWS_SECRET_ACCESS_KEY', keyMasked: 'mock-aws-••••••••', rawKey: 'mock-aws-access-key-example-demo', lastRotated: '14 days ago', rotationDays: 90 },
    { id: '3', name: 'DATABASE_POSTGRES_URL', keyMasked: 'postgres://user:••••••••@db.saassy.internal', rawKey: 'postgres://admin:SuperSecretPass123!@db.saassy.internal:5432/main', lastRotated: 'Just now', rotationDays: 60 }
  ]);

  const [visibleId, setVisibleId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);

  const rotateKey = (id: string) => {
    setRotatingId(id);
    setTimeout(() => {
      setSecrets(prev => prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            lastRotated: 'Just now'
          };
        }
        return s;
      }));
      setRotatingId(null);
    }, 800);
  };

  return (
    <section id="secret-vault" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Lock size={16} />
            <span>Zero-Trust KMS Vault</span>
          </div>
          <h2 className="section-title">
            Secret Vault & <span className="text-gradient">Rotation Hub</span>
          </h2>
          <p className="section-desc">
            Automate KMS key rotation, detect credential leaks in real time, and enforce hardware security module (HSM) zero-trust encryption.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {secrets.map(sec => (
              <div
                key={sec.id}
                style={{
                  background: '#060911',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Key size={18} color="#6366f1" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.name}</div>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {visibleId === sec.id ? sec.rawKey : sec.keyMasked}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Last Rotated: <strong>{sec.lastRotated}</strong>
                  </span>
                  <button onClick={() => setVisibleId(visibleId === sec.id ? null : sec.id)} className="btn btn-secondary btn-sm">
                    {visibleId === sec.id ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => rotateKey(sec.id)} disabled={rotatingId === sec.id} className="btn btn-primary btn-sm">
                    <RefreshCw size={14} className={rotatingId === sec.id ? 'spin' : ''} /> Rotate Secret
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
