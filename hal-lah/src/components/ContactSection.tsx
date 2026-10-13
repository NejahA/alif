'use client';

import React, { useState } from 'react';
import { sound } from '@/utils/sound';
import confetti from 'canvas-confetti';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import GithubIcon from './GithubIcon';

export default function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPgp, setCopiedPgp] = useState(false);
  const [selectedScope, setSelectedScope] = useState('Distributed Systems Advisory');
  const [selectedBudget, setSelectedBudget] = useState('$50k - $150k+');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = () => {
    sound.playSuccess();
    navigator.clipboard.writeText('alif@hallah.dev');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleCopyPgp = () => {
    sound.playSuccess();
    navigator.clipboard.writeText('4A9F 120B C3D4 E5F6 7890 1122 3344 5566 7788 99AA');
    setCopiedPgp(true);
    setTimeout(() => setCopiedPgp(false), 2200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#a855f7', '#10b981', '#f59e0b'],
    });
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-wrapper" style={{ paddingBottom: '7rem' }}>
      <div className="section-header">
        <div className="section-tag">Direct Transmission</div>
        <h2 className="section-title">
          Initiate <span className="text-gradient-cyan">Engagement</span>
        </h2>
        <p className="section-desc">
          Available for staff architecture consulting, high-throughput re-architecting, and elite full-stack builds.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
        }}
        className="contact-layout-grid"
      >
        {/* Left Column: Direct Coordinates & Channels */}
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#fff' }}>
              Direct Transmission Channels
            </h3>

            {/* Email item */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={18} color="var(--cyan-neon)" />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    PRIMARY EMAIL
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                    alif@hallah.dev
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyEmail}
                style={{
                  background: copiedEmail ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: copiedEmail ? '1px solid var(--emerald-neon)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '0.45rem 0.75rem',
                  color: copiedEmail ? 'var(--emerald-neon)' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* PGP Fingerprint */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="var(--emerald-neon)" />
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    ENCRYPTED PGP KEY
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    4A9F 120B C3D4 E5F6 7890
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyPgp}
                style={{
                  background: copiedPgp ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: copiedPgp ? '1px solid var(--emerald-neon)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '0.45rem 0.75rem',
                  color: copiedPgp ? 'var(--emerald-neon)' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                {copiedPgp ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedPgp ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Response SLA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <Clock size={14} color="var(--amber-neon)" />
              <span>Standard Response: &lt; 24h (P1 Incidents: &lt; 4h)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Consultation Transceiver Form */}
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem',
            border: '1px solid rgba(168, 85, 247, 0.25)',
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid var(--emerald-neon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <Check size={30} color="var(--emerald-neon)" />
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.75rem' }}>
                Transmission Received & Authenticated
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>
                Thank you, {name || 'Partner'}. Your inquiry regarding &quot;{selectedScope}&quot; has been logged in Hal::laH telemetry queue. You will receive an encrypted reply shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-secondary"
                style={{ padding: '0.6rem 1.4rem' }}
              >
                Send Another Transmission
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: '#fff' }}>
                Dispatch Contract / Advisory Inquiry
              </h3>

              {/* Engagement Scope Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  ENGAGEMENT SCOPE:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    'Distributed Systems Advisory',
                    'High-Throughput Re-Architecture',
                    'Full-Stack Web App Development',
                    'Performance & Latency Audit',
                  ].map((scope) => {
                    const isSelected = selectedScope === scope;
                    return (
                      <button
                        type="button"
                        key={scope}
                        onClick={() => {
                          sound.playClick();
                          setSelectedScope(scope);
                        }}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: '6px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected ? '1px solid var(--cyan-neon)' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {scope}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name and Email inputs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    YOUR NAME / ORG:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontFamily: 'var(--font-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    DIRECT EMAIL:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@enterprise.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontFamily: 'var(--font-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Message field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  PROJECT CONTEXT & CHALLENGE:
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your architectural requirements, data volumes, or timeline..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.9rem',
                }}
              >
                <Send size={16} />
                <span>Transmit Secure Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .contact-layout-grid {
            grid-template-columns: 0.85fr 1.15fr !important;
          }
        }
      `}</style>
    </section>
  );
}
