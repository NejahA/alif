'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/utils/sound';
import { 
  Volume2, 
  VolumeX, 
  Terminal, 
  Command, 
  FileDown, 
  Menu, 
  X,
  Radio
} from 'lucide-react';
import GithubIcon from './GithubIcon';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenTerminal: () => void;
}

export default function Navbar({ onOpenCommandPalette, onOpenTerminal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [soundActive, setSoundActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const enabled = sound.toggle();
    setSoundActive(enabled);
  };

  const handleDownloadResume = () => {
    sound.playSuccess();
    const resumeText = `=====================================================
Hal::laH — Principal & Staff Software Architect
Portfolio & Systems Showcase: https://hallah.dev
Contact: alif@hallah.dev
=====================================================

SPECIALIZATIONS:
• Distributed Consensus & Fault-Tolerant Architectures (Raft, Paxos, Event Sourcing)
• High-Throughput Event Streaming (Kafka, ClickHouse, Flink, RabbitMQ)
• Ultra-Low Latency Systems (Go, Rust, Node.js, WebAssembly)
• Modern Interactive Frontend Platforms (Next.js, React 19, WebGL, Canvas)

CORE PRODUCTION METRICS:
• 99.999% Service Availability across multi-cloud regions
• 450k+ Peak Concurrent Connections maintained with sub-12ms P99 latency
• 14+ Open Source Distributed Utilities & Developer Frameworks

FEATURED SYSTEMS ARCHITECTED:
1. AetherStream: Multi-Region Event Streaming & Ingestion (2.1 GB/s peak)
2. Kiros HyperGrid: GPU-Accelerated 3D Collaborative Canvas Engine
3. Synapse-Nexus: Autonomous Multi-Agent Mesh & Distributed Vector Orchestration
4. Vesper Shield: Zero-Knowledge Distributed Vault & Optical Cryptography Engine

=====================================================
Copyright © Hal::laH. All systems nominal.
`;

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Hal_laH_Staff_Architect_Resume.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: scrolled ? '0.75rem 1.5rem' : '1.25rem 2rem',
        background: scrolled ? 'rgba(5, 7, 12, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <a
          href="#overview"
          onClick={() => sound.playClick()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--cyan-neon)',
                letterSpacing: '-0.05em',
              }}
            >
              H:H
            </span>
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              Hal<span style={{ color: 'var(--cyan-neon)' }}>::</span>laH
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Architected In Symmetry
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.5rem',
          }}
          className="desktop-nav"
        >
          {[
            { label: 'Overview', href: '#overview' },
            { label: 'Lab & Sim', href: '#lab' },
            { label: 'Works', href: '#projects' },
            { label: 'Blueprint', href: '#architecture' },
            { label: 'Radar', href: '#radar' },
            { label: 'ROI Calc', href: '#calculator' },
            { label: 'Contact', href: '#contact' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => sound.playClick()}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--cyan-neon)';
                sound.playChirp(1200, 0.03);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Sound Synthesizer Toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundActive ? 'Mute Audio Synthesis' : 'Enable Audio Feedback'}
            style={{
              background: soundActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: soundActive ? '1px solid var(--cyan-neon)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.45rem',
              color: soundActive ? 'var(--cyan-neon)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            {soundActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* GitHub Profile Link */}
          <a
            href="https://github.com/NejahA"
            target="_blank"
            rel="noreferrer"
            onClick={() => sound.playClick()}
            title="NejahA on GitHub (15 Repositories)"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cyan-neon)';
              e.currentTarget.style.color = 'var(--cyan-neon)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            <GithubIcon size={16} />
          </a>

          {/* Quick Terminal Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTerminal();
            }}
            title="Launch Interactive Terminal"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cyan-neon)';
              e.currentTarget.style.color = 'var(--cyan-neon)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <Terminal size={14} color="var(--cyan-neon)" />
            <span className="hide-mobile">Terminal</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCommandPalette();
            }}
            title="Open Command Palette (Ctrl+K)"
            style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              color: '#d8b4fe',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Command size={14} />
            <span className="hide-mobile">Ctrl+K</span>
          </button>

          {/* Download Resume / Dossier */}
          <button
            onClick={handleDownloadResume}
            className="btn-primary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              borderRadius: '8px',
            }}
          >
            <FileDown size={14} />
            <span>Dossier</span>
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-burger-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(9, 13, 22, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {[
            { label: 'Overview', href: '#overview' },
            { label: 'Engineering Lab', href: '#lab' },
            { label: 'Featured Works', href: '#projects' },
            { label: 'Architecture Blueprint', href: '#architecture' },
            { label: 'Tech Radar', href: '#radar' },
            { label: 'ROI Calculator', href: '#calculator' },
            { label: 'Terminal CLI', action: () => onOpenTerminal() },
            { label: 'Contact Hal::laH', href: '#contact' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href || '#'}
              onClick={(e) => {
                if (item.action) {
                  e.preventDefault();
                  item.action();
                }
                setMobileMenuOpen(false);
                sound.playClick();
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-burger-btn {
            display: none !important;
          }
        }
        @media (max-width: 899px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-burger-btn {
            display: block !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
