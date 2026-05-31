import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Otamatone() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [pitch, setPitch] = useState(440); // Frequency in Hz
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const neckRef = useRef(null);

  useEffect(() => {
    // The "Wah" mouth effect
    filterRef.current = new Tone.Filter({ type: 'lowpass', frequency: 500, Q: 2 }).connect(masterBus);
    
    // Nasty, buzzy sawtooth for the classic toy sound
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0, sustain: 1, release: 0.1 }
    }).connect(filterRef.current);

    return () => {
      synthRef.current?.dispose();
      filterRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  // Handle ribbon controller (slide up and down neck)
  const handleNeckInteraction = async (e) => {
    if (e.buttons !== 1) return;
    await Tone.start();
    
    if (neckRef.current) {
      const rect = neckRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = 1 - Math.max(0, Math.min(1, y / rect.height)); // 0 is bottom, 1 is top
      
      // Map percentage to frequency (roughly 200Hz to 1200Hz)
      const newPitch = 200 + percentage * 1000;
      setPitch(newPitch);
      
      if (synthRef.current) {
        synthRef.current.frequency.rampTo(newPitch, 0.05); // Smooth glide (portamento)
        if (!isPlaying) {
          synthRef.current.triggerAttack(newPitch);
          setIsPlaying(true);
        }
      }
    }
  };

  const handleNeckRelease = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setIsPlaying(false);
    }
  };

  // Squeeze mouth to open filter
  const toggleMouth = (open) => {
    setMouthOpen(open);
    if (filterRef.current) {
      filterRef.current.frequency.rampTo(open ? 3000 : 500, 0.1);
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

      <div style={{ display: 'flex', gap: '40px', alignItems: 'center', height: '400px' }}>
        
        {/* The Head (Mouth) */}
        <div 
            onMouseDown={() => toggleMouth(true)}
            onMouseUp={() => toggleMouth(false)}
            onMouseLeave={() => toggleMouth(false)}
            style={{ 
                width: '120px', height: '120px', background: '#fff', borderRadius: '50%',
                boxShadow: '0 10px 20px rgba(0,0,0,0.5)', cursor: 'pointer',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', border: '2px solid #ddd'
            }}
        >
            {/* Eyes */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', background: '#000', borderRadius: '50%' }} />
                <div style={{ width: '8px', height: '8px', background: '#000', borderRadius: '50%' }} />
            </div>
            
            {/* Mouth */}
            <div style={{ 
                width: mouthOpen ? '60px' : '40px', 
                height: mouthOpen ? '40px' : '5px', 
                background: '#000', borderRadius: mouthOpen ? '20px' : '5px',
                transition: 'all 0.1s'
            }} />
            
            <div style={{ position: 'absolute', bottom: '-30px', color: '#888', fontSize: '12px' }}>Squeeze Mouth</div>
        </div>

        {/* The Neck (Ribbon Controller) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '10px' }}>Slide Finger</div>
            <div 
                ref={neckRef}
                onMouseDown={handleNeckInteraction}
                onMouseMove={handleNeckInteraction}
                onMouseUp={handleNeckRelease}
                onMouseLeave={handleNeckRelease}
                style={{ 
                    width: '30px', height: '300px', background: '#111', 
                    borderRadius: '15px', border: '2px solid #333',
                    position: 'relative', cursor: 'ns-resize',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
                }}
            >
                {/* Visual marker for current pitch */}
                {isPlaying && (
                    <div style={{ 
                        position: 'absolute', left: 0, right: 0, height: '10px', 
                        background: '#3b82f6', borderRadius: '5px',
                        bottom: `${((pitch - 200) / 1000) * 100}%`,
                        transform: 'translateY(50%)', pointerEvents: 'none',
                        boxShadow: '0 0 10px #3b82f6'
                    }} />
                )}
            </div>
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Slide your mouse up and down the black neck to play notes. Click the white face to open the mouth (Wah filter).</p>
    </div>
  );
}
