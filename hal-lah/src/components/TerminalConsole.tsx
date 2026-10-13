'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sound } from '@/utils/sound';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, CornerDownLeft } from 'lucide-react';

interface TerminalConsoleProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

interface CommandLog {
  id: string;
  command: string;
  output: React.ReactNode;
}

export default function TerminalConsole({ isOpen = true, onClose, isEmbedded = false }: TerminalConsoleProps) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [accentColor, setAccentColor] = useState('var(--cyan-neon)');
  const [isMaximized, setIsMaximized] = useState(false);

  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      command: '',
      output: (
        <div>
          <span style={{ color: 'var(--cyan-neon)' }}>Hal::laH Virtual Shell [Version 2.4.0-arm64]</span>
          <br />
          <span style={{ color: 'var(--text-muted)' }}>Type &apos;help&apos; to view available shell commands. Try &apos;benchmark&apos; or &apos;about&apos;.</span>
        </div>
      ),
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    sound.playClick();
    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: React.ReactNode = null;

    switch (mainCmd) {
      case 'help':
        output = (
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>help</strong> - List available terminal commands</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>about</strong> - Display Hal::laH systems engineering dossier</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>skills</strong> - Show core competencies & language proficiencies</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>projects</strong> - List production architectural systems</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>benchmark</strong> - Execute simulated 2.1 GB/s throughput load test</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>curl quote</strong> - Retrieve a system architecture maxim</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>cat resume</strong> - Output structured plain-text dossier</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>contact</strong> - View direct inquiry & PGP channels</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>theme [cyan|violet|emerald|amber]</strong> - Change terminal phosphor color</div>
            <div><strong style={{ color: 'var(--cyan-neon)' }}>clear</strong> - Clear terminal history</div>
          </div>
        );
        break;

      case 'about':
        output = (
          <div style={{ color: '#fff', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--cyan-neon)', fontWeight: 700 }}>Hal::laH — Staff Distributed Systems Architect</span>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Specializing in fault-tolerant distributed consensus (Raft), high-throughput event streaming (Kafka/ClickHouse), WebAssembly acceleration, and symmetrical low-latency architectures.
            </p>
          </div>
        );
        break;

      case 'skills':
        output = (
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <div><span style={{ color: 'var(--cyan-neon)' }}>Languages:</span> Go, Rust, TypeScript, Python, SQL, C++</div>
            <div><span style={{ color: 'var(--violet-neon)' }}>Distributed:</span> Raft, Apache Kafka, ClickHouse, Redis, CockroachDB</div>
            <div><span style={{ color: 'var(--emerald-neon)' }}>Runtimes:</span> WebAssembly, WebGL, Node.js 22, Docker, Kubernetes</div>
            <div><span style={{ color: 'var(--amber-neon)' }}>Reliability:</span> Zero-downtime failover, CQRS, mTLS, zk-SNARKs</div>
          </div>
        );
        break;

      case 'projects':
      case 'repos':
        output = (
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div style={{ color: 'var(--cyan-neon)', fontWeight: 700, marginBottom: '0.4rem' }}>
              PUBLIC REPOSITORIES :: github.com/NejahA (15 Projects)
            </div>
            <div>1. <a href="https://github.com/NejahA/drewit" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-neon)', textDecoration: 'underline' }}>drewit</a> [TypeScript] — Vector Drawing & Interactive Canvas (Live: drewit-three.vercel.app)</div>
            <div>2. <a href="https://github.com/NejahA/iot-control-server" target="_blank" rel="noreferrer" style={{ color: 'var(--violet-neon)', textDecoration: 'underline' }}>iot-control-server</a> [JavaScript] — Real-Time WebSocket Telemetry (Live: iot-control-server.vercel.app)</div>
            <div>3. <a href="https://github.com/NejahA/mediach" target="_blank" rel="noreferrer" style={{ color: 'var(--emerald-neon)', textDecoration: 'underline' }}>mediach</a> [JavaScript] — Streaming Media Dashboard (Live: mediach-fawn.vercel.app)</div>
            <div>4. <a href="https://github.com/NejahA/catcha" target="_blank" rel="noreferrer" style={{ color: 'var(--amber-neon)', textDecoration: 'underline' }}>catcha</a> [HTML/JS] — 60 FPS Interactive Reflex Game (Live: catcha-psi.vercel.app)</div>
            <div>5. <a href="https://github.com/NejahA/nextjs-dashboard" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>nextjs-dashboard</a> [TypeScript] — Next.js Financial Hub (Live: nextjs-dashboard-ten-chi-23.vercel.app)</div>
            <div>6. <a href="https://github.com/NejahA/librepods" target="_blank" rel="noreferrer" style={{ color: '#ec4899', textDecoration: 'underline' }}>librepods</a> [C/Systems] — Open-Source AirPods Bluetooth Driver (AGPL-3.0)</div>
            <div>7. <a href="https://github.com/NejahA/dwight" target="_blank" rel="noreferrer" style={{ color: '#f43f5e', textDecoration: 'underline' }}>dwight</a> [Modern C++] — Low-Level Zero-Copy Computational Core</div>
            <div>8. <a href="https://github.com/NejahA/Rewear-Client" target="_blank" rel="noreferrer" style={{ color: 'var(--emerald-neon)', textDecoration: 'underline' }}>Rewear</a> [JavaScript] — Circular Fashion Marketplace (Live: rewear-client.vercel.app)</div>
            <div>9. <a href="https://github.com/NejahA/Portfolio" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-neon)', textDecoration: 'underline' }}>Portfolio</a> [CSS/JS] — Personal Showcase (Live: portfolio-achref-nejahs-projects.vercel.app)</div>
            <div>10. <a href="https://github.com/NejahA/alif" target="_blank" rel="noreferrer" style={{ color: 'var(--violet-neon)', textDecoration: 'underline' }}>alif</a> [JavaScript] — Core Monorepo Matrix (110+ Modules)</div>
          </div>
        );
        break;

      case 'github':
        output = (
          <div style={{ color: '#fff', lineHeight: 1.6 }}>
            <div style={{ color: 'var(--cyan-neon)', fontWeight: 700 }}>GITHUB PROFILE :: @NejahA</div>
            <div>URL: <a href="https://github.com/NejahA" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-neon)', textDecoration: 'underline' }}>https://github.com/NejahA</a></div>
            <div style={{ color: 'var(--text-secondary)' }}>15 Public Repositories across TypeScript, C++, JavaScript, and Java.</div>
          </div>
        );
        break;

      case 'benchmark':
        output = (
          <div style={{ color: 'var(--emerald-neon)', fontFamily: 'var(--font-mono)' }}>
            <div>[BENCHMARK] Warming up thread pool (16 worker threads)...</div>
            <div>[STREAM] Ingesting 1,000,000 synthetic event records...</div>
            <div style={{ color: '#fff' }}>[PROCESSED] 1,000,000 events in 476ms</div>
            <div style={{ color: 'var(--cyan-neon)' }}>[RESULT] Throughput: 2,100,840 events/sec | P99 Latency: 5.28ms | 0 packet loss</div>
          </div>
        );
        sound.playSuccess();
        break;

      case 'curl':
        if (args[0] === 'quote') {
          const quotes = [
            '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
            '"A distributed system is one in which the failure of a computer you didn\'t even know existed can render your own computer unusable." — Leslie Lamport',
            '"Make it work, make it right, make it fast." — Kent Beck',
          ];
          output = <div style={{ color: 'var(--amber-neon)', fontStyle: 'italic' }}>{quotes[Math.floor(Math.random() * quotes.length)]}</div>;
        } else {
          output = <div style={{ color: '#f43f5e' }}>curl: specify resource (e.g. &apos;curl quote&apos;)</div>;
        }
        break;

      case 'cat':
        if (args[0] === 'resume') {
          output = (
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <div>Hal::laH — Staff Systems Architect | alif@hallah.dev</div>
              <div>Available for elite advisory, principal engineering, and Q4 contracts.</div>
              <div>Download full dossier via the navbar button.</div>
            </div>
          );
        } else {
          output = <div style={{ color: '#f43f5e' }}>cat: file not found. Try &apos;cat resume&apos;.</div>;
        }
        break;

      case 'contact':
        output = (
          <div style={{ color: '#fff', lineHeight: 1.6 }}>
            <div>Direct Email: <span style={{ color: 'var(--cyan-neon)' }}>alif@hallah.dev</span></div>
            <div>GitHub: <span style={{ color: 'var(--violet-neon)' }}>github.com/NejahA</span></div>
            <div>PGP Fingerprint: <span style={{ color: 'var(--emerald-neon)' }}>7F4C 9821 00B1 D3E8 4F92</span></div>
          </div>
        );
        break;

      case 'theme':
        if (args[0] === 'cyan') setAccentColor('var(--cyan-neon)');
        else if (args[0] === 'violet') setAccentColor('var(--violet-neon)');
        else if (args[0] === 'emerald') setAccentColor('var(--emerald-neon)');
        else if (args[0] === 'amber') setAccentColor('var(--amber-neon)');
        output = <div style={{ color: '#fff' }}>Terminal theme set to {args[0] || 'cyan'}.</div>;
        break;

      case 'clear':
        setLogs([]);
        setInputVal('');
        return;

      case 'sudo':
        output = <div style={{ color: '#f43f5e' }}>Permission denied: Hal::laH root kernel access is immutable.</div>;
        break;

      case 'date':
        output = <div style={{ color: '#fff' }}>{new Date().toUTCString()}</div>;
        break;

      case 'echo':
        output = <div style={{ color: '#fff' }}>{args.join(' ')}</div>;
        break;

      default:
        output = (
          <div style={{ color: '#f43f5e' }}>
            Command not recognized: &apos;{trimmed}&apos;. Type &apos;help&apos; for list of commands.
          </div>
        );
    }

    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        command: trimmed,
        output,
      },
    ]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'about', 'skills', 'projects', 'benchmark', 'curl quote', 'cat resume', 'contact', 'clear'];
      const match = commands.find((c) => c.startsWith(inputVal.trim()));
      if (match) {
        setInputVal(match);
      }
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const content = (
    <div
      style={{
        background: '#04060a',
        borderRadius: isEmbedded ? '12px' : '16px',
        border: `1px solid ${accentColor}`,
        boxShadow: isEmbedded ? '0 10px 40px rgba(0, 0, 0, 0.7)' : '0 25px 70px rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        height: isMaximized ? '94vh' : isEmbedded ? '520px' : '560px',
        width: '100%',
        maxWidth: isMaximized ? '96vw' : '840px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Title Bar */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--amber-neon)' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--emerald-neon)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            guest@hallah-core: ~ (zsh)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          {!isEmbedded && onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div
        style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          fontSize: '0.825rem',
        }}
      >
        {logs.map((item) => (
          <div key={item.id}>
            {item.command && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <span style={{ color: accentColor }}>hal@core:~$</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{item.command}</span>
              </div>
            )}
            <div>{item.output}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input Prompt */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          background: 'rgba(0, 0, 0, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ color: accentColor, fontWeight: 700, fontSize: '0.85rem' }}>hal@core:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="type a command... ('help', 'benchmark', 'projects')"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
          }}
        />
        <button
          onClick={() => executeCommand(inputVal)}
          style={{
            background: 'transparent',
            border: 'none',
            color: accentColor,
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <CornerDownLeft size={16} />
        </button>
      </div>
    </div>
  );

  if (isEmbedded) {
    return (
      <section id="terminal" className="section-wrapper">
        <div className="section-header">
          <div className="section-tag">Interactive CLI Emulator</div>
          <h2 className="section-title">
            Embedded <span className="text-gradient-cyan">Developer Terminal</span>
          </h2>
          <p className="section-desc">
            Directly test synthetic benchmarks, read dossier files, and inspect architecture stats via our in-browser command line.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {content}
        </div>
      </section>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {content}
    </div>
  );
}
