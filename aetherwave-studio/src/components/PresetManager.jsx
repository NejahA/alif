import React, { useState, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Sparkles, Bookmark, Download, Trash2, Play, Volume2 } from 'lucide-react';

export const PresetManager = ({ 
  isOpen, 
  onClose, 
  setActiveTheme, 
  recordedAudioUrl, 
  clearRecordedAudio 
}) => {
  const [userPresets, setUserPresets] = useState([]);
  const [presetNameInput, setPresetNameInput] = useState('');

  // Built-in curated Mood Presets
  const moodPresets = [
    {
      id: 'galactic',
      name: 'Galactic Drift',
      desc: 'Deep cosmic binaural theta float with pentatonic harmonies',
      theme: 'cosmic',
      color: '#8b5cf6',
      apply: () => {
        audioEngine.updateParam('waveform', 'sine');
        audioEngine.updateParam('filterCutoff', 1800);
        audioEngine.updateParam('delayFeedback', 0.5);
        audioEngine.updateParam('reverbWet', 0.7);
        audioEngine.updateParam('scaleName', 'pentatonic');
        audioEngine.updateParam('noiseVolume', 0.08);
        audioEngine.setBinauralBeats(true);
        setActiveTheme('cosmic');
      }
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Night',
      desc: 'High-energy dark minor synth sweep with neon visualizer',
      theme: 'cyberpunk',
      color: '#ec4899',
      apply: () => {
        audioEngine.updateParam('waveform', 'sawtooth');
        audioEngine.updateParam('filterCutoff', 4500);
        audioEngine.updateParam('filterResonance', 6);
        audioEngine.updateParam('delayFeedback', 0.35);
        audioEngine.updateParam('reverbWet', 0.4);
        audioEngine.updateParam('scaleName', 'cyberpunk');
        audioEngine.updateParam('noiseVolume', 0.02);
        audioEngine.setBinauralBeats(false);
        setActiveTheme('cyberpunk');
      }
    },
    {
      id: 'zen',
      name: 'Zen Sanctuary',
      desc: 'Soothing lowpass ambient pads with atmospheric wind',
      theme: 'zen',
      color: '#10b981',
      apply: () => {
        audioEngine.updateParam('waveform', 'triangle');
        audioEngine.updateParam('filterCutoff', 1000);
        audioEngine.updateParam('filterResonance', 2);
        audioEngine.updateParam('delayFeedback', 0.25);
        audioEngine.updateParam('reverbWet', 0.6);
        audioEngine.updateParam('scaleName', 'ambientMinor');
        audioEngine.updateParam('noiseVolume', 0.12);
        audioEngine.setBinauralBeats(true);
        setActiveTheme('zen');
      }
    },
    {
      id: 'solar',
      name: 'Solar Storm',
      desc: 'Bright Lydian harmonies and energetic flare visualizer',
      theme: 'solar',
      color: '#f59e0b',
      apply: () => {
        audioEngine.updateParam('waveform', 'square');
        audioEngine.updateParam('filterCutoff', 3200);
        audioEngine.updateParam('delayFeedback', 0.4);
        audioEngine.updateParam('reverbWet', 0.45);
        audioEngine.updateParam('scaleName', 'lydian');
        audioEngine.updateParam('noiseVolume', 0.04);
        audioEngine.setBinauralBeats(false);
        setActiveTheme('solar');
      }
    }
  ];

  // Load custom user presets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aetherwave_user_presets');
      if (saved) setUserPresets(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCustomPreset = () => {
    if (!presetNameInput.trim()) return;
    const newPreset = {
      id: Date.now().toString(),
      name: presetNameInput.trim(),
      params: { ...audioEngine.params }
    };
    const updated = [...userPresets, newPreset];
    setUserPresets(updated);
    localStorage.setItem('aetherwave_user_presets', JSON.stringify(updated));
    setPresetNameInput('');
  };

  const deleteCustomPreset = (id) => {
    const updated = userPresets.filter(p => p.id !== id);
    setUserPresets(updated);
    localStorage.setItem('aetherwave_user_presets', JSON.stringify(updated));
  };

  const applyCustomPreset = (preset) => {
    Object.keys(preset.params).forEach(key => {
      audioEngine.updateParam(key, preset.params[key]);
    });
  };

  if (!isOpen && !recordedAudioUrl) return null;

  return (
    <div style={{ position: 'relative', zIndex: 45 }}>
      {/* Recorded Audio Export Modal Popup */}
      {recordedAudioUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{
            width: '420px',
            padding: '28px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid var(--accent-cyan)'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
              Audio Performance Captured!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Your live generative soundscape has been rendered and is ready for export.
            </p>

            <audio controls src={recordedAudioUrl} style={{ width: '100%', marginTop: '8px' }} />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
              <a 
                href={recordedAudioUrl} 
                download="aetherwave-performance.webm"
                className="btn-primary" 
                style={{ textDecoration: 'none', padding: '0.6rem 1.4rem' }}
              >
                <Download size={16} /> Download File
              </a>
              <button 
                onClick={clearRecordedAudio}
                className="btn-icon"
                style={{ width: 'auto', padding: '0 16px' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mood Presets Drawer */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          width: '380px',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-pink)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Curated Mood Presets</h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          {/* Curated Mood Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {moodPresets.map(preset => (
              <div 
                key={preset.id} 
                onClick={preset.apply}
                className="glass-panel"
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${preset.color}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{preset.name}</span>
                  <span style={{ fontSize: '0.7rem', color: preset.color, fontFamily: 'var(--font-mono)' }}>Activate →</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{preset.desc}</p>
              </div>
            ))}
          </div>

          {/* User Custom Presets Section */}
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={14} /> My Saved Presets
            </h3>

            {/* Save Form */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                placeholder="Preset Name..." 
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button 
                onClick={saveCustomPreset} 
                className="btn-primary" 
                style={{ padding: '0 14px', fontSize: '0.8rem' }}
              >
                Save
              </button>
            </div>

            {/* Saved list */}
            {userPresets.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>No custom presets saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {userPresets.map(up => (
                  <div key={up.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                    <span onClick={() => applyCustomPreset(up)} style={{ fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}>{up.name}</span>
                    <button onClick={() => deleteCustomPreset(up.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
