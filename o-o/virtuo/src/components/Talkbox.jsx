import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, Mic } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Talkbox() {
  const [active, setActive] = useState(false);
  const [volume, setVolume] = useState(-5);
  const [micActive, setMicActive] = useState(false);
  
  const synthRef = useRef(null); // Carrier (The guitar/synth)
  const micRef = useRef(null);   // Modulator (The mouth tube)
  const autoFilterRef = useRef(null); 

  useEffect(() => {
    // Talkbox effect: A gnarly sawtooth synth acting as the carrier.
    // In reality, the sound is played into a tube in the mouth. 
    // We emulate this by using a very resonant AutoFilter that reacts to envelope to simulate the "talking".
    // Alternatively, just a bitcrusher and wah to sound funky.
    
    autoFilterRef.current = new Tone.AutoFilter({
        frequency: 4,
        type: 'sine',
        depth: 1,
        baseFrequency: 200,
        octaves: 4,
        filter: { type: 'bandpass', Q: 5 }
    }).connect(masterBus);
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 1, release: 0.1 }
    }).connect(autoFilterRef.current);

    return () => {
      synthRef.current?.dispose();
      autoFilterRef.current?.dispose();
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
      if(autoFilterRef.current) autoFilterRef.current.stop();
    } else {
      micRef.current = new Tone.UserMedia();
      micRef.current.open().then(() => {
        setMicActive(true);
        if(autoFilterRef.current) autoFilterRef.current.start();
      }).catch(e => {
        console.error("Mic access denied", e);
        alert("Microphone access is required for the Talkbox.");
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
    { name: 'E Min7', notes: ['E3', 'G3', 'B3', 'D4'] },
    { name: 'A Min7', notes: ['A2', 'C3', 'E3', 'G3'] },
    { name: 'D 9', notes: ['D3', 'F#3', 'C4', 'E4'] },
    { name: 'G Maj7', notes: ['G2', 'B2', 'D3', 'F#3'] }
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
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: micActive ? '#eab308' : 'transparent', color: micActive ? '#000' : '#fff' }}
        >
            <Mic size={16} /> {micActive ? 'Tube in Mouth!' : 'Grab the Tube (Mic)'}
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
                    background: active === c.notes ? '#eab308' : '#1f2937',
                    border: '2px solid #ca8a04', borderRadius: '10px',
                    color: active === c.notes ? '#000' : '#eab308', fontSize: '16px', fontWeight: 'bold',
                    cursor: 'pointer', boxShadow: active === c.notes ? '0 0 20px #eab308' : 'none'
                }}
            >
                {c.name}
            </button>
        ))}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Enable your mic to "put the tube in your mouth", then play funky chords!</p>
    </div>
  );
}
