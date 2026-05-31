import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Disc, Zap, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const TapeSatPro = () => {
  const [params, setParams] = useState({
    drive: 0.4,
    wow: 0.2,
    flutter: 0.1,
    heat: 0.6,
    hiss: 0.1,
    output: 0
  });
  const [isActive, setIsActive] = useState(false);
  
  const distortRef = useRef(null);
  const wowRef = useRef(null);
  const flutterRef = useRef(null);
  const noiseRef = useRef(null);

  useEffect(() => {
    // Pro Tape Chain
    const distort = new Tone.Distortion({
      distortion: 0.4,
      wet: 0
    }).toDestination();

    const wow = new Tone.Vibrato({
      frequency: 0.5,
      depth: 0.1
    }).connect(distort);

    const flutter = new Tone.Vibrato({
      frequency: 12,
      depth: 0.05
    }).connect(wow);

    const noise = new Tone.Noise({
      type: "pink",
      volume: -Infinity
    }).connect(distort);

    distortRef.current = distort;
    wowRef.current = wow;
    flutterRef.current = flutter;
    noiseRef.current = noise;

    return () => {
      distort.dispose();
      wow.dispose();
      flutter.dispose();
      noise.dispose();
    };
  }, []);

  useEffect(() => {
    if (distortRef.current) {
        distortRef.current.wet.rampTo(isActive ? 1 : 0, 0.1);
        distortRef.current.distortion = params.drive * params.heat;
        
        wowRef.current.depth.value = params.wow * 0.2;
        flutterRef.current.depth.value = params.flutter * 0.1;
        
        if (isActive && params.hiss > 0) {
            noiseRef.current.volume.rampTo(Tone.gainToDb(params.hiss * 0.05), 0.1);
            noiseRef.current.start();
        } else {
            noiseRef.current.volume.rampTo(-Infinity, 0.1);
        }
    }
  }, [isActive, params]);

  return (
    <div className="tape-sat-pro" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Disc color="#fb923c" /> Tape Saturation Pro
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>High-fidelity magnetic tape simulation with analog warmth and mechanical artifacts.</p>
        </div>
        <button 
          className={`btn-glass ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (Tone.context.state !== 'running') Tone.start();
            setIsActive(!isActive);
          }}
          style={{ padding: '10px 40px', background: isActive ? '#fb923c' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isActive ? 'TAPE RUNNING' : 'BYPASS'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
           <div className="glass-panel" style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>SATURATION ENGINE</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                       <span style={{ fontSize: '0.75rem' }}>DRIVE</span>
                       <span style={{ fontSize: '0.8rem', color: '#fb923c' }}>{Math.round(params.drive * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={params.drive} onChange={(e) => setParams({...params, drive: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#fb923c' }} />
                 </div>
                 <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                       <span style={{ fontSize: '0.75rem' }}>TAPE HEAT</span>
                       <span style={{ fontSize: '0.8rem', color: '#fb923c' }}>{Math.round(params.heat * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={params.heat} onChange={(e) => setParams({...params, heat: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#fb923c' }} />
                 </div>
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>MECHANICAL ARTIFACTS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>WOW (SLOW)</span>
                    <input type="range" min="0" max="1" step="0.01" value={params.wow} onChange={(e) => setParams({...params, wow: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#fb923c' }} />
                 </div>
                 <div>
                    <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '8px', opacity: 0.5 }}>FLUTTER (FAST)</span>
                    <input type="range" min="0" max="1" step="0.01" value={params.flutter} onChange={(e) => setParams({...params, flutter: parseFloat(e.target.value)})} style={{ width: '100%', accentColor: '#fb923c' }} />
                 </div>
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 50% 50%, #fb923c 0%, transparent 70%)' }} />
              
              <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                 <motion.div
                   animate={{ rotate: isActive ? 360 : 0 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fb923c', borderTopColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fb923c' }} />
                 </motion.div>
                 <motion.div
                   animate={{ rotate: isActive ? -360 : 0 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fb923c', borderBottomColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fb923c' }} />
                 </motion.div>
              </div>
              <p style={{ position: 'absolute', bottom: '20px', fontSize: '0.65rem', letterSpacing: '4px', opacity: 0.4 }}>REEL-TO-REEL V3</p>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Volume2 size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>HISS</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>-48 dB</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>SOFT CLIP</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>ACTIVE</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>BIAS</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>OPTIMIZED</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TapeSatPro;
