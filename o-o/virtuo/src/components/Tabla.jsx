import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Tabla() {
  const [activeDrums, setActiveDrums] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  
  const bayanRef = useRef(null); // Larger, deeper drum (left)
  const dayanRef = useRef(null); // Smaller, higher drum (right)
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 1.2, wet: 0.2 }).connect(masterBus);
    
    // Bayan (Deep, bendable)
    bayanRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.8, sustain: 0.01, release: 1 }
    }).connect(reverbRef.current);
    
    // Dayan (High, sharp)
    dayanRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 1,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.5 }
    }).connect(reverbRef.current);

    return () => {
      bayanRef.current?.dispose();
      dayanRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (bayanRef.current && dayanRef.current) {
      bayanRef.current.volume.rampTo(volume + 5, 0.1); // Boost Bayan slightly
      dayanRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const playBayan = async (type) => {
    await Tone.start();
    if (bayanRef.current) {
      if (type === 'open') {
        bayanRef.current.triggerAttackRelease('G2', '8n');
      } else { // closed/slap
        bayanRef.current.triggerAttackRelease('C3', '16n');
      }
      triggerVisual('bayan');
    }
  };

  const playDayan = async (type) => {
    await Tone.start();
    if (dayanRef.current) {
      if (type === 'na') {
        dayanRef.current.triggerAttackRelease('C5', '16n');
      } else if (type === 'tin') {
        dayanRef.current.triggerAttackRelease('G4', '8n');
      } else { // tun
        dayanRef.current.triggerAttackRelease('E4', '4n');
      }
      triggerVisual('dayan');
    }
  };

  const triggerVisual = (drum) => {
    setActiveDrums(prev => new Set(prev).add(drum));
    setTimeout(() => {
      setActiveDrums(prev => {
        const next = new Set(prev);
        next.delete(drum);
        return next;
      });
    }, 100);
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

      <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-end', height: '300px' }}>
        
        {/* Bayan (Left, Copper/Brass) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <motion.div
            animate={{ scale: activeDrums.has('bayan') ? 1.05 : 1 }}
            style={{
              width: '180px', height: '180px',
              background: 'radial-gradient(circle at center, #eee 40%, #555 90%, #d4af37 100%)',
              borderRadius: '50%',
              position: 'relative',
              boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
            {/* Syahi (Black center) */}
            <div style={{ width: '70px', height: '70px', background: '#222', borderRadius: '50%', position: 'absolute', top: '30%', left: '30%' }} />
            
            {/* Hit Zones */}
            <div 
              style={{ position: 'absolute', top: '10%', left: '10%', width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', background: 'rgba(255,255,255,0.1)' }}
              onMouseDown={() => playBayan('closed')}
              title="Closed (Ke)"
            />
            <div 
              style={{ position: 'absolute', bottom: '20%', right: '20%', width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer', background: 'rgba(255,255,255,0.1)' }}
              onMouseDown={() => playBayan('open')}
              title="Open (Ge)"
            />
          </motion.div>
          <div style={{ color: 'var(--text-muted)' }}>Bayan (Bass)</div>
        </div>

        {/* Dayan (Right, Wood) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <motion.div
            animate={{ scale: activeDrums.has('dayan') ? 1.05 : 1 }}
            style={{
              width: '140px', height: '140px',
              background: 'radial-gradient(circle at center, #eee 30%, #555 80%, #8b4513 100%)',
              borderRadius: '50%',
              position: 'relative',
              boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
            {/* Syahi (Black center) */}
            <div style={{ width: '60px', height: '60px', background: '#222', borderRadius: '50%' }} />
            
            {/* Hit Zones */}
            <div 
              style={{ position: 'absolute', top: '5%', left: '40%', width: '30px', height: '30px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}
              onMouseDown={() => playDayan('na')}
              title="Edge (Na)"
            />
            <div 
              style={{ position: 'absolute', top: '30%', right: '10%', width: '30px', height: '30px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}
              onMouseDown={() => playDayan('tin')}
              title="Mid (Tin)"
            />
             <div 
              style={{ position: 'absolute', top: '40%', left: '40%', width: '40px', height: '40px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}
              onMouseDown={() => playDayan('tun')}
              title="Center (Tun)"
            />
          </motion.div>
          <div style={{ color: 'var(--text-muted)' }}>Dayan (Treble)</div>
        </div>

      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click different areas of the drums for different sounds.</p>
    </div>
  );
}
