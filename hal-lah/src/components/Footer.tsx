'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/utils/sound';
import { ArrowUp, Heart, Shield, Radio, Terminal } from 'lucide-react';

export default function Footer() {
  const [utcTime, setUtcTime] = useState<string>('');
  const [year, setYear] = useState<string>('2026');

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
    const updateTime = () => {
      setUtcTime(new Date().toUTCString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(3, 5, 10, 0.95)',
        position: 'relative',
        zIndex: 2,
        padding: '3.5rem 1.5rem 2rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: 'var(--cyan-neon)',
                fontSize: '0.85rem',
              }}
            >
              H:H
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Hal<span style={{ color: 'var(--cyan-neon)' }}>::</span>laH
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                ARCHITECTED IN SYMMETRY // ZERO COMPROMISE
              </div>
            </div>
          </div>

          {/* World Clock Telemetry */}
          <div
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Radio size={12} color="var(--emerald-neon)" />
            <span>UTC SYNC: {utcTime || 'SYNCHRONIZING...'}</span>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              borderRadius: '8px',
            }}
          >
            <ArrowUp size={14} />
            <span>Apex Top</span>
          </button>
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {year} Hal::laH. Handcrafted with Next.js 16, React 19 & Vanilla CSS.
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>CLUSTER: GLOBAL-MESH</span>
            <span style={{ color: 'var(--emerald-neon)' }}>STATUS: NOMINAL</span>
            <span>BUILD: REV-84</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
