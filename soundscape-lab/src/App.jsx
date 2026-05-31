import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

const SOUNDS = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', color: '#3b82f6', freq: 2000, type: 'pink' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', color: '#06b6d4', freq: 800, type: 'brown' },
  { id: 'wind', name: 'Wind', emoji: '💨', color: '#8b5cf6', freq: 4000, type: 'pink' },
  { id: 'fire', name: 'Fire', emoji: '🔥', color: '#f97316', freq: 1500, type: 'brown' },
  { id: 'forest', name: 'Forest', emoji: '🌲', color: '#22c55e', freq: 3000, type: 'pink' },
  { id: 'drone', name: 'Drone', emoji: '🔊', color: '#ec4899', freq: 110, type: 'sine' },
  { id: 'white', name: 'White Noise', emoji: '📡', color: '#a1a1aa', freq: 6000, type: 'white' }
];

const RECOMMENDED = [
  { name: 'Deep Focus', sounds: { rain: -18, ocean: -22, drone: -16 } },
  { name: 'Sleep', sounds: { ocean: -20, forest: -24, rain: -22 } },
  { name: 'Rainy Day', sounds: { rain: -14, wind: -20, white: -28 } },
  { name: 'Campfire', sounds: { fire: -16, forest: -20, wind: -22 } },
  { name: 'Space Drone', sounds: { drone: -14, wind: -22, white: -24 } }
];

function LayerControl({ sound, volume, onChange, isActive, onToggle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
      background: isActive ? `${sound.color}15` : 'rgba(255,255,255,0.03)',
      borderRadius: '10px', border: `1px solid ${isActive ? sound.color + '40' : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.3s ease', cursor: 'pointer'
    }} onClick={onToggle}>
      <span style={{ fontSize: '1.5rem' }}>{sound.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? sound.color : 'rgba(255,255,255,0.5)' }}>{sound.name}</div>
        <input type="range" min="-40" max="0" step="1" value={volume}
          onClick={e => e.stopPropagation()}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: sound.color, height: '4px', marginTop: '4px' }} />
      </div>
      <span style={{ fontSize: '0.6rem', opacity: 0.4, minWidth: '28px', textAlign: 'right' }}>{Math.round(Tone.gainToDb(Tone.dbToGain(volume)))}dB</span>
    </div>
  );
}

function Visualizer() {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    analyserRef.current = new Tone.Analyser('waveform', 128);
    Tone.Destination.connect(analyserRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const draw = () => {
      if (!analyserRef.current) return;
      const values = analyserRef.current.getValue();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width / values.length;
      ctx.fillStyle = '#8a2be2';
      for (let i = 0; i < values.length; i++) {
        const h = (values[i] + 1) * canvas.height / 2;
        ctx.fillRect(i * w, canvas.height - h, w - 1, h);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); };
  }, []);

  return <canvas ref={canvasRef} width="400" height="80" style={{ width: '100%', height: '80px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }} />;
}

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [masterVol, setMasterVol] = useState(-6);
  const [volumes, setVolumes] = useState({ rain: -30, ocean: -30, wind: -30, fire: -30, forest: -30, drone: -30, white: -30 });
  const noisersRef = useRef({});
  const filtersRef = useRef({});
  const gainRef = useRef({});
  const currentPreset = useRef('');

  const initSound = useCallback((id, sound, vol) => {
    if (noisersRef.current[id]) {
      noisersRef.current[id].dispose();
    }
    if (filtersRef.current[id]) filtersRef.current[id].dispose();
    if (gainRef.current[id]) gainRef.current[id].dispose();

    let source;
    if (sound.type === 'sine') {
      source = new Tone.Oscillator({ type: 'sine', frequency: sound.freq });
    } else {
      source = new Tone.Noise(sound.type);
    }
    const filter = new Tone.Filter(sound.freq, 'lowpass').toDestination();
    const gain = new Tone.Gain(Tone.dbToGain(vol)).connect(filter);
    source.connect(gain);

    noisersRef.current[id] = source;
    filtersRef.current[id] = filter;
    gainRef.current[id] = gain;
  }, []);

  const startAll = useCallback(async () => {
    await Tone.start();
    setIsStarted(true);
    Tone.Destination.volume.value = masterVol;
    Object.entries(volumes).forEach(([id, vol]) => {
      if (vol > -35) {
        const sound = SOUNDS.find(s => s.id === id);
        if (sound) initSound(id, sound, vol);
        noisersRef.current[id]?.start();
      }
    });
  }, [volumes, masterVol, initSound]);

  const stopAll = useCallback(() => {
    Object.entries(noisersRef.current).forEach(([id, src]) => { src.stop(); src.dispose(); });
    noisersRef.current = {};
    filtersRef.current = {};
    gainRef.current = {};
    setIsStarted(false);
  }, []);

  const toggleSound = useCallback((id) => {
    const newVol = volumes[id] > -35 ? -30 : -18;
    setVolumes(prev => ({ ...prev, [id]: newVol }));
    if (!isStarted) return;
    if (newVol > -35) {
      const sound = SOUNDS.find(s => s.id === id);
      initSound(id, sound, newVol);
      noisersRef.current[id]?.start();
    } else {
      noisersRef.current[id]?.stop();
    }
  }, [volumes, isStarted, initSound]);

  const setVolume = useCallback((id, vol) => {
    setVolumes(prev => ({ ...prev, [id]: vol }));
    if (gainRef.current[id]) {
      gainRef.current[id].gain.rampTo(Tone.dbToGain(vol), 0.1);
    }
    if (!isStarted) return;
    if (vol <= -35 && noisersRef.current[id]) {
      noisersRef.current[id].stop();
    } else if (vol > -35 && !noisersRef.current[id]) {
      const sound = SOUNDS.find(s => s.id === id);
      initSound(id, sound, vol);
      noisersRef.current[id]?.start();
    }
  }, [isStarted, initSound]);

  const applyPreset = useCallback((preset) => {
    currentPreset.current = preset.name;
    if (isStarted) stopAll();
    const newVols = { ...volumes };
    Object.keys(newVols).forEach(k => { newVols[k] = -30; });
    Object.entries(preset.sounds).forEach(([id, vol]) => { newVols[id] = vol; });
    setVolumes(newVols);
    setTimeout(() => startAll(), 100);
  }, [volumes, isStarted, stopAll, startAll]);

  useEffect(() => {
    Tone.Destination.volume.rampTo(masterVol, 0.1);
  }, [masterVol]);

  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(138,43,226,0.1) 0%, transparent 60%)',
      color: '#f0f6fc', fontFamily: "'Inter', sans-serif", padding: '20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
    }}>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #8a2be2, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Soundscape Lab
        </h1>
        <p style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '4px' }}>Ambient sound generator for focus, sleep & relaxation</p>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isStarted ? (
          <button onClick={startAll} style={{
            padding: '16px', borderRadius: '12px', border: '2px solid #22c55e',
            background: '#22c55e20', color: '#22c55e', fontSize: '1rem', fontWeight: 800,
            cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.3s ease'
          }}>
            ▶ START SOUNDSCAPE
          </button>
        ) : (
          <button onClick={stopAll} style={{
            padding: '12px', borderRadius: '12px', border: '2px solid #ef4444',
            background: '#ef444420', color: '#ef4444', fontSize: '1rem', fontWeight: 800,
            cursor: 'pointer', letterSpacing: '1px'
          }}>
            ■ STOP
          </button>
        )}

        <Visualizer />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Master</span>
          <input type="range" min="-30" max="0" step="0.5" value={masterVol} onChange={e => setMasterVol(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#8a2be2', height: '4px' }} />
          <span style={{ fontSize: '0.65rem', opacity: 0.4, minWidth: '30px', textAlign: 'right' }}>{masterVol}dB</span>
        </div>

        {SOUNDS.map(sound => (
          <LayerControl key={sound.id} sound={sound} volume={volumes[sound.id]}
            isActive={volumes[sound.id] > -35}
            onChange={v => setVolume(sound.id, v)}
            onToggle={() => toggleSound(sound.id)} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ fontSize: '0.7rem', opacity: 0.4, marginBottom: '8px', textAlign: 'center' }}>Presets</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {RECOMMENDED.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)} style={{
              padding: '6px 14px', borderRadius: '20px', border: `1px solid ${currentPreset.current === p.name ? '#8a2be2' : 'rgba(255,255,255,0.15)'}`,
              background: currentPreset.current === p.name ? '#8a2be230' : 'rgba(255,255,255,0.05)',
              color: currentPreset.current === p.name ? '#8a2be2' : 'rgba(255,255,255,0.6)',
              fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
            }}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.6rem', opacity: 0.25, textAlign: 'center', marginTop: '20px', paddingBottom: '20px' }}>
        Soundscape Lab • Built with Tone.js & React
      </div>
    </div>
  );
}
