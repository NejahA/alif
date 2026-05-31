import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function BeatSlicer() {
  const [activeSlice, setActiveSlice] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const playerRef = useRef(null);

  // We will simulate a breakbeat by having a single loaded audio buffer
  // Since we can't easily load external assets without CORS, we'll use a public Tone.js example drum loop
  const breakUrl = "https://tonejs.github.io/audio/loop/FW3.mp3"; 

  useEffect(() => {
    playerRef.current = new Tone.Player({
        url: breakUrl,
        onload: () => setIsLoaded(true)
    }).connect(masterBus);

    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
        playerRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const playSlice = async (sliceIndex) => {
    await Tone.start();
    if (playerRef.current && isLoaded) {
      // Assume the loop is exactly 2 seconds long for 8 equal slices
      // We'll calculate based on actual buffer duration
      const duration = playerRef.current.buffer.duration;
      const sliceLength = duration / 8;
      const startTime = sliceIndex * sliceLength;
      
      playerRef.current.stop(); // Stop current playback
      playerRef.current.start(Tone.now(), startTime, sliceLength);
      
      setActiveSlice(sliceIndex);
      setTimeout(() => setActiveSlice(null), 100);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Master Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div style={{ 
          background: '#111', padding: '20px', borderRadius: '10px', 
          border: '2px solid #333', display: 'flex', flexDirection: 'column', gap: '20px',
          width: '400px'
      }}>
          
        {/* Waveform Display (Mockup) */}
        <div style={{ width: '100%', height: '80px', background: '#222', borderRadius: '5px', position: 'relative', overflow: 'hidden', display: 'flex' }}>
            {!isLoaded && <div style={{ color: '#fff', position: 'absolute', top: '30px', width: '100%', textAlign: 'center' }}>Loading Breakbeat...</div>}
            {isLoaded && Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ 
                    flex: 1, borderRight: '1px dashed #555', background: activeSlice === i ? 'rgba(234, 179, 8, 0.3)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ width: '80%', height: '40px', background: '#3b82f6', clipPath: 'polygon(0 50%, 20% 0, 40% 80%, 60% 20%, 80% 100%, 100% 50%, 100% 100%, 0 100%)', opacity: 0.5 }} />
                </div>
            ))}
        </div>

        {/* MPC Pads */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div 
                    key={i}
                    onMouseDown={() => playSlice(i)}
                    style={{
                        width: '100%', aspectRatio: '1/1',
                        background: activeSlice === i ? '#eab308' : '#3f3f46',
                        borderRadius: '5px', border: '2px solid #27272a',
                        cursor: isLoaded ? 'pointer' : 'not-allowed',
                        boxShadow: activeSlice === i ? '0 0 15px #eab308' : '0 5px 0 #18181b',
                        transform: activeSlice === i ? 'translateY(5px)' : 'none',
                        transition: 'all 0.05s', display: 'flex', alignItems: 'flex-start', padding: '5px',
                        color: activeSlice === i ? '#000' : '#888', fontWeight: 'bold'
                    }}
                >
                    {i + 1}
                </div>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Classic MPC workflow. A drum break is automatically chopped into 8 slices. Finger-drum your own rhythm!</p>
    </div>
  );
}
