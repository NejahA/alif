'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { sound } from '@/utils/sound';
import ProjectModal, { ProjectData } from './ProjectModal';
import GithubIcon from './GithubIcon';
import { 
  ArrowUpRight, 
  ExternalLink, 
  Layers, 
  Activity, 
  Shield, 
  Cpu, 
  Sparkles,
  GitBranch,
  Globe2,
  Code2
} from 'lucide-react';

const projects: ProjectData[] = [
  {
    id: 'drewit',
    title: 'drewit — Interactive Vector & Digital Canvas',
    domain: 'Creative Engineering & TypeScript',
    category: 'Creative & Canvas',
    description: 'High-performance interactive vector drawing and sketching canvas built with TypeScript and HTML5 Canvas with real-time stroke smoothing, layer management, and SVG/PNG export.',
    detailedOverview: 'drewit delivers a fluid drawing experience in the browser. Architected in TypeScript with modular tool controllers, quadratic Bezier curve smoothing for high-speed stylus and mouse gestures, and an undo/redo state stack optimized for minimal memory allocation.',
    architectureDetails: [
      'Bespoke canvas rendering loop with adaptive high-DPI retina scaling',
      'Quadratic curve interpolation algorithm for ultra-smooth stroke rendering',
      'Zero-latency layer management and vector shape rasterization',
      'Instant export pipelines generating vectorized SVG and optimized PNG files',
    ],
    metrics: [
      { label: 'Deployment', value: 'Live on Vercel' },
      { label: 'Primary Language', value: 'TypeScript' },
      { label: 'Render Latency', value: '< 2ms' },
      { label: 'License', value: 'MIT' },
    ],
    tags: ['TypeScript', 'HTML5 Canvas', 'SVG', 'Vercel', 'Vector Graphics'],
    image: '/images/projects/kiros.jpg',
    githubUrl: 'https://github.com/NejahA/drewit',
    liveUrl: 'https://drewit-three.vercel.app',
    codeSnippet: `// drewit Vector Stroke Smoother
export class StrokePath {
  points: { x: number; y: number }[] = [];
  renderSmooth(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length - 2; i++) {
      const xc = (this.points[i].x + this.points[i + 1].x) / 2;
      const yc = (this.points[i].y + this.points[i + 1].y) / 2;
      ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
    }
    ctx.stroke();
  }
}`,
  },
  {
    id: 'iot-control-server',
    title: 'iot-control-server — Real-Time WebSocket Telemetry Hub',
    domain: 'IoT & Bidirectional Sockets',
    category: 'Systems & IoT',
    description: 'High-concurrency WebSocket server and telemetry gateway for real-time IoT device fleet control, sensor streaming, and bidirectional remote hardware actuation.',
    detailedOverview: 'Built to bridge connected microcontrollers and browser management dashboards. Implements low-latency WebSocket communication, heartbeat keep-alive monitoring, message broadcast routing, and state caching for connected hardware endpoints.',
    architectureDetails: [
      'Persistent bidirectional WebSocket duplex connections with auto-reconnect fallback',
      'Real-time heartbeat ping/pong keepalive for instantaneous hardware drop detection',
      'Broadcast event multiplexing routing telemetry to multiple synchronized clients',
      'Optimized JSON packet streaming with sub-millisecond dispatch cycles',
    ],
    metrics: [
      { label: 'Deployment', value: 'Live on Vercel' },
      { label: 'Protocol', value: 'WebSockets (ws)' },
      { label: 'Runtime', value: 'Node.js' },
      { label: 'Latency', value: '< 5ms P99' },
    ],
    tags: ['JavaScript', 'Node.js', 'WebSockets', 'IoT Telemetry', 'Vercel'],
    image: '/images/projects/aetherstream.jpg',
    githubUrl: 'https://github.com/NejahA/iot-control-server',
    liveUrl: 'https://iot-control-server.vercel.app',
    codeSnippet: `// IoT WebSocket Broker
wss.on('connection', (ws, req) => {
  const deviceId = req.headers['x-device-id'] || 'device_' + Date.now();
  fleet.register(deviceId, ws);

  ws.on('message', (payload) => {
    const telemetry = JSON.parse(payload.toString());
    fleet.broadcastTelemetry(deviceId, telemetry);
  });
});`,
  },
  {
    id: 'mediach',
    title: 'mediach — Comprehensive Multimedia Platform',
    domain: 'Full-Stack Media Streaming',
    category: 'Live Deployments',
    description: 'All-in-one media consumption, player, and digital content dashboard engineered with responsive UI layouts, streaming controllers, and catalog management.',
    detailedOverview: 'mediach is an all-in-one entertainment and media portal providing instant playback, rich playlist management, catalog categorization, and seamless audio/video streaming controls designed for high responsiveness.',
    architectureDetails: [
      'Adaptive HTML5 audio/video stream controller with customized playback rates',
      'Dynamic catalog grid with client-side fuzzy filtering and category indexing',
      'Persistent player state persisting across navigation events in local storage',
      'Fluid dark mode glassmorphic UI styled for high-end cinematic viewing',
    ],
    metrics: [
      { label: 'Deployment', value: 'Live on Vercel' },
      { label: 'Domain', value: 'Media Hub' },
      { label: 'Architecture', value: 'SPA + Stream' },
      { label: 'Status', value: 'Production' },
    ],
    tags: ['JavaScript', 'HTML5 Audio/Video', 'Vercel', 'Media Player', 'CSS3'],
    image: '/images/projects/synapse.jpg',
    githubUrl: 'https://github.com/NejahA/mediach',
    liveUrl: 'https://mediach-fawn.vercel.app',
    codeSnippet: `// mediach Stream Controller
export function initializeMediaChannel(srcUrl) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const mediaElement = document.getElementById('main-media-stream');
  const source = audioCtx.createMediaElementSource(mediaElement);
  const gainNode = audioCtx.createGain();
  source.connect(gainNode).connect(audioCtx.destination);
  return { audioCtx, gainNode };
}`,
  },
  {
    id: 'catcha',
    title: 'catcha — High-Speed Reflex & Physics Web Game',
    domain: 'Interactive Web Games',
    category: 'Creative & Canvas',
    description: 'Fast-paced interactive browser game testing reaction times and precision clicking, featuring smooth requestAnimationFrame loops, score states, and collision detection.',
    detailedOverview: 'An addictive interactive browser game emphasizing instant responsiveness and smooth animation frame rates. Built with vanilla web technologies, dynamic particle feedback, and high-frequency collision math.',
    architectureDetails: [
      '60 FPS render loop governed by window.requestAnimationFrame',
      'Precision coordinate hit-testing and elastic momentum physics',
      'Dynamic difficulty scaling ramping speed and spawn frequencies',
      'Local high-score persistence and visual multiplier particle bursts',
    ],
    metrics: [
      { label: 'Deployment', value: 'Live on Vercel' },
      { label: 'Frame Rate', value: '60 FPS Smooth' },
      { label: 'Tech', value: 'Vanilla JS / Canvas' },
      { label: 'Bundle', value: '< 20 KB' },
    ],
    tags: ['JavaScript', 'HTML5 Game', 'Vercel', 'Animation', 'Physics Loop'],
    image: '/images/projects/kiros.jpg',
    githubUrl: 'https://github.com/NejahA/catcha',
    liveUrl: 'https://catcha-psi.vercel.app',
    codeSnippet: `// Catcha Physics & Collision Loop
function gameTick(timestamp) {
  const dt = (timestamp - lastFrame) / 1000;
  targets.forEach((target) => {
    target.x += target.vx * dt;
    target.y += target.vy * dt;
    checkBoundary(target);
  });
  renderTargets();
  requestAnimationFrame(gameTick);
}`,
  },
  {
    id: 'nextjs-dashboard',
    title: 'nextjs-dashboard — High-Speed Financial Operations Panel',
    domain: 'Next.js App Router & Server Actions',
    category: 'TypeScript & Next.js',
    description: 'Production financial analytics dashboard built on Next.js App Router, featuring real-time revenue curves, invoice lifecycle management, and server-side authentication.',
    detailedOverview: 'Built to benchmark Next.js App Router performance and server components. Features dynamic streaming data fetching, skeleton loading states, invoice CRUD operations with optimistic UI, and strict TypeScript types.',
    architectureDetails: [
      'Server Components streaming data with React Suspense boundary skeletons',
      'Server Actions handling mutation payloads with Zod schema validation',
      'Postgres database integration via connection pool with parameterized queries',
      'Optimistic mutations providing immediate client response before server write',
    ],
    metrics: [
      { label: 'Deployment', value: 'Live on Vercel' },
      { label: 'Framework', value: 'Next.js App Router' },
      { label: 'Language', value: 'TypeScript' },
      { label: 'Database', value: 'PostgreSQL' },
    ],
    tags: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Server Actions', 'Vercel'],
    image: '/images/projects/aetherstream.jpg',
    githubUrl: 'https://github.com/NejahA/nextjs-dashboard',
    liveUrl: 'https://nextjs-dashboard-ten-chi-23.vercel.app',
    codeSnippet: `// Next.js Server Action with Zod Validation
'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = FormSchema.parse(Object.fromEntries(formData));
  const amountInCents = amount * 100;
  await sql\`INSERT INTO invoices (customer_id, amount, status) VALUES (\${customerId}, \${amountInCents}, \${status})\`;
  revalidatePath('/dashboard/invoices');
}`,
  },
  {
    id: 'librepods',
    title: 'librepods — Open Hardware Driver & Protocol Suite',
    domain: 'Systems Engineering & Bluetooth LE',
    category: 'Systems & IoT',
    description: 'AirPods liberated from Apple’s closed ecosystem — open-source protocol implementation and reverse-engineered Bluetooth driver for cross-platform control on Linux and Android.',
    detailedOverview: 'librepods enables complete control over Apple AirPods devices on open operating systems without relying on proprietary iOS layers. Features reverse-engineered battery telemetry reading, active noise cancellation mode toggling, ear-detection callbacks, and head-tracking orientation data parsing.',
    architectureDetails: [
      'Bluetooth Low Energy (BLE) RFCOMM and L2CAP packet decoder',
      'Battery percentage parsing for individual ear tips and charging case',
      'Noise Cancellation mode switching over Bluetooth proprietary command sequences',
      'Free software under GNU Affero General Public License v3.0 (AGPL-3.0)',
    ],
    metrics: [
      { label: 'License', value: 'AGPL-3.0' },
      { label: 'Domain', value: 'Hardware Driver' },
      { label: 'Protocol', value: 'Bluetooth LE' },
      { label: 'Platform', value: 'Cross-Platform' },
    ],
    tags: ['C / Systems', 'Bluetooth LE', 'Hardware Driver', 'Reverse Engineering', 'Open Source'],
    image: '/images/projects/vesper.jpg',
    githubUrl: 'https://github.com/NejahA/librepods',
    codeSnippet: `// Bluetooth Protocol Command Generator
void send_anc_mode(gatt_connection_t *conn, uint8_t mode) {
    uint8_t payload[7] = { 0x04, 0x00, 0x04, 0x00, 0x0E, mode, 0x00 };
    gatt_write_characteristic(conn, CHAR_APPLE_CONTROL, payload, sizeof(payload));
}`,
  },
  {
    id: 'dwight',
    title: 'dwight — High-Performance Native Systems Engine',
    domain: 'Low-Level Systems & Native Memory',
    category: 'Systems & IoT',
    description: 'High-performance low-level computational core and memory processor developed in modern C++ with zero-copy byte buffers and cache-friendly data structures.',
    detailedOverview: 'Built to achieve bare-metal throughput for compute-intensive tasks. Utilizes modern C++ features, RAII resource management, SIMD vectorization where applicable, and zero heap allocations during hot-path execution loops.',
    architectureDetails: [
      'Modern C++ implementation with strict move semantics and no runtime heap allocs',
      'Cache-aligned memory buffers minimizing L1/L2 data cache misses',
      'Modular algorithmic pipeline with high computational density',
      'Multi-threaded worker pool utilizing atomic synchronization locks',
    ],
    metrics: [
      { label: 'Language', value: 'Modern C++' },
      { label: 'Memory Pattern', value: 'Zero-Copy' },
      { label: 'Performance', value: 'Bare-Metal' },
      { label: 'Compilation', value: 'Native' },
    ],
    tags: ['C++', 'Low-Level Systems', 'Memory Management', 'Algorithms', 'High Performance'],
    image: '/images/projects/vesper.jpg',
    githubUrl: 'https://github.com/NejahA/dwight',
    codeSnippet: `// Modern C++ Memory Ring Buffer
template <typename T, size_t Size>
class CacheAlignedBuffer {
    alignas(64) std::array<T, Size> buffer_;
    std::atomic<size_t> head_{0};
public:
    void push(const T& val) noexcept {
        buffer_[head_.fetch_add(1, std::memory_order_relaxed) % Size] = val;
    }
};`,
  },
  {
    id: 'medior',
    title: 'medior — TypeScript Media Library Organizer',
    domain: 'TypeScript File Processing',
    category: 'TypeScript & Next.js',
    description: 'Robust TypeScript media management and file indexing application engineered for cataloging, metadata extraction, and multi-format processing.',
    detailedOverview: 'medior is engineered to index large local media volumes with speed and safety. Utilizing TypeScript strict type enforcement, reactive component architectures, and background file workers for smooth performance.',
    architectureDetails: [
      'Strict TypeScript type safety across entire data ingestion lifecycle',
      'Asynchronous worker indexing processing thousands of files concurrently',
      'Metadata tagging and rapid full-text search indexing',
      'Modular extensible plugin architecture for format extensions',
    ],
    metrics: [
      { label: 'Language', value: 'TypeScript' },
      { label: 'Architecture', value: 'Multi-Threaded' },
      { label: 'Target', value: 'Media Indexer' },
      { label: 'Type Safety', value: 'Strict 100%' },
    ],
    tags: ['TypeScript', 'Node.js', 'Media Processing', 'Metadata Indexer'],
    image: '/images/projects/synapse.jpg',
    githubUrl: 'https://github.com/NejahA/medior',
    codeSnippet: `// TypeScript Metadata Indexer
export async function indexMediaBatch(files: string[]): Promise<MediaMetadata[]> {
  const results: MediaMetadata[] = [];
  for (const file of files) {
    const meta = await parseFileExif(file);
    results.push({ path: file, ...meta, timestamp: Date.now() });
  }
  return results;
}`,
  },
  {
    id: 'rewear',
    title: 'Rewear — Circular Fashion & Exchange Platform',
    domain: 'Full-Stack E-Commerce',
    category: 'Live Deployments',
    description: 'Sustainable fashion exchange marketplace application promoting circular economy principles with real-time product browsing, cart transactions, and client routing.',
    detailedOverview: 'Built to empower sustainable consumer habits by facilitating peer clothing exchange and circular trade. Includes client interface (Rewear-Client) and backend services for catalog querying, cart state, and user dashboards.',
    architectureDetails: [
      'Modular component structure separating UI state from cart transaction logic',
      'Instant responsive client-side routing and optimistic item reservation',
      'Persistent cart and session storage surviving page reloads',
      'Responsive design adapting across desktop, tablet, and mobile screens',
    ],
    metrics: [
      { label: 'Deployment', value: 'Live on Vercel' },
      { label: 'Domain', value: 'Circular E-Commerce' },
      { label: 'Frontend', value: 'JavaScript / SPA' },
      { label: 'Status', value: 'Live' },
    ],
    tags: ['JavaScript', 'E-Commerce', 'Vercel', 'Circular Economy', 'Full-Stack'],
    image: '/images/projects/aetherstream.jpg',
    githubUrl: 'https://github.com/NejahA/Rewear-Client',
    liveUrl: 'https://rewear-client.vercel.app',
    codeSnippet: `// Rewear Cart Management
export const useCartStore = {
  items: [],
  addItem(product) {
    this.items.push({ ...product, reservedAt: Date.now() });
    localStorage.setItem('rewear_cart', JSON.stringify(this.items));
  }
};`,
  },
  {
    id: 'portfolio',
    title: 'Achref Nejah — Developer Portfolio Showcase',
    domain: 'Personal Creative Portfolio',
    category: 'Live Deployments',
    description: 'Original developer portfolio showcase by Achref Nejah presenting featured projects, technical capabilities, and creative works.',
    detailedOverview: 'The personal portfolio website highlighting full-stack engineering work, modern web interfaces, interactive components, and contact channels.',
    architectureDetails: [
      'Clean semantic layout with bespoke CSS transitions and dark theme styling',
      'Project showcase gallery with live links and repository connections',
      'Mobile-first responsive fluid grid layout',
      'Optimized asset loading and fast initial paint times on Vercel edge',
    ],
    metrics: [
      { label: 'Deployment', value: 'Live on Vercel' },
      { label: 'Author', value: 'Achref Nejah' },
      { label: 'Hosting', value: 'Vercel Edge' },
      { label: 'Domain', value: 'Portfolio' },
    ],
    tags: ['CSS', 'JavaScript', 'Portfolio', 'Vercel', 'Web Design'],
    image: '/images/projects/synapse.jpg',
    githubUrl: 'https://github.com/NejahA/Portfolio',
    liveUrl: 'https://portfolio-achref-nejahs-projects.vercel.app',
    codeSnippet: `// Portfolio Interactive Anchor Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});`,
  },
  {
    id: 'alif-core',
    title: 'alif — Central Engineering Matrix & Monorepo',
    domain: 'Full-Stack Engineering Workspace',
    category: 'TypeScript & Next.js',
    description: 'The central development workspace and repository matrix housing multiple suites, tools, full-stack microservices, and Hal::laH systems.',
    detailedOverview: 'alif acts as the primary engineering repository containing deep full-stack explorations, production assignments, backend services, and next-generation interactive applications.',
    architectureDetails: [
      'Multi-project workspace containing 110+ subdirectories and services',
      'Unified dependency management and shared utilities',
      'Integration hub connecting frontend apps, backend APIs, and algorithms',
      'Active continuous integration and code revision stream',
    ],
    metrics: [
      { label: 'GitHub Repository', value: 'NejahA/alif' },
      { label: 'Scale', value: '110+ Modules' },
      { label: 'Status', value: 'Active Core' },
      { label: 'Language', value: 'JavaScript / TS' },
    ],
    tags: ['JavaScript', 'TypeScript', 'Next.js', 'Monorepo', 'Full-Stack'],
    image: '/images/projects/vesper.jpg',
    githubUrl: 'https://github.com/NejahA/alif',
    codeSnippet: `// alif Central Workspace Configuration
module.exports = {
  projects: ['hal-lah', 'saassy', 'code-canvas', 'iot-control', 'melodix'],
  version: '2.4.0',
  target: 'NejahA/alif'
};`,
  },
];

export default function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Projects');
  const [activeModalProject, setActiveModalProject] = useState<ProjectData | null>(null);

  const categories = [
    'All Projects',
    'Live Deployments',
    'TypeScript & Next.js',
    'Systems & IoT',
    'Creative & Canvas',
  ];

  const filteredProjects = selectedCategory === 'All Projects'
    ? projects
    : selectedCategory === 'Live Deployments'
    ? projects.filter((p) => p.liveUrl !== undefined)
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="section-wrapper">
      <div className="section-header">
        <div className="section-tag">GitHub Engineering Showcase :: @NejahA</div>
        <h2 className="section-title">
          Featured <span className="text-gradient-cyan">Repositories & Works</span>
        </h2>
        <p className="section-desc">
          Official engineering repositories from{' '}
          <a
            href="https://github.com/NejahA"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--cyan-neon)', textDecoration: 'underline', fontWeight: 600 }}
          >
            github.com/NejahA
          </a>
          . Explore production web applications, WebSocket IoT telemetry servers, C++ systems engines, and interactive canvases.
        </p>

        {/* GitHub Direct Link Pill */}
        <div style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
          <a
            href="https://github.com/NejahA"
            target="_blank"
            rel="noreferrer"
            onClick={() => sound.playClick()}
            className="btn-secondary"
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              color: '#fff',
            }}
          >
            <GithubIcon size={16} color="var(--cyan-neon)" />
            <span>Visit @NejahA on GitHub (15 Repositories)</span>
            <ExternalLink size={12} color="var(--text-muted)" />
          </a>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginBottom: '3rem',
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: isActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid var(--cyan-neon)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 0 15px rgba(0, 240, 255, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
        }}
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="glass-panel"
            style={{
              padding: '0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            onClick={() => {
              sound.playClick();
              setActiveModalProject(project);
            }}
            onMouseEnter={() => sound.playChirp(1000, 0.02)}
          >
            {/* Project Image Banner */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '210px',
                overflow: 'hidden',
              }}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                className="project-cover-img"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(5, 7, 12, 0.95) 100%)',
                }}
              />
              
              {/* Badges on banner */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'flex',
                  gap: '0.4rem',
                }}
              >
                <div
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(5, 7, 12, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: 'var(--cyan-neon)',
                    fontWeight: 600,
                  }}
                >
                  {project.category}
                </div>

                {project.liveUrl && (
                  <div
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid var(--emerald-neon)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: 'var(--emerald-neon)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span className="badge-pulse" style={{ width: '5px', height: '5px' }} />
                    <span>Live</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.35rem',
                }}
              >
                {project.domain}
              </div>

              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '0.75rem',
                  lineHeight: 1.3,
                }}
              >
                {project.title}
              </h3>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                  flex: 1,
                }}
              >
                {project.description}
              </p>

              {/* Quick Metrics Strip */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0, 0, 0, 0.45)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '1.25rem',
                }}
              >
                {project.metrics.slice(0, 2).map((m, idx) => (
                  <div key={idx}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan-neon)' }}>
                      {m.value}
                    </div>
                    <div style={{ fontFamily: 'var(--font-main)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags & Action trigger */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '1rem',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {project.tags.slice(0, 2).map((t, idx) => (
                    <span key={idx} className="code-chip">
                      {t}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {project.githubUrl && (
                    <span
                      title="View GitHub Repository"
                      style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}
                    >
                      <GithubIcon size={16} />
                    </span>
                  )}
                  {project.liveUrl && (
                    <span
                      title="Live Deployment on Vercel"
                      style={{ color: 'var(--emerald-neon)', display: 'inline-flex' }}
                    >
                      <Globe2 size={16} />
                    </span>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--cyan-neon)',
                      fontWeight: 600,
                    }}
                  >
                    <span>Spec</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal Component */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />

      <style jsx>{`
        .project-cover-img:hover {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}
