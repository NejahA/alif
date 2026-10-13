'use client';

import React, { useState, useEffect } from 'react';
import { Server, Zap, Shield, TrendingUp, AlertOctagon, RotateCcw, Plus, Play, Cpu, HardDrive } from 'lucide-react';

interface ServerNode {
  id: string;
  name: string;
  region: string;
  capacity: number; // RPS capacity
  costPerSec: number;
  cpuLoad: number; // 0 - 100%
  status: 'active' | 'degraded' | 'crashed';
}

export default function InfrastructureTycoon() {
  const [servers, setServers] = useState<ServerNode[]>([
    { id: 'us-east-1', name: 'US-East Cluster (Primary)', region: 'us-east', capacity: 500, costPerSec: 5, cpuLoad: 35, status: 'active' },
    { id: 'eu-west-1', name: 'EU-West Edge Node', region: 'eu-west', capacity: 300, costPerSec: 3, cpuLoad: 20, status: 'active' }
  ]);

  const [budget, setBudget] = useState(1500);
  const [revenue, setRevenue] = useState(0);
  const [trafficRps, setTrafficRps] = useState(250);
  const [autoScaleEnabled, setAutoScaleEnabled] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Infrastructure Tycoon ready. Press Start Simulation.']);

  // Total capacity calculation
  const totalCapacity = servers.reduce((acc, s) => acc + (s.status === 'active' ? s.capacity : 0), 0);
  const systemLoad = Math.min(100, Math.round((trafficRps / Math.max(1, totalCapacity)) * 100));

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev.slice(0, 4)]);
  };

  const addServerNode = () => {
    if (budget < 250) {
      addLog('❌ Insufficient capital! Server node costs $250.');
      return;
    }

    const regions = ['ap-southeast', 'us-west', 'sa-east', 'eu-central'];
    const reg = regions[Math.floor(Math.random() * regions.length)];
    const newId = `server-${Date.now()}`;

    setBudget(b => b - 250);
    setServers(prev => [
      ...prev,
      { id: newId, name: `${reg.toUpperCase()} Cluster Node`, region: reg, capacity: 400, costPerSec: 4, cpuLoad: 15, status: 'active' }
    ]);
    addLog(`🚀 Provisioned new Kubernetes cluster in ${reg.toUpperCase()}! (-$250)`);
  };

  const triggerTrafficSpike = () => {
    setTrafficRps(r => r + 650);
    addLog('🔥 FLASH TRAFFIC SPIKE! Incoming 650 RPS surge!');
  };

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setGameTime(t => t + 1);

      // Random organic traffic fluctuations
      setTrafficRps(prevRps => {
        const delta = Math.floor(Math.random() * 60) - 25;
        return Math.max(100, prevRps + delta);
      });

      // AutoScale check
      setServers(prevServers => {
        const currentCap = prevServers.reduce((acc, s) => acc + (s.status === 'active' ? s.capacity : 0), 0);
        const currentLoad = (trafficRps / Math.max(1, currentCap)) * 100;

        if (autoScaleEnabled && currentLoad > 80 && budget >= 250) {
          setBudget(b => b - 250);
          addLog('⚡ AutoScaler triggered: Provisioned emergency compute instance (-$250)');
          return [
            ...prevServers,
            { id: `autoscale-${Date.now()}`, name: 'AutoScale Dynamic Pod', region: 'global', capacity: 350, costPerSec: 3.5, cpuLoad: 40, status: 'active' }
          ];
        }

        // Calculate node load & crash potential
        return prevServers.map(s => {
          if (s.status === 'crashed') return s;
          const nodeLoad = Math.min(100, Math.round(currentLoad + (Math.random() * 10 - 5)));
          if (nodeLoad > 95 && Math.random() < 0.15) {
            addLog(`💥 CRITICAL OVERLOAD: Server ${s.name} CRASHED!`);
            return { ...s, cpuLoad: 100, status: 'crashed' };
          }
          return { ...s, cpuLoad: nodeLoad };
        });
      });

      // Financials update per tick
      const totalCost = servers.reduce((acc, s) => acc + (s.status === 'active' ? s.costPerSec : 0), 0);
      const earned = Math.round(trafficRps * 0.08); // Revenue from processed requests

      setBudget(b => Math.max(0, b + earned - totalCost));
      setRevenue(r => r + earned);

    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, trafficRps, autoScaleEnabled, budget, servers]);

  const resetGame = () => {
    setGameActive(false);
    setBudget(1500);
    setRevenue(0);
    setTrafficRps(250);
    setGameTime(0);
    setServers([
      { id: 'us-east-1', name: 'US-East Cluster (Primary)', region: 'us-east', capacity: 500, costPerSec: 5, cpuLoad: 35, status: 'active' },
      { id: 'eu-west-1', name: 'EU-West Edge Node', region: 'eu-west', capacity: 300, costPerSec: 3, cpuLoad: 20, status: 'active' }
    ]);
    addLog('[SYSTEM] Tycoon simulation reset.');
  };

  return (
    <section id="infra-tycoon" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Server size={16} />
            <span>Infrastructure Management Game</span>
          </div>
          <h2 className="section-title">
            Cloud Infrastructure <span className="text-gradient">Tycoon</span>
          </h2>
          <p className="section-desc">
            Balance server capacity, auto-scaling budgets, and traffic surges. Prevent cluster crashes and maximize revenue in this interactive simulation.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Header Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="#10b981" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Budget:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>${budget}</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#f59e0b" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Traffic:</span>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>{trafficRps} RPS</span>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color={systemLoad > 85 ? '#ef4444' : '#06b6d4'} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Load:</span>
                <span style={{ fontWeight: 800, color: systemLoad > 85 ? '#ef4444' : '#06b6d4' }}>{systemLoad}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setGameActive(!gameActive)} 
                className="btn btn-primary"
              >
                <Play size={16} /> {gameActive ? 'Pause Sim' : 'Start Simulation'}
              </button>
              <button onClick={triggerTrafficSpike} disabled={!gameActive} className="btn btn-secondary">
                🔥 Simulate Traffic Spike
              </button>
              <button onClick={addServerNode} className="btn btn-secondary">
                <Plus size={16} /> Add Node ($250)
              </button>
              <button onClick={resetGame} className="btn btn-secondary">
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>

          {/* Server Nodes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {servers.map(server => (
              <div
                key={server.id}
                style={{
                  background: '#060911',
                  borderRadius: '14px',
                  border: `1px solid ${server.status === 'crashed' ? '#ef4444' : server.cpuLoad > 80 ? '#f59e0b' : 'var(--border-color)'}`,
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Server size={18} color={server.status === 'crashed' ? '#ef4444' : '#06b6d4'} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{server.name}</span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: server.status === 'crashed' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    color: server.status === 'crashed' ? '#ef4444' : '#10b981'
                  }}>
                    {server.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Capacity: {server.capacity} RPS | Op Cost: ${server.costPerSec}/s
                </div>

                {/* CPU Load Gauge */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>CPU Util</span>
                    <span>{server.cpuLoad}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${server.cpuLoad}%`,
                      height: '100%',
                      background: server.cpuLoad > 85 ? '#ef4444' : server.cpuLoad > 60 ? '#f59e0b' : '#10b981',
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Console Log */}
          <div style={{ background: '#060911', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>TELEMETRY LOGS</div>
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
