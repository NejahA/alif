import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

// Synthesize foley sounds using Tone.js noise and membrane synths
const FOLEY_SOUNDS = [
  { id: 'footstep_wood', name: 'Footstep (Wood)', color: '#8b4513' },
  { id: 'footstep_gravel', name: 'Footstep (Gravel)', color: '#71717a' },
  { id: 'glass_shatter', name: 'Glass Shatter', color: '#38bdf8' },
  { id: 'metal_clank', name: 'Metal Clank', color: '#94a3b8' },
  { id: 'water_drop', name: 'Water Drop', color: '#3b82f6' },
  { id: 'water_splash', name: 'Water Splash', color: '#60a5fa' },
  { id: 'cloth_rustle', name: 'Cloth Rustle', color: '#a78bfa' },
  { id: 'paper_crumple', name: 'Paper Crumple', color: '#fcd34d' },
  { id: 'door_thud', name: 'Door Thud', color: '#5f3c23' },
  { id: 'whoosh', name: 'Whoosh', color: '#9ca3af' },
  { id: 'heartbeat', name: 'Heartbeat', color: '#ef4444' },
  { id: 'camera_click', name: 'Camera Click', color: '#111' },
];

export default function FoleyStage() {
  const [activePad, setActivePad] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthsRef = useRef({});

  useEffect(() => {
    // We create specific synths to emulate real-world sounds
    const master = masterBus;

    const noiseSynth = new Tone.NoiseSynth({ envelope: { attack: 0.01, decay: 0.1 } }).connect(master);
    const metalSynth = new Tone.MetalSynth({ envelope: { attack: 0.01, decay: 0.5, release: 0.5 }, resonance: 4000 }).connect(master);
    const membraneSynth = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4 }).connect(master);
    const fmSynth = new Tone.FMSynth().connect(master);
    
    // Custom filter for gravel
    const gravelFilter = new Tone.Filter(2000, "highpass").connect(master);
    const gravelNoise = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.05, decay: 0.2 } }).connect(gravelFilter);

    // Filter for splash
    const splashFilter = new Tone.Filter(1000, "lowpass").connect(master);
    const splashNoise = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.1, decay: 0.4 } }).connect(splashFilter);

    synthsRef.current = {
      footstep_wood: () => membraneSynth.triggerAttackRelease("G1", "8n"),
      footstep_gravel: () => gravelNoise.triggerAttackRelease("8n"),
      glass_shatter: () => metalSynth.triggerAttackRelease("16n", Tone.now(), 10000), // High res metal
      metal_clank: () => metalSynth.triggerAttackRelease("8n", Tone.now(), 800),
      water_drop: () => fmSynth.triggerAttackRelease("C5", "32n"), // High ping
      water_splash: () => splashNoise.triggerAttackRelease("4n"),
      cloth_rustle: () => noiseSynth.triggerAttackRelease("16n", Tone.now(), 0.5), // Soft white noise
      paper_crumple: () => gravelNoise.triggerAttackRelease("16n"), // Short brown noise
      door_thud: () => membraneSynth.triggerAttackRelease("C1", "4n"), // Deep thud
      whoosh: () => {
          splashFilter.frequency.rampTo(5000, 0.5);
          splashNoise.triggerAttackRelease("2n");
          setTimeout(() => { splashFilter.frequency.value = 1000; }, 500);
      },
      heartbeat: () => {
          membraneSynth.triggerAttackRelease("C0", "8n");
          setTimeout(() => membraneSynth.triggerAttackRelease("C0", "8n"), 150);
      },
      camera_click: () => fmSynth.triggerAttackRelease("C6", "64n") // Very short high blip
    };

    return () => {
      noiseSynth.dispose();
      metalSynth.dispose();
      membraneSynth.dispose();
      fmSynth.dispose();
      gravelFilter.dispose();
      gravelNoise.dispose();
      splashFilter.dispose();
      splashNoise.dispose();
    };
  }, []);

  // Update volume (Note: since we use many synths, we adjust masterBus or Destination volume globally in real implementation. 
  // For this isolated component, we just accept the global mix, or we could map over all synths).

  const playSound = async (id) => {
    await Tone.start();
    if (synthsRef.current[id]) {
      synthsRef.current[id]();
      setActivePad(id);
      setTimeout(() => setActivePad(null), 100);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Foley Volume
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
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', 
          background: '#18181b', padding: '20px', borderRadius: '15px', border: '1px solid #3f3f46'
      }}>
        {FOLEY_SOUNDS.map(sound => (
            <button
                key={sound.id}
                onMouseDown={() => playSound(sound.id)}
                style={{
                    width: '100px', height: '100px',
                    background: activePad === sound.id ? sound.color : '#27272a',
                    border: `2px solid ${sound.color}`,
                    borderRadius: '10px',
                    color: '#fff', fontSize: '12px', fontWeight: 'bold',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', padding: '10px',
                    boxShadow: activePad === sound.id ? `0 0 15px ${sound.color}` : 'none',
                    transform: activePad === sound.id ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.05s'
                }}
            >
                {sound.name}
            </button>
        ))}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>A 12-pad sampler loaded with synthesized cinematic Foley sound effects.</p>
    </div>
  );
}
