import { useEffect, useRef, useState } from 'react'
import './App.css'

const FILTERS = [
  { name: 'Normal', value: 'none' },
  { name: 'Cyberpunk', value: 'hue-rotate(240deg) contrast(1.5) saturate(2)' },
  { name: 'Vintage', value: 'sepia(0.6) contrast(1.1) brightness(0.9)' },
  { name: 'Dreamy', value: 'blur(2px) brightness(1.2) saturate(1.2)' },
  { name: 'B&W', value: 'grayscale(1)' },
  { name: 'Noir', value: 'grayscale(1) contrast(1.4) brightness(0.8)' },
  { name: 'Invert', value: 'invert(1)' },
  { name: 'Warm', value: 'sepia(0.3) saturate(1.8) brightness(1.1)' },
  { name: 'Cold', value: 'hue-rotate(180deg) saturate(1.5)' }
]

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentFilter, setCurrentFilter] = useState(FILTERS[0])
  const [isFlashActive, setIsFlashActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setCameraError('Camera access denied or not available.')
        console.error('Error accessing camera:', err)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsFlashActive(true)
    setTimeout(() => setIsFlashActive(false), 400)

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Apply filter to canvas context
      context.filter = currentFilter.value
      
      // Since video is mirrored in UI, we mirror it here too if desired, 
      // but usually users want the "real" photo. Let's keep it mirrored for consistency.
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Save image
      try {
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `lensflow-${new Date().getTime()}.png`
        link.href = dataUrl
        link.click()
      } catch (err) {
        console.error('Failed to capture image:', err)
      }
    }
  }

  return (
    <div className="app-container">
      <div className="background-glow"></div>
      <div className={`shutter-flash ${isFlashActive ? 'flash-active' : ''}`}></div>

      <header className="header glass">
        <h1 className="title premium-gradient">LENSFLOW</h1>
        <div className="status-indicator">
          {cameraError ? (
            <span style={{ color: '#ff4d4d' }}>{cameraError}</span>
          ) : (
            <span style={{ color: '#4caf50' }}>● Live Feed</span>
          )}
        </div>
      </header>

      <main className="main-view">
        <div className="video-wrapper glass">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-feed"
            style={{ filter: currentFilter.value }}
          />
        </div>

        <div className="controls-overlay glass">
          <div className="filter-tray">
            {FILTERS.map((filter) => (
              <div
                key={filter.name}
                className={`filter-item ${currentFilter.name === filter.name ? 'active' : ''}`}
                onClick={() => setCurrentFilter(filter)}
              >
                <div 
                  className="filter-preview-circle" 
                  style={{ filter: filter.value, background: 'url(https://i.pravatar.cc/50?u=preview) center/cover' }}
                ></div>
                <span className="filter-label">{filter.name}</span>
              </div>
            ))}
          </div>

          <div className="action-bar">
            <button className="capture-btn" onClick={handleCapture}>
              <div className="capture-btn-inner"></div>
            </button>
          </div>
        </div>
      </main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default App
