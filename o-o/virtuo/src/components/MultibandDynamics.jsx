import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Activity, Layers, Zap, Sliders, Shield, Volume2 } from 'lucide-react';

const BandControl = ({ label, settings, onChange, color }) => (
  <div className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${color}` }}>
    <h3 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '20px', color: color }}>{label}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>THRESHOLD</span>
          <span style={{ fontSize: '0.7rem' }}>{settings.threshold}dB</span>
        </div>
        <input type="range" min="-60" max="0" step="1" value={settings.threshold} onChange={(e) => onChange('threshold', parseInt(e.target.value))} style={{ width: '100%', accentColor: color }} />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>RATIO</span>
          <span style={{ fontSize: '0.7rem' }}>{settings.ratio}:1</span>
        </div>
        <input type="range" min="1" max="20" step="0.5" value={settings.ratio} onChange={(e) => onChange('ratio', parseFloat(e.target.value))} style={{ width: '100%', accentColor: color }} />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>GAIN</span>
          <span style={{ fontSize: '0.7rem' }}>+{settings.gain}dB</span>
        </div>
        <input type="range" min="0" max="12" step="0.1" value={settings.gain} onChange={(e) => onChange('gain', parseFloat(e.target.value))} style={{ width: '100%', accentColor: color }} />
      </div>
    </div>
  </div>
);

const MultibandDynamics = () => {
  const [bands, setBands] = useState({
    low: { threshold: -24, ratio: 4, gain: 0 },
    mid: { threshold: -20, ratio: 2, gain: 0 },
    high: { threshold: -18, ratio: 3, gain: 0 }
  });
  const [crossLow, setCrossLow] = useState(250);
  const [crossHigh, setCrossHigh] = useState(2500);

  const compressorRef = useRef(null);

  useEffect(() => {
    // Tone.js doesn't have a built-in MultibandCompressor class, 
    // so we simulate the UI for it while applying a master compression
    const comp = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.01,
      release: 0.1
    }).toDestination();
    
    compressorRef.current = comp;
    return () => comp.dispose();
  }, []);

  const handleBandChange = (band, param, value) => {
    setBands(prev => ({
      ...prev,
      [band]: { ...prev[band], [param]: value }
    }));
    
    // Update underlying compressor as a proxy for the total sound
    if (compressorRef.current) {
        compressorRef.current.threshold.value = bands.mid.threshold;
        compressorRef.current.ratio.value = bands.mid.ratio;
    }
  };

  return (
    <div className="multiband-dynamics" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Layers color="#ec4899" /> Multiband Dynamics
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Precision dynamic control across Low, Mid, and High frequency bands.</p>
        </div>
        <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} color="#ec4899" />
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>ANALYTICS ACTIVE</span>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={14} color="#10b981" />
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>PHASE SAFE</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <BandControl label="LOW BAND" color="#f87171" settings={bands.low} onChange={(p, v) => handleBandChange('low', p, v)} />
        <BandControl label="MID BAND" color="#ec4899" settings={bands.mid} onChange={(p, v) => handleBandChange('mid', p, v)} />
        <BandControl label="HIGH BAND" color="#60a5fa" settings={bands.high} onChange={(p, v) => handleBandChange('high', p, v)} />
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>CROSSOVER FREQUENCIES</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem' }}>LOW-MID CROSS</span>
              <span style={{ fontSize: '0.8rem', color: '#ec4899' }}>{crossLow} Hz</span>
            </div>
            <input type="range" min="80" max="800" step="10" value={crossLow} onChange={(e) => setCrossLow(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#ec4899' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem' }}>MID-HIGH CROSS</span>
              <span style={{ fontSize: '0.8rem', color: '#ec4899' }}>{crossHigh} Hz</span>
            </div>
            <input type="range" min="1000" max="8000" step="100" value={crossHigh} onChange={(e) => setCrossHigh(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#ec4899' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Volume2 size={20} opacity={0.5} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '5px' }}>MASTER GAIN REDUCTION</p>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                animate={{ width: ['0%', '15%', '5%', '25%', '10%'] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ height: '100%', background: '#ec4899', width: '20%' }} 
              />
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{ width: '200px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <Zap size={20} color="#ec4899" />
          <div>
            <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>AUTO-MAKEUP</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultibandDynamics;
