import React, { useState, useEffect } from 'react';
import {
  Volume2, VolumeX, Mic, Square, Download,
  Maximize2, Sparkles, Sliders, Grid, Cpu, Disc, Radio, Music, Activity, Wand2,
  Zap, BarChart3, Repeat, Keyboard, Clock, Music2, Flame, Play, Pause
} from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';
import { midiController } from '../audio/MidiController';
import { drumEngine } from '../audio/DrumEngine';

export const Navbar = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  onRecordComplete,
  masterBpm,
  setMasterBpm,
  masterVolume,
  setMasterVolume,
  showShortcuts,
  setShowShortcuts,
  setActiveTheme
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [midiDevicesCount, setMidiDevicesCount] = useState(0);
  const [isPumpJamActive, setIsPumpJamActive] = useState(false);
  const [isOrbitActive, setIsOrbitActive] = useState(false);
  const [vuLevels, setVuLevels] = useState({ left: 0, right: 0 });

  useEffect(() => {
    midiController.init((count) => setMidiDevicesCount(count));
    const onToggleRec = () => handleRecordToggle();
    window.addEventListener('aetherwave-toggle-record', onToggleRec);
    return () => window.removeEventListener('aetherwave-toggle-record', onToggleRec);
  }, []);

  // Stereo VU Level Monitor Loop
  useEffect(() => {
    let animFrame;
    const updateVU = () => {
      const levels = audioEngine.getStereoLevels();
      setVuLevels(levels);
      animFrame = requestAnimationFrame(updateVU);
    };
    updateVU();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setMasterVolume(val);
    audioEngine.updateParam('masterVolume', isMuted ? 0 : val);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.init();
    audioEngine.updateParam('masterVolume', nextMute ? 0 : masterVolume);
  };

  const handleRecordToggle = async () => {
    if (!isRecording) {
      audioEngine.init();
      const started = audioEngine.startRecording();
      if (started) setIsRecording(true);
    } else {
      setIsRecording(false);
      const audioUrl = await audioEngine.stopRecording();
      if (audioUrl && onRecordComplete) onRecordComplete(audioUrl);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => console.log(err));
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  const handleBpmChange = (e) => {
    const v = parseInt(e.target.value, 10);
    setMasterBpm(v);
    audioEngine.masterBpm = v;
    audioEngine.arpBpm = v;
    drumEngine.bpm = v;
  };

  const togglePumpJamMode = () => {
    const active = audioEngine.togglePumpJam();
    drumEngine.toggleSequencer();
    setIsPumpJamActive(active);
    if (active && setActiveTheme) {
      setActiveTheme('pumpHyperSpace');
    }
  };

  const navButtons = [
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'pianoroll', label: 'Piano Roll', icon: Music },
    { id: 'composer', label: 'Composer', icon: Wand2 },
    { id: 'synth', label: 'Synth', icon: Sliders },
    { id: 'chordgen', label: 'Harmonizer', icon: Sparkles },
    { id: 'effects', label: 'FX Rack', icon: Zap },
    { id: 'arp', label: 'Arp', icon: Music2 },
    { id: 'eq', label: 'EQ', icon: Activity },
    { id: 'pads', label: 'Pads', icon: Grid },
    { id: 'piano', label: 'Keys', icon: Music },
    { id: 'drums', label: 'Drums', icon: Disc },
    { id: 'scope', label: 'Scope', icon: BarChart3 },
    { id: 'loops', label: 'Loops', icon: Repeat },
    { id: 'patcher', label: 'Graph', icon: Cpu },
    { id: 'presets', label: 'Presets', icon: Sparkles },
  ];

  return (
    <>
      <header className="glass-panel" style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        gap: '14px',
        borderRadius: '18px'
      }}>
        {/* Brand & PUMP IT UP Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div className="glow-cyan" style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '18px'
          }}>🌌</div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800,
              letterSpacing: '0.05em',
              background: 'linear-gradient(90deg, #fff, var(--text-muted))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>AETHERWAVE</h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AudioVisual DAW v2.0</p>
          </div>

          {/* ⚡ PUMP IT UP! Turbo Button */}
          <button
            onClick={togglePumpJamMode}
            className={`glass-pill ${isPumpJamActive ? 'glow-pink' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#fff',
              background: isPumpJamActive 
                ? 'linear-gradient(90deg, #ff0080, #7928ca)' 
                : 'linear-gradient(90deg, #ec4899, #8b5cf6)',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(236, 72, 153, 0.4)',
              transition: 'all 0.2s ease',
              marginLeft: '6px'
            }}
          >
            <Zap size={14} fill="#fff" />
            <span>{isPumpJamActive ? '⚡ PUMP JAM ACTIVE' : '⚡ PUMP IT UP!'}</span>
          </button>
        </div>

        {/* Navigation Bar Buttons */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(0,0,0,0.32)', padding: '3px', borderRadius: '12px',
          overflowX: 'auto', maxWidth: '48%', flexShrink: 1, scrollbarWidth: 'none'
        }}>
          {navButtons.map((b, i) => {
            const Icon = b.icon;
            const active = activeTab === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveTab(b.id)}
                className={`btn-icon ${active ? 'active' : ''}`}
                style={{
                  width: 'auto', padding: '6px 10px', gap: '5px',
                  fontSize: '0.72rem', whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title={`${b.label} [${i + 1 > 10 ? 0 : i + 1}]`}
              >
                <Icon size={13} />
                <span style={{ display: 'inline' }}>{b.label}</span>
              </button>
            );
          })}
        </div>

        {/* Master Control Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* BPM */}
          <div className="glass-pill" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 8px 4px 10px'
          }}>
            <Clock size={12} color="var(--accent-cyan)" />
            <input type="range" min="40" max="220" value={masterBpm} onChange={handleBpmChange}
              style={{ width: '60px', height: '4px' }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: 'var(--accent-cyan)', fontWeight: 700, minWidth: '38px', textAlign: 'right'
            }}>{masterBpm}<span style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)' }}>bpm</span></span>
          </div>

          {/* Real-time Stereo VU Level Meters */}
          <div className="glass-pill" style={{ display: 'flex', gap: '3px', padding: '6px 8px', alignItems: 'flex-end', height: '24px' }} title="Master Stereo VU Meter">
            <div style={{ width: '4px', height: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', height: `${Math.min(100, vuLevels.left * 100)}%`, background: vuLevels.left > 0.85 ? '#ef4444' : '#10b981', transition: 'height 0.05s ease', borderRadius: '2px' }} />
            </div>
            <div style={{ width: '4px', height: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', height: `${Math.min(100, vuLevels.right * 100)}%`, background: vuLevels.right > 0.85 ? '#ef4444' : '#10b981', transition: 'height 0.05s ease', borderRadius: '2px' }} />
            </div>
          </div>

          {/* MIDI count */}
          <div className="glass-pill" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 8px', fontSize: '0.72rem',
            color: midiDevicesCount > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)'
          }}>
            <Radio size={11} color={midiDevicesCount > 0 ? '#10b981' : '#64748b'} />
            <span>MIDI: {midiDevicesCount > 0 ? `${midiDevicesCount}` : '—'}</span>
          </div>

          {/* Shortcuts */}
          <button onClick={() => setShowShortcuts(!showShortcuts)}
            className="btn-icon" title="Keyboard Shortcuts [?]"
            style={{ width: '32px', height: '32px', background: showShortcuts ? 'var(--accent-purple)' : undefined }}>
            <Keyboard size={14} />
          </button>

          {/* Record */}
          <button onClick={handleRecordToggle}
            className={`btn-primary ${isRecording ? 'recording-pulse' : ''}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.72rem' }}>
            {isRecording ? <Square size={13} /> : <Mic size={13} />}
            <span>{isRecording ? 'Rec…' : 'Record'}</span>
          </button>

          {/* DJ Performance Quick FX & 3D Orbit */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => audioEngine.triggerTapeStop()}
              className="glass-pill"
              style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-pink)', border: '1px solid rgba(236,72,153,0.4)', cursor: 'pointer' }}
              title="DJ Tape Stop Pitch Drop"
            >
              ⏹ TAPE STOP
            </button>
            <button
              onClick={() => audioEngine.triggerStutter(8)}
              className="glass-pill"
              style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.4)', cursor: 'pointer' }}
              title="DJ Stutter Gate FX"
            >
              ⚡ STUTTER
            </button>
            <button
              onClick={() => {
                const running = audioEngine.toggleAutoPan();
                setIsOrbitActive(running);
              }}
              className={`glass-pill ${isOrbitActive ? 'glow-purple' : ''}`}
              style={{
                padding: '4px 8px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: isOrbitActive ? '#fff' : 'var(--text-muted)',
                background: isOrbitActive ? 'var(--accent-purple)' : 'transparent',
                border: '1px solid var(--border-glass)',
                cursor: 'pointer'
              }}
              title="360° Auto-Orbit Spatial Audio Panner"
            >
              🎧 3D ORBIT
            </button>
          </div>

          {/* Master Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100px' }}>
            <button onClick={toggleMute} style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', padding: 0
            }}>
              {isMuted || masterVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input type="range" min="0" max="1" step="0.01"
              value={isMuted ? 0 : masterVolume} onChange={handleVolumeChange} style={{ width: '70px' }} />
          </div>

          <button onClick={toggleFullscreen} className="btn-icon" title="Fullscreen [F]" style={{ width: '32px', height: '32px' }}>
            <Maximize2 size={14} />
          </button>
        </div>
      </header>

      {/* Turbo Jam Active Banner Overlay */}
      {isPumpJamActive && (
        <div style={{
          position: 'absolute',
          top: '74px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 49,
          background: 'rgba(236, 72, 153, 0.9)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          padding: '6px 20px',
          borderRadius: '9999px',
          boxShadow: '0 0 25px rgba(236, 72, 153, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'var(--font-display)',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          <Zap size={15} />
          <span>⚡ PUMP IT UP! HYPER TURBO JAM MODE RUNNING</span>
          <button
            onClick={togglePumpJamMode}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: 'none',
              color: '#fff',
              padding: '2px 10px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.72rem'
            }}
          >
            STOP JAM
          </button>
        </div>
      )}
    </>
  );
};
