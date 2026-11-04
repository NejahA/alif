import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../gameScene';
import { RotateCcw } from 'lucide-react';

export default function GameTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 900,
      height: 480,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 900, x: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [GameScene]
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleRestart = () => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('GameScene');
      if (scene) {
        scene.scene.restart();
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>
            🪕 Banjoui: The Melodic Rhythm Platformer
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Collect musical notes, hop platforms, and hit rhythm strums (SPACE / Z) to blast discord enemies.
          </p>
        </div>
        <button
          onClick={handleRestart}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}
        >
          <RotateCcw size={15} />
          Restart Level
        </button>
      </div>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '480px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#0a0a0f'
        }}
      />

      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
        <span style={{ background: '#1e293b', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
          <strong>← →</strong> Move
        </span>
        <span style={{ background: '#1e293b', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
          <strong>↑ / SPACE</strong> Jump
        </span>
        <span style={{ background: '#1e293b', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
          <strong>SPACE / Z</strong> Strum Rhythm Blast
        </span>
      </div>
    </div>
  );
}
