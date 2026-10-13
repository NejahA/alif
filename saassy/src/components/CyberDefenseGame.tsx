'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Cpu, Zap, Lock, Play, Pause, RotateCcw, Award, AlertTriangle, Activity, Terminal, Crosshair } from 'lucide-react';

interface Threat {
  id: string;
  type: 'ddos' | 'sql' | 'prompt' | 'zeroday';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  pathIndex: number;
  label: string;
}

interface AgentDefender {
  id: string;
  type: 'waf' | 'llm_guard' | 'zero_trust' | 'quantum';
  gridX: number;
  gridY: number;
  range: number;
  damage: number;
  fireRate: number; // in ms
  lastFired: number;
  name: string;
  icon: string;
  color: string;
  level: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface LaserBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  alpha: number;
}

export default function CyberDefenseGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wave, setWave] = useState(1);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [health, setHealth] = useState(100);
  const [credits, setCredits] = useState(400);
  const [score, setScore] = useState(0);
  const [selectedAgentType, setSelectedAgentType] = useState<'waf' | 'llm_guard' | 'zero_trust' | 'quantum'>('waf');
  const [agents, setAgents] = useState<AgentDefender[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [logs, setLogs] = useState<string[]>([
    'SYSTEM READY: Deploy AI Defender Agents to protect Core API Mesh.'
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const threatsRef = useRef<Threat[]>([]);
  const agentsRef = useRef<AgentDefender[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lasersRef = useRef<LaserBeam[]>([]);

  // Keep refs in sync with state for requestAnimationFrame
  threatsRef.current = threats;
  agentsRef.current = agents;

  const PATH = [
    { x: 50, y: 120 },
    { x: 220, y: 120 },
    { x: 220, y: 280 },
    { x: 450, y: 280 },
    { x: 450, y: 140 },
    { x: 680, y: 140 },
    { x: 680, y: 320 },
    { x: 850, y: 320 }
  ];

  const CORE_POS = { x: 850, y: 320 };

  const AGENT_CONFIGS = {
    waf: { name: 'WAF Firewall', cost: 100, range: 110, damage: 12, fireRate: 350, color: '#06b6d4', icon: '🛡️' },
    llm_guard: { name: 'LLM Guardrail', cost: 150, range: 130, damage: 22, fireRate: 600, color: '#a855f7', icon: '🧠' },
    zero_trust: { name: 'Zero-Trust Gate', cost: 200, range: 160, damage: 45, fireRate: 1000, color: '#6366f1', icon: '🔒' },
    quantum: { name: 'Quantum Shield', cost: 250, range: 140, damage: 18, fireRate: 400, color: '#10b981', icon: '⚡' }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev.slice(0, 4)]);
  };

  const startWave = () => {
    if (waveInProgress || isGameOver) return;
    setWaveInProgress(true);
    addLog(`⚠️ WAVE ${wave} INITIATED: incoming cyber threats detected!`);

    const newThreats: Threat[] = [];
    const count = 5 + wave * 4;

    for (let i = 0; i < count; i++) {
      const types: ('ddos' | 'sql' | 'prompt' | 'zeroday')[] = ['ddos', 'sql', 'prompt', 'zeroday'];
      const type = types[Math.floor(Math.random() * Math.min(types.length, 1 + Math.floor(wave / 2)))];

      let speed = 1.2;
      let hp = 60 + wave * 25;
      let reward = 25;
      let label = 'DDoS Bot';

      if (type === 'sql') { speed = 1.5; hp = 45 + wave * 20; reward = 35; label = 'SQL Injection'; }
      if (type === 'prompt') { speed = 1.0; hp = 90 + wave * 30; reward = 50; label = 'Prompt Hijack'; }
      if (type === 'zeroday') { speed = 0.8; hp = 160 + wave * 45; reward = 80; label = 'Zero-Day Exploit'; }

      // Stagger spawn along path x
      newThreats.push({
        id: `threat-${wave}-${i}-${Math.random()}`,
        type,
        x: PATH[0].x - (i * 60),
        y: PATH[0].y,
        hp,
        maxHp: hp,
        speed,
        reward,
        pathIndex: 0,
        label
      });
    }

    setThreats(newThreats);
    setIsPlaying(true);
  };

  // Main game loop
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Move threats
      setThreats(prevThreats => {
        const nextThreats: Threat[] = [];
        let damageToCore = 0;

        for (const threat of prevThreats) {
          if (threat.hp <= 0) {
            // Threat killed
            setCredits(c => c + threat.reward);
            setScore(s => s + threat.reward * 10);
            createExplosion(threat.x, threat.y, '#f59e0b');
            continue;
          }

          const targetPoint = PATH[threat.pathIndex + 1];
          if (!targetPoint) {
            // Reached core
            damageToCore += 15;
            createExplosion(threat.x, threat.y, '#ef4444');
            continue;
          }

          const dx = targetPoint.x - threat.x;
          const dy = targetPoint.y - threat.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 4) {
            threat.pathIndex += 1;
          } else {
            threat.x += (dx / dist) * threat.speed * 60 * dt;
            threat.y += (dy / dist) * threat.speed * 60 * dt;
          }

          nextThreats.push(threat);
        }

        if (damageToCore > 0) {
          setHealth(h => {
            const nh = Math.max(0, h - damageToCore);
            if (nh === 0) {
              setIsGameOver(true);
              setIsPlaying(false);
              addLog('💥 CRITICAL FAILURE: Core Microservices compromised!');
            }
            return nh;
          });
        }

        // Check wave finish
        if (nextThreats.length === 0 && waveInProgress) {
          setWaveInProgress(false);
          setWave(w => w + 1);
          setCredits(c => c + 150); // Bonus credits per wave
          addLog(`✅ WAVE ${wave} DEFENDED! +150 Credit Bonus awarded.`);
        }

        return nextThreats;
      });

      // Agents target & shoot threats
      const currentThreats = threatsRef.current;
      const currentAgents = agentsRef.current;
      const nowMs = performance.now();

      currentAgents.forEach(agent => {
        if (nowMs - agent.lastFired >= agent.fireRate) {
          // Find closest threat in range
          let closest: Threat | null = null;
          let minDist = agent.range;

          currentThreats.forEach(threat => {
            if (threat.x < 0) return;
            const dist = Math.sqrt(Math.pow(threat.x - agent.gridX, 2) + Math.pow(threat.y - agent.gridY, 2));
            if (dist < minDist) {
              minDist = dist;
              closest = threat;
            }
          });

          if (closest) {
            agent.lastFired = nowMs;
            const targetId = (closest as Threat).id;

            // Fire laser
            lasersRef.current.push({
              startX: agent.gridX,
              startY: agent.gridY,
              endX: (closest as Threat).x,
              endY: (closest as Threat).y,
              color: agent.color,
              alpha: 1.0
            });

            // Apply damage to threat
            setThreats(prev => prev.map(t => {
              if (t.id === targetId) {
                return { ...t, hp: t.hp - agent.damage };
              }
                return t;
            }));
          }
        }
      });

      // Draw canvas
      drawCanvas();

      animFrameId.current = requestAnimationFrame(gameLoop);
    };

    animFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, wave, waveInProgress]);

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1.0,
        size: Math.random() * 4 + 2
      });
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Background
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.07)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Path Line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    PATH.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.lineWidth = 3;
    PATH.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw Core Node
    ctx.beginPath();
    ctx.arc(CORE_POS.x, CORE_POS.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = health > 30 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(239, 68, 68, 0.35)';
    ctx.fill();
    ctx.strokeStyle = health > 30 ? '#6366f1' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CORE AI', CORE_POS.x, CORE_POS.y + 4);

    // Draw Lasers
    lasersRef.current.forEach((laser, idx) => {
      ctx.beginPath();
      ctx.moveTo(laser.startX, laser.startY);
      ctx.lineTo(laser.endX, laser.endY);
      ctx.strokeStyle = laser.color;
      ctx.globalAlpha = laser.alpha;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      laser.alpha -= 0.15;
    });
    lasersRef.current = lasersRef.current.filter(l => l.alpha > 0);

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
    });
    particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

    // Draw Agents
    agentsRef.current.forEach(agent => {
      // Range Ring
      ctx.beginPath();
      ctx.arc(agent.gridX, agent.gridY, agent.range, 0, Math.PI * 2);
      ctx.strokeStyle = `${agent.color}33`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Agent body
      ctx.beginPath();
      ctx.arc(agent.gridX, agent.gridY, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(agent.icon, agent.gridX, agent.gridY + 5);
    });

    // Draw Threats
    threatsRef.current.forEach(threat => {
      if (threat.x < 0) return;

      // Health bar background
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(threat.x - 16, threat.y - 20, 32, 5);

      // Health bar fill
      const hpRatio = Math.max(0, threat.hp / threat.maxHp);
      ctx.fillStyle = hpRatio > 0.5 ? '#10b981' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(threat.x - 16, threat.y - 20, 32 * hpRatio, 5);

      // Threat Icon / Shape
      ctx.beginPath();
      ctx.arc(threat.x, threat.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = threat.type === 'zeroday' ? '#ef4444' : threat.type === 'prompt' ? '#a855f7' : '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const config = AGENT_CONFIGS[selectedAgentType];

    if (credits < config.cost) {
      addLog(`❌ Insufficient credits! Need ${config.cost} Credits.`);
      return;
    }

    // Ensure not placing directly on path or too close to existing agent
    const tooCloseToAgent = agents.some(a => Math.hypot(a.gridX - x, a.gridY - y) < 30);
    if (tooCloseToAgent) {
      addLog('⚠️ Node slot occupied.');
      return;
    }

    const newAgent: AgentDefender = {
      id: `agent-${Date.now()}`,
      type: selectedAgentType,
      gridX: x,
      gridY: y,
      range: config.range,
      damage: config.damage,
      fireRate: config.fireRate,
      lastFired: 0,
      name: config.name,
      icon: config.icon,
      color: config.color,
      level: 1
    };

    setAgents(prev => [...prev, newAgent]);
    setCredits(c => c - config.cost);
    addLog(`🛡️ Deployed ${config.name} at node [${Math.round(x)}, ${Math.round(y)}]`);

    // Trigger canvas draw
    setTimeout(drawCanvas, 50);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setIsGameOver(false);
    setWave(1);
    setWaveInProgress(false);
    setHealth(100);
    setCredits(400);
    setScore(0);
    setAgents([]);
    setThreats([]);
    lasersRef.current = [];
    particlesRef.current = [];
    addLog('🔄 System reset. Ready for deployment.');
    setTimeout(drawCanvas, 100);
  };

  useEffect(() => {
    drawCanvas();
  }, []);

  return (
    <section id="defense-game" className="section" style={{ background: 'rgba(9, 13, 22, 0.95)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Crosshair size={16} />
            <span>Interactive Arcade Mini-Game</span>
          </div>
          <h2 className="section-title">
            Agent Cyber <span className="text-gradient">Defense Arena</span>
          </h2>
          <p className="section-desc">
            Test your AI security strategy! Deploy autonomous AI guard agents to defend core microservice endpoints against real-time DDoS waves, SQL injections, and prompt exploits.
          </p>
        </div>

        {/* Main Game Interface Glass Box */}
        <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
          {/* Top Control Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#ef4444" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Core Health:</span>
                <span style={{ fontWeight: 800, color: health > 30 ? '#10b981' : '#ef4444' }}>{health}%</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#f59e0b" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Credits:</span>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>{credits} CR</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#a855f7" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Score:</span>
                <span style={{ fontWeight: 800, color: '#a855f7' }}>{score}</span>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#06b6d4" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Wave:</span>
                <span style={{ fontWeight: 800, color: '#06b6d4' }}>#{wave}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={startWave} 
                disabled={waveInProgress || isGameOver}
                className="btn btn-primary"
                style={{ opacity: waveInProgress || isGameOver ? 0.5 : 1 }}
              >
                <Play size={16} /> {waveInProgress ? 'Threat Wave Active...' : `Start Wave ${wave}`}
              </button>
              <button onClick={resetGame} className="btn btn-secondary">
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>

          {/* Main Layout Grid: Canvas + Sidebar Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
            {/* Canvas Container */}
            <div style={{ position: 'relative', background: '#060911', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                width={900}
                height={400}
                onClick={handleCanvasClick}
                style={{ width: '100%', height: '400px', display: 'block', cursor: 'crosshair' }}
              />

              {isGameOver && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(9, 13, 22, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px'
                }}>
                  <AlertTriangle size={56} color="#ef4444" />
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>CORE BREACHED!</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Final Defense Score: <strong>{score}</strong> | Waves Survived: <strong>{wave - 1}</strong></p>
                  <button onClick={resetGame} className="btn btn-primary btn-lg">
                    <RotateCcw size={18} /> Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Agent Selection Panel & System Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Deploy AI Agent
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(Object.keys(AGENT_CONFIGS) as Array<keyof typeof AGENT_CONFIGS>).map(typeKey => {
                    const cfg = AGENT_CONFIGS[typeKey];
                    const isSelected = selectedAgentType === typeKey;
                    return (
                      <div
                        key={typeKey}
                        onClick={() => setSelectedAgentType(typeKey)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isSelected ? cfg.color : 'rgba(255, 255, 255, 0.08)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: cfg.color }}>{cfg.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dmg: {cfg.damage} | Rng: {cfg.range}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>{cfg.cost} CR</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terminal Log Output */}
              <div style={{ flex: 1, background: '#060911', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <Terminal size={14} /> SYSTEM DEFENSE LOGS
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '6px', color: '#94a3b8' }}>
                  {logs.map((log, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
