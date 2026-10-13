'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { sound } from '@/utils/sound';
import { 
  Terminal, 
  Cpu, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Wifi, 
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import GithubIcon from './GithubIcon';

interface HeroSectionProps {
  onOpenTerminal: () => void;
}

export default function HeroSection({ onOpenTerminal }: HeroSectionProps) {
  const roles = [
    'Staff Distributed Systems Architect',
    'High-Throughput Streaming Engineer',
    'Real-Time WebGL & Canvas Developer',
    'Fault-Tolerant Consensus Specialist',
  ];

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);

  // Typewriter effect
  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText === currentRole) {
      timer = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
      setTypingSpeed(70);
    } else {
      timer = setTimeout(() => {
        const nextText = isDeleting
          ? currentRole.substring(0, displayText.length - 1)
          : currentRole.substring(0, displayText.length + 1);
        setDisplayText(nextText);
        setTypingSpeed(isDeleting ? 30 : 65);
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles, typingSpeed]);

  return (
    <section id="overview" className="section-wrapper" style={{ paddingTop: '8.5rem', paddingBottom: '4rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
          alignItems: 'center',
        }}
        className="hero-grid"
      >
        {/* Main Content Column */}
        <div>
          {/* Top telemetry & status badge */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="badge-status">
              <span className="badge-pulse" />
              <span>Available for advisory & engineering contracts</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              <Wifi size={12} color="var(--cyan-neon)" />
              <span>Mesh Edge: 12ms P99</span>
            </div>
          </div>

          {/* Symmetrical Brand Title */}
          <div
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--cyan-neon)',
              marginBottom: '0.5rem',
            }}
          >
            :: PALINDROMIC CODE SYMMETRY ::
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
            }}
          >
            I am <span className="text-gradient-cyan">Hal::laH</span>.
            <br />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.8rem, 3.8vw, 3.2rem)',
                display: 'block',
                marginTop: '0.4rem',
                color: '#fff',
                minHeight: '1.3em',
              }}
            >
              {displayText}
              <span
                style={{
                  display: 'inline-block',
                  width: '3px',
                  height: '1em',
                  background: 'var(--cyan-neon)',
                  marginLeft: '4px',
                  verticalAlign: 'middle',
                  animation: 'blink 0.9s infinite',
                }}
              />
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.65,
              marginBottom: '2.25rem',
            }}
          >
            Engineering mission-critical architectures where failure is not an option. Specializing in high-throughput streaming pipelines, distributed Raft consensus clusters, WebAssembly acceleration, and interactive browser experiences that bridge technical rigor with breathtaking aesthetics.
          </p>

          {/* Action Button Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '3.5rem',
            }}
          >
            <a
              href="#lab"
              onClick={() => sound.playClick()}
              className="btn-primary"
            >
              <Cpu size={16} />
              <span>Launch Engineering Lab</span>
              <ArrowRight size={14} />
            </a>

            <a
              href="https://github.com/NejahA"
              target="_blank"
              rel="noreferrer"
              onClick={() => sound.playClick()}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <GithubIcon size={16} color="var(--cyan-neon)" />
              <span>GitHub (@NejahA)</span>
            </a>

            <button
              onClick={() => {
                sound.playClick();
                onOpenTerminal();
              }}
              className="btn-secondary"
            >
              <Terminal size={16} color="var(--cyan-neon)" />
              <span>Open Terminal CLI</span>
            </button>

            <a
              href="#projects"
              onClick={() => sound.playClick()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                padding: '0.75rem 1rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Layers size={14} />
              <span>Repositories (15)</span>
            </a>
          </div>

          {/* Real Production Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1.25rem',
              maxWidth: '740px',
            }}
          >
            {[
              {
                value: '99.999%',
                label: 'Production SLA',
                sub: 'Zero unplanned downtime',
                color: 'var(--cyan-neon)',
              },
              {
                value: '450k+',
                label: 'Peak Concurrency',
                sub: 'Simultaneous live sockets',
                color: 'var(--violet-neon)',
              },
              {
                value: '<12ms',
                label: 'P99 Global Latency',
                sub: 'Edge-cached routing',
                color: 'var(--emerald-neon)',
              },
              {
                value: '14+',
                label: 'Open Source Systems',
                sub: 'Production frameworks',
                color: 'var(--amber-neon)',
              },
            ].map((metric, i) => (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '1.1rem 1.25rem',
                  borderTop: `2px solid ${metric.color}`,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: metric.color,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {metric.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#fff',
                    marginTop: '0.2rem',
                  }}
                >
                  {metric.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.15rem',
                  }}
                >
                  {metric.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Card & Cyber Console */}
        <div className="hero-avatar-card">
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              padding: '1.5rem',
              background: 'rgba(12, 17, 30, 0.75)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Ambient cyber line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--cyan-neon), transparent)',
              }}
            />

            {/* Avatar container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '360px',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Image
                src="/images/avatar.jpg"
                alt="Hal::laH Staff Software Architect"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              {/* Scanline overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(0, 240, 255, 0.05) 51%, transparent 52%)',
                  backgroundSize: '100% 6px',
                  pointerEvents: 'none',
                }}
              />
              {/* Cyber tag badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  padding: '0.5rem 0.85rem',
                  background: 'rgba(5, 7, 12, 0.85)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={14} color="var(--cyan-neon)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  >
                    IDENT: HAL::LAH_CORE
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--emerald-neon)',
                  }}
                >
                  SEC_LEVEL: 0
                </span>
              </div>
            </div>

            {/* Live Telemetry Ticker */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>SYS_RUNTIME: 42,912h</span>
                <span style={{ color: 'var(--cyan-neon)' }}>ACTIVE KERNEL</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>CLUSTER HEALTH</span>
                <span style={{ color: 'var(--emerald-neon)' }}>100% NOMINAL</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>PRIMARY SPECIALTY</span>
                <span style={{ color: 'var(--violet-neon)' }}>DISTRIBUTED CONSENSUS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1.25fr 0.75fr !important;
          }
        }
        @media (max-width: 1023px) {
          .hero-avatar-card {
            max-width: 440px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
