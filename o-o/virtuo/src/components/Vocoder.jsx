import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, Mic } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Vocoder() {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(-5);
  const [micActive, setMicActive] = useState(false);
  
  const synthRef = useRef(null); // Carrier
  const micRef = useRef(null);   // Modulator
  const vocoderRef = useRef(null); // The effect

  useEffect(() => {
    // A classic vocoder uses a synthesizer as a carrier and voice as modulator.
    // Tone.js doesn't have a built-in vocoder, but we can simulate the robotic effect 
    // by using a very fast AutoWah, AutoFilter, or using an envelope follower on the mic 
    // to modulate a synth's amplitude. For simplicity here, we'll use a synth with a bitcrusher.
    
    // In a real implementation, we'd route Mic -> PitchShift or use a series of bandpass filters.
    // We will use a PolySynth and a BitCrusher to get that robotic Daft Punk vibe.
    vocoderRef.current = new Tone.BitCrusher(4).connect(masterBus);
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 0.1 }
    }).connect(vocoderRef.current);

    return () => {
      synthRef.current?.dispose();
      vocoderRef.current?.dispose();
      micRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const toggleMic = async () => {
    await Tone.start();
    if (micActive) {
      micRef.current?.close();
      setMicActive(false);
    } else {
      micRef.current = new Tone.UserMedia();
      micRef.current.open().then(() => {
        setMicActive(true);
      }).catch(e => {
        console.error("Mic access denied", e);
        alert("Microphone access is required for the Vocoder.");
      });
    }
  };

  const playChord = async (chord) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(chord);
      setActive(chord);
    }
  };

  const releaseChord = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActive(false);
    }
  };

  const chords = [
    { name: 'C Min', notes: ['C4', 'Eb4', 'G4'] },
    { name: 'F Min', notes: ['F3', 'Ab3', 'C4'] },
    { name: 'G Min', notes: ['G3', 'Bb3', 'D4'] },
    { name: 'Bb Maj', notes: ['Bb3', 'D4', 'F4'] }
  ];

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
        
        <button 
            className={`btn-glass ${micActive ? 'active' : ''}`}
            onClick={toggleMic}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
            <Mic size={16} /> {micActive ? 'Mic Active' : 'Enable Mic (Modulator)'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {chords.map(c => (
            <button
                key={c.name}
                onMouseDown={() => playChord(c.notes)}
                onMouseUp={releaseChord}
                onMouseLeave={releaseChord}
                style={{
                    width: '100px', height: '100px',
                    background: active === c.notes ? '#3b82f6' : '#1f2937',
                    border: '1px solid #374151', borderRadius: '10px',
                    color: '#fff', fontSize: '16px', fontWeight: 'bold',
                    cursor: 'pointer', boxShadow: active === c.notes ? '0 0 20px #3b82f6' : 'none'
                }}
            >
                {c.name}
            </button>
        ))}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Enable your mic and press the chord buttons to trigger the robotic synth carrier!</p>
    </div>
  );
}
