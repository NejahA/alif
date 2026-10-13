import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Plus, RefreshCw, Eye } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function Spatial3DConstellation({ soundEnabled = true }) {
  const canvasRef = useRef(null);
  const [starCount, setStarCount] = useState(40);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [selectedStar, setSelectedStar] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 300);
    let height = (canvas.height = 200);

    let angleX = 0;
    let angleY = 0;

    // Generate 3D point cloud
    const stars = Array.from({ length: starCount }, (_, i) => ({
      id: i + 1,
      x: (Math.random() - 0.5) * 220,
      y: (Math.random() - 0.5) * 220,
      z: (Math.random() - 0.5) * 220,
      size: Math.random() * 2 + 1.2,
      color: i % 3 === 0 ? '#06b6d4' : i % 2 === 0 ? '#8b5cf6' : '#38bdf8'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angleY += 0.008 * rotationSpeed;
      angleX += 0.004 * rotationSpeed;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected = stars.map((s) => {
        // Rotate Y
        let x1 = s.x * cosY - s.z * sinY;
        let z1 = s.z * cosY + s.x * sinY;

        // Rotate X
        let y1 = s.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + s.y * sinX;

        // Perspective projection
        const fov = 200;
        const scale = fov / (fov + z2 + 150);
        const px = width / 2 + x1 * scale;
        const py = height / 2 + y1 * scale;

        return { ...s, px, py, scale, z: z2 };
      });

      // Sort by depth
      projected.sort((a, b) => b.z - a.z);

      // Draw connecting constellation lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 45) {
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = '#8b5cf6';
            ctx.globalAlpha = (1 - dist / 45) * 0.25;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw star points
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, Math.max(0.2, p.scale));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [starCount, rotationSpeed]);

  const addStarNode = () => {
    setStarCount((prev) => prev + 5);
    if (soundEnabled) playBeep(1100, 'sine', 0.05);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <Sparkles style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Spatial 3D Constellation</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Deep-Space Node Projection</p>
          </div>
        </div>

        <button
          onClick={addStarNode}
          className="btn-cosmo-outline"
          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
        >
          <Plus style={{ width: '12px', height: '12px' }} /> ADD NODES ({starCount})
        </button>
      </div>

      {/* 3D Canvas Box */}
      <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(5, 8, 20, 0.85)', border: '1px solid var(--border-glass)' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Footer controls */}
      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>PERSPECTIVE: <strong style={{ color: 'var(--accent-cyan)' }}>3D SPHERICAL</strong></span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setRotationSpeed(s)}
              className={`btn-cosmo-outline ${rotationSpeed === s ? 'active' : ''}`}
              style={{ padding: '2px 6px', fontSize: '0.65rem' }}
            >
              {s}x ROTATION
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
