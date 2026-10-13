'use client';

import React, { useState } from 'react';
import { Send, ShieldCheck, CheckCircle2, Copy, Check, Radio, Loader2, Key } from 'lucide-react';

export default function WebhookTester() {
  const [eventType, setEventType] = useState('user.signup');
  const [targetUrl, setTargetUrl] = useState('https://api.company.com/v1/saassy-hook');
  const [loading, setLoading] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const eventOptions = [
    { value: 'user.signup', label: 'User Signed Up' },
    { value: 'payment.succeeded', label: 'Payment Succeeded' },
    { value: 'deployment.completed', label: 'Deployment Completed' },
    { value: 'alert.triggered', label: 'Security Alert Triggered' },
  ];

  const handleSendWebhook = async () => {
    setLoading(true);
    setDeliveryResult(null);

    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, targetUrl }),
      });
      const data = await res.json();
      setDeliveryResult(data);
    } catch (err) {
      setDeliveryResult({ success: false, error: 'Webhook dispatch failed.' });
    } finally {
      setLoading(false);
    }
  };

  const copyPayload = () => {
    if (deliveryResult) {
      navigator.clipboard.writeText(JSON.stringify(deliveryResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="webhooks" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Radio size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Event-Driven Webhook Sandbox</span>
          </div>
          <h2 className="section-title">Live Webhook Dispatch & Verification</h2>
          <p className="section-desc">
            Test outbound webhook payloads and inspect HMAC-SHA256 signatures in real-time.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Select Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                {eventOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Target Endpoint URL
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://api.company.com/webhook"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

          </div>

          <button onClick={handleSendWebhook} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '24px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            {loading ? 'Dispatching Payload...' : 'Dispatch Test Webhook Event'}
          </button>

          {/* Webhook Response Inspector */}
          <div className="terminal-box">
            <div className="terminal-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={14} style={{ color: 'var(--accent-amber)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Delivery Log Inspector
                </span>
              </div>

              {deliveryResult && (
                <button onClick={copyPayload} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div className="terminal-body" style={{ minHeight: '160px', whiteSpace: 'pre-wrap', fontSize: '0.825rem' }}>
              {!loading && !deliveryResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Click "Dispatch Test Webhook Event" to view delivery signature and payload.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Connecting to {targetUrl}...
                </span>
              )}

              {!loading && deliveryResult && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ 200 OK — Delivery ID: {deliveryResult.deliveryId} ({deliveryResult.responseTimeMs}ms)
                  </div>
                  <code>{JSON.stringify(deliveryResult, null, 2)}</code>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
