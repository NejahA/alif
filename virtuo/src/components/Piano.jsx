import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { getChannel } from '../audio/masterBus';
import PresetManager from './PresetManager';
import InstrumentFXChain from './InstrumentFXChain';
import { SlidersHorizontal } from 'lucide-react';
import { useAudioSafe } from '../hooks/useAudioSafe';

const NOTES = [
  { note: 'C4', type: 'white', key: 'a' },
  { note: 'C#4', type: 'black', key: 'w' },
  { note: 'D4', type: 'white', key: 's' },
  { note: 'D#4', type: 'black', key: 'e' },
  { note: 'E4', type: 'white', key: 'd' },
  { note: 'F4', type: 'white', key: 'f' },
  { note: 'F#4', type: 'black', key: 't' },
  { note: 'G4', type: 'white', key: 'g' },
  { note: 'G#4', type: 'black', key: 'y' },
  { note: 'A4', type: 'white', key: 'h' },
  { note: 'A#4', type: 'black', key: 'u' },
  { note: 'B4', type: 'white', key: 'j' },
  { note: 'C5', type: 'white', key: 'k' },
];

export default function Piano() {
  const isAudioReady = useAudioSafe();
  const synthRef = useRef(null);
  const bridgeRef = useRef(null);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [showFX, setShowFX] = useState(false);
  const [skin, setSkin] = useState({ primary: 'var(--accent-primary)', glow: 'var(--accent-glow)' });

  useEffect(() => {
    const updateSkin = () => {
      const saved = localStorage.getItem('virtuo_virtues');
      if (saved) {
        const virtues = JSON.parse(saved);
        const virtueColors = {
          harmony: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
          rhythm: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
          timbre: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
          expression: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' },
          innovation: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
          theory: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' }
        };
        
        let maxXP = -1;
        let dominant = 'innovation';
        Object.entries(virtues).forEach(([v, data]) => {
          if (data.xp > maxXP) {
            maxXP = data.xp;
            dominant = v;
          }
        });

        const level = Math.floor(Math.sqrt(maxXP / 100));
        if (level >= 10) { // Mastery skin unlock
          setSkin(virtueColors[dominant]);
        } else {
          setSkin({ primary: 'var(--accent-primary)', glow: 'var(--accent-glow)' });
        }
      }
    };

    updateSkin();
    window.addEventListener('virtuo-gain-xp', updateSkin);
    return () => window.removeEventListener('virtuo-gain-xp', updateSkin);
  }, []);
  const [settings, setSettings] = useState({
    oscType: 'sine',
    attack: 0.05,
    decay: 0.2,
    sustain: 0.5,
    release: 1
  });

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    // Dispatch for automation
    Object.keys(newSettings).forEach(key => {
      if (newSettings[key] !== settings[key]) {
        window.dispatchEvent(new CustomEvent('virtuo-param-change', {
          detail: { instrumentId: 'piano', paramId: key, value: newSettings[key] }
        }));
      }
    });
  };

  useEffect(() => {
    const handleAutomation = (e) => {
      const { instrumentId, paramId, value } = e.detail;
      if (instrumentId === 'piano') {
        setSettings(prev => ({ ...prev, [paramId]: value }));
      }
    };
    window.addEventListener('virtuo-automation-play', handleAutomation);
    return () => window.removeEventListener('virtuo-automation-play', handleAutomation);
  }, []);

  useEffect(() => {
    if (!isAudioReady) return;
    // Bridge node for FX chain
    bridgeRef.current = new Tone.Gain(1);

    // Initialize Tone.js PolySynth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: settings.oscType },
      envelope: { 
        attack: settings.attack, 
        decay: settings.decay, 
        sustain: settings.sustain, 
        release: settings.release 
      },
    }).connect(bridgeRef.current);

    // MIDI Listeners
    const onMidiOn = (e) => {
      playNote(e.detail.note);
    };
    const onMidiOff = (e) => {
      releaseNote(e.detail.note);
    };

    window.addEventListener('virtuo-midi-on', onMidiOn);
    window.addEventListener('virtuo-midi-off', onMidiOff);

    const handleKeyDown = (e) => {
      const keyObj = NOTES.find(n => n.key === e.key.toLowerCase());
      if (keyObj && !activeKeys.has(keyObj.note)) {
        playNote(keyObj.note);
      }
    };

    const handleKeyUp = (e) => {
      const keyObj = NOTES.find(n => n.key === e.key.toLowerCase());
      if (keyObj) {
        releaseNote(keyObj.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      synthRef.current?.dispose();
      bridgeRef.current?.dispose();
      window.removeEventListener('virtuo-midi-on', onMidiOn);
      window.removeEventListener('virtuo-midi-off', onMidiOff);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        oscillator: { type: settings.oscType },
        envelope: { 
          attack: settings.attack, 
          decay: settings.decay, 
          sustain: settings.sustain, 
          release: settings.release 
        }
      });
    }
  }, [settings]);

  const playNote = async (note) => {
    await Tone.start(); // Ensure audio context is started
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveKeys(prev => new Set(prev).add(note));
      
      // Gain XP in Harmony and Expression
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'harmony', amount: 1 }
      }));
      window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
        detail: { virtue: 'expression', amount: 1 }
      }));
    }
  };

  const releaseNote = (note) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <PresetManager 
          instrumentType="piano"
          currentSettings={settings}
          onLoadPreset={setSettings}
        />
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>Tone Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>Oscillator</span>
              <select 
                value={settings.oscType}
                onChange={(e) => updateSettings({ ...settings, oscType: e.target.value })}
                className="btn-glass"
                style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Release</span>
                <span>{settings.release}s</span>
              </div>
              <input 
                type="range" min="0.1" max="4" step="0.1"
                value={settings.release}
                onChange={(e) => updateSettings({ ...settings, release: Number(e.target.value) })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
            </div>
            <button 
              className={`btn-glass ${showFX ? 'active' : ''}`}
              onClick={() => setShowFX(!showFX)}
              style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
            >
              <SlidersHorizontal size={14} /> {showFX ? 'Hide FX Chain' : 'Show FX Chain'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: showFX ? 'block' : 'none', width: '100%' }}>
        <InstrumentFXChain 
          instrumentId="piano" 
          inputNode={bridgeRef.current} 
          outputNode={getChannel('piano')} 
        />
      </div>

      <div style={{ position: 'relative', display: 'flex', height: '300px', margin: '40px 0', justifyContent: 'center' }}>
      {NOTES.map((keyObj, i) => {
        const isBlack = keyObj.type === 'black';
        const isActive = activeKeys.has(keyObj.note);

        return (
          <motion.div
            key={keyObj.note}
            onMouseDown={() => playNote(keyObj.note)}
            onMouseUp={() => releaseNote(keyObj.note)}
            onMouseLeave={() => releaseNote(keyObj.note)}
            animate={{
              boxShadow: isActive ? `0 0 20px ${skin.glow}` : 'none',
              y: isActive ? 5 : 0
            }}
            transition={{ duration: 0.1 }}
            style={{
              width: isBlack ? '40px' : '60px',
              height: isBlack ? '200px' : '300px',
              background: isBlack ? 'var(--key-black)' : 'var(--key-white)',
              border: `1px solid ${isActive ? skin.primary : '#333'}`,
              borderRadius: '0 0 4px 4px',
              marginLeft: isBlack ? '-20px' : '0',
              marginRight: isBlack ? '-20px' : '0',
              zIndex: isBlack ? 2 : 1,
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '20px',
              color: isBlack ? 'white' : 'black',
              fontWeight: 600,
              userSelect: 'none'
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: skin.primary,
                opacity: 0.5,
                borderRadius: '0 0 4px 4px',
              }} />
            )}
            <div style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 0.7 }}>
              <span style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '3px', textTransform: 'uppercase' }}>{keyObj.key}</span>
              <span style={{ fontSize: '0.8rem' }}>{keyObj.note}</span>
            </div>
          </motion.div>
        );
      })}
      </div>
    </div>
  );
}
