'use client';

import React, { useState } from 'react';
import { sound } from '@/utils/sound';
import { 
  Compass, 
  Globe2, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Database, 
  Workflow, 
  Radio, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface ArchitectureNode {
  id: string;
  name: string;
  category: string;
  latencyBudget: string;
  sla: string;
  tech: string[];
  description: string;
  failoverProtocol: string;
}

const blueprintNodes: ArchitectureNode[] = [
  {
    id: 'edge',
    name: '1. Anycast Global Edge & DDoS Shield',
    category: 'Edge Layer',
    latencyBudget: '1.2ms',
    sla: '100% Edge SLA',
    tech: ['Anycast BGP', 'Cloudflare Workers', 'TLS 1.3 0-RTT', 'Geo-Routing'],
    description: 'Terminates client TLS handshakes within 1.2ms at nearest Point of Presence (PoP). Filters Layer 3/4 and Layer 7 malicious volumetric attacks before traffic touches origin VPCs.',
    failoverProtocol: 'Autonomous BGP route withdrawal if edge cluster health checks fail within 250ms.',
  },
  {
    id: 'mesh',
    name: '2. Envoy Service Mesh & mTLS Ingress',
    category: 'Ingress & Mesh',
    latencyBudget: '2.4ms',
    sla: '99.999% Availability',
    tech: ['Envoy Proxy', 'Istio Mesh', 'mTLS Cryptography', 'Distributed Tracing'],
    description: 'Enforces zero-trust cryptographic mutual TLS between microservices. Applies token-bucket rate limiting and circuit breaking to prevent cascading network failures.',
    failoverProtocol: 'Outlier detection triggers automatic ejection of degraded upstream pods within 3 consecutive 5xx errors.',
  },
  {
    id: 'services',
    name: '3. High-Throughput Microservice Fabric',
    category: 'Compute Core',
    latencyBudget: '6.5ms',
    sla: '99.995% SLA',
    tech: ['Go (Golang)', 'Rust (tokio)', 'Node.js 22', 'gRPC Protobuf'],
    description: 'Stateless execution pods running compiled Go and Rust binaries. Inter-service RPCs communicate over binary Protobuf with zero JSON serialization overhead.',
    failoverProtocol: 'Horizontal Pod Autoscalers trigger sub-second spin-up upon CPU saturation > 65%.',
  },
  {
    id: 'eventmesh',
    name: '4. Kafka Event Mesh & CQRS Backbone',
    category: 'Asynchronous Stream',
    latencyBudget: '4.8ms',
    sla: 'Zero Data Loss Guarantee',
    tech: ['Apache Kafka', 'MirrorMaker 2', 'Apache Flink', 'Protobuf Schema'],
    description: 'Partitioned event streaming bus guaranteeing strictly ordered, exactly-once delivery semantics for state mutations, audit logs, and analytical streams.',
    failoverProtocol: 'Partition leader re-election mediated by KRaft quorum within < 300ms of broker heartbeat loss.',
  },
  {
    id: 'cache',
    name: '5. Multi-Tier Redis Cache & Invalidation Bus',
    category: 'In-Memory Acceleration',
    latencyBudget: '0.8ms',
    sla: '99.999% SLA',
    tech: ['Redis Cluster', 'Local LRU Ring', 'Pub/Sub Invalidation', 'RESP3'],
    description: 'Dual-tiered caching layer. Local in-process L1 memory caches hot reads, while distributed Redis clusters hold warm query projections synchronized via Pub/Sub.',
    failoverProtocol: 'Redis Sentinel failover triggers master-replica role inversion in under 800ms.',
  },
  {
    id: 'database',
    name: '6. Multi-Region Distributed CockroachDB',
    category: 'Persistent Storage',
    latencyBudget: '14.2ms',
    sla: '99.999% ACID Durability',
    tech: ['CockroachDB', 'Raft Consensus', 'ClickHouse', 'PostgreSQL Dialect'],
    description: 'Geo-partitioned distributed SQL storage with serializable ACID isolation. Data ranges are replicated across 3 continents with local write quorums.',
    failoverProtocol: 'Range-level leaseholder transfer maintains zero downtime even through full data-center blackout.',
  },
];

export default function ArchitectureBlueprint() {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(blueprintNodes[0]);

  return (
    <section id="architecture" className="section-wrapper">
      <div className="section-header">
        <div className="section-tag">System Design Topology</div>
        <h2 className="section-title">
          Distributed <span className="text-gradient-cyan">Architecture Blueprint</span>
        </h2>
        <p className="section-desc">
          Click any architectural tier below to inspect latency budget allocation, failover protocols, and technology choices designed for high availability.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
        }}
        className="blueprint-layout"
      >
        {/* Visual Pipeline Strip */}
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            border: '1px solid rgba(0, 240, 255, 0.2)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--cyan-neon)',
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            END-TO-END SYSTEM REQUEST LIFECYCLE (P99 BUDGET: &lt; 29.9ms TOTAL)
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {blueprintNodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedNode(node);
                  }}
                  onMouseEnter={() => sound.playChirp(900, 0.02)}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid var(--cyan-neon)' : '1px solid rgba(255, 255, 255, 0.07)',
                    boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: isSelected ? 'var(--cyan-neon)' : 'var(--text-muted)',
                      }}
                    >
                      {node.category}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--emerald-neon)',
                        fontWeight: 700,
                      }}
                    >
                      {node.latencyBudget}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      lineHeight: 1.3,
                    }}
                  >
                    {node.name.split('. ')[1]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Tier Deep-Dive Card */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            background: 'rgba(12, 17, 30, 0.85)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--violet-neon)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                :: TIER ARCHITECTURE INSPECTOR // {selectedNode.category}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {selectedNode.name}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="badge-status">
                <span className="badge-pulse" />
                <span>{selectedNode.sla}</span>
              </div>
              <div
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--cyan-neon)',
                  fontWeight: 700,
                }}
              >
                LATENCY BUDGET: {selectedNode.latencyBudget}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="blueprint-detail-grid">
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} color="var(--cyan-neon)" />
                Core Topology & Protocol
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {selectedNode.description}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--emerald-neon)" />
                Fault Tolerance & High-Availability Failover
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {selectedNode.failoverProtocol}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.65rem' }}>
                Production Technologies Deployed:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedNode.tech.map((t, idx) => (
                  <span key={idx} className="code-chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          .blueprint-detail-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
