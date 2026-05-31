import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Zap, Activity, Clock, Sliders, Layers } from 'lucide-react';

const PolyArpPro = () => {
  const [params, setParams] = useState({
    rate: '16n',
    range: 2,
    mode: 'upDown',
    gate: 0.8,
    humanize: 0.1
  });
  const [isActive, setIsActive] = useState(false);
  const [activeNotes, setActiveNotes] = useState([]);

  return (
    <div className="poly-arp-pro" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Music color="#8b5cf6" /> PolyArp Pro
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Advanced polyphonic arpeggiator with complex step logic and harmonic range.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#8b5cf6' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'ARPEGGIATOR ON' : 'ENGAGE ARP'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>RATE</span>
                    <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>1 / {params.rate.replace('n', '')}</span>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    {['4n', '8n', '16n', '32n'].map(r => (
                      <button key={r} onClick={() => setParams({...params, rate: r})} className={`btn-glass ${params.rate === r ? 'active' : ''}`} style={{ flex: 1, fontSize: '0.75rem' }}>1/{r.replace('n', '')}</button>
                    ))}
                 </div>
              </div>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>OCTAVE RANGE</span>
                    <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{params.range} OCT</span>
                 </div>
                 <input type="range" min="1" max="4" step="1" value={params.range} onChange={(e) => setParams({...params, range: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#8b5cf6' }} />
              </div>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>GATE (LENGTH)</span>
                    <span style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{Math.round(params.gate * 100)}%</span>
                 </div>
                 <input type="range" min="0.1" max="1" step="0.01" value={params.gate} onChange={(e) => setParams({...params, gate: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#8b5cf6' }} />
              </div>

              <div>
                 <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '8px' }}>ARP MODE</label>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {['up', 'down', 'upDown', 'random', 'chord', 'converge'].map(m => (
                      <button key={m} onClick={() => setParams({...params, mode: m})} className={`btn-glass ${params.mode === m ? 'active' : ''}`} style={{ fontSize: '0.7rem', padding: '8px' }}>{m.toUpperCase()}</button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '2px', marginBottom: '30px' }}>STEP SEQUENCE</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', width: '100%' }}>
                 {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        background: isActive ? (i % 4 === 0 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)') : 'rgba(255,255,255,0.05)',
                        scale: isActive ? [1, 1.1, 1] : 1
                      }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      style={{ height: '30px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                 ))}
              </div>
              <p style={{ marginTop: '25px', fontSize: '0.65rem', letterSpacing: '4px', opacity: 0.4 }}>POLY-CORE ENGINE</p>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Clock size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SYNC</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>HOST</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>JITTER</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>OFF</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Layers size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>POLY</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>16 VOICES</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PolyArpPro;
