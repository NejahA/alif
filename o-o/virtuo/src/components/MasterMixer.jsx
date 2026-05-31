import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Activity, Lock, Unlock, Volume2, ShieldAlert } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function MasterMixer() {
  const [masterVolume, setMasterVolume] = useState(0);
  const [limiterThreshold, setLimiterThreshold] = useState(-1);
  const [compression, setCompression] = useState(4);
  const [isLocked, setIsLocked] = useState(true);
  const [vuLevel, setVuLevel] = useState(-60);
  
  const meterRef = useRef(null);
  const limiterRef = useRef(null);
  const compressorRef = useRef(null);

  useEffect(() => {
    meterRef.current = new Tone.Meter();
    limiterRef.current = new Tone.Limiter(limiterThreshold).toDestination();
    compressorRef.current = new Tone.Compressor({
      threshold: -20,
      ratio: compression
    }).connect(limiterRef.current);
    
    masterBus.connect(compressorRef.current);
    masterBus.connect(meterRef.current);

    return () => {
      meterRef.current?.dispose();
      limiterRef.current?.dispose();
      compressorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (limiterRef.current) limiterRef.current.threshold.value = limiterThreshold;
    if (compressorRef.current) compressorRef.current.ratio.value = compression;
    Tone.Destination.volume.rampTo(masterVolume, 0.1);
  }, [masterVolume, limiterThreshold, compression]);

  useEffect(() => {
    let animationFrame;
    const updateMeter = () => {
      const level = meterRef.current.getValue();
      setVuLevel(Array.isArray(level) ? level[0] : level);
      animationFrame = requestAnimationFrame(updateMeter);
    };
    updateMeter();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const getVuHeight = () => {
    const min = -60;
    const max = 6;
    const percent = ((vuLevel - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, percent));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <SlidersHorizontal size={24} color="#22c55e" /> Master Channel Strip
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Professional Final Mix Controls</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', width: '100%', maxWidth: '1000px', height: '500px' }}>
        {/* VU Meter */}
        <div className="glass-panel" style={{ width: '80px', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800 }}>VU</span>
          <div style={{ flex: 1, width: '20px', background: '#111', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ 
               position: 'absolute', bottom: 0, width: '100%', 
               height: `${getVuHeight()}%`,
               background: vuLevel > 0 ? '#ef4444' : (vuLevel > -6 ? '#fbbf24' : '#22c55e'),
               boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
               transition: 'height 0.05s linear'
             }} />
             {/* Scale marks */}
             {[6, 0, -6, -12, -24, -48].map(db => (
               <div key={db} style={{ position: 'absolute', bottom: `${((db + 60) / 66) * 100}%`, left: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.2)' }}>
                  <span style={{ position: 'absolute', left: '25px', top: '-5px', fontSize: '8px', color: '#666' }}>{db}</span>
               </div>
             ))}
          </div>
          <Activity size={16} color={vuLevel > -3 ? '#facc15' : '#666'} />
        </div>

        {/* Main Controls */}
        <div className="glass-panel" style={{ flex: 1, padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
          {/* Master Gain */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <h3 style={{ fontSize: '12px', color: '#888', letterSpacing: '1px' }}>OUTPUT GAIN</h3>
             <input 
               type="range" min="-60" max="6" step="1" 
               value={masterVolume} 
               onChange={(e) => setMasterVolume(Number(e.target.value))}
               style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '250px', width: '40px', accentColor: '#22c55e' }}
             />
             <div style={{ background: '#000', padding: '5px 15px', borderRadius: '4px', border: '1px solid #333', fontSize: '14px', fontWeight: 800, color: '#22c55e' }}>
               {masterVolume > 0 ? '+' : ''}{masterVolume} dB
             </div>
          </div>

          {/* Compressor */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <h3 style={{ fontSize: '12px', color: '#888', letterSpacing: '1px' }}>COMP RATIO</h3>
             <div style={{ width: '150px', height: '150px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                   <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="10" />
                   <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="10" 
                           strokeDasharray={`${(compression / 20) * 283} 283`} />
                </svg>
                <div style={{ position: 'absolute', fontSize: '20px', fontWeight: 800 }}>{compression}:1</div>
             </div>
             <input 
               type="range" min="1" max="20" step="1" 
               value={compression} 
               onChange={(e) => setCompression(Number(e.target.value))}
               style={{ width: '100%', accentColor: '#22c55e' }}
             />
             <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>Dynamic Glue & Consistency</p>
          </div>

          {/* Limiter */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <h3 style={{ fontSize: '12px', color: '#888', letterSpacing: '1px' }}>CEILING</h3>
             <div 
               onClick={() => setIsLocked(!isLocked)}
               style={{ 
                 width: '80px', height: '80px', borderRadius: '50%', background: isLocked ? '#22c55e' : '#111', 
                 display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
                 border: '4px solid #222', boxShadow: isLocked ? '0 0 30px rgba(34, 197, 94, 0.3)' : 'none'
               }}
             >
                {isLocked ? <Lock size={32} color="#fff" /> : <Unlock size={32} color="#444" />}
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                   <span>THRESHOLD</span>
                   <span>{limiterThreshold} dB</span>
                </div>
                <input 
                  type="range" min="-12" max="0" step="0.1" 
                  value={limiterThreshold} 
                  onChange={(e) => setLimiterThreshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: vuLevel > -1 ? '#ef4444' : '#666', fontSize: '10px' }}>
                <ShieldAlert size={14} /> CLIPPING PROTECTION
             </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '15px 40px', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
         <Volume2 size={16} color="var(--accent-primary)" />
         <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Master bus signal is routed through a 4-stage processing chain before destination.</span>
      </div>
    </div>
  );
}
