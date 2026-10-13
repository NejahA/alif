'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Copy, Check, RefreshCw, Activity, Cpu, Server, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [apiKey, setApiKey] = useState('sk_saassy_live_8f92a11b094e');
  const [copiedKey, setCopiedKey] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[12:04:01] System boot initialized in region us-east-1',
    '[12:04:02] Connected to Next.js API Gateway',
    '[12:04:03] Health check passed: 99.99% operational',
  ]);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/stats')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setStats(data.data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateNewKey = () => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`sk_saassy_live_${randomHex}`);
    addLog(`[${new Date().toLocaleTimeString()}] Generated new API secret key.`);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev.slice(0, 9)]);
  };

  const triggerDeploy = () => {
    setDeploying(true);
    addLog(`[${new Date().toLocaleTimeString()}] Initiating Edge Deployment...`);
    setTimeout(() => {
      setDeploying(false);
      addLog(`[${new Date().toLocaleTimeString()}] Deployment succeeded! Route active globally.`);
    }, 1500);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        className="glass-card" 
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0d1322',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          padding: '28px',
        }}
      >
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-badge" style={{ width: '36px', height: '36px' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Saassy Live Workspace Portal</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} /> Cluster Status: Operational
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-secondary)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#141c2e', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>Active Session</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {stats ? stats.activeUsers.toLocaleString() : '142,850'}
            </div>
          </div>

          <div style={{ background: '#141c2e', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>API Latency</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {stats ? `${stats.avgLatencyMs}ms` : '14ms'}
            </div>
          </div>

          <div style={{ background: '#141c2e', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>Active Regions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {stats ? stats.regions.length : 4} Edge Nodes
            </div>
          </div>
        </div>

        {/* API Key Management */}
        <div style={{ background: '#141c2e', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} style={{ color: 'var(--accent-amber)' }} /> Production Secret Key
          </h3>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              readOnly
              value={apiKey}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: '#090d16',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
              }}
            />
            <button onClick={copyKey} className="btn btn-secondary btn-sm">
              {copiedKey ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
              {copiedKey ? 'Copied' : 'Copy'}
            </button>
            <button onClick={generateNewKey} className="btn btn-primary btn-sm">
              <RefreshCw size={16} /> Rotate
            </button>
          </div>
        </div>

        {/* Terminal Logs & Quick Action Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div className="terminal-box">
            <div className="terminal-header">
              <Terminal size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Realtime Event Stream</span>
            </div>
            <div className="terminal-body" style={{ minHeight: '120px', fontSize: '0.8rem' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px', color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
            <button onClick={triggerDeploy} disabled={deploying} className="btn btn-primary" style={{ width: '100%' }}>
              <Server size={18} /> {deploying ? 'Deploying Edge Route...' : 'Trigger Edge Deployment'}
            </button>
            <button onClick={() => addLog(`[${new Date().toLocaleTimeString()}] Health Check OK`)} className="btn btn-secondary" style={{ width: '100%' }}>
              <Activity size={18} /> Run Diagnostic Check
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
