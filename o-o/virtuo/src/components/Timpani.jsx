import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Timpani() {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(-2);
  const [pitch, setPitch] = useState(100); // Base Hz
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 4, wet: 0.5 }).connect(masterBus);
    
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.1,
      octaves: 1,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 2, sustain: 0, release: 2 }
    }).connect(reverbRef.current);

    return () => {
      synthRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  // Handle pedal pitch bend
  useEffect(() => {
    if (synthRef.current) {
        // We can't directly bend a MembraneSynth base pitch easily after strike without triggering it,
        // but we can if we use a MonoSynth. But since MembraneSynth is better for the attack,
        // we will simulate the pedal by setting the next strike's base pitch.
        // Actually, for Timpani, the pedal bends the ringing note.
        // Let's use a trick: detune.
        synthRef.current.detune.rampTo((pitch - 100) * 5, 0.1); 
    }
  }, [pitch]);

  const playHit = async () => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(pitch, '2n');
      setActive(true);
      setTimeout(() => setActive(false), 150);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'space-between' }}>
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

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '40px' }}>
        {/* Pedal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Pedal (Pitch)</div>
            <input 
                type="range" min="60" max="150" step="1" 
                value={pitch} 
                onChange={(e) => setPitch(Number(e.target.value))}
                style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '200px', accentColor: '#a16207' }}
            />
            <div style={{ color: '#a16207' }}>{pitch} Hz</div>
        </div>

        {/* The Drum */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
                width: '300px', height: '100px', 
                background: '#f5f5f5', borderRadius: '50%',
                border: '10px solid #b8860b', // Copper rim
                boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                position: 'relative',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 2
            }}>
                {/* Hit area */}
                <motion.div
                    animate={{ scale: active ? 0.98 : 1, backgroundColor: active ? 'rgba(0,0,0,0.1)' : 'transparent' }}
                    onMouseDown={playHit}
                    style={{ width: '80%', height: '80%', borderRadius: '50%', cursor: 'pointer' }}
                />
            </div>
            
            {/* Kettle bowl */}
            <div style={{ 
                width: '280px', height: '200px', 
                background: 'radial-gradient(ellipse at top, #d4af37 0%, #8b6508 100%)',
                borderBottomLeftRadius: '140px', borderBottomRightRadius: '140px',
                marginTop: '-50px',
                zIndex: 1,
                boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.5)'
            }} />
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the drum head to strike, and move the pedal to bend the pitch.</p>
    </div>
  );
}
