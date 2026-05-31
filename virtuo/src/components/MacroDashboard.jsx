import React, { useState } from 'react';
import { Layout, Zap, Wind, Cloud, Activity } from 'lucide-react';
import { 
  setReverbWet, setDelayWet, setBitcrusherWet, 
  setEQLow, setEQHigh, setPhaserWet, setMasterFilterFreq 
} from '../audio/masterBus';

export default function MacroDashboard() {
  const [macros, setMacros] = useState({
    space: 0,
    grit: 0,
    air: 0,
    filter: 1
  });

  useEffect(() => {
    const handleAutomation = (e) => {
      const { instrumentId, paramId, value } = e.detail;
      if (instrumentId === 'macro') {
        handleMacroChange(paramId, value);
      }
    };
    window.addEventListener('virtuo-automation-play', handleAutomation);
    return () => window.removeEventListener('virtuo-automation-play', handleAutomation);
  }, []);

  const handleMacroChange = (id, val) => {
    setMacros(prev => ({ ...prev, [id]: val }));
    
    // Dispatch for automation
    window.dispatchEvent(new CustomEvent('virtuo-param-change', {
      detail: { instrumentId: 'macro', paramId: id, value: val }
    }));

    switch(id) {
      case 'space':
        setReverbWet(val * 0.8);
        setDelayWet(val * 0.4);
        break;
      case 'grit':
        setBitcrusherWet(val * 0.6);
        setEQLow(val * 12); // Boost lows for grit
        break;
      case 'air':
        setEQHigh(val * 12);
        setPhaserWet(val * 0.5);
        break;
      case 'filter':
        // Map 0-1 to 200Hz - 20000Hz
        const freq = 200 + (val * 19800);
        setMasterFilterFreq(freq);
        break;
      default: break;
    }
  };

  const macroConfigs = [
    { id: 'space', name: 'SPACE', icon: <Cloud size={16} />, color: '#3b82f6' },
    { id: 'grit', name: 'GRIT', icon: <Zap size={16} />, color: '#f59e0b' },
    { id: 'air', name: 'AIR', icon: <Wind size={16} />, color: '#10b981' },
    { id: 'filter', name: 'FILTER', icon: <Activity size={16} />, color: '#ef4444' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Layout size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Macro Dashboard</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {macroConfigs.map(cfg => (
          <div key={cfg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: `2px solid ${cfg.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: `radial-gradient(circle, ${cfg.color}11 0%, transparent 70%)`
            }}>
              {cfg.icon}
              <input 
                type="range" min="0" max="1" step="0.01"
                value={macros[cfg.id]}
                onChange={(e) => handleMacroChange(cfg.id, Number(e.target.value))}
                style={{ 
                  position: 'absolute',
                  width: '100px',
                  transform: 'rotate(-90deg)',
                  opacity: 0,
                  cursor: 'ns-resize'
                }}
              />
              {/* Custom knob-like indicator */}
              <svg width="80" height="80" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle 
                  cx="40" cy="40" r="35" 
                  fill="none" 
                  stroke={cfg.color} 
                  strokeWidth="4" 
                  strokeDasharray={`${macros[cfg.id] * 220} 220`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: cfg.color, letterSpacing: '1px' }}>{cfg.name}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.5, textAlign: 'center' }}>
        Drag circles to control multiple parameters simultaneously.
      </div>
    </div>
  );
}
