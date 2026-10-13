'use client';

import React, { useState } from 'react';
import { sound } from '@/utils/sound';
import { 
  Radar, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Code2,
  Cloud,
  Cpu,
  Lock
} from 'lucide-react';

interface TechItem {
  name: string;
  quadrant: 'languages' | 'infra' | 'realtime' | 'architecture';
  ring: 'ADOPT' | 'TRIAL' | 'ASSESS';
  level: number; // percentage
  productionStory: string;
}

const techItems: TechItem[] = [
  // Languages
  { name: 'Go (Golang)', quadrant: 'languages', ring: 'ADOPT', level: 96, productionStory: 'Architected AetherStream ingestion workers processing 2.1 GB/s without GC pauses.' },
  { name: 'Rust', quadrant: 'languages', ring: 'ADOPT', level: 92, productionStory: 'Built Wasm-accelerated spatial index rendering 100k nodes at 60 FPS in Kiros HyperGrid.' },
  { name: 'TypeScript', quadrant: 'languages', ring: 'ADOPT', level: 98, productionStory: 'Strict compile-time type safety across all frontend apps and Node.js microservices.' },
  { name: 'Python', quadrant: 'languages', ring: 'ADOPT', level: 88, productionStory: 'Built multi-agent DAG execution routers with FastMCP and async task pools.' },
  { name: 'SQL & Relational', quadrant: 'languages', ring: 'ADOPT', level: 94, productionStory: 'Complex distributed query optimization in CockroachDB and ClickHouse analytical marts.' },

  // Infra & Distributed
  { name: 'Apache Kafka', quadrant: 'infra', ring: 'ADOPT', level: 95, productionStory: 'Managed multi-datacenter Kafka clusters with partition balancing and mirror replication.' },
  { name: 'Kubernetes (K8s)', quadrant: 'infra', ring: 'ADOPT', level: 90, productionStory: 'Custom Operators and CRDs for self-healing pod scheduling across bare metal and cloud.' },
  { name: 'Redis (Cluster)', quadrant: 'infra', ring: 'ADOPT', level: 95, productionStory: 'Configured sub-millisecond distributed caching, rate-limiters, and Pub/Sub invalidation.' },
  { name: 'Envoy / Istio Mesh', quadrant: 'infra', ring: 'ADOPT', level: 88, productionStory: 'Configured zero-trust mTLS encryption, circuit breaking, and distributed tracing spans.' },
  { name: 'ClickHouse', quadrant: 'infra', ring: 'ADOPT', level: 90, productionStory: 'Columnar storage storing petabytes of telemetry with sub-second aggregate queries.' },

  // Real-Time & Web
  { name: 'WebAssembly (WASM)', quadrant: 'realtime', ring: 'ADOPT', level: 92, productionStory: 'Zero-copy memory sharing with WebGL canvases for real-time CAD and node graphs.' },
  { name: 'WebGL / WebGPU', quadrant: 'realtime', ring: 'ADOPT', level: 86, productionStory: 'Custom shader pipelines for hardware-accelerated interactive canvas rendering.' },
  { name: 'Next.js & React 19', quadrant: 'realtime', ring: 'ADOPT', level: 98, productionStory: 'Server Components, concurrent rendering, and ultra-fast Edge-cached web platforms.' },
  { name: 'WebSockets & WebRTC', quadrant: 'realtime', ring: 'ADOPT', level: 94, productionStory: 'Sub-16ms bidirectional state sync with CRDT conflict-free resolution.' },

  // Architecture & Security
  { name: 'Raft Consensus', quadrant: 'architecture', ring: 'ADOPT', level: 94, productionStory: 'Implemented custom Raft state machines for distributed leader election and consensus.' },
  { name: 'CQRS & Event Sourcing', quadrant: 'architecture', ring: 'ADOPT', level: 96, productionStory: 'Decoupled write mutation paths from read query projections for 10x throughput scaling.' },
  { name: 'Zero-Knowledge Proofs', quadrant: 'architecture', ring: 'TRIAL', level: 82, productionStory: 'Integrated zk-SNARK proof verification for cryptographic vault transactions.' },
  { name: 'Zero-Trust mTLS', quadrant: 'architecture', ring: 'ADOPT', level: 92, productionStory: 'Mutual cryptographic certificate attestation between every network microservice.' },
];

export default function TechRadar() {
  const [selectedQuadrant, setSelectedQuadrant] = useState<'all' | 'languages' | 'infra' | 'realtime' | 'architecture'>('all');
  const [activeTech, setActiveTech] = useState<TechItem>(techItems[0]);

  const quadrants = [
    { id: 'all', label: 'All Domains', icon: <Radar size={14} /> },
    { id: 'languages', label: 'Languages & Core', icon: <Code2 size={14} /> },
    { id: 'infra', label: 'Cloud & Distributed Infra', icon: <Cloud size={14} /> },
    { id: 'realtime', label: 'Real-Time & Wasm', icon: <Cpu size={14} /> },
    { id: 'architecture', label: 'Consensus & Security', icon: <Lock size={14} /> },
  ];

  const filtered = selectedQuadrant === 'all'
    ? techItems
    : techItems.filter((t) => t.quadrant === selectedQuadrant);

  return (
    <section id="radar" className="section-wrapper">
      <div className="section-header">
        <div className="section-tag">Competency Matrix</div>
        <h2 className="section-title">
          Technology <span className="text-gradient-cyan">Radar & Skills</span>
        </h2>
        <p className="section-desc">
          Battle-tested systems, high-performance runtimes, and engineering frameworks proven in multi-million user production environments.
        </p>
      </div>

      {/* Quadrant Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
        }}
      >
        {quadrants.map((q) => {
          const isActive = selectedQuadrant === q.id;
          return (
            <button
              key={q.id}
              onClick={() => {
                sound.playClick();
                setSelectedQuadrant(q.id as typeof selectedQuadrant);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: isActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid var(--cyan-neon)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 0 15px rgba(0, 240, 255, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {q.icon}
              <span>{q.label}</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Layout: Grid of Tech + Active Detail Dossier */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
        }}
        className="radar-grid-layout"
      >
        {/* Tech Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((tech) => {
            const isSelected = activeTech.name === tech.name;
            return (
              <div
                key={tech.name}
                onClick={() => {
                  sound.playClick();
                  setActiveTech(tech);
                }}
                onMouseEnter={() => sound.playChirp(1100, 0.02)}
                className="glass-panel"
                style={{
                  padding: '1.2rem',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(14, 20, 36, 0.65)',
                  border: isSelected ? '1px solid var(--cyan-neon)' : '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: isSelected ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    {tech.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: tech.ring === 'ADOPT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: tech.ring === 'ADOPT' ? 'var(--emerald-neon)' : 'var(--amber-neon)',
                      border: tech.ring === 'ADOPT' ? '1px solid var(--emerald-neon)' : '1px solid var(--amber-neon)',
                    }}
                  >
                    {tech.ring}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: `${tech.level}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--cyan-neon), var(--violet-neon))',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>MASTERY:</span>
                  <span style={{ color: 'var(--cyan-neon)', fontWeight: 700 }}>{tech.level}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Tech Production Spotlight */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            background: 'rgba(10, 15, 28, 0.9)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={20} color="var(--cyan-neon)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--cyan-neon)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              :: BATTLE-TESTED PRODUCTION DOSSIER
            </span>
          </div>

          <h3
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '0.5rem',
            }}
          >
            {activeTech.name}
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>QUADRANT: </span>
              <span style={{ color: 'var(--violet-neon)', textTransform: 'uppercase' }}>{activeTech.quadrant}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>STATUS: </span>
              <span style={{ color: 'var(--emerald-neon)' }}>{activeTech.ring} (PRODUCTION)</span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              borderRadius: '10px',
              padding: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              PRODUCTION BATTLE STORY & IMPACT:
            </div>
            <p style={{ color: '#fff', fontSize: '0.95rem', lineHeight: 1.65 }}>
              &quot;{activeTech.productionStory}&quot;
            </p>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All systems architected with {activeTech.name} are monitored with continuous profiling, automated load testing, and formal verification where applicable.
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 960px) {
          .radar-grid-layout {
            grid-template-columns: 1.25fr 0.75fr !important;
          }
        }
      `}</style>
    </section>
  );
}
