import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const CHANTER_NOTES = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5', 'A5'];

export default function Bagpipes() {
  const [dronesActive, setDronesActive] = useState(false);
  const [activeChanter, setActiveChanter] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const drone1Ref = useRef(null);
  const drone2Ref = useRef(null);
  const chanterRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).connect(masterBus);
    
    // Drones (usually bass and tenor tuned to A)
    const droneOpts = { oscillator: { type: 'sawtooth' }, envelope: { attack: 1, release: 2 } };
    drone1Ref.current = new Tone.Synth(droneOpts).connect(reverbRef.current);
    drone2Ref.current = new Tone.Synth(droneOpts).connect(reverbRef.current);
    
    // Chanter (melody pipe)
    chanterRef.current = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      filter: { type: 'bandpass', frequency: 1500, Q: 1.5 },
      envelope: { attack: 0.05, decay: 0.1, sustain: 1, release: 0.1 }
    }).connect(reverbRef.current);

    return () => {
      drone1Ref.current?.dispose();
      drone2Ref.current?.dispose();
      chanterRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (drone1Ref.current) drone1Ref.current.volume.rampTo(volume - 5, 0.1);
    if (drone2Ref.current) drone2Ref.current.volume.rampTo(volume - 5, 0.1);
    if (chanterRef.current) chanterRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  const toggleDrones = async () => {
    await Tone.start();
    if (dronesActive) {
      drone1Ref.current.triggerRelease();
      drone2Ref.current.triggerRelease();
    } else {
      drone1Ref.current.triggerAttack('A2'); // Bass drone
      drone2Ref.current.triggerAttack('A3'); // Tenor drone
    }
    setDronesActive(!dronesActive);
  };

  const playChanter = async (note) => {
    await Tone.start();
    if (chanterRef.current) {
      chanterRef.current.triggerAttack(note);
      setActiveChanter(note);
    }
  };

  const releaseChanter = () => {
    if (chanterRef.current) {
      chanterRef.current.triggerRelease();
      setActiveChanter(null);
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

      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        
        {/* The Bag and Drones */}
        <div style={{ position: 'relative', width: '200px', height: '300px' }}>
            {/* Drones */}
            <div style={{ position: 'absolute', top: 0, left: '20px', width: '20px', height: '150px', background: '#3e2723', transform: 'rotate(-20deg)' }} />
            <div style={{ position: 'absolute', top: '10px', left: '80px', width: '20px', height: '200px', background: '#3e2723' }} />
            <div style={{ position: 'absolute', top: '20px', left: '140px', width: '20px', height: '150px', background: '#3e2723', transform: 'rotate(20deg)' }} />

            {/* The Bag */}
            <div 
                style={{ 
                    position: 'absolute', bottom: 0, width: '100%', height: '180px', 
                    background: '#8b0000', // Tartan red
                    borderRadius: '50% 50% 40% 60%',
                    boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <button className={`btn-glass ${dronesActive ? 'active' : ''}`} onClick={toggleDrones} style={{ zIndex: 10 }}>
                    {dronesActive ? 'Squeeze Bag (Stop)' : 'Inflate Bag (Drones)'}
                </button>
            </div>
        </div>

        {/* The Chanter (Melody) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: '#111', padding: '10px', borderRadius: '10px', border: '1px solid #333' }}>
            <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>Chanter</div>
            {CHANTER_NOTES.map(note => (
                <button
                    key={note}
                    onMouseDown={() => playChanter(note)}
                    onMouseUp={releaseChanter}
                    onMouseLeave={releaseChanter}
                    style={{
                        width: '80px', height: '30px', 
                        background: activeChanter === note ? '#ef4444' : '#3f3f46',
                        color: '#fff', border: 'none', borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {note}
                </button>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Inflate the bag to start the constant drone, then play melodies on the Chanter.</p>
    </div>
  );
}
