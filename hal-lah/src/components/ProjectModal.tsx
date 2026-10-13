'use client';

import React from 'react';
import Image from 'next/image';
import { sound } from '@/utils/sound';
import { 
  X, 
  ExternalLink, 
  Cpu, 
  Layers, 
  CheckCircle, 
  BarChart3, 
  Terminal,
  ShieldAlert
} from 'lucide-react';
import GithubIcon from './GithubIcon';

export interface ProjectData {
  id: string;
  title: string;
  domain: string;
  category: string;
  description: string;
  detailedOverview: string;
  architectureDetails: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  image: string;
  codeSnippet: string;
  githubUrl?: string;
  liveUrl?: string;
}

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: 'rgba(8, 12, 22, 0.98)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.25)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modal-zoom 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--cyan-neon)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              :: SYSTEM SPECIFICATION // {project.category}
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.15rem' }}>
              {project.title}
            </h3>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem',
          }}
        >
          {/* Banner Hero Image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '1.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            {project.metrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--cyan-neon)',
                  }}
                >
                  {m.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.2rem',
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Deep-Dive Overview */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: '#fff',
                marginBottom: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Cpu size={16} color="var(--cyan-neon)" />
              Architectural Overview
            </h4>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              {project.detailedOverview}
            </p>
          </div>

          {/* Architecture Pillars */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: '#fff',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Layers size={16} color="var(--violet-neon)" />
              System Engineering Highlights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {project.architectureDetails.map((detail, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <CheckCircle size={16} color="var(--emerald-neon)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Production Code Blueprint */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: '#fff',
                marginBottom: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Terminal size={16} color="var(--amber-neon)" />
              Core Kernel Implementation Snippet
            </h4>
            <pre
              style={{
                background: '#04060a',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--cyan-neon)',
                overflowX: 'auto',
                lineHeight: 1.6,
              }}
            >
              <code>{project.codeSnippet}</code>
            </pre>
          </div>

          {/* Technology Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.tags.map((t, idx) => (
              <span key={idx} className="code-chip">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '1rem 1.75rem',
            background: 'rgba(0, 0, 0, 0.5)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playClick()}
                className="btn-secondary"
                style={{
                  padding: '0.5rem 1.15rem',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#fff',
                }}
              >
                <GithubIcon size={16} color="var(--cyan-neon)" />
                <span>GitHub Repository</span>
                <ExternalLink size={12} color="var(--text-muted)" />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.playSuccess()}
                className="btn-primary"
                style={{
                  padding: '0.5rem 1.15rem',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <span>Live Deployment</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="btn-secondary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
          >
            Close Dossier
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-zoom {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
