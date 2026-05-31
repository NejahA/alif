import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Mic, Activity, Zap, Radio, Sliders, Settings2 } from 'lucide-react';

const VocalTuner = () => {
  const [settings, setSettings] = useState({
    retuneSpeed: 0.2,
    humanize: 0.4,
    vibrato: 0.3,
    correction: 0.8,
    formant: 0
  });
  const [isActive, setIsActive] = useState(false);
  const [pitchShift, setPitchShift] = useState(0);

  const pitchShiftRef = useRef(null);
  const micRef = useRef(null);
  const vibratoRef = useRef(null);

  useEffect(() => {
    // Vocal Pro Chain
    const pitchShift = new Tone.PitchShift({ pitch: 0 }).toDestination();
    const vibrato = new Tone.Vibrato({ frequency: 5, depth: 0.1 }).connect(pitchShift);
    const mic = new Tone.UserMedia();

    pitchShiftRef.current = pitchShift;
    vibratoRef.current = vibrato;
    micRef.current = mic;

    return () => {
      pitchShift.dispose();
      vibrato.dispose();
      mic.dispose();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      micRef.current.open().then(() => {
        micRef.current.connect(vibratoRef.current);
      }).catch(e => console.error("Mic access denied", e));
    } else {
      micRef.current.close();
    }
  }, [isActive]);

  useEffect(() => {
    if (vibratoRef.current) {
        vibratoRef.current.depth.value = settings.vibrato * 0.5;
    }
  }, [settings.vibrato]);

  return (
    <div className="vocal-tuner" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Mic color="#10b981" /> Vocal Tuner Pro
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time pitch correction and formant shifting for modern vocals.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 30px', background: isActive ? '#10b981' : 'rgba(255,255,255,0.05)', color: isActive ? 'white' : 'inherit' }}
        >
          {isActive ? 'TUNER ACTIVE' : 'ENGAGE MIC'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px' }}>TUNING PARAMETERS</h3>
              <Settings2 size={16} opacity={0.3} />
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>RETUNE SPEED</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{Math.round((1 - settings.retuneSpeed) * 100)}ms</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={settings.retuneSpeed} onChange={(e) => setSettings({...settings, retuneSpeed: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#10b981' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>CORRECTION AMOUNT</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{Math.round(settings.correction * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={settings.correction} onChange={(e) => setSettings({...settings, correction: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#10b981' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                   <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>HUMANIZE</span>
                   <input type="range" min="0" max="1" step="0.01" value={settings.humanize} onChange={(e) => setSettings({...settings, humanize: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#10b981' }} />
                </div>
                <div>
                   <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>VIBRATO</span>
                   <input type="range" min="0" max="1" step="0.01" value={settings.vibrato} onChange={(e) => setSettings({...settings, vibrato: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#10b981' }} />
                </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '5px' }}>
                 {[1, 2, 3].map(i => <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: isActive ? '#10b981' : 'rgba(255,255,255,0.2)' }} />)}
              </div>
              
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <motion.div 
                  animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: `2px solid ${isActive ? '#10b981' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Activity size={40} color={isActive ? '#10b981' : 'rgba(255,255,255,0.2)'} />
                </motion.div>
              </div>
              
              <div style={{ marginTop: '25px', textAlign: 'center' }}>
                 <p style={{ fontSize: '0.65rem', letterSpacing: '3px', opacity: 0.4, marginBottom: '5px' }}>DETECTOR STATUS</p>
                 <p style={{ fontSize: '1rem', fontWeight: 800, color: isActive ? '#10b981' : 'white' }}>{isActive ? 'TRACKING...' : 'IDLE'}</p>
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>FORMANT SHIFT</span>
                 <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{settings.formant > 0 ? '+' : ''}{settings.formant} ST</span>
              </div>
              <input type="range" min="-12" max="12" step="1" value={settings.formant} onChange={(e) => setSettings({...settings, formant: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#10b981' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                 <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>DEEP</span>
                 <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>BRIGHT</span>
              </div>
           </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
         <div className="glass-panel" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={16} color="#10b981" />
            <div>
               <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>LATENCY</p>
               <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Zero-Point</p>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={16} color="#10b981" />
            <div>
               <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SCALE</p>
               <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Chromatic</p>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={16} color="#10b981" />
            <div>
               <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>ENGINE</p>
               <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>NeuroTune</p>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={16} color="#10b981" />
            <div>
               <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>MODE</p>
               <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Hard-Tune</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default VocalTuner;
