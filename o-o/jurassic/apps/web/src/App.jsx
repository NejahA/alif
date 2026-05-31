import { useState, useEffect, useMemo } from 'react'
import './App.css'

function App() {
  const [dinosaurs, setDinosaurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDino, setSelectedDino] = useState(null)
  const [isRoaring, setIsRoaring] = useState(false)
  const [discoveredFossil, setDiscoveredFossil] = useState(null)

  useEffect(() => {
    async function fetchDinos() {
      try {
        const res = await fetch('/api/dinosaurs')
        const data = await res.json()
        setDinosaurs(data)
      } catch (err) {
        console.error('Failed to fetch dinos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDinos()
  }, [])

  const handleRoar = () => {
    if (!selectedDino) return
    setIsRoaring(true)
    setTimeout(() => setIsRoaring(false), 2000)
  }

  const handleDig = () => {
    const fossils = [
      '🦴 Found a T-Rex Tooth!',
      '🥚 Discovered a Fossilized Egg!',
      '👣 Found a massive Footprint!',
      '🐚 Discovered an Ancient Ammonite!',
      '🌿 Found a prehistoric Fern impression!'
    ]
    const random = fossils[Math.floor(Math.random() * fossils.length)]
    setDiscoveredFossil(random)
    setTimeout(() => setDiscoveredFossil(null), 3000)
  }

  const periodClass = useMemo(() => {
    if (!selectedDino) return 'default-period'
    const p = selectedDino.period.toLowerCase()
    if (p.includes('cretaceous')) return 'cretaceous-theme'
    if (p.includes('jurassic')) return 'jurassic-theme'
    if (p.includes('triassic')) return 'triassic-theme'
    return 'default-period'
  }, [selectedDino])

  if (loading) {
    return <div className="loading">Initializing Jurassic DNA Sequence...</div>
  }

  return (
    <div className={`jurassic-app ${periodClass}`}>
      <header>
        <div className="logo-area">
          <h1>Jurassic</h1>
          <span className="subtitle">TERRIBLE LIZARDS</span>
        </div>
        <div className="controls">
          <button className="dig-btn" onClick={handleDig}>⛏️ DIG FOR FOSSILS</button>
        </div>
      </header>

      {discoveredFossil && (
        <div className="fossil-alert">
          <h3>WOW! {discoveredFossil}</h3>
        </div>
      )}

      <main>
        <div className="dino-list">
          {dinosaurs.map((dino) => (
            <div 
              key={dino._id} 
              className={`dino-card ${selectedDino?._id === dino._id ? 'active' : ''}`}
              onClick={() => setSelectedDino(dino)}
            >
              <div className="card-header">
                <h3>{dino.name}</h3>
                <span className={`diet-tag ${dino.diet.toLowerCase()}`}>{dino.diet[0]}</span>
              </div>
              <div className="danger-dots">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`dot ${i < dino.dangerLevel ? 'filled' : ''}`}></span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="dino-detail">
          {selectedDino ? (
            <div className="detail-view">
              <div className="detail-header">
                <div>
                  <h2>{selectedDino.name}</h2>
                  <p className="species"><em>{selectedDino.species}</em></p>
                </div>
                <button className="roar-btn" onClick={handleRoar} disabled={isRoaring}>
                  {isRoaring ? '📢 ROARING!!!' : '🔊 ROAR'}
                </button>
              </div>

              <div className="img-container">
                {selectedDino.image && (
                  <img 
                    src={selectedDino.image} 
                    alt={selectedDino.name} 
                    className={`dino-img ${isRoaring ? 'shake' : ''}`} 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/800x400/111/00ff41?text=IMAGE+UNAVAILABLE';
                    }}
                  />
                )}
                {isRoaring && <div className="roar-text">{selectedDino.roar}</div>}
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <label>Danger Level</label>
                  <div className="danger-meter">
                    <div className="meter-fill" style={{ width: `${(selectedDino.dangerLevel / 5) * 100}%` }}></div>
                  </div>
                </div>
                <div className="stat-item">
                  <label>Period</label>
                  <span>{selectedDino.period}</span>
                </div>
                <div className="stat-item">
                  <label>Diet</label>
                  <span className={`diet-text ${selectedDino.diet.toLowerCase()}`}>{selectedDino.diet}</span>
                </div>
              </div>

              <div className="info">
                <h3>Description</h3>
                <p className="desc">{selectedDino.description}</p>
                {selectedDino.funFact && (
                  <div className="fun-fact">
                    <strong>💡 DID YOU KNOW?</strong>
                    <p>{selectedDino.funFact}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="placeholder">
              <div className="scanner-line"></div>
              <p>SELECT A SPECIMEN FOR ANALYSIS</p>
            </div>
          )}
        </div>
      </main>

      <footer>
        <p>&copy; 2026 Jurassic Research Division. Handle with care.</p>
      </footer>
    </div>
  )
}

export default App
