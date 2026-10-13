'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, ArrowRight, Layers, ShieldCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenDashboard: () => void;
}

export default function Navbar({ onOpenDashboard }: NavbarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="navbar">
      <div className="container nav-content">
        <a href="#" className="logo">
          <div className="logo-badge">
            <Sparkles size={20} />
          </div>
          <span>Saassy<span style={{ color: 'var(--accent-primary)' }}>.ai</span></span>
        </a>

        <ul className="nav-links">
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><a href="#defense-game" className="nav-link" style={{ color: '#06b6d4', fontWeight: 600 }}>🕹️ Defense Arcade</a></li>
          <li><a href="#prompt-hacker" className="nav-link" style={{ color: '#a855f7', fontWeight: 600 }}>🔓 Prompt CTF</a></li>
          <li><a href="#swarm-visualizer" className="nav-link" style={{ color: '#6366f1', fontWeight: 600 }}>🤖 Swarm AI</a></li>
          <li><a href="#agent-memory" className="nav-link" style={{ color: '#a855f7', fontWeight: 600 }}>🧠 Agent Memory</a></li>
          <li><a href="#threat-matrix" className="nav-link" style={{ color: '#ef4444', fontWeight: 600 }}>🎯 Threat Hunter</a></li>
          <li><a href="#k8s-autoscaler" className="nav-link" style={{ color: '#10b981', fontWeight: 600 }}>☸️ K8s Scale</a></li>
          <li><a href="#infra-tycoon" className="nav-link" style={{ color: '#10b981', fontWeight: 600 }}>☁️ Infra Tycoon</a></li>
          <li><a href="#token-router" className="nav-link" style={{ color: '#f59e0b', fontWeight: 600 }}>⚡ LLM Router</a></li>
          <li><a href="#fine-tuner" className="nav-link" style={{ color: '#ec4899', fontWeight: 600 }}>🧬 LoRA Tuner</a></li>
          <li><a href="#edge-ping" className="nav-link" style={{ color: '#06b6d4', fontWeight: 600 }}>🌐 Edge Ping</a></li>
          <li><a href="#rate-limiter" className="nav-link" style={{ color: '#ef4444', fontWeight: 600 }}>🛡️ Rate Limiter</a></li>
          <li><a href="#pricing" className="nav-link">Pricing</a></li>
          <li><a href="#testimonials" className="nav-link">Customers</a></li>
        </ul>

        <div className="nav-actions">
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary btn-sm" 
            aria-label="Toggle Theme"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={onOpenDashboard} className="btn btn-secondary btn-sm">
            Live Portal
          </button>

          <button onClick={onOpenDashboard} className="btn btn-primary btn-sm">
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
