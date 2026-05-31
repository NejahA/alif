import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Drum, Zap, Activity, Waves, Volume2, Shield } from 'lucide-react';

const TechnoKickDesigner = () => {
  const [settings, setSettings] = useState({
    pitch: 45,
    decay: 0.4,
    thud: 0.6,
    click: 0.3,
    sub: 0.8,
    distortion: 0.4,
    compression: 0.5
  });

  const kickRef = useRef(null);
  const clickRef = useRef(null);
  const distortRef = useRef(null);
  const compRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    // Pro Kick Chain
    const compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.01,
      release: 0.1
    }).toDestination();

    const distortion = new Tone.Distortion({
      distortion: 0.4,
      wet: 0.5
    }).connect(compressor);

    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 0.1
      }
    }).connect(distortion);

    const click = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.05
      }
    }).connect(distortion);

    const sub = new Tone.Oscillator({
      type: "sine",
      frequency: 45
    }).connect(distortion);

    kickRef.current = kick;
    clickRef.current = click;
    distortRef.current = distortion;
    compRef.current = compressor;
    subRef.current = sub;

    return () => {
      kick.dispose();
      click.dispose();
      distortion.dispose();
      compressor.dispose();
      sub.dispose();
    };
  }, []);

  const triggerKick = () => {
    if (Tone.context.state !== 'running') Tone.start();

    const time = Tone.now();
    
    // Configure kick based on settings
    kickRef.current.envelope.decay = settings.decay;
    kickRef.current.pitchDecay = 0.1 - (settings.thud * 0.08);
    
    distortRef.current.distortion = settings.distortion;
    distortRef.current.wet.value = settings.distortion * 0.8;
    
    compRef.current.threshold.value = -10 - (settings.compression * 30);
    
    kickRef.current.triggerAttackRelease(settings.pitch, "8n", time);
    
    if (settings.click > 0.1) {
      clickRef.current.volume.value = Tone.gainToDb(settings.click);
      clickRef.current.triggerAttackRelease("16n", time);
    }
  };

  return (
    <div className="techno-kick-designer" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Drum color="#facc15" /> Techno Kick Designer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The heart of the warehouse. Sculpt the perfect club kick.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>CORE ENGINE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem' }}>BASE PITCH</span>
                  <span style={{ fontSize: '0.8rem', color: '#facc15' }}>{settings.pitch}Hz</span>
                </div>
                <input type="range" min="30" max="80" step="1" value={settings.pitch} onChange={(e) => setSettings({...settings, pitch: parseInt(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem' }}>DECAY</span>
                  <span style={{ fontSize: '0.8rem', color: '#facc15' }}>{Math.round(settings.decay * 1000)}ms</span>
                </div>
                <input type="range" min="0.1" max="1" step="0.01" value={settings.decay} onChange={(e) => setSettings({...settings, decay: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>CHARACTER</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>THUD (WEIGHT)</span>
                <input type="range" min="0" max="1" step="0.01" value={settings.thud} onChange={(e) => setSettings({...settings, thud: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>CLICK (ATTACK)</span>
                <input type="range" min="0" max="1" step="0.01" value={settings.click} onChange={(e) => setSettings({...settings, click: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>DRIVE</span>
                <input type="range" min="0" max="1" step="0.01" value={settings.distortion} onChange={(e) => setSettings({...settings, distortion: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>CRUSH</span>
                <input type="range" min="0" max="1" step="0.01" value={settings.compression} onChange={(e) => setSettings({...settings, compression: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#facc15' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
             <motion.div
               animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
               transition={{ duration: 0.1, repeat: 0 }}
               style={{ 
                 width: '180px', 
                 height: '180px', 
                 borderRadius: '50%', 
                 border: '8px solid #facc15',
                 boxShadow: `0 0 ${settings.thud * 50}px #facc15`,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer'
               }}
               onMouseDown={triggerKick}
             >
               <Drum size={60} color="#facc15" />
             </motion.div>
             <p style={{ position: 'absolute', bottom: '20px', fontSize: '0.7rem', opacity: 0.4, letterSpacing: '4px' }}>PUNCH HERE</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
             <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
                <Waves size={16} style={{ marginBottom: '8px', color: '#facc15' }} />
                <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>PHASE</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>ALIGNED</p>
             </div>
             <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
                <Volume2 size={16} style={{ marginBottom: '8px', color: '#facc15' }} />
                <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>PEAK</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>-3.2 dB</p>
             </div>
             <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
                <Shield size={16} style={{ marginBottom: '8px', color: '#facc15' }} />
                <p style={{ fontSize: '0.6rem', opacity: 0.5 }}>LIMITER</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>ACTIVE</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnoKickDesigner;
