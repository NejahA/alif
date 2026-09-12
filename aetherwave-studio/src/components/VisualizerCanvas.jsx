import React, { useEffect, useRef, useState } from 'react';
import { ParticleEngine } from '../visuals/ParticleEngine';
import { audioEngine } from '../audio/AudioEngine';
import { Sparkles, Compass, Flame, Shield, Terminal, Orbit, Zap } from 'lucide-react';

export const VisualizerCanvas = ({ activeTheme, setActiveTheme }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const animFrameRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new ParticleEngine(canvas);
    engineRef.current = engine;
    engine.resize(window.innerWidth, window.innerHeight);

    const handleResize = () => {
      engine.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const loop = () => {
      const freqData = audioEngine.getFrequencyData();
      engine.render(freqData);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Sync visual theme
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTheme(activeTheme);
    }
  }, [activeTheme]);

  // Canvas Click Handler (Plays note and spawns visual ripple)
  const handleCanvasClick = (e) => {
    if (!hasStarted) {
      audioEngine.init();
      setHasStarted(true);
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (engineRef.current) {
      engineRef.current.createRipple(x, y, 1.4);
    }

    // Map Y axis to pitch frequency (150Hz to 600Hz)
    const normalizedY = 1 - (y / window.innerHeight);
    const freq = 150 + normalizedY * 500;
    audioEngine.playNote(freq, 0.7);
  };

  const themes = [
    { id: 'blackHole', name: '🕳️ 3D Black Hole', icon: Compass, color: '#ec4899' },
    { id: 'plasmaVortex', name: '🌀 3D Plasma Vortex', icon: Orbit, color: '#a855f7' },
    { id: 'laserMatrix', name: '💥 3D Laser Matrix', icon: Sparkles, color: '#ff0080' },
    { id: 'cyberGrid', name: '🌄 3D Outrun Horizon', icon: Flame, color: '#00f0ff' },
    { id: 'pumpHyperSpace', name: '⚡ PUMP HyperSpace', icon: Zap, color: '#ff0080' },
    { id: 'cosmic', name: 'Cosmic Nebula', icon: Compass, color: '#8b5cf6' },
    { id: 'tunnel', name: '3D Hyperspace Tunnel', icon: Orbit, color: '#06b6d4' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: Terminal, color: '#ec4899' },
    { id: 'zen', name: 'Deep Zen', icon: Shield, color: '#10b981' },
    { id: 'solar', name: 'Solar Flare', icon: Flame, color: '#f59e0b' },
    { id: 'matrix', name: 'Matrix Rain', icon: Sparkles, color: '#22c55e' }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* HTML5 Canvas */}
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }} 
      />

      {/* Start Audio Hint Overlay */}
      {!hasStarted && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(12px)',
          padding: '24px 36px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
            Click Anywhere to Awaken Sound Universe
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tap the canvas to trigger sound ripples & interactive audio synthesis
          </p>
        </div>
      )}

      {/* Visual Theme Selector Bar (Bottom Center) */}
      <div className="glass-panel" style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '9999px',
        zIndex: 40
      }}>
        {themes.map(t => {
          const Icon = t.icon;
          const isSelected = activeTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              className="glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                background: isSelected ? 'rgba(255,255,255,0.18)' : 'transparent',
                borderColor: isSelected ? t.color : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={14} color={t.color} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
