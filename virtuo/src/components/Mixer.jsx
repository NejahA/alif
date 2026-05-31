import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Sliders, VolumeX, Volume2, Target, Circle, Music, Shield, Sparkles } from 'lucide-react';
import { setChannelVolume, setChannelPan, setSwing } from '../audio/masterBus';

const INSTRUMENTS = [
  { id: 'piano', name: 'Piano' },
  { id: 'violin', name: 'Violin' },
  { id: 'guitar', name: 'Guitar' },
  { id: 'drums', name: 'Beats' },
  { id: 'pads', name: 'Pads' },
  { id: 'synth', name: 'Synth' },
  { id: 'bass', name: 'Bass' },
  { id: 'vocal', name: 'Vocal' },
  { id: 'ambient', name: 'Ambient' },
];

export default function Mixer() {
  const [harmonyLevel, setHarmonyLevel] = useState(0);
  
  useEffect(() => {
    const saved = localStorage.getItem('virtuo_virtues');
    if (saved) {
      const virtues = JSON.parse(saved);
      if (virtues.harmony) {
        setHarmonyLevel(Math.floor(Math.sqrt(virtues.harmony.xp / 100)));
      }
    }
  }, []);

  const [volumes, setVolumes] = useState(() => {
    const saved = localStorage.getItem('virtuo_mixer_volumes');
    return saved ? JSON.parse(saved) : INSTRUMENTS.reduce((acc, inst) => ({ ...acc, [inst.id]: 0 }), {});
  });

  const [pans, setPans] = useState(() => {
    const saved = localStorage.getItem('virtuo_mixer_pans');
    return saved ? JSON.parse(saved) : INSTRUMENTS.reduce((acc, inst) => ({ ...acc, [inst.id]: 0 }), {});
  });

  const [mutes, setMutes] = useState({});
  const [solos, setSolos] = useState({});
  const [globalSwing, setGlobalSwingState] = useState(0);

  useEffect(() => {
    // Apply initial states
    INSTRUMENTS.forEach(inst => {
      updateChannel(inst.id);
      setChannelPan(inst.id, pans[inst.id] || 0);
    });
  }, [mutes, solos, volumes]);

  useEffect(() => {
    const handleAutomation = (e) => {
      const { instrumentId, paramId, value } = e.detail;
      if (instrumentId !== 'mixer') return;
      
      const [id, type] = paramId.split('_');
      if (type === 'volume') handleVolumeChange(id, value);
      if (type === 'pan') handlePanChange(id, value);
    };

    window.addEventListener('virtuo-automation-play', handleAutomation);
    return () => window.removeEventListener('virtuo-automation-play', handleAutomation);
  }, [volumes, pans]);

  const updateChannel = (id) => {
    const isSoloActive = Object.values(solos).some(v => v === true);
    let vol = volumes[id];
    
    if (mutes[id]) {
      vol = -Infinity;
    } else if (isSoloActive && !solos[id]) {
      vol = -Infinity;
    }
    
    setChannelVolume(id, vol);
  };

  const handleVolumeChange = (id, val) => {
    const newVolumes = { ...volumes, [id]: val };
    setVolumes(newVolumes);
    localStorage.setItem('virtuo_mixer_volumes', JSON.stringify(newVolumes));
    
    // Dispatch for automation
    window.dispatchEvent(new CustomEvent('virtuo-param-change', {
      detail: { instrumentId: 'mixer', paramId: `${id}_volume`, value: val }
    }));
  };

  const handlePanChange = (id, val) => {
    const newPans = { ...pans, [id]: val };
    setPans(newPans);
    localStorage.setItem('virtuo_mixer_pans', JSON.stringify(newPans));
    setChannelPan(id, val);

    // Dispatch for automation
    window.dispatchEvent(new CustomEvent('virtuo-param-change', {
      detail: { instrumentId: 'mixer', paramId: `${id}_pan`, value: val }
    }));
  };

  const toggleMute = (id) => {
    setMutes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSolo = (id) => {
    setSolos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Sliders size={20} color="var(--accent-primary)" />
        <h4 style={{ margin: 0 }}>Advanced Mixer</h4>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
        {INSTRUMENTS.map(inst => {
          const isSoloActive = Object.values(solos).some(v => v === true);
          const isSilenced = mutes[inst.id] || (isSoloActive && !solos[inst.id]);
          
          return (
            <div key={inst.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', width: '60px', fontWeight: 600 }}>{inst.name}</span>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => toggleMute(inst.id)}
                    className="btn-glass"
                    style={{ padding: '4px 8px', fontSize: '0.7rem', color: mutes[inst.id] ? '#ef4444' : 'inherit', borderColor: mutes[inst.id] ? '#ef4444' : 'var(--glass-border)' }}
                  >
                    M
                  </button>
                  <button 
                    onClick={() => toggleSolo(inst.id)}
                    className="btn-glass"
                    style={{ padding: '4px 8px', fontSize: '0.7rem', color: solos[inst.id] ? '#fbbf24' : 'inherit', borderColor: solos[inst.id] ? '#fbbf24' : 'var(--glass-border)' }}
                  >
                    S
                  </button>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Volume2 size={12} opacity={0.5} />
                  <input 
                    type="range" min="-60" max="10" step="1"
                    value={volumes[inst.id]}
                    onChange={(e) => handleVolumeChange(inst.id, Number(e.target.value))}
                    style={{ flex: 1, accentColor: isSilenced ? '#666' : 'var(--accent-primary)', opacity: isSilenced ? 0.3 : 1 }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', width: '30px', textAlign: 'right', opacity: 0.6 }}>{volumes[inst.id]}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '70px' }}>
                <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>PAN</span>
                <input 
                  type="range" min="-1" max="1" step="0.1"
                  value={pans[inst.id] || 0}
                  onChange={(e) => handlePanChange(inst.id, Number(e.target.value))}
                  style={{ flex: 1, height: '4px', accentColor: 'var(--text-muted)' }}
                />
                <span style={{ fontSize: '0.65rem', width: '25px', opacity: 0.5 }}>
                  {pans[inst.id] > 0 ? `R${Math.round(pans[inst.id]*10)}` : pans[inst.id] < 0 ? `L${Math.round(Math.abs(pans[inst.id])*10)}` : 'C'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Music size={14} color="var(--accent-primary)" />
            <span>GLOBAL SWING</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{Math.round(globalSwing * 100)}%</span>
        </div>
        <input 
          type="range" min="0" max="1" step="0.01" 
          value={globalSwing} 
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setGlobalSwingState(val);
            setSwing(val);
          }}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', margin: 0 }}>
          Adds a rhythmic "shuffle" to all sequenced instruments.
        </p>
      </div>

      {harmonyLevel >= 3 && (
        <div style={{ 
          marginTop: '10px', 
          padding: '12px', 
          background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.2))', 
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={14} color="#3b82f6" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6' }}>HARMONY BONUS</span>
            <Sparkles size={12} color="#3b82f6" className="pulse" />
          </div>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
            Your mastery of Harmony (Level {harmonyLevel}) grants <strong>+15% Stereo Width</strong> and improved clarity across all channels.
          </p>
        </div>
      )}
    </div>
  );
}
