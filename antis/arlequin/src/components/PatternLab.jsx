import React from 'react';

const PatternLab = ({ 
  config, 
  setConfig, 
  snapshots, 
  onCapture, 
  onDeleteSnapshot, 
  presets, 
  onApplyPreset 
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const resetLab = () => {
    setConfig({
      density: 60,
      opacity: 30,
      chroma: ['#FF0055', '#00FFCC', '#FFCC00']
    });
  };

  const cycleColor = (index) => {
    const nextColors = ['#FF0055', '#00FFCC', '#FFCC00', '#6600FF', '#0099FF', '#FF3300', '#FFFFFF', '#101010'];
    const currentColor = config.chroma[index];
    const nextIdx = (nextColors.indexOf(currentColor) + 1) % nextColors.length;
    
    const newChroma = [...config.chroma];
    newChroma[index] = nextColors[nextIdx];
    
    setConfig(prev => ({
      ...prev,
      chroma: newChroma
    }));
  };

  return (
    <div className="lab-wrapper" style={{ display: 'flex', gap: '30px', flex: 1 }}>
      {/* Sidebar: Presets */}
      <aside className="glass" style={{ width: '250px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 className="heading" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Artisan Presets</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.keys(presets).map(name => (
            <button 
              key={name}
              className="btn-secondary glow-hover"
              style={{ padding: '12px', fontSize: '0.7rem', textAlign: 'left' }}
              onClick={() => onApplyPreset(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
        <button 
          className="btn-primary" 
          style={{ width: '100%', fontSize: '0.8rem' }}
          onClick={onCapture}
        >
          Capture Facet
        </button>
      </aside>

      {/* Main Lab Content */}
      <section className="lab-section glass" style={{ 
        flex: 1, 
        padding: '40px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="heading" style={{ color: 'var(--color-secondary)', margin: 0 }}>Pattern Laboratory</h2>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '5px 15px', fontSize: '0.7rem' }}
              onClick={resetLab}
            >
              RESET
            </button>
            <div className="glass" style={{ padding: '5px 15px', fontSize: '0.7rem', opacity: 0.6, borderRadius: '50px' }}>
              v2.0 ARLEQUIN_ULTRA
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>DENSITY</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>{config.density}px</span>
            </div>
            <input 
              type="range" 
              name="density"
              min="20" 
              max="150" 
              value={config.density} 
              onChange={handleChange}
              style={{ width: '100%', accentColor: 'var(--color-secondary)' }} 
            />
          </div>

          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>OPACITY</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{config.opacity}%</span>
            </div>
            <input 
              type="range" 
              name="opacity"
              min="0" 
              max="100" 
              value={config.opacity} 
              onChange={handleChange}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }} 
            />
          </div>

          <div className="glass" style={{ padding: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.8rem', opacity: 0.7 }}>CHROMA MOTIF</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {config.chroma.map((color, idx) => (
                <div 
                  key={idx}
                  onClick={() => cycleColor(idx)}
                  className="glow-hover"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: color,
                    boxShadow: `0 0 15px ${color}66`,
                    border: '2px solid rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live Canvas & Snapshots */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass" style={{ 
            flex: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'relative', 
            overflow: 'hidden',
            background: 'rgba(0,0,0,0.6)',
            border: '1px dashed var(--glass-border)'
          }}>
            <div style={{ 
              position: 'absolute',
              width: '150%',
              height: '150%',
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, ${config.density}px)`,
              opacity: config.opacity / 100,
              transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
            }}>
              {Array.from({ length: 400 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`shape-${config.shape}`}
                  style={{ 
                    width: config.density * 1.2, 
                    height: config.density * 1.2, 
                    background: config.chroma[i % config.chroma.length],
                    opacity: 0.2
                  }}
                />
              ))}
            </div>
            <div className="heading" style={{ zIndex: 5, fontSize: '2rem', textShadow: '0 0 20px black' }}>Live Canvas</div>
          </div>

          {/* Snapshots Gallery */}
          {snapshots.length > 0 && (
            <div className="glass animate-slideUp" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 className="heading" style={{ fontSize: '0.7rem', opacity: 0.5 }}>Saved Facets</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {snapshots.map((s) => (
                  <div 
                    key={s.id}
                    className="glass glow-hover"
                    style={{ 
                      flexShrink: 0, 
                      width: '100px', 
                      height: '60px', 
                      cursor: 'pointer', 
                      position: 'relative',
                      background: `linear-gradient(45deg, ${s.chroma[0]}, ${s.chroma[1] || s.chroma[0]})`,
                      overflow: 'hidden'
                    }}
                    onClick={() => setConfig(s)}
                  >
                    <div style={{ position: 'absolute', bottom: '5px', right: '5px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.4rem', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px' }}>
                        {s.density}px
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenInStudio(s); }}
                        style={{ background: 'var(--color-primary)', border: 'none', color: 'white', fontSize: '0.5rem', padding: '2px 5px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        STUDIO
                      </button>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteSnapshot(s.id); }}
                      style={{ position: 'absolute', top: '0', right: '0', background: 'rgba(255,0,0,0.4)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.6rem', padding: '2px 5px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PatternLab;
