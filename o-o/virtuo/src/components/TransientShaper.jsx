import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Zap, Activity, Waves, Sliders, Shield, Volume2 } from 'lucide-react';

const TransientShaper = () => {
  const [settings, setSettings] = useState({
    attack: 0.5,
    sustain: 0.5,
    softClip: true,
    gain: 0
  });
  const [isActive, setIsActive] = useState(false);
  const limiterRef = useRef(null);

  useEffect(() => {
    const limiter = new Tone.Limiter(-0.1).toDestination();
    limiterRef.current = limiter;
    return () => limiter.dispose();
  }, []);

  return (
    <div className="transient-shaper" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Zap color="#facc15" /> Transient Shaper
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Punch through the mix or smooth out sharp peaks by shaping the attack and sustain.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button 
             className={`btn-glass ${isActive ? 'active' : ''}`}
             onClick={() => {
               if (Tone.context.state !== 'running') Tone.start();
               setIsActive(!isActive);
             }}
             style={{ padding: '10px 30px', background: isActive ? '#facc15' : 'rgba(255,255,255,0.05)', color: isActive ? 'black' : 'inherit' }}
           >
             {isActive ? 'SHAPING ACTIVE' : 'BYPASS'}
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 20px' }}>
                    <svg width="150" height="150" viewBox="0 0 100 100">
                       <path d="M 10 90 L 30 20 L 90 90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                       <path 
                        d={`M 10 90 L 30 ${90 - (settings.attack * 70)} L 90 90`} 
                        fill="none" 
                        stroke="#facc15" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                       />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                       <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{Math.round((settings.attack - 0.5) * 200)}%</p>
                       <p style={{ fontSize: '0.6rem', opacity: 0.4, letterSpacing: '2px' }}>ATTACK</p>
                    </div>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={settings.attack} onChange={(e) => setSettings({...settings, attack: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                 <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 20px' }}>
                    <svg width="150" height="150" viewBox="0 0 100 100">
                       <path d="M 10 40 L 90 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                       <path 
                        d={`M 10 ${90 - (settings.sustain * 70)} L 90 ${90 - (settings.sustain * 70)}`} 
                        fill="none" 
                        stroke="#facc15" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                       />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                       <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{Math.round((settings.sustain - 0.5) * 200)}%</p>
                       <p style={{ fontSize: '0.6rem', opacity: 0.4, letterSpacing: '2px' }}>SUSTAIN</p>
                    </div>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={settings.sustain} onChange={(e) => setSettings({...settings, sustain: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                 <Shield size={20} color={settings.softClip ? '#facc15' : 'rgba(255,255,255,0.2)'} />
                 <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>SOFT CLIP</p>
                    <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>PREVENTS DIGITAL CLIPPING</p>
                 </div>
                 <button 
                  className={`btn-glass ${settings.softClip ? 'active' : ''}`}
                  onClick={() => setSettings({...settings, softClip: !settings.softClip})}
                  style={{ padding: '5px 15px', fontSize: '0.7rem' }}
                 >
                    {settings.softClip ? 'ON' : 'OFF'}
                 </button>
              </div>

              <div style={{ width: '200px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>OUTPUT GAIN</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{settings.gain} dB</span>
                 </div>
                 <input type="range" min="-12" max="12" step="0.1" value={settings.gain} onChange={(e) => setSettings({...settings, gain: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '30px', letterSpacing: '2px', textAlign: 'center' }}>IMPACT ANALYZER</h3>
              
              <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
                 {Array(30).fill(null).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isActive ? (i < 5 ? [`${40 + settings.attack * 60}%`, '20%', '40%'] : [`${20 + settings.sustain * 80}%`, '30%', '50%']) : '40%'
                      }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.02 }}
                      style={{ flex: 1, background: i < 5 ? '#facc15' : 'rgba(250, 204, 21, 0.3)', borderRadius: '1px' }}
                    />
                 ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                 <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>ATTACK</span>
                 <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>SUSTAIN</span>
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={18} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>DETECTION</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>ULTRA-FAST</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Volume2 size={18} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>HEADROOM</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>+6.0 dB</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TransientShaper;
