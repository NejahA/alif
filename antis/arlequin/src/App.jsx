import React, { useState } from 'react'
import './App.css'
import HarlequinGrid from './components/HarlequinGrid'
import PatternLab from './components/PatternLab'
import StudioWorkspace from './components/StudioWorkspace'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const collectionRef = React.useRef(null)
  
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('arlequin_config')
    return saved ? JSON.parse(saved) : {
      density: 60,
      opacity: 30,
      chroma: ['#FF0055', '#00FFCC', '#FFCC00'],
      shape: 'diamond'
    }
  })

  const [studioConfig, setStudioConfig] = useState({
    rotation: 45,
    skew: 0,
    scale: 1.2,
    huePulse: false,
    hueRotation: 0,
    sonicActive: false,
    blendMode: 'normal',
    waveActive: false,
    swarmActive: false,
    mirrorActive: false,
    timeScale: 1,
    paintedCells: {},
    parallaxActive: false,
    wireframeMode: false,
    postProcess: 'none'
  })

  const [snapshots, setSnapshots] = useState(() => {
    const saved = localStorage.getItem('arlequin_snapshots')
    return saved ? JSON.parse(saved) : []
  })

  React.useEffect(() => {
    let interval;
    if (studioConfig.huePulse) {
      interval = setInterval(() => {
        setStudioConfig(prev => ({
          ...prev,
          hueRotation: (prev.hueRotation + 1) % 360
        }))
      }, 50)
    }
    return () => clearInterval(interval)
  }, [studioConfig.huePulse])

  React.useEffect(() => {
    localStorage.setItem('arlequin_config', JSON.stringify(config))
  }, [config])

  React.useEffect(() => {
    localStorage.setItem('arlequin_snapshots', JSON.stringify(snapshots))
  }, [snapshots])

  const ARTISAN_PRESETS = {
    'Venetian Dusk': { density: 80, opacity: 40, chroma: ['#CC3300', '#FF9933', '#330000'], shape: 'diamond' },
    'Cyber Prism': { density: 40, opacity: 60, chroma: ['#6600FF', '#0099FF', '#FF00CC'], shape: 'hexagon' },
    'Royal Nexus': { density: 100, opacity: 20, chroma: ['#FFD700', '#8B0000', '#000080'], shape: 'diamond' },
    'Ethereal': { density: 30, opacity: 15, chroma: ['#FFFFFF', '#E0F7FA', '#B2EBF2'], shape: 'shard' }
  }

  const captureSnapshot = () => {
    if (snapshots.length >= 12) snapshots.shift()
    setSnapshots([...snapshots, { ...config, id: Date.now() }])
  }

  const applyPreset = (name) => {
    setConfig(ARTISAN_PRESETS[name])
  }

  const deleteSnapshot = (id) => {
    setSnapshots(snapshots.filter(s => s.id !== id))
  }

  const openInStudio = (snapshot) => {
    setConfig(snapshot)
    setActiveTab('studio')
  }

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app-container" style={{
      '--mx': `${mousePos.x}px`,
      '--my': `${mousePos.y}px`
    }}>
      <HarlequinGrid density={config.density} colors={config.chroma} opacity={config.opacity / 100} shape={config.shape} />
      
      <main className="main-content">
        <nav className="glass" style={{ 
          padding: '15px 40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px',
          zIndex: 100
        }}>
          <div 
            className="heading" 
            style={{ 
              fontSize: '1.8rem', 
              fontWeight: '800', 
              color: 'var(--color-primary)',
              letterSpacing: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('home')}
          >
            ARLEQUIN
          </div>
          <div style={{ display: 'flex', gap: '40px', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>
            <span 
              className="glow-hover"
              style={{ cursor: 'pointer', opacity: activeTab === 'home' ? 1 : 0.4, transition: 'var(--transition-smooth)' }}
              onClick={() => setActiveTab('home')}
            >
              Gallery
            </span>
            <span 
              className="glow-hover"
              style={{ cursor: 'pointer', opacity: activeTab === 'lab' ? 1 : 0.4, transition: 'var(--transition-smooth)' }}
              onClick={() => setActiveTab('lab')}
            >
              Pattern Lab
            </span>
            <span 
              className="glow-hover"
              style={{ cursor: 'pointer', opacity: activeTab === 'studio' ? 1 : 0.4, transition: 'var(--transition-smooth)' }}
              onClick={() => setActiveTab('studio')}
            >
              Studio
            </span>
          </div>
        </nav>

        {activeTab === 'home' && (
          <section className="hero-section" style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 className="title-main animate-float">Prismatic <br /> Aesthetics</h1>
            <p className="subtitle">
              The digital atelier for high-fidelity geometric expression. 
              Crafting multifaceted visual experiences with Harlequin-inspired precision.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
              <button className="btn-primary glow-hover" onClick={() => setActiveTab('lab')}>Enter the Lab</button>
              <button className="btn-secondary glow-hover" onClick={scrollToCollection}>View Collection</button>
            </div>
            <div 
              ref={collectionRef}
              className="animate-slideUp" 
              style={{ 
                marginTop: '60px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '30px',
                width: '100%'
              }}
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="glass glow-hover" style={{ 
                  height: '200px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-end',
                  padding: '20px',
                  background: `linear-gradient(45deg, rgba(255,0,85,0.1), rgba(0,255,204,0.1))`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div className="diamond-clip" style={{ 
                    position: 'absolute', 
                    top: '-20px', 
                    right: '-20px', 
                    width: '100px', 
                    height: '100px', 
                    background: i === 1 ? 'var(--color-primary)' : i === 2 ? 'var(--color-secondary)' : 'var(--color-accent)',
                    opacity: 0.2
                  }} />
                  <div style={{ zIndex: 2 }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '2px' }}>SERIES_00{i}</div>
                    <div className="heading" style={{ fontSize: '1rem' }}>Facet Evolution</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'lab' && (
          <PatternLab 
            config={config} 
            setConfig={setConfig} 
            snapshots={snapshots}
            onCapture={captureSnapshot}
            onDeleteSnapshot={deleteSnapshot}
            presets={ARTISAN_PRESETS}
            onApplyPreset={applyPreset}
            onOpenInStudio={openInStudio}
          />
        )}

        {activeTab === 'studio' && (
          <StudioWorkspace 
            config={config} 
            setConfig={setConfig}
            studioConfig={studioConfig}
            setStudioConfig={setStudioConfig}
          />
        )}
      </main>

      <footer style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '40px', 
        zIndex: 10,
        fontSize: '0.7rem',
        opacity: 0.3,
        letterSpacing: '2px'
      }}>
        © 2026 ARLEQUIN DIGITAL ATELIER // ALL RIGHTS RESERVED
      </footer>
    </div>
  )
}

export default App
