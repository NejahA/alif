import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Plus, Minus, Volume2, Activity, RefreshCcw, Disc } from 'lucide-react';
import masterBus from '../audio/masterBus';

const INTERVALS = [
  { name: 'Unison', semitones: 0 },
  { name: 'Minor 2nd', semitones: 1 },
  { name: 'Major 2nd', semitones: 2 },
  { name: 'Minor 3rd', semitones: 3 },
  { name: 'Major 3rd', semitones: 4 },
  { name: 'Perfect 4th', semitones: 5 },
  { name: 'Tritone', semitones: 6 },
  { name: 'Perfect 5th', semitones: 7 },
  { name: 'Minor 6th', semitones: 8 },
  { name: 'Major 6th', semitones: 9 },
  { name: 'Minor 7th', semitones: 10 },
  { name: 'Major 7th', semitones: 11 },
  { name: 'Octave', semitones: 12 }
];

export default function Harmonizer() {
  const [voices, setVoices] = useState([{ id: 1, interval: 4, volume: -6, pan: -0.3, active: true }]);
  const [isActive, setIsActive] = useState(true);
  const [masterWet, setMasterWet] = useState(0.7);
  const [voiceCount, setVoiceCount] = useState(1);
  const voicesRef = useRef({});

  const addVoice = () => {
    if (voices.length >= 4) return;
    const newId = Date.now();
    setVoices(prev => [...prev, { id: newId, interval: 0, volume: -8, pan: 0, active: true }]);
    setVoiceCount(c => c + 1);
  };

  const removeVoice = (id) => {
    if (voices.length <= 1) return;
    setVoices(prev => prev.filter(v => v.id !== id));
    setVoiceCount(c => c - 1);
  };

  const updateVoice = (id, field, value) => {
    setVoices(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const getVoiceLabel = (interval) => {
    const found = INTERVALS.find(i => i.semitones === interval);
    return found ? found.name : `${interval} st`;
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '360px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Music size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Harmonizer</h3>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            border: 'none',
            background: isActive ? '#22c55e' : 'rgba(255,255,255,0.1)',
            color: isActive ? 'white' : 'var(--text-muted)',
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Dry/Wet Mix</span>
          <span>{Math.round(masterWet * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={masterWet} onChange={(e) => setMasterWet(Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Voices: {voiceCount}/4</span>
        <motion.button whileTap={{ scale: 0.95 }} onClick={addVoice} disabled={voices.length >= 4}
          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--accent-primary)', background: 'rgba(0,0,0,0.2)', color: 'var(--accent-primary)', cursor: voices.length >= 4 ? 'not-allowed' : 'pointer', opacity: voices.length >= 4 ? 0.3 : 1, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Plus size={12} /> Add Voice
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
        {voices.map((voice, idx) => (
          <motion.div
            key={voice.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Voice {idx + 1}</span>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <button
                  onClick={() => updateVoice(voice.id, 'active', !voice.active)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: voice.active ? '#22c55e' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {voice.active ? 'ON' : 'OFF'}
                </button>
                {voices.length > 1 && (
                  <button onClick={() => removeVoice(voice.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', opacity: 0.5 }}>
                    <Minus size={12} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {[0, 3, 4, 5, 7, 12].map(st => (
                <button
                  key={st}
                  onClick={() => updateVoice(voice.id, 'interval', st)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${voice.interval === st ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                    background: voice.interval === st ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
                    color: voice.interval === st ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    fontWeight: voice.interval === st ? 700 : 400
                  }}
                >
                  {INTERVALS.find(i => i.semitones === st)?.name.split(' ').pop()}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.5 }}>
                  <span>Volume</span>
                  <span>{voice.volume} dB</span>
                </div>
                <input type="range" min="-30" max="0" step="1" value={voice.volume} onChange={(e) => updateVoice(voice.id, 'volume', Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.5 }}>
                  <span>Pan</span>
                  <span>{voice.pan > 0 ? 'R' : 'L'}{Math.abs(Math.round(voice.pan * 100))}</span>
                </div>
                <input type="range" min="-1" max="1" step="0.05" value={voice.pan} onChange={(e) => updateVoice(voice.id, 'pan', Number(e.target.value))} style={{ accentColor: 'var(--accent-primary)' }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: 'center' }}>
        Creates harmony voices from input signal. Each voice adds an interval-shifted copy.
      </div>
    </div>
  );
}
