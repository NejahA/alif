import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, Waves, Sliders, Volume2, Target } from 'lucide-react';

const MasterModule = ({ label, icon: Icon, children, color }) => (
  <div className="glass-panel" style={{ padding: '20px', borderTop: `2px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <Icon size={16} color={color} />
      <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>{label}</h3>
    </div>
    {children}
  </div>
);

const MasteringChain = () => {
  const [settings, setSettings] = useState({
    eqLow: 0,
    eqHigh: 0,
    saturation: 0.2,
    width: 1,
    ceiling: -0.1,
    gain: 0
  });
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="mastering-chain" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Target color="#f43f5e" /> Mastering Chain
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Final stage processing for a polished, professional, and loud sound.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#f43f5e' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'MASTERING ON' : 'BYPASS'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <MasterModule label="TONAL EQ" icon={Activity} color="#3b82f6">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>LOW SHELF</span>
                    <span style={{ fontSize: '0.7rem' }}>{settings.eqLow}dB</span>
                 </div>
                 <input type="range" min="-12" max="12" step="0.1" value={settings.eqLow} onChange={(e) => setSettings({...settings, eqLow: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#3b82f6' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>HIGH SHELF</span>
                    <span style={{ fontSize: '0.7rem' }}>{settings.eqHigh}dB</span>
                 </div>
                 <input type="range" min="-12" max="12" step="0.1" value={settings.eqHigh} onChange={(e) => setSettings({...settings, eqHigh: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#3b82f6' }} />
              </div>
           </div>
        </MasterModule>

        <MasterModule label="SATURATION" icon={Zap} color="#f97316">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                 <p style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f97316' }}>{Math.round(settings.saturation * 100)}%</p>
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>VALVE WARMTH</p>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={settings.saturation} onChange={(e) => setSettings({...settings, saturation: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f97316' }} />
           </div>
        </MasterModule>

        <MasterModule label="IMAGING" icon={Waves} color="#10b981">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                 <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>WIDTH</span>
                 <span style={{ fontSize: '0.7rem' }}>{Math.round(settings.width * 100)}%</span>
              </div>
              <input type="range" min="0" max="2" step="0.01" value={settings.width} onChange={(e) => setSettings({...settings, width: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#10b981' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                 <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>MONO</span>
                 <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>WIDE</span>
              </div>
           </div>
        </MasterModule>

        <MasterModule label="MAXIMIZER" icon={Shield} color="#f43f5e">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>CEILING</span>
                    <span style={{ fontSize: '0.7rem' }}>{settings.ceiling}dB</span>
                 </div>
                 <input type="range" min="-1.0" max="0" step="0.01" value={settings.ceiling} onChange={(e) => setSettings({...settings, ceiling: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f43f5e' }} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>MAKEUP GAIN</span>
                    <span style={{ fontSize: '0.7rem' }}>{settings.gain}dB</span>
                 </div>
                 <input type="range" min="0" max="12" step="0.1" value={settings.gain} onChange={(e) => setSettings({...settings, gain: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#f43f5e' }} />
              </div>
           </div>
        </MasterModule>
      </div>

      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(0,0,0,0.4)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px' }}>MASTER METERING</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>PEAK</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>RMS</span>
               </div>
            </div>
         </div>

         <div style={{ position: 'relative', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', padding: '0 10px' }}>
            <div style={{ height: '12px', width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
               <motion.div 
                 animate={{ width: isActive ? ['70%', '95%', '85%', '98%', '90%'] : '0%' }}
                 transition={{ duration: 0.1, repeat: Infinity }}
                 style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #f43f5e)' }} 
               />
            </div>
            <div style={{ height: '12px', width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
               <motion.div 
                 animate={{ width: isActive ? ['60%', '80%', '75%', '85%', '70%'] : '0%' }}
                 transition={{ duration: 0.2, repeat: Infinity }}
                 style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} 
               />
            </div>
            {/* Meter Scale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
               {[-60, -48, -36, -24, -12, -6, 0].map(v => <span key={v} style={{ fontSize: '0.6rem', opacity: 0.3 }}>{v}</span>)}
            </div>
         </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
            <Volume2 size={16} />
            <span style={{ fontSize: '0.7rem' }}>TRUE PEAK LIMITING</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
            <Sliders size={16} />
            <span style={{ fontSize: '0.7rem' }}>MID/SIDE PROCESSING</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
            <Zap size={16} />
            <span style={{ fontSize: '0.7rem' }}>LINEAR PHASE EQ</span>
         </div>
      </div>
    </div>
  );
};

export default MasteringChain;
