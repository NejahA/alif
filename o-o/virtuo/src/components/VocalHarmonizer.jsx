import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Mic, Music, Volume2, Users } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function VocalHarmonizer() {
  const [isListening, setIsListening] = useState(false);
  const [harmonies, setHarmonies] = useState({
    third: { active: true, shift: 4, gain: 0.5 },
    fifth: { active: true, shift: 7, gain: 0.4 },
    octave: { active: false, shift: 12, gain: 0.3 }
  });
  
  const nodesRef = useRef({});

  useEffect(() => {
    // Pitch shifters for harmonies
    nodesRef.current.third = new Tone.PitchShift(4).connect(masterBus);
    nodesRef.current.fifth = new Tone.PitchShift(7).connect(masterBus);
    nodesRef.current.octave = new Tone.PitchShift(12).connect(masterBus);
    nodesRef.current.dry = new Tone.Gain(1).connect(masterBus);
    
    nodesRef.current.input = new Tone.UserMedia();

    return () => {
      Object.values(nodesRef.current).forEach(n => n.dispose());
    };
  }, []);

  useEffect(() => {
    if (nodesRef.current.third) {
      nodesRef.current.third.pitch = harmonies.third.shift;
      nodesRef.current.third.wet.value = harmonies.third.active ? 1 : 0;
      nodesRef.current.third.volume.value = Tone.gainToDb(harmonies.third.gain);
      
      nodesRef.current.fifth.pitch = harmonies.fifth.shift;
      nodesRef.current.fifth.wet.value = harmonies.fifth.active ? 1 : 0;
      nodesRef.current.fifth.volume.value = Tone.gainToDb(harmonies.fifth.gain);
      
      nodesRef.current.octave.pitch = harmonies.octave.shift;
      nodesRef.current.octave.wet.value = harmonies.octave.active ? 1 : 0;
      nodesRef.current.octave.volume.value = Tone.gainToDb(harmonies.octave.gain);
    }
  }, [harmonies]);

  const toggleMic = async () => {
    if (isListening) {
      nodesRef.current.input.close();
      setIsListening(false);
    } else {
      try {
        await nodesRef.current.input.open();
        nodesRef.current.input.connect(nodesRef.current.third);
        nodesRef.current.input.connect(nodesRef.current.fifth);
        nodesRef.current.input.connect(nodesRef.current.octave);
        nodesRef.current.input.connect(nodesRef.current.dry);
        setIsListening(true);
      } catch (e) {
        alert("Could not access microphone: " + e.message);
      }
    }
  };

  const updateHarmony = (key, field, value) => {
    setHarmonies(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Users size={24} color="#f97316" /> Vocal Harmonizer
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Real-Time Artificial Choir</p>
      </div>

      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button 
          className={`btn-glass ${isListening ? 'active' : ''}`}
          onClick={toggleMic}
          style={{ 
            padding: '30px', borderRadius: '20px', fontSize: '1.5rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
            border: isListening ? '2px solid #f97316' : '2px solid #333'
          }}
        >
          {isListening ? <Mic size={32} color="#f97316" /> : <Mic size={32} />}
          {isListening ? 'HARMONIZER ACTIVE' : 'START MICROPHONE'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {Object.entries(harmonies).map(([key, data]) => (
            <div key={key} className="glass-panel" style={{ padding: '20px', opacity: data.active ? 1 : 0.5, border: data.active ? '1px solid #f97316' : '1px solid transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '12px' }}>{key}</span>
                <input 
                  type="checkbox" 
                  checked={data.active} 
                  onChange={(e) => updateHarmony(key, 'active', e.target.checked)} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>PITCH SHIFT</span>
                  <span>{data.shift > 0 ? '+' : ''}{data.shift}</span>
                </div>
                <input 
                  type="range" min="-24" max="24" step="1" 
                  value={data.shift} 
                  onChange={(e) => updateHarmony(key, 'shift', Number(e.target.value))}
                  style={{ accentColor: '#f97316' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>VOLUME</span>
                  <span>{Math.round(data.gain * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={data.gain} 
                  onChange={(e) => updateHarmony(key, 'gain', Number(e.target.value))}
                  style={{ accentColor: '#f97316' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
            <Music size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.9rem' }}>Tip: Use headphones to avoid feedback loops!</span>
         </div>
      </div>
    </div>
  );
}
