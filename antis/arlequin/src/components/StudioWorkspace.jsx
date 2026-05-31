import React, { useRef, useEffect, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

const StudioWorkspace = ({ config, setConfig, studioConfig, setStudioConfig }) => {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const reqFrameRef = useRef(null);
  
  const [audioReact, setAudioReact] = useState({ scaleMod: 0, hueMod: 0 });
  const [paintMode, setPaintMode] = useState(false);
  const [activePaintColor, setActivePaintColor] = useState('#FFFFFF');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleStudioChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudioConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'postProcess' ? value : parseFloat(value))
    }));
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    if (canvasRef.current) {
      htmlToImage.toPng(canvasRef.current, { quality: 0.95, style: { background: '#050505' } })
        .then((dataUrl) => {
          download(dataUrl, 'arlequin-facet.png');
        })
        .catch((error) => {
          console.error('Error exporting image:', error);
        });
    }
  };

  const handleFacetClick = (index) => {
    if (!paintMode) return;
    setStudioConfig(prev => {
      const newPainted = { ...prev.paintedCells };
      if (newPainted[index] === activePaintColor) {
        delete newPainted[index];
      } else {
        newPainted[index] = activePaintColor;
      }
      return { ...prev, paintedCells: newPainted };
    });
  };

  const clearPaintedCells = () => {
    setStudioConfig(prev => ({ ...prev, paintedCells: {} }));
  };

  const toggleSonicResonance = async () => {
    if (studioConfig.sonicActive) {
      setStudioConfig(prev => ({ ...prev, sonicActive: false }));
      if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAudioReact({ scaleMod: 0, hueMod: 0 });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        const source = audioCtxRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        setStudioConfig(prev => ({ ...prev, sonicActive: true }));
        
        const analyzeAudio = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArrayRef.current[i];
          }
          const average = sum / bufferLength;
          
          const intensity = average / 255;
          setAudioReact({
             scaleMod: intensity * 0.8,
             hueMod: intensity * 100
          });
          
          reqFrameRef.current = requestAnimationFrame(analyzeAudio);
        };
        
        analyzeAudio();
      } catch (err) {
        console.error("Microphone access denied or not available", err);
        alert("Microphone access is required for Sonic Resonance.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const handleMouseMove = (e) => {
    if (studioConfig.parallaxActive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    }
  };

  const renderGridContent = () => {
    return Array.from({ length: Math.floor(600 / (studioConfig.mirrorActive ? 4 : 1)) }).map((_, i) => {
      const cols = Math.ceil(window.innerWidth / config.density) + 2;
      const x = i % cols;
      const y = Math.floor(i / cols);
      const delay = studioConfig.waveActive ? (x + y) * 0.05 * (1 / (studioConfig.timeScale || 0.1)) : 0;
      const swarmClass = studioConfig.swarmActive ? 'swarm-element' : '';
      const ix = x * config.density;
      const iy = y * config.density;

      const isPainted = studioConfig.paintedCells[i];
      const baseColor = isPainted || config.chroma[i % config.chroma.length];
      
      const wireframeStyle = studioConfig.wireframeMode ? {
        background: 'transparent',
        boxShadow: `inset 0 0 10px ${baseColor}, 0 0 5px ${baseColor}`
      } : {
        background: baseColor
      };

      return (
        <div 
          key={i} 
          onClick={() => handleFacetClick(i)}
          className={`shape-${config.shape} ${swarmClass} ${studioConfig.postProcess === 'aberration' ? 'post-aberration' : ''}`}
          style={{ 
            '--ix': `${ix}px`,
            '--iy': `${iy}px`,
            width: config.density * 1.5, 
            height: config.density * 1.5, 
            opacity: isPainted ? 1 : 0.8,
            mixBlendMode: isPainted ? 'normal' : studioConfig.blendMode,
            animationDelay: `${delay}s`,
            animationDuration: studioConfig.waveActive ? `${2 / (studioConfig.timeScale || 0.1)}s` : '0s',
            animationName: studioConfig.waveActive ? 'pulse-glow' : 'none',
            animationIterationCount: 'infinite',
            transition: 'background 0.3s ease, box-shadow 0.3s ease, mix-blend-mode 0.3s ease, margin 0.5s ease-out',
            cursor: paintMode ? 'crosshair' : 'default',
            zIndex: isPainted ? 10 : 1,
            ...wireframeStyle
          }}
        />
      );
    });
  };

  const parallaxTransform = studioConfig.parallaxActive 
    ? `perspective(1000px) rotateX(${mousePos.y * -30}deg) rotateY(${mousePos.x * 30}deg)`
    : '';

  return (
    <div className="studio-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px', 
      flex: 1,
      animation: 'fadeIn 1s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="heading" style={{ color: 'var(--color-primary)', margin: 0, fontSize: '2rem' }}>Arlequin Studio</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>ADVANCED GENERATIVE WORKSPACE // V7.0_IMMERSION</p>
        </div>
        <div className="glass" style={{ padding: '10px 20px', display: 'flex', gap: '20px' }}>
          <button className="btn-secondary" style={{ fontSize: '0.7rem' }} onClick={handleExport}>EXPORT_RAW</button>
          <button className="btn-primary" style={{ fontSize: '0.7rem' }}>SYNC_HUD</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', flex: 1 }}>
        {/* Floating Master HUD */}
        <aside className="glass" style={{ 
          width: '320px', 
          padding: '30px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          background: 'rgba(0,0,0,0.6)',
          borderRight: '1px solid var(--color-primary)',
          overflowY: 'auto',
          maxHeight: '75vh'
        }}>
          <h3 className="heading" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Master HUD</h3>
          
          <div className="control-group">
            <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>FACET_MORPHING</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['diamond', 'hexagon', 'shard'].map(sh => (
                <button 
                  key={sh}
                  onClick={() => handleConfigChange({ target: { name: 'shape', value: sh } })}
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    fontSize: '0.6rem', 
                    background: config.shape === sh ? 'var(--color-primary)' : 'transparent',
                    color: 'white',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >{sh}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-white)' }}>GHOST_FACETS (WIREFRAME)</label>
            <input 
              type="checkbox" 
              name="wireframeMode" 
              checked={studioConfig.wireframeMode} 
              onChange={handleStudioChange}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
            />
          </div>

          <div className="control-group">
            <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>CINEMATIC_POST_PROCESS</label>
            <select 
              name="postProcess" 
              value={studioConfig.postProcess} 
              onChange={handleStudioChange}
              style={{ width: '100%', padding: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}
            >
              <option value="none">None</option>
              <option value="grain">Film Grain</option>
              <option value="aberration">Chromatic Aberration</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>HOLOGRAPHIC_PARALLAX</label>
            <input 
              type="checkbox" 
              name="parallaxActive" 
              checked={studioConfig.parallaxActive} 
              onChange={handleStudioChange}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)' }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

          <div className="control-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>TEMPORAL_SHIFT</label>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-secondary)' }}>{studioConfig.timeScale}x</span>
            </div>
            <input 
              type="range" 
              name="timeScale" 
              min="0.1" max="5" step="0.1"
              value={studioConfig.timeScale} 
              onChange={handleStudioChange} 
              style={{ width: '100%', accentColor: 'var(--color-secondary)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>KALEIDOSCOPE_MIRROR</label>
            <input 
              type="checkbox" 
              name="mirrorActive" 
              checked={studioConfig.mirrorActive} 
              onChange={handleStudioChange}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-white)' }}
            />
          </div>

          <div className="glass" style={{ padding: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>FACET_PAINTER</label>
              <input 
                type="checkbox" 
                checked={paintMode} 
                onChange={(e) => setPaintMode(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)' }}
              />
            </div>
            {paintMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {['#FFFFFF', '#FF0055', '#00FFCC', '#FFCC00', '#101010'].map(color => (
                    <div 
                      key={color}
                      onClick={() => setActivePaintColor(color)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: color, cursor: 'pointer',
                        border: activePaintColor === color ? '2px solid white' : '2px solid transparent',
                        boxShadow: activePaintColor === color ? `0 0 10px ${color}` : 'none'
                      }}
                    />
                  ))}
                </div>
                <button onClick={clearPaintedCells} className="btn-secondary" style={{ padding: '5px', fontSize: '0.6rem' }}>Clear Paint</button>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

          <div className="control-group">
            <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>PRISMATIC_SCALE_&_ROTATION</label>
            <input 
              type="range" 
              name="scale" 
              min="0.5" max="3" step="0.1"
              value={studioConfig.scale} 
              onChange={handleStudioChange} 
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
            <input 
              type="range" 
              name="rotation" 
              min="0" max="360" 
              value={studioConfig.rotation} 
              onChange={handleStudioChange} 
              style={{ width: '100%', marginTop: '10px', accentColor: 'var(--color-primary)' }}
            />
          </div>

          <div className="control-group">
            <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>BLEND_MODE_ALCHEMY</label>
            <select 
              name="blendMode" 
              value={studioConfig.blendMode} 
              onChange={handleStudioChange}
              style={{ width: '100%', padding: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}
            >
              <option value="normal">Normal</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="color-dodge">Color Dodge</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>HUE_PULSE_SYNC</label>
            <input type="checkbox" name="huePulse" checked={studioConfig.huePulse} onChange={handleStudioChange} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>MATRIX_WAVEFORM</label>
            <input type="checkbox" name="waveActive" checked={studioConfig.waveActive} onChange={handleStudioChange} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>SWARM_PHYSICS</label>
            <input type="checkbox" name="swarmActive" checked={studioConfig.swarmActive} onChange={handleStudioChange} />
          </div>
        </aside>

        {/* Studio Canvas */}
        <div 
          className="glass" 
          onMouseMove={handleMouseMove}
          style={{ 
            flex: 1, 
            position: 'relative', 
            overflow: 'hidden',
            background: 'rgba(5,5,5,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px' // For Parallax parent
          }}
        >
          {studioConfig.postProcess === 'grain' && <div className="film-grain"></div>}
          
          <div ref={canvasRef} style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transform: parallaxTransform,
            transition: 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d'
          }}>
            {studioConfig.mirrorActive ? (
              <div style={{
                position: 'relative',
                width: '120%', height: '120%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                transform: `rotate(${studioConfig.rotation}deg) skew(${studioConfig.skew}deg) scale(${studioConfig.scale + audioReact.scaleMod})`,
                filter: `hue-rotate(${studioConfig.hueRotation + audioReact.hueMod}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
              }}>
                <div style={{ position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: `repeat(auto-fill, ${config.density}px)`, opacity: config.opacity / 100 }}>{renderGridContent()}</div>
                <div style={{ position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: `repeat(auto-fill, ${config.density}px)`, opacity: config.opacity / 100, transform: 'scaleX(-1)' }}>{renderGridContent()}</div>
                <div style={{ position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: `repeat(auto-fill, ${config.density}px)`, opacity: config.opacity / 100, transform: 'scaleY(-1)' }}>{renderGridContent()}</div>
                <div style={{ position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: `repeat(auto-fill, ${config.density}px)`, opacity: config.opacity / 100, transform: 'scale(-1, -1)' }}>{renderGridContent()}</div>
              </div>
            ) : (
              <div style={{ 
                width: '120%',
                height: '120%',
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, ${config.density}px)`,
                opacity: config.opacity / 100,
                transform: `rotate(${studioConfig.rotation}deg) skew(${studioConfig.skew}deg) scale(${studioConfig.scale + audioReact.scaleMod})`,
                filter: `hue-rotate(${studioConfig.hueRotation + audioReact.hueMod}deg)`,
                transition: studioConfig.sonicActive ? 'none' : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                willChange: 'transform, filter',
                padding: '40px',
                boxSizing: 'border-box',
                background: '#050505',
                transformStyle: 'preserve-3d'
              }}>
                {renderGridContent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioWorkspace;
