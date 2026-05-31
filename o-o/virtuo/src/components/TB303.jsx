import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STEPS = 16;

export default function TB303() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState(-5);
  
  // 303 Controls
  const [cutoff, setCutoff] = useState(1000); // Filter cutoff
  const [resonance, setResonance] = useState(10); // High resonance for "acid" sound
  const [envMod, setEnvMod] = useState(5000); // Envelope modulation amount
  const [decay, setDecay] = useState(0.2); // Envelope decay

  // Sequence: note string or null
  const [sequence, setSequence] = useState([
    'C2', 'C3', null, 'C2', 'Eb2', null, 'F2', 'F1',
    'C2', 'Bb1', null, 'C2', 'G2', 'F2', 'Eb2', 'C2'
  ]);

  const synthRef = useRef(null);

  useEffect(() => {
    // The Acid Sound: Sawtooth wave into a highly resonant lowpass filter
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { type: 'lowpass', rolloff: -24, Q: resonance },
      envelope: { attack: 0.01, decay: decay, sustain: 0, release: 0.1 },
      filterEnvelope: { attack: 0.01, decay: decay, sustain: 0, release: 0.1, baseFrequency: cutoff, octaves: 4 }
    }).connect(masterBus);

    return () => {
      synthRef.current?.dispose();
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  // Update Synth Parameters in real-time
  useEffect(() => {
    if (synthRef.current) {
        synthRef.current.volume.rampTo(volume, 0.1);
        synthRef.current.filter.Q.value = resonance;
        synthRef.current.filterEnvelope.baseFrequency = cutoff;
        synthRef.current.filterEnvelope.octaves = envMod / cutoff;
        synthRef.current.envelope.decay = decay;
        synthRef.current.filterEnvelope.decay = decay;
    }
  }, [volume, cutoff, resonance, envMod, decay]);

  // Sequencer Logic
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;

    const loop = new Tone.Sequence((time, step) => {
      setCurrentStep(step);
      const note = sequence[step];
      if (note && synthRef.current) {
        synthRef.current.triggerAttackRelease(note, '16n', time);
      }
    }, Array.from({ length: STEPS }, (_, i) => i), "16n");

    if (isPlaying) {
      Tone.start();
      loop.start(0);
      Tone.Transport.start();
    } else {
      loop.stop();
      Tone.Transport.stop();
      setCurrentStep(0);
    }

    return () => {
      loop.dispose();
    };
  }, [isPlaying, sequence, tempo]);

  const togglePlay = async () => {
    await Tone.start();
    setIsPlaying(!isPlaying);
  };

  const randomizeSequence = () => {
      const scale = ['C1', 'Eb1', 'F1', 'G1', 'Bb1', 'C2', 'Eb2', 'F2', 'G2'];
      const newSeq = Array.from({ length: STEPS }).map(() => {
          if (Math.random() > 0.7) return null; // Rest
          return scale[Math.floor(Math.random() * scale.length)];
      });
      setSequence(newSeq);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '800px' }}>
      
      <div style={{ 
          background: '#d4d4d8', // Silver plastic
          padding: '20px', borderRadius: '15px', border: '1px solid #a1a1aa',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '100%'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #52525b', paddingBottom: '10px' }}>
            <div style={{ color: '#111', fontSize: '24px', fontWeight: '900', fontStyle: 'italic' }}>
                TB-303
            </div>
            <button 
                onClick={togglePlay}
                style={{ 
                    padding: '5px 20px', background: isPlaying ? '#ef4444' : '#d4d4d8',
                    color: isPlaying ? '#fff' : '#111', border: '2px solid #111', borderRadius: '5px', cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                {isPlaying ? 'STOP' : 'START'}
            </button>
        </div>

        {/* Knobs Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '10px', background: '#e4e4e7', borderRadius: '5px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#111' }}>CUTOFF</label>
                <input type="range" min="100" max="5000" step="10" value={cutoff} onChange={(e) => setCutoff(Number(e.target.value))} style={{ width: '80px', accentColor: '#111' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#111' }}>RESONANCE</label>
                <input type="range" min="1" max="20" step="1" value={resonance} onChange={(e) => setResonance(Number(e.target.value))} style={{ width: '80px', accentColor: '#111' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#111' }}>ENV MOD</label>
                <input type="range" min="1000" max="10000" step="100" value={envMod} onChange={(e) => setEnvMod(Number(e.target.value))} style={{ width: '80px', accentColor: '#111' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#111' }}>DECAY</label>
                <input type="range" min="0.1" max="1" step="0.1" value={decay} onChange={(e) => setDecay(Number(e.target.value))} style={{ width: '80px', accentColor: '#111' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#111' }}>TEMPO</label>
                <input type="range" min="60" max="200" value={tempo} onChange={(e) => setTempo(Number(e.target.value))} style={{ width: '80px', accentColor: '#111' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#111' }}>VOLUME</label>
                <input type="range" min="-30" max="0" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ width: '80px', accentColor: '#111' }} />
            </div>

        </div>

        {/* Sequencer Lights & Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
                {sequence.map((note, i) => (
                    <div key={i} style={{ 
                        flex: 1, height: '10px', borderRadius: '5px',
                        background: currentStep === i ? '#ef4444' : '#a1a1aa',
                        boxShadow: currentStep === i ? '0 0 10px #ef4444' : 'none'
                    }} />
                ))}
            </div>
            
            <div style={{ display: 'flex', gap: '5px' }}>
                {sequence.map((note, i) => (
                    <div key={i} style={{ 
                        flex: 1, height: '30px', background: note ? '#111' : '#d4d4d8',
                        border: '1px solid #71717a', borderRadius: '3px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: note ? '#fff' : '#111', fontSize: '10px', fontWeight: 'bold'
                    }}>
                        {note || '-'}
                    </div>
                ))}
            </div>
        </div>

        <button 
            onClick={randomizeSequence}
            style={{ marginTop: '20px', padding: '10px', width: '100%', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
            Generate Random Acid Line
        </button>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Hit START and sweep the CUTOFF and RESONANCE knobs to get that classic squelchy acid techno sound.</p>
    </div>
  );
}
