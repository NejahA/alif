import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SOUNDS = [
  { id: 'rain', label: '🌧 Rain', emoji: '🌧', color: '#4a90d9' },
  { id: 'forest', label: '🌲 Forest', emoji: '🌲', color: '#2d8a4e' },
  { id: 'ocean', label: '🌊 Ocean', emoji: '🌊', color: '#0077be' },
  { id: 'fire', label: '🔥 Fire', emoji: '🔥', color: '#e25822' },
  { id: 'wind', label: '💨 Wind', emoji: '💨', color: '#8ecae6' },
  { id: 'cafe', label: '☕ Cafe', emoji: '☕', color: '#a0522d' },
];

// Generate white noise as a fallback ambient sound
function createNoiseBuffer(audioCtx, duration) {
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createFilteredNoise(audioCtx, type) {
  const duration = 4;
  const buffer = createNoiseBuffer(audioCtx, duration);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  switch (type) {
    case 'rain':
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;
      gain.gain.value = 0.3;
      break;
    case 'forest':
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1.5;
      gain.gain.value = 0.2;
      break;
    case 'ocean':
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      filter.Q.value = 0.3;
      gain.gain.value = 0.35;
      // Add LFO for wave effect
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 0.1;
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      break;
    case 'fire':
      filter.type = 'highpass';
      filter.frequency.value = 500;
      filter.Q.value = 0.8;
      gain.gain.value = 0.25;
      break;
    case 'wind':
      filter.type = 'highpass';
      filter.frequency.value = 3000;
      filter.Q.value = 0.5;
      gain.gain.value = 0.15;
      break;
    case 'cafe':
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.3;
      gain.gain.value = 0.2;
      break;
    default:
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      gain.gain.value = 0.2;
  }

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  return { source, gain, filter, start: () => source.start(), stop: () => source.stop() };
}

export default function AmbientMixer() {
  const [volumes, setVolumes] = useLocalStorage('ambient-volumes', {});
  const [isPlaying, setIsPlaying] = useState({});
  const audioCtxRef = useRef(null);
  const nodesRef = useRef({});

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const toggleSound = useCallback((soundId) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    if (isPlaying[soundId]) {
      if (nodesRef.current[soundId]) {
        nodesRef.current[soundId].stop();
        nodesRef.current[soundId].source.disconnect();
        delete nodesRef.current[soundId];
      }
      setIsPlaying(prev => ({ ...prev, [soundId]: false }));
    } else {
      const node = createFilteredNoise(ctx, soundId);
      const vol = volumes[soundId] ?? 50;
      node.gain.gain.value = (vol / 100) * 0.3;
      node.start();
      nodesRef.current[soundId] = node;
      setIsPlaying(prev => ({ ...prev, [soundId]: true }));
    }
  }, [isPlaying, volumes, getAudioContext]);

  const changeVolume = useCallback((soundId, value) => {
    const vol = parseInt(value);
    setVolumes(prev => ({ ...prev, [soundId]: vol }));
    if (nodesRef.current[soundId]) {
      nodesRef.current[soundId].gain.gain.value = (vol / 100) * 0.3;
    }
  }, [setVolumes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(nodesRef.current).forEach(node => {
        node.stop();
        node.source.disconnect();
      });
    };
  }, []);

  return (
    <div className="feature-card ambient-card">
      <div className="card-header">
        <h2>🌊 Ambient Sound Mixer</h2>
        <p className="card-subtitle">Mix ambient sounds to create your perfect focus environment.</p>
      </div>

      <div className="ambient-grid">
        {SOUNDS.map(sound => (
          <div
            key={sound.id}
            className={`ambient-sound ${isPlaying[sound.id] ? 'active' : ''}`}
            style={{ '--sound-color': sound.color }}
          >
            <button
              className="sound-toggle"
              onClick={() => toggleSound(sound.id)}
            >
              <span className="sound-emoji">{sound.emoji}</span>
              <span className="sound-label">{sound.label}</span>
              <span className="sound-indicator">
                {isPlaying[sound.id] ? '🔊' : '🔇'}
              </span>
            </button>
            <div className="volume-control">
              <input
                type="range"
                min="0"
                max="100"
                value={volumes[sound.id] ?? 50}
                onChange={(e) => changeVolume(sound.id, e.target.value)}
                className="volume-slider"
              />
              <span className="volume-value">{volumes[sound.id] ?? 50}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}