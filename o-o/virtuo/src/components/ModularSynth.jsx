import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Cpu, Link, Volume2, Power } from 'lucide-react';
import { motion } from 'framer-motion';

const ModularSynth = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [oscType, setOscType] = useState('sawtooth');
  const [filterFreq, setFilterFreq] = useState(1000);
  const [lfoRate, setLfoRate] = useState(2);
  const [lfoDepth, setLfoDepth] = useState(500);

  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const lfoRef = useRef(null);

  useEffect(() => {
    // Initialize Audio Nodes
    filterRef.current = new Tone.Filter(filterFreq, 'lowpass').toDestination();
    synthRef.current = new Tone.Synth({
      oscillator: { type: oscType },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1 }
    }).connect(filterRef.current);
    
    lfoRef.current = new Tone.LFO(lfoRate, filterFreq - lfoDepth, filterFreq + lfoDepth);
    lfoRef.current.connect(filterRef.current.frequency);
    
    return () => {
      if (synthRef.current) synthRef.current.dispose();
      if (filterRef.current) filterRef.current.dispose();
      if (lfoRef.current) lfoRef.current.dispose();
    };
  }, []);

  // Update parameters
  useEffect(() => {
    if (synthRef.current) synthRef.current.oscillator.type = oscType;
  }, [oscType]);

  useEffect(() => {
    if (filterRef.current) filterRef.current.frequency.rampTo(filterFreq, 0.1);
    if (lfoRef.current) {
      lfoRef.current.min = Math.max(20, filterFreq - lfoDepth);
      lfoRef.current.max = Math.min(20000, filterFreq + lfoDepth);
    }
  }, [filterFreq, lfoDepth]);

  useEffect(() => {
    if (lfoRef.current) lfoRef.current.frequency.rampTo(lfoRate, 0.1);
  }, [lfoRate]);

  const togglePlay = () => {
    if (!isPlaying) {
      Tone.start();
      lfoRef.current.start();
      synthRef.current.triggerAttack("C3");
    } else {
      synthRef.current.triggerRelease();
      lfoRef.current.stop();
    }
    setIsPlaying(!isPlaying);
  };

  const handleKeyPress = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      togglePlay();
    }
  };

  return (
    <div style={{ padding: '30px', background: 'var(--glass-bg)', borderRadius: '20px', border: '1px solid var(--glass-border)', color: 'white', display: 'flex', flexDirection: 'column', gap: '30px' }} tabIndex={0} onKeyDown={handleKeyPress}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={28} color="#10b981" /> Modular Synthesizer
        </h2>
        <button 
          onClick={togglePlay}
          style={{ background: isPlaying ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
        >
          <Power size={18} /> {isPlaying ? 'STOP SEQUENCE' : 'START SEQUENCE'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {/* Oscillator Module */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '2px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#3b82f6', borderBottom: '1px solid #3b82f6', paddingBottom: '10px' }}>VCO (Oscillator)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Waveform</label>
              <select 
                value={oscType} 
                onChange={(e) => setOscType(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '5px' }}
              >
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#111', border: '4px solid #3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isPlaying ? '#3b82f6' : '#333' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Module */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '2px solid #eab308' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#eab308', borderBottom: '1px solid #eab308', paddingBottom: '10px' }}>VCF (Filter)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ color: '#888' }}>Cutoff Freq</label>
                <span>{filterFreq} Hz</span>
              </div>
              <input 
                type="range" min="50" max="5000" step="10"
                value={filterFreq}
                onChange={(e) => setFilterFreq(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#eab308' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
              <Link size={24} color="#eab308" opacity={0.5} />
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#111', border: '4px solid #eab308', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isPlaying ? '#eab308' : '#333' }} />
              </div>
            </div>
          </div>
        </div>

        {/* LFO Module */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '15px', border: '2px solid #ec4899' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ec4899', borderBottom: '1px solid #ec4899', paddingBottom: '10px' }}>LFO (Modulation)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ color: '#888' }}>Rate</label>
                <span>{lfoRate} Hz</span>
              </div>
              <input 
                type="range" min="0.1" max="20" step="0.1"
                value={lfoRate}
                onChange={(e) => setLfoRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ec4899' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ color: '#888' }}>Depth (FM)</label>
                <span>{lfoDepth}</span>
              </div>
              <input 
                type="range" min="0" max="2000" step="10"
                value={lfoDepth}
                onChange={(e) => setLfoDepth(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ec4899' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModularSynth;
