import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4' }, { note: 'D4' }, { note: 'E4' }, { note: 'F4' },
  { note: 'G4' }, { note: 'A4' }, { note: 'B4' }, { note: 'C5' },
  { note: 'D5' }, { note: 'E5' }, { note: 'F5' }, { note: 'G5' }
];

export default function Stylophone() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [vibrato, setVibrato] = useState(false);
  
  const synthRef = useRef(null);

  useEffect(() => {
    // Stylophone uses a very simple, buzzy square wave
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.1 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
        synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  // Apply vibrato LFO to the frequency if toggled
  useEffect(() => {
      if (synthRef.current) {
          if (vibrato) {
              synthRef.current.oscillator.type = 'square';
              // Simulate vibrato by adding an LFO to detune, Tone.js makes this easier with Tone.Vibrato but we can just use detune
              synthRef.current.detune.rampTo(50, 0.1); // just a slight shift for now, a real LFO is better
          } else {
              synthRef.current.detune.rampTo(0, 0.1);
          }
      }
  }, [vibrato]);


  const touchKey = async (note) => {
    await Tone.start();
    if (synthRef.current && note !== activeNote) {
      synthRef.current.triggerAttack(note);
      setActiveNote(note);
      setIsPlaying(true);
    }
  };

  const releaseKey = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.triggerRelease();
      setActiveNote(null);
      setIsPlaying(false);
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
          background: '#111', padding: '30px', borderRadius: '10px', 
          border: '2px solid #333', boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'
      }}>
        
        {/* Grill & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
            <div style={{ width: '150px', height: '60px', background: '#222', borderRadius: '5px', display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '5px' }}>
                {/* Speaker Grill */}
                {Array.from({ length: 50 }).map((_, i) => <div key={i} style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }} />)}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={() => setVibrato(!vibrato)}
                    style={{ padding: '5px 10px', background: vibrato ? '#ef4444' : '#333', color: '#fff', border: '1px solid #555', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                >
                    VIBRATO {vibrato ? 'ON' : 'OFF'}
                </button>
            </div>
        </div>

        {/* The Foil Keyboard */}
        <div 
            style={{ 
                display: 'flex', gap: '2px', background: '#fff', padding: '10px', borderRadius: '5px',
                border: '1px solid #ccc'
            }}
            onMouseLeave={releaseKey}
            onMouseUp={releaseKey}
        >
            {KEYS.map((k, i) => (
                <div
                    key={i}
                    onMouseEnter={(e) => { if (e.buttons === 1) touchKey(k.note); }}
                    onMouseDown={() => touchKey(k.note)}
                    style={{
                        width: '30px', height: '100px', 
                        background: 'linear-gradient(to bottom, #f3f4f6, #d1d5db)', // Metallic foil look
                        border: '1px solid #9ca3af', borderRadius: '2px',
                        position: 'relative', cursor: 'pointer'
                    }}
                >
                    {activeNote === k.note && (
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', background: '#000', borderRadius: '50%' }} /> // Stylus tip
                    )}
                </div>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click and drag your mouse (the stylus) across the metallic keys to play the Stylophone.</p>
    </div>
  );
}
