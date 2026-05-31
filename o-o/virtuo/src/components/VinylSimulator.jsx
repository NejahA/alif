import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Disc, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function VinylSimulator() {
  const [isActive, setIsActive] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0.5);
  const [wowFlutter, setWowFlutter] = useState(0.5);
  
  const noiseRef = useRef(null);
  const filterRef = useRef(null);
  const vibratoRef = useRef(null);

  useEffect(() => {
    // We can't easily insert an effect into Tone.Destination post-facto for all instruments
    // without redesigning the whole audio routing. But since most instruments connect to `masterBus`
    // which then connects to Destination, we CAN insert an effect into the masterBus chain!
    // However, masterBus is a direct Tone.Gain node.
    // To implement wow/flutter globally, we'd need to route masterBus -> Vibrato -> Destination.
    // Let's create the effect nodes:
    
    vibratoRef.current = new Tone.Vibrato({
      maxDelay: 0.005,
      frequency: 0.5, // Slow wow
      depth: 0,
      type: "sine"
    }).toDestination();

    // Crackle noise
    filterRef.current = new Tone.Filter({
      type: "highpass",
      frequency: 2000,
      rolloff: -12
    }).connect(vibratoRef.current);
    
    noiseRef.current = new Tone.Noise("brown").connect(filterRef.current);
    noiseRef.current.volume.value = -Infinity;
    noiseRef.current.start();

    return () => {
      // Disconnect effect when component unmounts to restore normal routing
      // If we disconnect masterBus here, it will break the app. 
      // We will only route noise through this effect for now, 
      // or we can route masterBus through vibrato while active.
      
      // Let's implement global wow/flutter by routing masterBus
      masterBus.disconnect();
      masterBus.toDestination(); // restore default
      
      noiseRef.current?.dispose();
      filterRef.current?.dispose();
      vibratoRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      // Route masterBus -> Vibrato
      masterBus.disconnect();
      masterBus.connect(vibratoRef.current);
      
      // Unmute noise
      noiseRef.current.volume.rampTo(-30 + (noiseLevel * 20), 0.5);
      
      // Set vibrato depth
      vibratoRef.current.depth.rampTo(wowFlutter * 0.1, 0.5);
      // Randomize wow frequency slightly to make it imperfect
      vibratoRef.current.frequency.value = 0.5 + (Math.random() * 0.5);
      
    } else {
      // Restore masterBus routing
      masterBus.disconnect();
      masterBus.toDestination();
      
      if (noiseRef.current) {
         noiseRef.current.volume.rampTo(-Infinity, 0.5);
      }
      if (vibratoRef.current) {
         vibratoRef.current.depth.rampTo(0, 0.5);
      }
    }
  }, [isActive, noiseLevel, wowFlutter]);

  const toggleVinyl = async () => {
    await Tone.start();
    setIsActive(!isActive);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      
      <div style={{ textAlign: 'center', maxWidth: '600px', color: 'var(--text-muted)' }}>
        Enable the Vinyl Simulator to route the master audio output through a lo-fi effect chain, adding vintage record crackle, surface noise, and pitch instability (wow & flutter) to any instrument you play.
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', opacity: isActive ? 1 : 0.5, transition: 'opacity 0.3s' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Activity size={14} /> Surface Noise
          </label>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={noiseLevel} 
            onChange={(e) => setNoiseLevel(Number(e.target.value))}
            disabled={!isActive}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Activity size={14} /> Wow & Flutter
          </label>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={wowFlutter} 
            onChange={(e) => setWowFlutter(Number(e.target.value))}
            disabled={!isActive}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Record Player Visual */}
      <div style={{ 
        position: 'relative',
        width: '400px',
        height: '350px',
        background: '#8b4513', // wooden base
        borderRadius: '10px',
        boxShadow: '0 15px 30px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.2)',
        border: '1px solid #5c2e0b',
        display: 'flex',
        alignItems: 'center',
        padding: '20px'
      }}>
        
        {/* Platter and Record */}
        <div style={{
          position: 'relative',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: '#222',
          boxShadow: '5px 5px 15px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }} onClick={toggleVinyl}>
           
           <motion.div 
             animate={{ rotate: isActive ? 360 : 0 }}
             transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: "linear" }}
             style={{
               width: '280px',
               height: '280px',
               borderRadius: '50%',
               background: 'repeating-radial-gradient(#111 0px, #111 2px, #1a1a1a 3px, #1a1a1a 4px)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}
           >
              {/* Record Label */}
              <div style={{
                 width: '100px',
                 height: '100px',
                 borderRadius: '50%',
                 background: 'linear-gradient(135deg, #f43f5e, #8a2be2)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 color: 'white',
                 fontSize: '10px',
                 fontWeight: 'bold',
                 boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
              }}>
                 VIRTUO RECORDS
              </div>
              <div style={{ position: 'absolute', width: '10px', height: '10px', background: '#000', borderRadius: '50%' }} />
           </motion.div>
        </div>

        {/* Tonearm */}
        <motion.div 
          animate={{ rotateZ: isActive ? 20 : 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            width: '20px',
            height: '200px',
            transformOrigin: 'top center',
            zIndex: 10
          }}
        >
           {/* Pivot */}
           <div style={{ width: '40px', height: '40px', background: 'radial-gradient(ellipse at center, #ccc, #666)', borderRadius: '50%', marginLeft: '-10px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)' }} />
           {/* Arm */}
           <div style={{ width: '8px', height: '160px', background: 'linear-gradient(to right, #ccc, #fff, #999)', marginLeft: '6px', marginTop: '-10px' }} />
           {/* Headshell */}
           <div style={{ width: '16px', height: '30px', background: '#222', marginLeft: '2px', borderRadius: '2px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)', borderTop: '2px solid #ccc' }} />
        </motion.div>

        {/* Controls Base (Power button) */}
        <div style={{ position: 'absolute', bottom: '30px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
           <button 
             onClick={toggleVinyl}
             style={{ 
               width: '40px', height: '40px', borderRadius: '50%', 
               background: isActive ? '#f43f5e' : '#555',
               border: '2px solid #222',
               boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
               cursor: 'pointer',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               color: '#fff'
             }}
           >
             <Activity size={16} />
           </button>
           <span style={{ fontSize: '10px', color: '#fff', opacity: 0.6 }}>POWER</span>
        </div>

      </div>
    </div>
  );
}
