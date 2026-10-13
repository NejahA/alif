'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Sarah Chen',
      role: 'VP of Engineering at FinPulse',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'Saassy cut our microservice latency by 68% within the first 48 hours. The autonomous AI error recovery saved us over 120 engineering hours last month alone.',
      metric: '68% Latency Reduction',
    },
    {
      name: 'Marcus Vance',
      role: 'CTO at CloudShift AI',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'The Next.js integration and edge proxy routing are flawless. We deployed our full multi-region pipeline in less than 30 minutes. Absolute game changer.',
      metric: '30-Min Setup Time',
    },
    {
      name: 'Elena Rostova',
      role: 'Lead Architect at DataNexus',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: 'Zero-trust security combined with instantaneous edge function distribution makes Saassy our mandatory foundation for all new SaaS ventures.',
      metric: '100% Security Audit Pass',
    },
  ];

  return (
    <section id="testimonials" className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Star size={14} style={{ color: 'var(--accent-amber)', fill: 'var(--accent-amber)' }} />
            <span>Loved by High-Growth Teams</span>
          </div>
          <h2 className="section-title">Trusted by Modern Engineering Leaders</h2>
          <p className="section-desc">
            Discover how forward-thinking developers power their core application logic with Saassy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
          {reviews.map((rev, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>
                  "{rev.content}"
                </p>
              </div>

              <div>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'inline-block', fontSize: '0.825rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px' }}>
                  ⚡ {rev.metric}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={rev.avatar} 
                    alt={rev.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glow)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{rev.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.role}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
