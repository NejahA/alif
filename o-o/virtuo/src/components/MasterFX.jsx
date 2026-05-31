import React, { useState } from 'react';
import { Layers, Activity, Wind, SlidersHorizontal, Zap } from 'lucide-react';
import { 
  setReverbWet, setDelayWet, setReverbDecay, setDelayFeedback,
  setEQLow, setEQMid, setEQHigh, setBitcrusherWet, setBitcrusherBits
} from '../audio/masterBus';

export default function MasterFX() {
  const [reverbWet, setReverbWetState] = useState(0);
  const [delayWet, setDelayWetState] = useState(0);
  const [decay, setDecay] = useState(2.5);
  const [feedback, setFeedback] = useState(0.3);
  
  const [low, setLow] = useState(0);
  const [mid, setMid] = useState(0);
  const [high, setHigh] = useState(0);
  const [crushWet, setCrushWet] = useState(0);

  const handleReverbChange = (val) => {
    setReverbWetState(val);
    setReverbWet(val);
  };

  const handleDelayChange = (val) => {
    setDelayWetState(val);
    setDelayWet(val);
  };

  const handleDecayChange = (val) => {
    setDecay(val);
    setReverbDecay(val);
  };

  const handleFeedbackChange = (val) => {
    setFeedback(val);
    setDelayFeedback(val);
  };

  const applyPreset = (preset) => {
    switch(preset) {
      case 'space':
        handleReverbChange(0.6);
        handleDelayChange(0.3);
        handleDecayChange(4);
        break;
      case 'lofi':
        setCrushWet(0.4);
        setBitcrusherWet(0.4);
        setLow(-10); setEQLow(-10);
        setHigh(-20); setEQHigh(-20);
        break;
      case 'clear':
        handleReverbChange(0);
        handleDelayChange(0);
        setCrushWet(0); setBitcrusherWet(0);
        setLow(0); setEQLow(0);
        setMid(0); setEQMid(0);
        setHigh(0); setEQHigh(0);
        break;
      default: break;
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '20px', width: '150px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Presets</h3>
        <button className="btn-glass" onClick={() => applyPreset('clear')} style={{ fontSize: '0.8rem', padding: '5px' }}>Dry</button>
        <button className="btn-glass" onClick={() => applyPreset('space')} style={{ fontSize: '0.8rem', padding: '5px' }}>Space</button>
        <button className="btn-glass" onClick={() => applyPreset('lofi')} style={{ fontSize: '0.8rem', padding: '5px' }}>Lo-Fi</button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Spatial FX</h3>
        </div>

        {/* Reverb Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reverb</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(reverbWet * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={reverbWet} 
            onChange={(e) => handleReverbChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        {/* Delay Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Delay</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(delayWet * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={delayWet} 
            onChange={(e) => handleDelayChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Tone & Grit Section */}
      <div className="glass-panel" style={{ padding: '20px', width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SlidersHorizontal size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Tone & Grit</h3>
        </div>

        {/* EQ Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Low</span>
            <span>Mid</span>
            <span>High</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', height: '60px' }}>
            <input 
              type="range" min="-48" max="6" step="1" 
              value={low} 
              onChange={(e) => { setLow(e.target.value); setEQLow(e.target.value); }}
              style={{ flex: 1, writingMode: 'bt-lr', appearance: 'slider-vertical', accentColor: 'var(--accent-primary)' }}
            />
            <input 
              type="range" min="-48" max="6" step="1" 
              value={mid} 
              onChange={(e) => { setMid(e.target.value); setEQMid(e.target.value); }}
              style={{ flex: 1, writingMode: 'bt-lr', appearance: 'slider-vertical', accentColor: 'var(--accent-primary)' }}
            />
            <input 
              type="range" min="-48" max="6" step="1" 
              value={high} 
              onChange={(e) => { setHigh(e.target.value); setEQHigh(e.target.value); }}
              style={{ flex: 1, writingMode: 'bt-lr', appearance: 'slider-vertical', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)', width: '100%' }} />

        {/* Bitcrusher Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bitcrusher</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(crushWet * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={crushWet} 
            onChange={(e) => { setCrushWet(e.target.value); setBitcrusherWet(e.target.value); }}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>
    </div>
  );
}
