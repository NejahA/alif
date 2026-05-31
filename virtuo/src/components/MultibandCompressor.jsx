import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Sliders, Activity, Zap, Waves } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function MultibandCompressor() {
  const [lowSettings, setLowSettings] = useState({ threshold: -20, ratio: 4, gain: 0 });
  const [midSettings, setMidSettings] = useState({ threshold: -20, ratio: 2, gain: 0 });
  const [highSettings, setHighSettings] = useState({ threshold: -20, ratio: 2, gain: 0 });
  
  const compRef = useRef(null);

  useEffect(() => {
    // Tone.js MultibandCompressor
    compRef.current = new Tone.MultibandCompressor({
      low: { threshold: -20, ratio: 4 },
      mid: { threshold: -20, ratio: 2 },
      high: { threshold: -20, ratio: 2 },
      lowFrequency: 250,
      highFrequency: 2000
    }).connect(masterBus);

    return () => {
      compRef.current?.dispose();
    };
  }, []);

  const updateBand = (band, param, value) => {
    if (!compRef.current) return;
    
    const setters = {
      low: setLowSettings,
      mid: setMidSettings,
      high: setHighSettings
    };

    setters[band](prev => ({ ...prev, [param]: value }));
    
    if (param === 'gain') {
      compRef.current[band].output.gain.value = Tone.dbToGain(value);
    } else {
      compRef.current[band][param] = value;
    }
  };

  const BandControl = ({ name, settings, band }) => (
    <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>{name}</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
          <span>Threshold</span>
          <span>{settings.threshold} dB</span>
        </div>
        <input 
          type="range" min="-60" max="0" step="1" 
          value={settings.threshold} 
          onChange={(e) => updateBand(band, 'threshold', Number(e.target.value))}
          style={{ accentColor: 'var(--accent-primary)' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
          <span>Ratio</span>
          <span>{settings.ratio}:1</span>
        </div>
        <input 
          type="range" min="1" max="20" step="1" 
          value={settings.ratio} 
          onChange={(e) => updateBand(band, 'ratio', Number(e.target.value))}
          style={{ accentColor: 'var(--accent-primary)' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
          <span>Gain</span>
          <span>{settings.gain} dB</span>
        </div>
        <input 
          type="range" min="-20" max="20" step="1" 
          value={settings.gain} 
          onChange={(e) => updateBand(band, 'gain', Number(e.target.value))}
          style={{ accentColor: 'var(--accent-primary)' }}
        />
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Activity size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Multiband Mastering Compressor</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <BandControl name="Low (< 250Hz)" settings={lowSettings} band="low" />
        <BandControl name="Mid (250Hz - 2kHz)" settings={midSettings} band="mid" />
        <BandControl name="High (> 2kHz)" settings={highSettings} band="high" />
      </div>

      <div style={{ fontSize: '0.65rem', opacity: 0.4, textAlign: 'center' }}>
        Independent dynamic control for low, mid, and high frequencies.
      </div>
    </div>
  );
}
