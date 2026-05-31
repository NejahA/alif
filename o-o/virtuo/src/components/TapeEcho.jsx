import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { CassetteTape } from 'lucide-react';
import { motion } from 'framer-motion';

const TapeEcho = () => {
  const [delayTime, setDelayTime] = useState(0.4);
  const [feedback, setFeedback] = useState(0.6);
  const [wowFlutter, setWowFlutter] = useState(0.2);
  const [wet, setWet] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  const delayRef = useRef(null);
  const lfoRef = useRef(null);
  const noiseRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    delayRef.current = new Tone.FeedbackDelay({
      delayTime: delayTime,
      feedback: feedback,
      wet: wet
    }).toDestination();

    // Simulating tape wow & flutter using an LFO on delay time
    lfoRef.current = new Tone.LFO({
      frequency: 0.5, // Slow wobble
      min: delayTime - (wowFlutter * 0.05),
      max: delayTime + (wowFlutter * 0.05)
    }).connect(delayRef.current.delayTime);

    // Filter to roll off high frequencies like analog tape
    const filter = new Tone.Filter(3000, "lowpass");
    delayRef.current.connect(filter);
    filter.toDestination();

    // Hiss simulator
    noiseRef.current = new Tone.Noise({ type: "pink", volume: -40 }).toDestination();

    synthRef.current = new Tone.PluckSynth().connect(delayRef.current);

    return () => {
      if (delayRef.current) delayRef.current.dispose();
      if (lfoRef.current) lfoRef.current.dispose();
      if (noiseRef.current) noiseRef.current.dispose();
      if (synthRef.current) synthRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (delayRef.current) {
      delayRef.current.feedback.rampTo(feedback, 0.1);
      delayRef.current.wet.rampTo(wet, 0.1);
      if (!lfoRef.current) delayRef.current.delayTime.rampTo(delayTime, 0.1);
    }
    
    if (lfoRef.current) {
      lfoRef.current.min = Math.max(0.01, delayTime - (wowFlutter * 0.05));
      lfoRef.current.max = Math.min(1.0, delayTime + (wowFlutter * 0.05));
    }
  }, [delayTime, feedback, wowFlutter, wet]);

  const handleTestTone = () => {
    Tone.start();
    if (!isPlaying && lfoRef.current && noiseRef.current) {
      lfoRef.current.start();
      noiseRef.current.start();
      setIsPlaying(true);
    }
    synthRef.current.triggerAttack("C4");
  };

  const toggleMotor = () => {
    Tone.start();
    if (isPlaying) {
      lfoRef.current.stop();
      noiseRef.current.stop();
    } else {
      lfoRef.current.start();
      noiseRef.current.start();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ padding: '30px', background: '#1c1917', borderRadius: '10px', border: '2px solid #292524', color: '#e7e5e4', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #292524', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontFamily: 'monospace' }}>
          <CassetteTape size={28} /> RE-201 SPACE TAPE ECHO
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={toggleMotor}
            style={{ padding: '10px 20px', background: isPlaying ? '#ef4444' : '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isPlaying ? 'POWER ON' : 'POWER OFF'}
          </button>
          <button 
            onClick={handleTestTone}
            style={{ padding: '10px 20px', background: '#eab308', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            TRIGGER
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Tape Reels Animation */}
        <div style={{ display: 'flex', gap: '40px', padding: '20px', background: '#0c0a09', borderRadius: '10px', border: '1px solid #292524', flex: 1, justifyContent: 'center' }}>
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }} 
            transition={{ repeat: Infinity, duration: delayTime * 5, ease: "linear" }}
            style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#444', border: '5px solid #222', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222' }} />
            <div style={{ position: 'absolute', width: '10px', height: '100%', background: '#222' }} />
            <div style={{ position: 'absolute', width: '100%', height: '10px', background: '#222' }} />
          </motion.div>

          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }} 
            transition={{ repeat: Infinity, duration: delayTime * 5, ease: "linear" }}
            style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#444', border: '5px solid #222', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222' }} />
            <div style={{ position: 'absolute', width: '10px', height: '100%', background: '#222' }} />
            <div style={{ position: 'absolute', width: '100%', height: '10px', background: '#222' }} />
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '20px', background: '#292524', borderRadius: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#a8a29e', fontSize: '12px', letterSpacing: '1px' }}>DELAY TIME</label>
          <input 
            type="range" min="0.05" max="1.0" step="0.01" 
            value={delayTime} 
            onChange={(e) => setDelayTime(Number(e.target.value))}
            style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '100px', accentColor: '#eab308' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{(delayTime * 1000).toFixed(0)}ms</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#a8a29e', fontSize: '12px', letterSpacing: '1px' }}>INTENSITY (FB)</label>
          <input 
            type="range" min="0" max="0.95" step="0.05" 
            value={feedback} 
            onChange={(e) => setFeedback(Number(e.target.value))}
            style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '100px', accentColor: '#eab308' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{(feedback * 100).toFixed(0)}%</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#a8a29e', fontSize: '12px', letterSpacing: '1px' }}>WOW/FLUTTER</label>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={wowFlutter} 
            onChange={(e) => setWowFlutter(Number(e.target.value))}
            style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '100px', accentColor: '#eab308' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{(wowFlutter * 100).toFixed(0)}%</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#a8a29e', fontSize: '12px', letterSpacing: '1px' }}>ECHO VOL</label>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={wet} 
            onChange={(e) => setWet(Number(e.target.value))}
            style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '100px', accentColor: '#eab308' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{(wet * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default TapeEcho;
