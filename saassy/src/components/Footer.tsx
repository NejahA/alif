'use client';

import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ success: true, message: data.message });
        setEmail('');
      } else {
        setStatus({ success: false, message: data.error });
      }
    } catch (err) {
      setStatus({ success: false, message: 'Subscription failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{ background: '#060911', borderTop: '1px solid var(--border-color)', paddingTop: '60px', paddingBottom: '40px' }}>
      <div className="container">
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          
          {/* Brand Col */}
          <div>
            <a href="#" className="logo" style={{ marginBottom: '16px', display: 'inline-flex' }}>
              <div className="logo-badge">
                <Sparkles size={20} />
              </div>
              <span>Saassy<span style={{ color: 'var(--accent-primary)' }}>.ai</span></span>
            </a>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Next-generation autonomous AI pipeline compiler and edge cloud infrastructure for ambitious engineering teams.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
              <span className="badge-dot"></span> All Systems Operational
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Product</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><a href="#features" className="nav-link">AI Workflows</a></li>
              <li><a href="#demo" className="nav-link">Live Playground</a></li>
              <li><a href="#pricing" className="nav-link">Enterprise Tier</a></li>
              <li><a href="#" className="nav-link">Edge CDN Proxy</a></li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Resources</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><a href="#" className="nav-link">Documentation</a></li>
              <li><a href="#" className="nav-link">API Reference</a></li>
              <li><a href="#" className="nav-link">GitHub Repository</a></li>
              <li><a href="#" className="nav-link">Status Page</a></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Subscribe to Updates</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Receive early access releases, architecture blueprints, and product changelogs.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
                <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                  {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                </button>
              </div>

              {status && (
                <div style={{ fontSize: '0.8rem', color: status.success ? 'var(--accent-emerald)' : '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {status.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {status.message}
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>© {new Date().getFullYear()} Saassy Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" className="nav-link">Privacy Policy</a>
            <a href="#" className="nav-link">Terms of Service</a>
            <a href="#" className="nav-link">Security Audit</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
