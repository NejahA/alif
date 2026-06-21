import { useEffect, useRef, useState, useCallback } from 'react';
import { NebulaEngine, EngineConfig } from './engine/nebulaEngine';
import { ColorPalette } from './engine/particle';
import './App.css';

const PALETTE_NAMES: Record<ColorPalette, string> = {
  cosmic: '🌌 Cosmic',
  aurora: '🌅 Aurora',
  sunset: '🌇 Sunset',
  ocean: '🌊 Ocean',
  void: '⚫ Void',
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NebulaEngine | null>(null);
  const [particleCount, setParticleCount] = useState(400);
  const [palette, setPalette] = useState<ColorPalette>('cosmic');
  const [speed, setSpeed] = useState(1);
  const [size, setSize] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [currentCount, setCurrentCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new NebulaEngine(canvasRef.current, {
      particleCount,
      palette,
      speed,
      sizeMultiplier: size,
    });
    engineRef.current = engine;
    engine.start();

    // Update particle count display
    const interval = setInterval(() => {
      setCurrentCount(engine.getParticleCount());
    }, 500);

    return () => {
      engine.destroy();
      clearInterval(interval);
    };
  }, []);

  const updateConfig = useCallback((config: Partial<EngineConfig>) => {
    if (engineRef.current) {
      engineRef.current.updateConfig(config);
    }
  }, []);

  const handlePaletteChange = (newPalette: ColorPalette) => {
    setPalette(newPalette);
    updateConfig({ palette: newPalette });
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    updateConfig({ speed: newSpeed });
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    updateConfig({ sizeMultiplier: newSize });
  };

  const handleParticleCountChange = (count: number) => {
    setParticleCount(count);
    updateConfig({ particleCount: count });
  };

  const handleReset = () => {
    setParticleCount(400);
    setPalette('cosmic');
    setSpeed(1);
    setSize(1);
    updateConfig({
      particleCount: 400,
      palette: 'cosmic',
      speed: 1,
      sizeMultiplier: 1,
    });
  };

  const handleScreenshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `nebula-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleClear = () => {
    if (engineRef.current) {
      engineRef.current.destroy();
      if (canvasRef.current) {
        const engine = new NebulaEngine(canvasRef.current, {
          particleCount,
          palette,
          speed,
          sizeMultiplier: size,
        });
        engineRef.current = engine;
        engine.start();
      }
    }
  };

  return (
    <div className="app">
      <canvas ref={canvasRef} className="canvas" />

      <div className="header">
        <h1 className="title">Nebula Forge</h1>
        <p className="subtitle">Cosmic Particle Art Generator</p>
        <div className="stats">
          <span className="stat">
            <span className="stat-label">Particles</span>
            <span className="stat-value">{currentCount}</span>
          </span>
          <span className="stat">
            <span className="stat-label">FPS</span>
            <span className="stat-value" id="fps">60</span>
          </span>
        </div>
      </div>

      <button
        className="toggle-btn"
        onClick={() => setShowControls(!showControls)}
        title={showControls ? 'Hide controls' : 'Show controls'}
      >
        {showControls ? '✕' : '⚙'}
      </button>

      {showControls && (
        <div className="controls">
          <h2 className="controls-title">Controls</h2>

          <div className="control-group">
            <label className="control-label">
              Palette
            </label>
            <div className="palette-grid">
              {(Object.keys(PALETTE_NAMES) as ColorPalette[]).map((p) => (
                <button
                  key={p}
                  className={`palette-btn ${palette === p ? 'active' : ''}`}
                  onClick={() => handlePaletteChange(p)}
                >
                  {PALETTE_NAMES[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">
              Particles: {particleCount}
            </label>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={particleCount}
              onChange={(e) => handleParticleCountChange(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group">
            <label className="control-label">
              Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group">
            <label className="control-label">
              Size: {size.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="action-buttons">
            <button className="action-btn reset" onClick={handleReset}>
              ↺ Reset
            </button>
            <button className="action-btn clear" onClick={handleClear}>
              ✦ Clear
            </button>
            <button className="action-btn screenshot" onClick={handleScreenshot}>
              📷 Save
            </button>
            <button className="action-btn fullscreen" onClick={handleFullscreen}>
              {isFullscreen ? '⛶ Exit' : '⛶ Full'}
            </button>
          </div>

          <div className="tips">
            <p>💡 Click anywhere to create a particle burst</p>
            <p>🖱️ Move mouse to attract particles</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;