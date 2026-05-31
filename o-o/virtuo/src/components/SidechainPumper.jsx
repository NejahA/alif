import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Zap, Activity, Waves, Clock, Sliders } from 'lucide-react';

const SidechainPumper = () => {
  const [settings, setSettings] = useState({
    depth: 0.8,
    rate: '4n',
    curve: 'exponential',
    smoothing: 0.1,
    offset: 0
  });
  const [isActive, setIsActive] = useState(false);
  const gainRef = useRef(null);
  const loopRef = useRef(null);

  useEffect(() => {
    const gain = new Tone.Gain(1).toDestination();
    gainRef.current = gain;

    return () => {
      gain.dispose();
      if (loopRef.current) loopRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      if (loopRef.current) loopRef.current.dispose();
      
      loopRef.current = new Tone.Loop(time => {
        gainRef.current.gain.cancelScheduledValues(time);
        gainRef.current.gain.setValueAtTime(1, time);
        gainRef.current.gain.exponentialRampToValueAtTime(1 - settings.depth, time + Tone.Time("16n").toSeconds());
        gainRef.current.gain.exponentialRampToValueAtTime(1, time + Tone.Time(settings.rate).toSeconds() - 0.01);
      }, settings.rate).start(0);
      
      if (Tone.Transport.state !== 'started') Tone.Transport.start();
    } else {
      if (loopRef.current) loopRef.current.stop();
      if (gainRef.current) gainRef.current.gain.value = 1;
    }
  }, [isActive, settings.depth, settings.rate]);

  return (
    <div className="sidechain-pumper" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Zap color="#f97316" /> Sidechain Pumper
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Classic volume ducking for that iconic four-on-the-floor pump.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 30px', background: isActive ? '#f97316' : 'rgba(255,255,255,0.05)', color: isActive ? 'white' : 'inherit' }}
        >
          {isActive ? 'PUMPING...' : 'ENGAGE PUMP'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '25px' }}>
             <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>PUMP ENVELOPE</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem' }}>DEPTH</span>
                      <span style={{ fontSize: '0.8rem', color: '#f97316' }}>{Math.round(settings.depth * 100)}%</span>
                   </div>
                   <input type="range" min="0" max="1" step="0.01" value={settings.depth} onChange={(e) => setSettings({...settings, depth: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f97316' }} />
                </div>
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem' }}>RATE</span>
                      <span style={{ fontSize: '0.8rem', color: '#f97316' }}>1 / {settings.rate === '4n' ? '4' : '8'}</span>
                   </div>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      {['4n', '8n'].map(r => (
                        <button 
                          key={r} 
                          className={`btn-glass ${settings.rate === r ? 'active' : ''}`}
                          onClick={() => setSettings({...settings, rate: r})}
                          style={{ flex: 1, fontSize: '0.8rem' }}
                        >
                          1/{r === '4n' ? '4' : '8'}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="glass-panel" style={{ padding: '25px' }}>
             <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>ADVANCED</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                   <span style={{ fontSize: '0.65rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>SMOOTHING</span>
                   <input type="range" min="0" max="0.5" step="0.01" value={settings.smoothing} onChange={(e) => setSettings({...settings, smoothing: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f97316' }} />
                </div>
                <div>
                   <span style={{ fontSize: '0.65rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>OFFSET</span>
                   <input type="range" min="-0.1" max="0.1" step="0.001" value={settings.offset} onChange={(e) => setSettings({...settings, offset: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f97316' }} />
                </div>
             </div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '30px', background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
           <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px', textAlign: 'center' }}>VISUALIZER</h3>
           
           <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px' }}>
              {Array(20).fill(null).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: isActive ? [
                      '100%', 
                      `${100 - settings.depth * 100}%`, 
                      '100%'
                    ] : '100%'
                  }}
                  transition={{ 
                    duration: settings.rate === '4n' ? 0.5 : 0.25, 
                    repeat: Infinity,
                    delay: i * 0.05
                  }}
                  style={{ flex: 1, background: '#f97316', opacity: 0.3 + (i / 20) * 0.7, borderRadius: '2px' }}
                />
              ))}
           </div>

           <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Clock size={20} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SYNC</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>TRANSPORT</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={20} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>CURVE</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>EXPONENTIAL</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={20} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>TRIGGER</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>AUTO</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SidechainPumper;
