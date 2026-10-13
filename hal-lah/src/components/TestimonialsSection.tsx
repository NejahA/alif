'use client';

import React from 'react';
import { sound } from '@/utils/sound';
import { Quote, ShieldCheck, Star } from 'lucide-react';

const reviews = [
  {
    name: 'Dr. Elena Rostova',
    role: 'VP of Distributed Infrastructure',
    company: 'FinScale Cloud Core',
    text: 'Hal::laH re-architected our transaction ingest engine in Go and Kafka. We went from dropping packets at 800k events/sec to effortlessly sustaining 2.1 GB/s peak throughput with sub-6ms latency. His understanding of lock-free memory and Raft consensus is second to none.',
    impact: 'Saved $340k/yr in AWS compute + zero dropped transactions',
  },
  {
    name: 'Marcus Vance',
    role: 'Principal Systems Architect',
    company: 'VoxelMatrix Labs',
    text: 'The Wasm/WebGL canvas pipeline Hal::laH engineered for us was pure technical wizardry. Rendering 100,000+ interactive vector nodes at 60 FPS in a web browser without breaking a sweat. Three senior agencies claimed it was technically impossible.',
    impact: '60 FPS sustained on mobile + 98% memory reduction',
  },
  {
    name: 'Kaelen Chen',
    role: 'Founder & Chief Technology Officer',
    company: 'Synapse Systems Inc.',
    text: 'Hal::laH possesses a rare engineering duality: he can design low-level distributed consensus protocols and zero-knowledge cryptographic vaults, yet build user interfaces so responsive and breathtaking they set the design benchmark for our entire industry.',
    impact: '4,000+ concurrent agents orchestrated in production',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section-wrapper" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div className="section-header">
        <div className="section-tag">Peer Endorsements</div>
        <h2 className="section-title">
          Engineering <span className="text-gradient-cyan">Battle Reviews</span>
        </h2>
        <p className="section-desc">
          Verified production reviews from engineering leaders, CTOs, and principal architects who deployed Hal::laH systems.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            onMouseEnter={() => sound.playChirp(1200, 0.015)}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="var(--amber-neon)" color="var(--amber-neon)" />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--emerald-neon)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <ShieldCheck size={14} />
                  <span>VERIFIED PROD</span>
                </div>
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.925rem',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  marginBottom: '1.5rem',
                }}
              >
                &quot;{rev.text}&quot;
              </p>
            </div>

            <div>
              {/* Impact Callout */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--cyan-neon)',
                  marginBottom: '1.25rem',
                }}
              >
                IMPACT: {rev.impact}
              </div>

              {/* Author */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                  {rev.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {rev.role} — <span style={{ color: 'var(--text-secondary)' }}>{rev.company}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
