import React, { useState } from 'react';
import { Layers, Activity, Wind, SlidersHorizontal, Zap, ArrowRight } from 'lucide-react';
import { 
  setReverbWet, setDelayWet, setReverbDecay, setDelayFeedback,
  setEQLow, setEQMid, setEQHigh, setBitcrusherWet, setBitcrusherBits,
  setChorusWet, setWidenerWidth, setTapeSaturation, setTapeWarmth,
  setMasterBalance, setSoftClipThreshold, setGalaxyReverb, setMasterFilterFreq
} from '../audio/masterBus';

export default function MasterFX() {
  const [reverbWet, setReverbWetState] = useState(0);
  const [galaxyWet, setGalaxyWet] = useState(0);
  const [delayWet, setDelayWetState] = useState(0);
  const [decay, setDecay] = useState(2.5);
  const [feedback, setFeedback] = useState(0.3);
  
  const [low, setLow] = useState(0);
  const [mid, setMid] = useState(0);
  const [high, setHigh] = useState(0);
  const [crushWet, setCrushWet] = useState(0);
  const [chorusWet, setChorusWetState] = useState(0);
  const [width, setWidth] = useState(0.5);
  const [tapeSat, setTapeSatState] = useState(0);
  const [tapeWarmth, setTapeWarmthState] = useState(0);
  const [balance, setBalance] = useState(0);
  const [softClip, setSoftClip] = useState(-0.5);
  const [masterFilter, setMasterFilter] = useState(20000);

  const handleFilterChange = (val) => {
    setMasterFilter(val);
    setMasterFilterFreq(val);
  };

  const fxChain = [
    { name: 'Source', active: true },
    { name: 'Comp', active: true },
    { name: 'Delay', active: delayWet > 0 },
    { name: 'Crush', active: crushWet > 0 },
    { name: 'EQ', active: Math.abs(low) + Math.abs(mid) + Math.abs(high) > 0 },
    { name: 'Saturation', active: tapeSat > 0 },
    { name: 'Chorus', active: chorusWet > 0 },
    { name: 'Verb', active: reverbWet > 0 },
    { name: 'Width', active: width !== 0.5 },
    { name: 'Balance', active: balance !== 0 },
    { name: 'Clip', active: true },
    { name: 'Limit', active: true },
  ];

  const handleReverbChange = (val) => {
    setReverbWetState(val);
    setReverbWet(val);
  };

  const handleMidiLearn = (paramId) => (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('virtuo-midi-learn-start', {
      detail: { instrumentId: 'master', paramId }
    }));
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      {/* Visual FX Chain */}
      <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '10px' }}>FX Flow</span>
        {fxChain.map((fx, i) => (
          <React.Fragment key={fx.name}>
            <div style={{ 
              fontSize: '0.7rem', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              background: fx.active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: fx.active ? 'white' : 'var(--text-muted)',
              border: fx.active ? '1px solid white' : '1px solid var(--glass-border)',
              transition: 'all 0.3s ease'
            }}>
              {fx.name}
            </div>
            {i < fxChain.length - 1 && <ArrowRight size={12} color="var(--text-muted)" />}
          </React.Fragment>
        ))}
      </div>

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
            onContextMenu={handleMidiLearn('reverbWet')}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            title="Right-click to MIDI Learn"
          />
        </div>

        {/* Galaxy Reverb Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Galaxy Verb</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(galaxyWet * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={galaxyWet} 
            onChange={(e) => { setGalaxyWet(parseFloat(e.target.value)); setGalaxyReverb(parseFloat(e.target.value)); }}
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
            onContextMenu={handleMidiLearn('delayWet')}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            title="Right-click to MIDI Learn"
          />
        </div>

        {/* Chorus Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chorus</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(chorusWet * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={chorusWet} 
            onChange={(e) => { setChorusWetState(e.target.value); setChorusWet(e.target.value); }}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Tone & Grit Section */}
      <div className="glass-panel" style={{ padding: '20px', width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SlidersHorizontal size={18} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Tone & Width</h3>
        </div>

        {/* Width Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Stereo Width</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(width * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={width} 
            onChange={(e) => { setWidth(parseFloat(e.target.value)); setWidenerWidth(parseFloat(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        {/* Master Balance Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Master Balance</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{balance === 0 ? 'C' : balance > 0 ? `R${Math.abs(Math.round(balance * 10))}` : `L${Math.abs(Math.round(balance * 10))}`}</span>
          </div>
          <input 
            type="range" min="-1" max="1" step="0.01" 
            value={balance} 
            onChange={(e) => { setBalance(parseFloat(e.target.value)); setMasterBalance(parseFloat(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        {/* Soft Clip Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Soft Clip Threshold</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{softClip.toFixed(1)} dB</span>
          </div>
          <input 
            type="range" min="-12" max="0" step="0.1" 
            value={softClip} 
            onChange={(e) => { setSoftClip(parseFloat(e.target.value)); setSoftClipThreshold(parseFloat(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        {/* Tape Saturation Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tape Saturation</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(tapeSat * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={tapeSat} 
            onChange={(e) => { setTapeSatState(parseFloat(e.target.value)); setTapeSaturation(parseFloat(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tape Warmth</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(tapeWarmth * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={tapeWarmth} 
            onChange={(e) => { setTapeWarmthState(parseFloat(e.target.value)); setTapeWarmth(parseFloat(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
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

        {/* Master Filter Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Wind size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Master Filter</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{masterFilter >= 1000 ? `${(masterFilter/1000).toFixed(1)}kHz` : `${masterFilter}Hz`}</span>
          </div>
          <input 
            type="range" min="20" max="20000" step="1" 
            value={masterFilter} 
            onChange={(e) => handleFilterChange(parseInt(e.target.value))}
            onContextMenu={handleMidiLearn('masterFilter')}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            title="Right-click to MIDI Learn"
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
