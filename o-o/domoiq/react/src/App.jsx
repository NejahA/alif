import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Globe, 
  Zap, 
  Activity, 
  Terminal, 
  Radio, 
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck, 
  Power,
  Clock,
  Database,
  Crosshair,
  Volume2,
  AlertTriangle,
  Bookmark,
  TrendingUp,
  Box,
  CloudLightning,
  Sun,
  Wind,
  FileText,
  User,
  Shield,
  ZapOff,
  MessageSquare,
  Settings,
  AlertOctagon,
  Fingerprint
} from 'lucide-react';

const playSound = (freq = 440, type = 'sine', duration = 0.1, volume = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) { console.warn("Audio not supported"); }
};

const speak = (text, activeTimeline = 'PRIME') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = activeTimeline === 'VOID' ? 0.7 : activeTimeline === 'NEON' ? 1.0 : 0.85;
    utterance.pitch = activeTimeline === 'VOID' ? 0.5 : activeTimeline === 'NEON' ? 1.2 : 0.7;
    window.speechSynthesis.speak(utterance);
  }
};

const TemporalNexus = ({ insights }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const particles = insights.map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random()
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 255, ${p.opacity})`;
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(188, 19, 254, ${(1 - dist / 100) * 0.2})`;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [insights]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '200px', borderRadius: '12px' }} />;
};

const DominanceLeaderboard = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.totalStakes, 0) || 1;
  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.5 }}>TIMELINE HEGEMONY</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {['PRIME', 'VOID', 'NEON'].map(t => {
          const entry = data.find(d => d._id === t) || { totalStakes: 0 };
          const percentage = (entry.totalStakes / total) * 100;
          return (
            <div key={t}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '8px' }}>
                <span style={{ letterSpacing: '2px', fontWeight: 800 }}>{t}</span>
                <span style={{ opacity: 0.6 }}>{percentage.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  style={{ 
                    height: '100%', 
                    background: t === 'VOID' ? '#ff0055' : t === 'NEON' ? '#00ff41' : 'var(--accent-cyan)',
                    boxShadow: `0 0 10px ${t === 'VOID' ? '#ff0055' : t === 'NEON' ? '#00ff41' : 'var(--accent-cyan)'}`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChronoMap = ({ data }) => {
  return (
    <div className="glass-card" style={{ height: '180px', position: 'relative', overflow: 'hidden', padding: '0' }}>
      <div style={{ 
        position: 'absolute', inset: 0, opacity: 0.1, 
        backgroundImage: 'radial-gradient(var(--accent-cyan) 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }} />
      <h3 className="font-future" style={{ position: 'absolute', top: '15px', left: '15px', fontSize: '0.6rem', opacity: 0.5 }}>CHRONO-HOTSPOTS</h3>
      {data.map((h, i) => (
        <motion.div 
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0.8, 1], opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          style={{ 
            position: 'absolute', left: `${h.x}%`, top: `${h.y}%`,
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent-cyan)', boxShadow: '0 0 15px var(--accent-cyan)'
          }}
        >
          <div style={{ position: 'absolute', top: '12px', left: '-20px', whiteSpace: 'nowrap', fontSize: '0.4rem', opacity: 0.4 }}>{h.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

const DivergenceGauge = ({ value }) => {
  const rotation = (value / 100) * 180 - 90;
  return (
    <div style={{ position: 'relative', width: '120px', height: '60px', overflow: 'hidden' }}>
      <div style={{ 
        width: '120px', height: '120px', borderRadius: '50%', 
        border: '8px solid rgba(255,255,255,0.05)', position: 'absolute', top: 0 
      }} />
      <motion.div 
        animate={{ rotate: rotation }}
        style={{ 
          width: '60px', height: '2px', background: 'var(--accent-cyan)', 
          position: 'absolute', bottom: '0', left: '50%', originX: '0%',
          boxShadow: '0 0 10px var(--accent-cyan)'
        }} 
      />
      <div style={{ 
        position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', 
        fontSize: '0.6rem', letterSpacing: '1px', color: 'var(--accent-cyan)' 
      }}>
        DIVERGENCE: {value.toFixed(2)}%
      </div>
    </div>
  );
};

const AnomalyAlert = ({ anomaly, onStabilize }) => {
  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="glass-card"
      style={{ 
        position: 'fixed', bottom: '100px', right: '40px', zIndex: 1000,
        width: '300px', border: '1px solid #ff0055', background: 'rgba(255,0,85,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <AlertOctagon color="#ff0055" />
        <span className="font-future" style={{ fontSize: '0.7rem', color: '#ff0055' }}>ANOMALY DETECTED</span>
      </div>
      <p style={{ fontSize: '0.7rem', marginBottom: '15px' }}>{anomaly.type} in {anomaly.location}. Stability decreasing.</p>
      <button 
        className="btn-futr" 
        style={{ width: '100%', background: '#ff0055', fontSize: '0.6rem' }}
        onClick={() => onStabilize(anomaly._id)}
      >
        STABILIZE RIFT
      </button>
    </motion.div>
  );
};

const SimulationDeck = ({ onSimulate }) => {
  const [params, setParams] = useState({ risk: 50, scope: 'Local', duration: 'Decade' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const outcomes = [
        "Total systemic collapse. Probability: 12%",
        "Golden age of neural integration. Probability: 64%",
        "Stagnation in the digital void. Probability: 24%"
      ];
      setResult(outcomes[Math.floor(Math.random() * outcomes.length)]);
      onSimulate();
    }, 2000);
  };

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.5 }}>NEURAL SIMULATION DECK</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontSize: '0.6rem', opacity: 0.5 }}>RISK PARAMETER</label>
          <input type="range" style={{ width: '100%' }} value={params.risk} onChange={e => setParams({...params, risk: e.target.value})} />
        </div>
        <button className="btn-futr" onClick={handleSimulate} disabled={loading}>
          {loading ? 'SIMULATING...' : 'EXECUTE SIMULATION'}
        </button>
        {result && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '15px', background: 'rgba(0,242,255,0.1)', borderRadius: '8px', fontSize: '0.7rem' }}
          >
            {result}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const QuantumChat = ({ broadcasts, onSend, channel, onChannelChange }) => {
  const [msg, setMsg] = useState('');
  return (
    <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="font-future" style={{ fontSize: '0.8rem', opacity: 0.5 }}>QUANTUM CHAT</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['GLOBAL', 'VOID', 'NEON'].map(c => (
            <button 
              key={c}
              onClick={() => onChannelChange(c)}
              style={{ 
                fontSize: '0.5rem', padding: '4px 8px', borderRadius: '4px',
                background: channel === c ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                color: channel === c ? 'black' : 'white',
                border: '1px solid var(--glass-border)', cursor: 'pointer'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {broadcasts.filter(b => b.message.includes(`[${channel}]`) || channel === 'GLOBAL').map((b, i) => (
          <div key={i} style={{ fontSize: '0.7rem', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>{b.sender}:</span> {b.message}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={msg} 
          onChange={e => setMsg(e.target.value)}
          placeholder={`Transmit to ${channel}...`}
          style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', padding: '10px', color: 'white', borderRadius: '8px' }}
          onKeyDown={e => { if(e.key === 'Enter') { onSend(`[${channel}] ${msg}`); setMsg(''); } }}
        />
        <button className="btn-futr" onClick={() => { onSend(`[${channel}] ${msg}`); setMsg(''); }} style={{ padding: '10px' }}>
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  );
};

const HolographicMarket = ({ credits, onBuy }) => {
  const [artifacts, setArtifacts] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/market').then(res => res.json()).then(setArtifacts);
  }, []);

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.5 }}>HOLOGRAPHIC MARKETPLACE</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
        {artifacts.map((art, i) => (
          <div key={i} className="glass-card" style={{ padding: '15px', textAlign: 'center', border: `1px solid ${art.rarity === 'Legendary' ? 'var(--accent-purple)' : 'var(--glass-border)'}` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{art.icon === 'Sparkles' ? '✨' : art.icon === 'Key' ? '🔑' : '🛡️'}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{art.name}</div>
            <div style={{ fontSize: '0.5rem', opacity: 0.5, margin: '5px 0' }}>{art.description}</div>
            <button 
              className="btn-futr" 
              style={{ fontSize: '0.5rem', padding: '6px', width: '100%', marginTop: '10px' }}
              onClick={() => onBuy(art)}
              disabled={credits < art.price}
            >
              {art.price} QC
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FactionSelector = ({ onSelect }) => {
  const factions = [
    { id: 'Archivists', desc: 'Masters of data and history.', color: '#00f2ff', icon: Database },
    { id: 'RiftWalkers', desc: 'Chaos-driven explorers of the void.', color: '#ff0055', icon: ZapOff },
    { id: 'ChronosGuard', desc: 'Sentinels of the primary timeline.', color: '#00ff41', icon: Shield }
  ];

  return (
    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', width: '600px' }}>
      <h2 className="font-future" style={{ fontSize: '1.5rem', marginBottom: '40px', letterSpacing: '5px' }}>CHOOSE YOUR ALIGNMENT</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {factions.map(f => (
          <motion.div 
            key={f.id} 
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(f.id)}
            className="glass-card" 
            style={{ padding: '20px', cursor: 'pointer', borderColor: f.color }}
          >
            <f.icon size={40} color={f.color} style={{ marginBottom: '15px' }} />
            <h3 className="font-future" style={{ fontSize: '0.8rem', color: f.color }}>{f.id.toUpperCase()}</h3>
            <p style={{ fontSize: '0.5rem', opacity: 0.5, marginTop: '10px' }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const MissionBoard = ({ missions, progress }) => {
  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.5 }}>MISSION BOARD</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {missions.map((m, i) => {
          const current = progress[m.targetType] || 0;
          const pct = Math.min(100, (current / m.targetCount) * 100);
          return (
            <div key={i} className="glass-card" style={{ padding: '15px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{m.title}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)' }}>{m.reward} QC</span>
              </div>
              <p style={{ fontSize: '0.5rem', opacity: 0.5, marginBottom: '10px' }}>{m.description}</p>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GlobalSingularityMeter = ({ progress }) => {
  return (
    <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '400px', zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--accent-cyan)' }}>
        <span>SINGULARITY STATUS</span>
        <span>{progress.toFixed(2)}%</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <motion.div 
          animate={{ width: `${progress}%` }}
          style={{ height: '100%', background: `linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))`, boxShadow: `0 0 20px var(--accent-cyan)` }}
        />
      </div>
    </div>
  );
};

const NeuralWeb3D = ({ insights, activeIndex }) => {
  return (
    <div className="glass-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '400px' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {insights.map((ins, i) => {
          const x = 50 + Math.cos(i * (Math.PI * 2 / insights.length)) * 30;
          const y = 50 + Math.sin(i * (Math.PI * 2 / insights.length)) * 30;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <line 
                  x1={`${50 + Math.cos((i-1) * (Math.PI * 2 / insights.length)) * 30}%`} 
                  y1={`${50 + Math.sin((i-1) * (Math.PI * 2 / insights.length)) * 30}%`}
                  x2={`${x}%`} y2={`${y}%`}
                  stroke="var(--accent-cyan)" strokeWidth="0.5" strokeOpacity="0.2"
                />
              )}
              <motion.circle 
                cx={`${x}%`} cy={`${y}%`} r={i === activeIndex ? 6 : 3}
                fill={i === activeIndex ? 'var(--accent-cyan)' : 'white'}
                fillOpacity={i === activeIndex ? 1 : 0.3}
                filter="url(#glow)"
              />
            </React.Fragment>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '0.6rem', opacity: 0.5 }}>
        INTERACTIVE NEURAL WEB v.3.0
      </div>
    </div>
  );
};

const HackingMiniGame = ({ onComplete }) => {
  const [sequence, setSequence] = useState(Array.from({ length: 4 }, () => Math.floor(Math.random() * 4)));
  const [input, setInput] = useState([]);
  
  const handlePress = (i) => {
    const nextInput = [...input, i];
    setInput(nextInput);
    if (nextInput[nextInput.length - 1] !== sequence[nextInput.length - 1]) {
      setInput([]);
      playSound(200, 'sawtooth', 0.2);
    } else if (nextInput.length === sequence.length) {
      onComplete();
    } else {
      playSound(1200, 'sine', 0.1);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '30px', border: '1px solid #ff0055', background: 'rgba(255,0,85,0.05)' }}>
      <h3 className="font-future" style={{ fontSize: '0.7rem', color: '#ff0055', marginBottom: '20px' }}>SYSTEM BREACH: BYPASS FIREWALL</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {[0, 1, 2, 3].map(i => (
          <button 
            key={i} 
            className="btn-futr" 
            style={{ background: input.length > 0 && input[input.length-1] === i ? 'white' : '#ff0055' }}
            onClick={() => handlePress(i)}
          >
            NODE {i}
          </button>
        ))}
      </div>
    </div>
  );
};

const QuantumCore = ({ entropy, pulse }) => {
  return (
    <div style={{ 
      width: '120px', height: '120px', position: 'relative', 
      margin: '40px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' 
    }}>
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 60 / pulse, repeat: Infinity } }}
        style={{ 
          position: 'absolute', inset: 0, borderRadius: '50%', 
          border: '2px dashed var(--accent-cyan)', opacity: 0.3 
        }} 
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{ 
          position: 'absolute', inset: '15%', borderRadius: '50%', 
          border: '1px solid var(--accent-purple)', opacity: 0.5 
        }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ 
          width: '30px', height: '30px', borderRadius: '50%', 
          background: 'var(--accent-cyan)', boxShadow: '0 0 30px var(--accent-cyan)' 
        }} 
      />
    </div>
  );
};

const NeuralMemoryBank = ({ pinned, onUnpin }) => {
  return (
    <div className="glass-card" style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)' }}>
      <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.5, letterSpacing: '3px' }}>NEURAL MEMORY BANK</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {pinned.length === 0 && <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>No records stored in memory.</p>}
        {pinned.map(p => (
          <motion.div 
            key={p._id} 
            layout
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ 
              padding: '12px', borderLeft: '2px solid var(--accent-purple)', 
              background: 'rgba(255,255,255,0.03)', position: 'relative'
            }}
          >
            <p style={{ fontSize: '0.7rem', lineHeight: '1.4', marginBottom: '8px' }}>{p.text.substring(0, 80)}...</p>
            <button 
              onClick={() => onUnpin(p)}
              style={{ fontSize: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer' }}
            >
              [ PURGE RECORD ]
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const WaveformGallery = ({ timeline }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      
      const colors = {
        PRIME: 'var(--accent-cyan)',
        VOID: '#ff0055',
        NEON: '#00ff41'
      };

      ctx.strokeStyle = colors[timeline] || colors.PRIME;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const amplitude = timeline === 'VOID' ? 40 : timeline === 'NEON' ? 10 : 25;
        const freq = timeline === 'VOID' ? 0.01 : timeline === 'NEON' ? 0.08 : 0.03;
        const y = canvas.height / 2 + Math.sin(x * freq + frame * 0.1) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      frame++;
      requestAnimationFrame(render);
    };
    render();
  }, [timeline]);

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <h3 className="font-future" style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '15px' }}>TEMPORAL RESONANCE WAVEFORM</h3>
      <canvas ref={canvasRef} width={400} height={100} style={{ width: '100%', opacity: 0.8 }} />
    </div>
  );
};

const NewsTicker = ({ headlines }) => {
  return (
    <div style={{ 
      width: '100%', background: 'rgba(0, 242, 255, 0.05)', height: '30px', 
      overflow: 'hidden', whiteSpace: 'nowrap', borderBottom: '1px solid var(--glass-border)',
      display: 'flex', alignItems: 'center'
    }}>
      <motion.div 
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ color: 'var(--accent-cyan)', fontSize: '0.6rem', letterSpacing: '2px', fontWeight: 800 }}
      >
        {headlines.map((h, i) => <span key={i} style={{ marginRight: '100px' }}>[ BREAKING ] {h.toUpperCase()}</span>)}
      </motion.div>
    </div>
  );
};

import AdminDashboard from './AdminDashboard';

const ParticleSwarm = ({ entropy }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let frame = 0;

    const createParticles = () => {
      particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2
      }));
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 242, 255, 0.2)';
      particles.forEach(p => {
        p.x += p.vx * (1 + entropy * 5);
        p.y += p.vy * (1 + entropy * 5);
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      frame++;
      requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();
    return () => window.removeEventListener('resize', handleResize);
  }, [entropy]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none', opacity: 0.3 }} />;
};

const UplinkModal = ({ onComplete }) => {
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (verifying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            onComplete();
            return 100;
          }
          return prev + 5;
        });
      }, 80);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [verifying, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, zIndex: 5000, 
        background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', color: 'var(--text-main)', padding: '24px'
      }}
    >
      <motion.div 
        animate={{ scale: verifying ? 0.96 : 1 }}
        style={{ width: '320px', textAlign: 'center', maxWidth: '100%' }}
      >
        <h2 className="font-future" style={{ fontSize: '0.9rem', letterSpacing: '5px', marginBottom: '40px', opacity: 0.8 }}>NEURAL UPLINK PENDING</h2>
        <button
          onClick={() => setVerifying(true)}
          style={{
            width: '120px', height: '120px', borderRadius: '50%', border: '2px solid var(--accent-cyan)',
            margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.2)',
            color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase'
          }}
        >
          {verifying ? 'VERIFYING' : 'CLICK TO VERIFY'}
          <motion.div 
            animate={{ scaleY: progress / 100 }}
            style={{ 
              position: 'absolute', inset: 0, background: 'var(--accent-cyan)', 
              opacity: 0.12, transformOrigin: 'bottom'
            }} 
          />
        </button>
        <p style={{ fontSize: '0.7rem', marginTop: '24px', opacity: 0.6 }}>Tap the verifier to complete authentication and continue.</p>
      </motion.div>
    </motion.div>
  );
};

const WaveLinkGame = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [freq, setFreq] = useState(50);
  const [targetFreq] = useState(30 + Math.floor(Math.random() * 40));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.05 + frame * 0.1) * 30;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'var(--accent-cyan)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * (freq / 1000) + frame * 0.1) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (Math.abs(freq - targetFreq) < 2) {
        onComplete();
      }

      frame++;
      requestAnimationFrame(render);
    };
    render();
  }, [freq]);

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <p style={{ fontSize: '0.7rem', marginBottom: '10px', opacity: 0.5 }}>MATCH NEURAL FREQUENCY: {targetFreq}Hz</p>
      <canvas ref={canvasRef} width={400} height={100} style={{ width: '100%', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }} />
      <input 
        type="range" min="30" max="70" value={freq} 
        onChange={(e) => setFreq(parseInt(e.target.value))}
        style={{ width: '100%', marginTop: '20px' }}
      />
    </div>
  );
};

const FutureArtifact = ({ seed }) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '200px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{ 
          width: '80%', height: '80%', 
          background: `conic-gradient(from 180deg at 50% 50%, var(--accent-cyan) 0deg, var(--accent-purple) 360deg)`,
          filter: 'blur(40px)', opacity: 0.3
        }}
      />
      <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
      <div style={{ fontSize: '0.6rem', letterSpacing: '4px', opacity: 0.5 }}>RECONSTRUCTING ARTIFACT...</div>
    </div>
  );
};

const OracleAvatar = ({ sync, stress }) => {
  return (
    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
      {/* Hologram Light Beam FX */}
      <div style={{ 
        position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
        width: '80px', height: '120px', background: 'linear-gradient(to top, var(--accent-cyan) 0%, transparent 80%)',
        opacity: 0.1, clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', pointerEvents: 'none'
      }} />
      <motion.svg 
        viewBox="0 0 100 100" 
        style={{ width: '100%', height: '100%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <radialGradient id="meshGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            cx="50" cy="50"
            r={20 + i * 5}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="0.5"
            strokeDasharray="10 5"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.4, 0.1],
              strokeDashoffset: [0, 50]
            }}
            transition={{ 
              duration: 3 + i, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        ))}
        <motion.circle 
          cx="50" cy="50" r="15" 
          fill="url(#meshGradient)"
          animate={{ 
            scale: [1, 1.5 + (stress * 0.5), 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 2 - (sync / 100), repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
};

const TemporalNewsTicker = () => {
  const headlines = [
    "2082: Martian Sovereignty Treaty Signed by Earth Union.",
    "2105: Neural-Link Standard 4.0 Achieves 99% Symbiosis.",
    "2055: Quantum-Fusion Energy Grid Becomes Global Standard.",
    "2091: First Digital Consciousness Granted Personhood.",
    "2118: Interstellar Probe 'Aether-1' Reaches Proxima B."
  ];

  return (
    <div style={{ 
      position: 'fixed', bottom: 0, left: 0, right: 0, 
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--glass-border)', padding: '10px 0',
      zIndex: 100, overflow: 'hidden', whiteSpace: 'nowrap'
    }}>
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ display: 'inline-block', paddingLeft: '100%' }}
      >
        {headlines.map((h, i) => (
          <span key={i} style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginRight: '100px', letterSpacing: '2px' }}>
            {h}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const CorruptedText = ({ text, stability }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (stability > 0.8) { setDisplay(text); return; }
    const interval = setInterval(() => {
      const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/";
      const corrupted = text.split('').map(c => 
        Math.random() > stability ? chars[Math.floor(Math.random() * chars.length)] : c
      ).join('');
      setDisplay(corrupted);
    }, 100);
    return () => clearInterval(interval);
  }, [text, stability]);
  return <span>{display}</span>;
};

const HolographicDetail = ({ insight, onClose, onStake, onPin, isPinned, stability = 1 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, zIndex: 200, 
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <motion.div 
        initial={{ rotateY: 90, scale: 0.5 }}
        animate={{ rotateY: 0, scale: 1 }}
        exit={{ rotateY: -90, scale: 0.5 }}
        transition={{ type: 'spring', damping: 15 }}
        className="glass-card"
        style={{ 
          width: '500px', padding: '50px', position: 'relative',
          transformStyle: 'preserve-3d', perspective: '1000px',
          boxShadow: '0 0 50px rgba(0, 242, 255, 0.2)'
        }}
      >
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px' }}>
          <button onClick={() => onPin(insight)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Bookmark size={24} color={isPinned ? 'var(--accent-cyan)' : 'white'} fill={isPinned ? 'var(--accent-cyan)' : 'none'} />
          </button>
          <button onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <h2 className="font-future" style={{ color: 'var(--accent-cyan)', marginBottom: '30px', fontSize: '1.5rem' }}>HOLOGRAPHIC RECORD</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div>
            <FutureArtifact seed={insight._id} />
          </div>
          <div>
            <CorruptedText text={`"${insight.text}"`} stability={stability} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
              <div className="glass-card" style={{ padding: '15px' }}>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '5px' }}>PROBABILITY</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{(70 + Math.random() * 29).toFixed(1)}%</div>
              </div>
              <div className="glass-card" style={{ padding: '15px' }}>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '5px' }}>SOURCE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>NODE-{insight._id?.substring(0,4).toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className="btn-futr" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            onClick={() => onStake(insight._id, 100)}
          >
            <TrendingUp size={18} /> STAKE 100 CREDITS
          </button>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '0.65rem', textAlign: 'center', opacity: 0.3, letterSpacing: '4px' }}>
          TOTAL STAKE: {insight.stakes || 0} QC
        </div>
      </motion.div>
    </motion.div>
  );
};

// Data now handled by Aether Nexus (MongoDB)


const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="glass-card"
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{ padding: '8px', background: `${color}20`, borderRadius: '8px' }}>
        <Icon size={20} color={color} />
      </div>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800 }} className="font-future">{value}</div>
  </motion.div>
);

function App() {
  const [insights, setInsights] = useState([]);
  const [activeInsight, setActiveInsight] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState(["> Initializing Aether Oracle...", "> Establishing secure neural uplink..."]);
  const [oracleQuery, setOracleQuery] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newInsightText, setNewInsightText] = useState("");
  const [newInsightCategory, setNewInsightCategory] = useState("Technological");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [oracleMode, setOracleMode] = useState('Visionary');
  const [stats, setStats] = useState({ totalInsights: 0, totalEndorsements: 0, systemEntropy: 0, distribution: [] });
  const [calibration, setCalibration] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [epoch, setEpoch] = useState(2050);
  const [bioState, setBioState] = useState({ pulse: 72, stress: 0.12 });
  const [credits, setCredits] = useState(1000);
  const [pinnedInsights, setPinnedInsights] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [heatmap, setHeatmap] = useState({});
  const [seerActivity, setSeerActivity] = useState([
    "User_442 endorsed node 2085.",
    "Cortex_Link established with Alpha-7.",
    "User_99 staked 500 QC on Neural Standard."
  ]);
  const [weather, setWeather] = useState({ type: 'Stable', icon: Sun, entropyBoost: 0 });
  const [showManifesto, setShowManifesto] = useState(false);
  const [manifestoContent, setManifestoContent] = useState("");
  const [activeTimeline, setActiveTimeline] = useState('PRIME');
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [terminalInput, setTerminalInput] = useState('');
  const [divergence, setDivergence] = useState(0);
  const [userName, setUserName] = useState(localStorage.getItem('seerName') || '');
  const [audioEngine, setAudioEngine] = useState(null);
  const [dominance, setDominance] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [isUplinked, setIsUplinked] = useState(true);
  const [seers, setSeers] = useState([]);
  const [news, setNews] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showTimelineHUD, setShowTimelineHUD] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [activeAnomaly, setActiveAnomaly] = useState(null);
  const [events, setEvents] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [seerData, setSeerData] = useState(null);
  const [missions, setMissions] = useState([]);
  const [faction, setFaction] = useState('None');
  const [showFactionSelector, setShowFactionSelector] = useState(false);
  const [singularity, setSingularity] = useState(0);
  const [selectedArtifacts, setSelectedArtifacts] = useState([]);
  
  const API_BASE = "https://domoiq-server.onrender.com/api";

  const fetchInsights = async (cat = 'All') => {
    try {
      const res = await fetch(`${API_BASE}/insights?category=${cat}&timeline=${activeTimeline}`);
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      const historyMsgs = data.map(log => `QUERY: "${log.query}" -> ${log.response.substring(0, 30)}...`);
      setTerminalOutput(prev => [...prev, ...historyMsgs].slice(-15));
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const res = await fetch(`${API_BASE}/heatmap`);
      const data = await res.json();
      setHeatmap(data);
    } catch (err) {
      console.error("Failed to fetch heatmap:", err);
    }
  };

  const fetchDominance = async () => {
    try {
      const res = await fetch(`${API_BASE}/dominance`);
      const data = await res.json();
      setDominance(data);
    } catch (err) {
      console.error("Failed to fetch dominance:", err);
    }
  };

  const fetchHotspots = async () => {
    try {
      const res = await fetch(`${API_BASE}/hotspots`);
      const data = await res.json();
      setHotspots(data);
    } catch (err) {
      console.error("Failed to fetch hotspots:", err);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch(`${API_BASE}/weather`);
      const data = await res.json();
      const icons = { Sun, CloudLightning, Wind };
      setWeather({ ...data, icon: icons[data.icon] || Sun });
      addTerminalMsg(`WEATHER UPDATE: ${data.msg}`);
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    }
  };

  const fetchSeers = async () => {
    try {
      const res = await fetch(`${API_BASE}/seers`);
      const data = await res.json();
      setSeers(data);
    } catch (err) {
      console.error("Failed to fetch seers:", err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/news?timeline=${activeTimeline}`);
      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`${API_BASE}/broadcasts`);
      const data = await res.json();
      setBroadcasts(data);
    } catch (err) {
      console.error("Failed to fetch broadcasts:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events?timeline=${activeTimeline}`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    fetchInsights(selectedCategory);
    fetchHistory();
    fetchStats();
    fetchHeatmap();
    fetchDominance();
    fetchHotspots();
    fetchSeers();
    fetchNews();
    fetchBroadcasts();
    fetchEvents();
    fetchSeerData();
    setShowTimelineHUD(true);
    setTimeout(() => setShowTimelineHUD(false), 2000);
  }, [activeTimeline]);

  const fetchSeerData = async () => {
    if (!userName) return;
    try {
      const res = await fetch(`${API_BASE}/seers/${userName}`);
      const data = await res.json();
      setSeerData(data);
      setCredits(data.credits);
    } catch (err) {
      console.error("Failed to fetch seer data:", err);
    }
  };

  const fetchMissions = async () => {
    try {
      const res = await fetch(`${API_BASE}/missions`);
      const data = await res.json();
      setMissions(data);
    } catch (err) {
      console.error("Failed to fetch missions:", err);
    }
  };

  const handleFactionSelect = async (f) => {
    try {
      const res = await fetch(`${API_BASE}/seers/${userName}/faction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faction: f })
      });
      const data = await res.json();
      setSeerData(data);
      setFaction(f);
      setShowFactionSelector(false);
      addTerminalMsg(`ALIGNMENT SECURED: Welcome to ${f}.`);
      playSound(2000, 'sine', 1);
    } catch (err) {
      console.error("Faction selection failed:", err);
    }
  };

  const updateMissionProgress = (type, amount = 1) => {
    if (!seerData) return;
    setSeerData(prev => {
      const nextProgress = { ...(prev.missionProgress || {}) };
      nextProgress[type] = (nextProgress[type] || 0) + amount;
      missions.forEach(m => {
        if (m.targetType === type && nextProgress[type] === m.targetCount) {
          addTerminalMsg(`MISSION COMPLETE: ${m.title}. Reward: ${m.reward} QC.`);
          playSound(2500, 'sine', 0.5);
        }
      });
      return { ...prev, missionProgress: nextProgress };
    });
  };

  const handleUpgrade = async (upgrade, cost) => {
    try {
      const res = await fetch(`${API_BASE}/seers/${userName}/upgrade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgrade, cost })
      });
      const data = await res.json();
      if (data.error) {
        addTerminalMsg(`UPGRADE ERROR: ${data.error}`);
      } else {
        setSeerData(data);
        addTerminalMsg(`NEURAL ENHANCEMENT SECURED: ${upgrade}.`);
        playSound(2200, 'square', 0.3);
      }
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  const fetchSingularity = async () => {
    try {
      const res = await fetch(`${API_BASE}/system`);
      const data = await res.json();
      setSingularity(data.singularityProgress);
    } catch (err) {
      console.error("Failed to fetch singularity:", err);
    }
  };

  const triggerSingularity = async (amount = 0.01) => {
    try {
      const res = await fetch(`${API_BASE}/system/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      setSingularity(data.singularityProgress);
      if (data.singularityProgress >= 100) {
        addTerminalMsg("CRITICAL: SINGULARITY REACHED. TRANSCENDING...");
        playSound(440, 'sawtooth', 1);
      }
    } catch (err) {
      console.error("Failed to trigger singularity:", err);
    }
  };

  const handleFuseArtifacts = async () => {
    if (selectedArtifacts.length < 2) return;
    try {
      const res = await fetch(`${API_BASE}/market/fuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, artifactIds: selectedArtifacts })
      });
      const data = await res.json();
      setSeerData(data.seer);
      setSelectedArtifacts([]);
      addTerminalMsg("FUSION COMPLETE: Mythic artifact crystallized.");
      playSound(2500, 'sine', 1);
      triggerSingularity(0.5);
    } catch (err) {
      console.error("Fusion failed:", err);
    }
  };

  useEffect(() => {
    fetchMissions();
    fetchSingularity();
    const sInterval = setInterval(fetchSingularity, 10000);
    return () => clearInterval(sInterval);
  }, []);

  useEffect(() => {
    if (seerData && (!seerData.faction || seerData.faction === 'None') && userName) {
      setShowFactionSelector(true);
    } else if (seerData) {
      setFaction(seerData.faction);
    }
  }, [seerData, userName]);

  const fetchAnomalies = async () => {
    try {
      const res = await fetch(`${API_BASE}/anomalies`);
      const data = await res.json();
      setAnomalies(data);
      if (data.length > 0 && !activeAnomaly) {
        setActiveAnomaly(data[0]);
        playSound(600, 'sawtooth', 0.5);
      }
    } catch (err) {
      console.error("Failed to fetch anomalies:", err);
    }
  };

  const stabilizeAnomaly = async (id) => {
    try {
      await fetch(`${API_BASE}/anomalies/${id}/stabilize`, { method: 'PATCH' });
      addTerminalMsg("Anomaly stabilized. 200 Credits awarded.");
      await fetch(`${API_BASE}/seers/${userName}/credits`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 200 })
      });
      setActiveAnomaly(null);
      fetchSeerData();
      updateMissionProgress('anomaly', 1);
      playSound(1800, 'sine', 0.3);
    } catch (err) {
      console.error("Stabilization failed:", err);
    }
  };

  const handleBuyArtifact = async (artifact) => {
    try {
      const res = await fetch(`${API_BASE}/market/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, artifactId: artifact._id })
      });
      const data = await res.json();
      if (data.error) {
        addTerminalMsg(`MARKET ERROR: ${data.error}`);
      } else {
        addTerminalMsg(`ACQUIRED ARTIFACT: ${artifact.name}.`);
        fetchSeerData();
        playSound(2000, 'sine', 0.5);
      }
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  const [chatChannel, setChatChannel] = useState('GLOBAL');
  const [showHacking, setShowHacking] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const aInterval = setInterval(fetchAnomalies, 15000);
    const rInterval = setInterval(async () => {
      if (Math.random() > 0.7) {
        const isBreach = Math.random() > 0.8;
        if (isBreach && !showHacking) {
           setShowHacking(true);
           addTerminalMsg("CRITICAL: System breach detected. Firewall compromise in progress.");
           playSound(400, 'sawtooth', 1);
           return;
        }
        const types = ["Temporal Rift", "Data Storm", "Nexus Decay", "Chrono-Glitch"];
        const locs = ["Sector 7", "Neo-Tokyo", "Mars Colony", "Orbit Alpha"];
        await fetch(`${API_BASE}/anomalies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: types[Math.floor(Math.random() * types.length)],
            location: locs[Math.floor(Math.random() * locs.length)],
            severity: Math.floor(Math.random() * 5) + 1
          })
        });
      }
    }, 45000);
    return () => { clearInterval(aInterval); clearInterval(rInterval); };
  }, []);

  useEffect(() => {
    const wInterval = setInterval(fetchWeather, 30000);
    return () => clearInterval(wInterval);
  }, []);

  useEffect(() => {
    // Calculate Divergence based on stakes and upvotes
    const totalStakes = insights.reduce((acc, curr) => acc + (curr.stakes || 0), 0);
    const totalUpvotes = insights.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);
    setDivergence((totalStakes * 0.01) + (totalUpvotes * 0.05));
  }, [insights]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const startAudio = () => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(activeTimeline === 'VOID' ? 110 : 220, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setAudioEngine({ ctx, osc, gain });
    };
    
    const resumeAudio = () => {
      if (audioEngine) audioEngine.ctx.resume();
    };

    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('mousemove', resumeAudio);
    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('mousemove', resumeAudio);
    };
  }, [audioEngine]);

  useEffect(() => {
    if (audioEngine) {
      const freq = activeTimeline === 'VOID' ? 55 : activeTimeline === 'NEON' ? 330 : 220;
      audioEngine.osc.frequency.exponentialRampToValueAtTime(freq, audioEngine.ctx.currentTime + 2);
    }
  }, [activeTimeline]);

  useEffect(() => {
    // Multiverse Theme Shifting
    if (activeTimeline === 'VOID') {
      document.documentElement.style.setProperty('--accent-cyan', '#ff0055');
      document.documentElement.style.setProperty('--accent-purple', '#000000');
    } else if (activeTimeline === 'NEON') {
      document.documentElement.style.setProperty('--accent-cyan', '#00ff41');
      document.documentElement.style.setProperty('--accent-purple', '#003b00');
    } else {
      const hue = ((epoch - 2025) / 125) * 120 + 180;
      document.documentElement.style.setProperty('--accent-cyan', `hsl(${hue}, 100%, 50%)`);
    }
  }, [activeTimeline, epoch]);

  useEffect(() => {
    if (insights.length > 0) {
      const interval = setInterval(() => {
        setActiveInsight(prev => (prev + 1) % insights.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [insights]);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        const glitches = [
          "SYSTEM WARNING: Temporal drift detected.",
          "INCOMING TRANSMISSION: [REDACTED] from 2099.",
          "ERROR: Quantum decoherence imminent.",
          "ALERT: Parallel timeline overlap (0.04%)"
        ];
        addTerminalMsg(glitches[Math.floor(Math.random() * glitches.length)]);
        playSound(800 + Math.random() * 200, 'square', 0.05, 0.02);
      }
    }, 15000);
    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    const seerInterval = setInterval(() => {
      const users = ["System_Admin", "Quantum_Drifter", "Neo_Seer", "User_884", "Cortex_X"];
      const actions = ["endorsed", "staked credits on", "accessed archive for", "calibrated link with"];
      const newActivity = `${users[Math.floor(Math.random() * users.length)]} ${actions[Math.floor(Math.random() * actions.length)]} Node-${Math.floor(Math.random() * 9000 + 1000)}.`;
      setSeerActivity(prev => [newActivity, ...prev].slice(0, 5));
    }, 8000);
    return () => clearInterval(seerInterval);
  }, []);

  useEffect(() => {
    const bioInterval = setInterval(() => {
      setBioState(prev => ({
        pulse: 60 + Math.floor(Math.random() * 40),
        stress: Math.max(0.1, Math.min(0.9, prev.stress + (Math.random() - 0.5) * 0.1))
      }));
    }, 3000);
    return () => clearInterval(bioInterval);
  }, []);

  useEffect(() => {
    // Dynamic Weather Sync handled by fetchWeather
  }, []);

  const addTerminalMsg = (msg) => {
    setTerminalOutput(prev => [...prev.slice(-12), `> ${msg}`]);
  };

  const handleTerminalCmd = (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput.trim().toLowerCase();
      addTerminalMsg(terminalInput);
      setTerminalInput('');

      if (cmd.startsWith('/shift ')) {
        const t = cmd.split(' ')[1].toUpperCase();
        if (['PRIME', 'VOID', 'NEON'].includes(t)) {
          setActiveTimeline(t);
          addTerminalMsg(`TIMELINE SHIFT: ${t} sequence initiated.`);
        } else {
          addTerminalMsg("ERROR: Invalid timeline coordinate.");
        }
      } else if (cmd === '/clear') {
        setTerminalOutput([]);
      } else if (cmd === '/calibrate') {
        runCalibration();
      } else if (cmd === '/manifest') {
        generateManifesto();
      } else if (cmd.startsWith('/name ')) {
        const name = cmd.split(' ')[1];
        setUserName(name);
        localStorage.setItem('seerName', name);
        addTerminalMsg(`IDENTITY RECORDED: Greetings, Seer ${name}.`);
      } else if (cmd.startsWith('/broadcast ')) {
        const msg = terminalInput.substring(11);
        sendBroadcast(msg);
      } else {
        addTerminalMsg("UNKNOWN COMMAND. Access /help for protocols.");
      }
      playSound(1200, 'square', 0.1);
    }
  };

  const handleOracleSubmit = async (e) => {
    e.preventDefault();
    if (!oracleQuery) return;

    setIsProcessing(true);
    addTerminalMsg(`Analyzing quantum query: "${oracleQuery}"`);
    addTerminalMsg("Syncing with parallel timelines...");
    playSound(440, 'sine', 0.2);

    try {
      const res = await fetch(`${API_BASE}/oracle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: oracleQuery, 
          mode: oracleMode,
          context: { userName, timeline: activeTimeline, divergence }
        })
      });
      const data = await res.json();
      
      setPrediction(data.response);
      setIsProcessing(false);
      addTerminalMsg(`Prediction crystallized in ${oracleMode} mode.`);
      triggerSingularity(0.05);
      playSound(880, 'sine', 0.3);
      speak(data.response, activeTimeline); // VOCALIZE
      fetchHistory(); // Refresh history
      fetchStats();
    } catch (err) {
      addTerminalMsg("ERROR: Neural uplink failed.");
      setIsProcessing(false);
    }
  };

  const handleInsightSubmit = async (e) => {
    e.preventDefault();
    if (!newInsightText) return;

    try {
      await fetch(`${API_BASE}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newInsightText, category: newInsightCategory })
      });
      setNewInsightText("");
      setShowSubmitModal(false);
      addTerminalMsg(`New insight recorded in ${newInsightCategory} timeline.`);
      fetchInsights(selectedCategory);
    } catch (err) {
      addTerminalMsg("ERROR: Data persistence failure.");
    }
  };

  const handleUpvote = async (id) => {
    try {
      await fetch(`${API_BASE}/insights/${id}/upvote`, { method: 'PATCH' });
      updateMissionProgress('upvote', 1);
      triggerSingularity(0.01);
      fetchInsights(selectedCategory);
      fetchStats();
      addTerminalMsg("Quantum endorsement recorded.");
      playSound(1200, 'sine', 0.1);
    } catch (err) {
      console.error("Upvote failed:", err);
    }
  };

  const handleStake = async (id, amount) => {
    if (credits < amount) {
      addTerminalMsg("ERROR: Insufficient Quantum Credits.");
      return;
    }
    try {
      await fetch(`${API_BASE}/insights/${id}/stake`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      updateMissionProgress('stake', amount);
      triggerSingularity(amount * 0.0001);
      setCredits(prev => prev - amount);
      addTerminalMsg(`Staked ${amount} credits on node ${id.substring(0,4)}.`);
      playSound(1500, 'square', 0.2);
      fetchInsights(selectedCategory);
    } catch (err) {
      console.error("Stake failed:", err);
    }
  };

  const handlePin = (insight) => {
    setPinnedInsights(prev => {
      const isPinned = prev.find(p => p._id === insight._id);
      if (isPinned) return prev.filter(p => p._id !== insight._id);
      return [...prev, insight];
    });
    playSound(1000, 'sine', 0.1);
  };

  const generateManifesto = () => {
    const topInsights = [...insights].sort((a, b) => (b.stakes + b.upvotes) - (a.stakes + a.upvotes)).slice(0, 3);
    if (topInsights.length === 0) {
      addTerminalMsg("ERROR: Insufficient data to manifest future.");
      return;
    }
    const content = `THE WORLD OF ${epoch}:\n\nPrimary Directive: ${topInsights[0].text}\n\nSecondary Influence: ${topInsights[1]?.text || "Stabilizing..."}\n\nNexus Probability: 94.2%\n\nThis future is inevitable. The Aether has spoken.`;
    setManifestoContent(content);
    setShowManifesto(true);
    playSound(2000, 'sine', 0.5);
    speak("Future manifesto generated. Accessing archived data.", activeTimeline);
  };

  const sendBroadcast = async (message) => {
    try {
      await fetch(`${API_BASE}/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userName || 'Anonymous', message })
      });
      setIsBroadcasting(true);
      playSound(2000, 'square', 0.5);
      setTimeout(() => setIsBroadcasting(false), 2000);
      fetchBroadcasts();
    } catch (err) {
      console.error("Broadcast failed:", err);
    }
  };

  const runCalibration = () => {
    setIsCalibrating(true);
    let step = 0;
    const interval = setInterval(() => {
      setCalibration(prev => Math.min(prev + Math.random() * 15, 100));
      playSound(200 + step * 100, 'triangle', 0.05);
      step++;
      if (step >= 10) {
        clearInterval(interval);
        setIsCalibrating(false);
        setCalibration(100);
        addTerminalMsg("Neural link calibrated. Sync 100%.");
      }
    }, 200);
  };

  return (
    <div 
      data-faction={faction}
      style={{ 
        minHeight: '100vh', padding: '40px', position: 'relative',
        filter: singularity >= 100 ? 'invert(1) hue-rotate(180deg)' : `hue-rotate(${stats.systemEntropy * 10}deg) contrast(${1 + stats.systemEntropy * 0.2})`,
        transform: `skewX(${Math.random() > 0.98 ? (Math.random() - 0.5) * 2 : 0}deg)`,
        transition: 'filter 0.3s ease-out'
      }}
    >
      <AnimatePresence>
        {showTimelineHUD && (
          <motion.div 
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 11000, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', pointerEvents: 'none'
            }}
          >
            <h1 className="font-future" style={{ fontSize: '5rem', letterSpacing: '20px', color: 'var(--accent-cyan)' }}>{activeTimeline}</h1>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBroadcasting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 10000, 
              background: 'white', pointerEvents: 'none' 
            }} 
          />
        )}
      </AnimatePresence>
      <ParticleSwarm entropy={stats.systemEntropy} />
      <NewsTicker headlines={news} />
      
      {/* Sidebar Toggle */}
      <button 
        onClick={() => setShowSidebar(true)}
        style={{ 
          position: 'fixed', top: '40px', left: '40px', zIndex: 100,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)'
        }}
      >
        <Settings size={24} />
      </button>

      {/* Seer Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, bottom: 0, width: '350px', 
              zIndex: 2000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(30px)',
              borderRight: '1px solid var(--glass-border)', padding: '40px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 className="font-future" style={{ fontSize: '0.8rem', letterSpacing: '4px' }}>SEER PROFILE</h2>
              <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 20px',
                border: '2px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={50} color="var(--accent-cyan)" />
              </div>
              <h3 className="font-future" style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>{userName || 'UNKNOWN SEER'}</h3>
              <p style={{ fontSize: '0.6rem', opacity: 0.5, letterSpacing: '2px', marginTop: '5px' }}>{seerData?.rank || 'INITIATE'}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <StatCard icon={Zap} label="POWER LEVEL" value={`${(divergence * 10).toFixed(0)} GW`} color="var(--accent-cyan)" />
              <StatCard icon={Shield} label="SECURITY CLEARANCE" value={seerData?.rank === 'Admin' ? 'Level 5' : 'Level 1'} color="var(--accent-purple)" />
              <StatCard icon={Database} label="MEMORY FRAGMENTS" value={pinnedInsights.length} color="#00ff41" />
            </div>

            <div style={{ marginTop: '30px' }}>
              <h4 className="font-future" style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '15px' }}>INVENTORY</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {seerData?.artifacts?.map((art, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (selectedArtifacts.includes(art._id)) {
                        setSelectedArtifacts(prev => prev.filter(id => id !== art._id));
                      } else {
                        setSelectedArtifacts(prev => [...prev, art._id]);
                      }
                    }}
                    style={{ 
                      width: '40px', height: '40px', 
                      background: selectedArtifacts.includes(art._id) ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', border: art.rarity === 'Mythic' ? '2px solid gold' : 'none'
                    }}
                  >
                     {art.icon === 'Sparkles' ? '✨' : art.icon === 'Key' ? '🔑' : art.icon === 'Shield' ? '🛡️' : '♾️'}
                  </div>
                ))}
              </div>
              {selectedArtifacts.length >= 2 && (
                <button className="btn-futr" style={{ width: '100%', marginTop: '10px', fontSize: '0.5rem' }} onClick={handleFuseArtifacts}>
                  FUSE SELECTED
                </button>
              )}
            </div>

            <div style={{ marginTop: '30px' }}>
              <h4 className="font-future" style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '15px' }}>NEURAL UPGRADES</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'Speed', label: 'Processing Speed', cost: 500 },
                  { id: 'Yield', label: 'Credit Yield', cost: 800 },
                  { id: 'Security', label: 'Firewall Strength', cost: 600 }
                ].map(u => {
                  const level = (seerData?.upgrades || {})[u.id] || 0;
                  const currentCost = u.cost * (level + 1);
                  return (
                    <button 
                      key={u.id}
                      onClick={() => handleUpgrade(u.id, currentCost)}
                      className="glass-card"
                      style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
                    >
                      <span style={{ fontSize: '0.6rem' }}>{u.label} (v.{level})</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)' }}>{currentCost} QC</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <h4 className="font-future" style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '15px' }}>SYSTEM SETTINGS</h4>
              <button 
                className="btn-futr" 
                style={{ width: '100%', fontSize: '0.6rem', background: 'rgba(0, 242, 255, 0.1)', color: 'var(--accent-cyan)', marginBottom: '10px' }} 
                onClick={() => setShowAdmin(true)}
              >
                SYSTEM CUSTOMIZATION
              </button>
              <button className="btn-futr" style={{ width: '100%', fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', color: 'white' }} onClick={() => setUserName('')}>
                PURGE IDENTITY
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFactionSelector && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 6000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FactionSelector onSelect={handleFactionSelect} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHacking && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <HackingMiniGame onComplete={() => {
              setShowHacking(false);
              addTerminalMsg("SECURITY RESTORED: Firewall recalibrated.");
              playSound(2000, 'sine', 0.5);
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAnomaly && <AnomalyAlert anomaly={activeAnomaly} onStabilize={stabilizeAnomaly} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAdmin && <AdminDashboard apiBase={API_BASE} onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {!isUplinked && <UplinkModal onComplete={() => {
           setIsUplinked(true);
           playSound(2000, 'sine', 0.5);
           speak("Biometric verification complete. Neural uplink established.", activeTimeline);
        }} />}
      </AnimatePresence>

      <div 
        style={{ 
          position: 'fixed', inset: 0, 
          boxShadow: `inset 0 0 ${50 + (bioState.pulse - 60) * 2}px rgba(0, 242, 255, ${0.05 + (bioState.pulse - 60) * 0.002})`,
          pointerEvents: 'none', zIndex: 1000,
          transition: 'box-shadow 0.1s ease-out'
        }} 
      />
      {/* Background Quantum Effect */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', opacity: 0.4 }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
            style={{ 
              position: 'absolute', 
              top: '50%', left: '50%', 
              width: '400px', height: '400px', 
              background: i % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)',
              filter: 'blur(100px)',
              borderRadius: '50%'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header style={{ marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <OracleAvatar sync={calibration} stress={bioState.stress} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/favicon.svg" alt="DOMOIQ Logo" style={{ width: '40px', height: '40px', filter: 'drop-shadow(0 0 10px var(--accent-cyan))' }} />
              <h1 className="font-future neon-text" style={{ fontSize: '2.5rem' }}>DOMOIQ</h1>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', letterSpacing: '4px', marginLeft: '52px' }}>NEURAL NEXUS &bull; V.2.0</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {['PRIME', 'VOID', 'NEON'].map(t => (
              <button 
                key={t}
                onClick={() => { setActiveTimeline(t); addTerminalMsg(`Timeline shift: ${t} sequence initiated.`); playSound(300, 'sawtooth', 0.5); }}
                style={{ 
                  fontSize: '0.6rem', padding: '6px 12px', borderRadius: '4px',
                  background: activeTimeline === t ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                  color: activeTimeline === t ? 'black' : 'white',
                  border: '1px solid var(--glass-border)', cursor: 'pointer', letterSpacing: '2px'
                }}
              >
                {t}
              </button>
            ))}
          </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DivergenceGauge value={divergence} />
          </div>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '150px' }}>
             <weather.icon size={18} color="var(--accent-cyan)" />
             <div>
               <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>TEMPORAL CLIMATE</div>
               <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{weather.type.toUpperCase()}</div>
             </div>
          </div>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '150px' }}>
             <Box size={18} color="var(--accent-cyan)" />
             <div>
               <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>QUANTUM CREDITS</div>
               <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{credits} QC</div>
             </div>
          </div>
          <button className="btn-futr" onClick={generateManifesto} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} /> MANIFEST
          </button>
          <button className="btn-futr" onClick={() => setShowSubmitModal(true)}>CONTRIBUTE</button>
        </div>
      </header>

      {/* Chrono Scrubber */}
      <section className="glass-card" style={{ marginBottom: '40px', padding: '20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 className="font-future" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', letterSpacing: '4px' }}>TEMPORAL EPOCH: {epoch}</h2>
          <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>SYNCHRONIZED WITH CHRONOS GRID</span>
        </div>
        <input 
          type="range" 
          min="2025" 
          max="2150" 
          value={epoch}
          onChange={(e) => setEpoch(parseInt(e.target.value))}
          style={{ 
            width: '100%', cursor: 'pointer',
            accentColor: 'var(--accent-cyan)',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            height: '6px'
          }}
        />
      </section>

      {/* Contribution Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 100, 
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card"
              style={{ width: '500px', padding: '40px' }}
            >
              <h2 className="font-future" style={{ marginBottom: '24px' }}>RECORD FUTURE INSIGHT</h2>
              <form onSubmit={handleInsightSubmit}>
                <textarea 
                  value={newInsightText}
                  onChange={(e) => setNewInsightText(e.target.value)}
                  placeholder="Describe a future event..."
                  style={{ 
                    width: '100%', background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid var(--glass-border)', borderRadius: '8px',
                    padding: '12px', color: 'white', minHeight: '100px', marginBottom: '20px'
                  }}
                />
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px', opacity: 0.7 }}>TIMELINE CATEGORY</label>
                  <select 
                    value={newInsightCategory}
                    onChange={(e) => setNewInsightCategory(e.target.value)}
                    style={{ 
                      width: '100%', background: 'rgba(0,0,0,0.5)', 
                      border: '1px solid var(--glass-border)', borderRadius: '8px',
                      padding: '10px', color: 'white'
                    }}
                  >
                    {['Technological', 'Biological', 'Digital', 'Interstellar', 'Ecological'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-futr" style={{ flex: 1 }}>COMMIT TO ARCHIVE</button>
                  <button type="button" className="btn-futr" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowSubmitModal(false)}>ABORT</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holographic Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <HolographicDetail 
            insight={selectedInsight} 
            onClose={() => setSelectedInsight(null)} 
            onStake={handleStake}
            onPin={handlePin}
            isPinned={!!pinnedInsights.find(p => p._id === selectedInsight._id)}
            stability={stats.coreStability}
          />
        )}
      </AnimatePresence>

      {/* Manifesto Modal */}
      <AnimatePresence>
        {showManifesto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 300, 
              background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(30px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card"
              style={{ width: '600px', padding: '60px', textAlign: 'center', border: '2px solid var(--accent-cyan)' }}
            >
              <h2 className="font-future" style={{ color: 'var(--accent-cyan)', fontSize: '2rem', marginBottom: '40px', letterSpacing: '10px' }}>FUTURE MANIFESTO</h2>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)', padding: '30px', 
                borderRadius: '12px', textAlign: 'left', fontFamily: 'monospace',
                fontSize: '1rem', lineHeight: '1.8', color: 'var(--accent-cyan)',
                borderLeft: '4px solid var(--accent-cyan)', marginBottom: '40px'
              }}>
                {manifestoContent.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
              <button className="btn-futr" onClick={() => setShowManifesto(false)}>CLOSE TRANSMISSION</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: activeTimeline === 'VOID' ? '1fr 300px' : '1fr 400px', 
        gap: activeTimeline === 'VOID' ? '100px' : '30px',
        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: activeTimeline === 'VOID' ? '60px' : '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
             <MissionBoard missions={missions} progress={seerData?.missionProgress || {}} />
             <QuantumChat broadcasts={broadcasts} onSend={sendBroadcast} channel={chatChannel} onChannelChange={setChatChannel} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
             <SimulationDeck onSimulate={() => playSound(2200, 'sine', 0.5)} />
             <HolographicMarket credits={credits} onBuy={handleBuyArtifact} />
          </div>
          
          {/* Oracle Input Area */}
          <section className="glass-card" style={{ padding: '40px' }}>
            {isCalibrating && <WaveLinkGame onComplete={finishCalibration} />}
            <h2 className="font-future" style={{ fontSize: '1.2rem', margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={20} color="var(--accent-cyan)" />
              CONSULT THE CHRONOS
            </h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '2px' }}>PROTOCOL:</span>
              {['Analytical', 'Visionary', 'Cryptic'].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setOracleMode(mode)}
                  style={{ 
                    fontSize: '0.6rem', padding: '4px 10px', borderRadius: '4px',
                    background: oracleMode === mode ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                    color: oracleMode === mode ? 'black' : 'white',
                    border: '1px solid var(--glass-border)', cursor: 'pointer'
                  }}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <form onSubmit={handleOracleSubmit} style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={oracleQuery}
                onChange={(e) => setOracleQuery(e.target.value)}
                placeholder="What do you wish to know about the future?"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '20px 60px 20px 24px',
                  color: 'white',
                  fontSize: '1.1rem',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--accent-cyan)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight color="black" />
              </button>
            </form>

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ marginTop: '30px', textAlign: 'center' }}
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ display: 'inline-block', marginBottom: '10px' }}
                  >
                    <Activity color="var(--accent-cyan)" size={40} />
                  </motion.div>
                  <p style={{ color: 'var(--accent-cyan)', letterSpacing: '4px', fontSize: '0.8rem' }}>CRYSTALLIZING TIMELINE...</p>
                </motion.div>
              ) : prediction ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card"
                  style={{ marginTop: '30px', borderLeft: '4px solid var(--accent-cyan)', background: 'rgba(0, 242, 255, 0.05)' }}
                >
                  <p style={{ fontSize: '1.2rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                    "{prediction}"
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          {/* Temporal Nexus Section */}
          <section className="glass-card" style={{ padding: '0', position: 'relative', overflow: 'hidden', height: '200px' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1 }}>
              <h2 className="font-future" style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '4px' }}>TEMPORAL NEXUS MAPPING</h2>
            </div>
            <TemporalNexus insights={insights} />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1, display: 'flex', gap: '10px' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                ACTIVE NODE
              </div>
            </div>
          </section>

          {/* Temporal Events Section */}
          <section className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="font-future" style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', letterSpacing: '4px' }}>TIMELINE EVENTS</h2>
              <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>LATEST CHRONO-LOGS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.length > 0 ? events.map((event, i) => (
                <motion.div 
                  key={event._id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ 
                    padding: '15px', background: 'rgba(255,255,255,0.03)', 
                    borderLeft: `4px solid ${event.type === 'Critical' ? '#ff0055' : event.type === 'Warning' ? '#ffaa00' : 'var(--accent-cyan)'}`,
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800 }}>{event.title.toUpperCase()}</h4>
                    <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: '1.4' }}>{event.description}</p>
                </motion.div>
              )) : (
                <p style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'center', padding: '20px' }}>NO EVENTS RECORDED FOR THIS TIMELINE.</p>
              )}
            </div>
          </section>

          {/* Timeline Section */}
          <section className="glass-card" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>
            <NeuralWeb3D insights={insights} activeIndex={activeInsight} />
            <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1, width: '250px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text"
                  placeholder="SEARCH CHRONOS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', background: 'rgba(0,0,0,0.5)', 
                    border: '1px solid var(--glass-border)', borderRadius: '20px',
                    padding: '8px 12px 8px 32px', color: 'var(--accent-cyan)', fontSize: '0.65rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {['All', 'Technological', 'Biological', 'Digital', 'Interstellar', 'Ecological'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ 
                      fontSize: '0.6rem', padding: '4px 12px', borderRadius: '4px',
                      background: selectedCategory === cat ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                      color: selectedCategory === cat ? 'black' : 'white',
                      border: '1px solid var(--glass-border)', cursor: 'pointer'
                    }}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ padding: '80px 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {insights.filter(ins => ins.text.toLowerCase().includes(searchQuery.toLowerCase())).map((insight, idx) => (
                <motion.div
                  key={insight._id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 5 }}
                  onClick={() => setSelectedInsight(insight)}
                  style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    background: idx === activeInsight ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: idx === activeInsight ? '1px solid var(--glass-border)' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '12px', height: '12px', 
                    borderRadius: '50%', 
                    background: idx === activeInsight ? 'var(--accent-cyan)' : 'var(--text-dim)',
                    boxShadow: idx === activeInsight ? 'var(--glow-cyan)' : 'none',
                    filter: insight.stakes > 500 ? 'brightness(2)' : 'none'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      opacity: idx === activeInsight ? 1 : 0.4,
                      color: idx === activeInsight ? 'var(--accent-cyan)' : 'white'
                    }}>
                      {insight.text}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <div style={{ fontSize: '0.6rem', opacity: 0.3, letterSpacing: '2px' }}>
                        CATEGORY: {insight.category?.toUpperCase()}
                        {insight.stakes > 0 && <span style={{ marginLeft: '10px', color: 'var(--accent-cyan)' }}>STAKE: {insight.stakes} QC</span>}
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleUpvote(insight._id); }}
                        style={{ 
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                          borderRadius: '4px', padding: '4px 12px', color: 'var(--accent-cyan)',
                          fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <Zap size={10} />
                        ENDORSE ({insight.upvotes || 0})
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {insights.length === 0 && <p style={{ opacity: 0.5, textAlign: 'center' }}>No data in this timeline segment.</p>}
            </div>

          </section>

          {/* Stats Grid / Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
             <StatCard icon={Globe} label="NEURAL REACH" value={`${stats.totalInsights * 140}M NODES`} color="#00f2ff" />
             <StatCard icon={Database} label="TOTAL ARCHIVES" value={`${stats.totalInsights} INSIGHTS`} color="#bc13fe" />
             <StatCard icon={ShieldCheck} label="ENTROPY" value={`${(stats.systemEntropy * 100).toFixed(2)}%`} color="#10b981" />
          </div>

          <section className="glass-card" style={{ padding: '30px' }}>
             <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.5 }}>CHRONO-DENSITY HEATMAP</h3>
             <div style={{ display: 'flex', gap: '4px', height: '100px', alignItems: 'flex-end' }}>
                {[2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100, 2110, 2120, 2130, 2140, 2150].map(d => (
                  <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: heatmap[d] ? 0.3 + (heatmap[d] * 0.2) : 0.1 }}
                      style={{ 
                        width: '100%', height: '100%', 
                        background: 'var(--accent-cyan)', 
                        borderRadius: '2px',
                        boxShadow: heatmap[d] > 2 ? 'var(--glow-cyan)' : 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.5rem', opacity: 0.3 }}>{d}</span>
                  </div>
                ))}
             </div>
          </section>

          <section className="glass-card" style={{ padding: '30px' }}>
             <h3 className="font-future" style={{ fontSize: '0.8rem', marginBottom: '20px', opacity: 0.5 }}>TIMELINE DISTRIBUTION</h3>
             <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', height: '150px' }}>
                {stats.distribution.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / stats.totalInsights) * 100}%` }}
                      style={{ 
                        width: '100%', background: 'linear-gradient(to top, var(--accent-purple), var(--accent-cyan))',
                        borderRadius: '4px 4px 0 0', minHeight: '4px'
                      }}
                    />
                    <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{d._id?.substring(0, 3).toUpperCase()}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>
        <GlobalSingularityMeter progress={singularity} />


        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
           <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                 <Bookmark size={18} color="var(--accent-cyan)" />
                 <h3 className="font-future" style={{ fontSize: '0.8rem' }}>NEURAL ARCHIVE</h3>
              </div>
              {pinnedInsights.length === 0 ? (
                <p style={{ fontSize: '0.7rem', opacity: 0.3, textAlign: 'center' }}>No insights pinned to your neural cortex.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pinnedInsights.map(p => (
                    <div key={p._id} onClick={() => setSelectedInsight(p)} style={{ fontSize: '0.75rem', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', borderLeft: '2px solid var(--accent-cyan)' }}>
                      {p.text.substring(0, 40)}...
                    </div>
                  ))}
                </div>
              )}
           </div>
           <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                 <Globe size={18} color="var(--accent-purple)" />
                 <h3 className="font-future" style={{ fontSize: '0.8rem' }}>CO-SEER NETWORK</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {seerActivity.map((act, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1 - (i * 0.2), x: 0 }}
                    style={{ fontSize: '0.7rem', display: 'flex', gap: '10px', alignItems: 'center' }}
                  >
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-purple)' }} />
                    <span style={{ opacity: 0.6 }}>{act}</span>
                  </motion.div>
                ))}
              </div>
           </div>

           <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                 <Activity size={18} color="var(--accent-cyan)" />
                 <h3 className="font-future" style={{ fontSize: '0.8rem' }}>NEURAL BIO-SIGNATURE</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{bioState.pulse} BPM</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>COHERENCE STABLE</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: bioState.stress > 0.6 ? '#ff4d4d' : 'var(--accent-cyan)' }}>
                    STRESS: {(bioState.stress * 100).toFixed(0)}%
                  </div>
                  <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px' }}>
                    <motion.div 
                      animate={{ width: `${bioState.stress * 100}%` }}
                      style={{ height: '100%', background: bioState.stress > 0.6 ? '#ff4d4d' : 'var(--accent-cyan)' }}
                    />
                  </div>
                </div>
              </div>
           </div>

           <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Terminal size={18} color="var(--accent-cyan)" />
                    <h3 className="font-future" style={{ fontSize: '0.8rem' }}>ORACLE TERMINAL</h3>
                  </div>
                  {Math.random() > 0.9 && <AlertTriangle size={14} color="var(--accent-purple)" className="glitch-anim" />}
               </div>
               <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '15px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#10b981', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', overflowY: 'auto', marginBottom: '10px' }}>
                  {terminalOutput.map((line, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        marginBottom: '4px', 
                        opacity: 0.7 + (i / terminalOutput.length) * 0.3,
                        color: line.includes('ALERT') || line.includes('WARNING') || line.includes('ERROR') ? '#ff4d4d' : '#10b981'
                      }}
                    >
                      {line}
                    </div>
                  ))}
                  <motion.span animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>_</motion.span>
               </div>
               <input 
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalCmd}
                  placeholder="Enter command..."
                  style={{ 
                    width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
                    borderRadius: '4px', padding: '8px', color: '#10b981', fontSize: '0.7rem',
                    fontFamily: 'monospace'
                  }}
               />
           </div>

           <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                 <ShieldCheck size={18} color="var(--accent-cyan)" />
                 <h3 className="font-future" style={{ fontSize: '0.8rem' }}>DIVERGENCE INDEX</h3>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{divergence.toFixed(2)}&psi;</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, letterSpacing: '2px' }}>BUTTERFLY EFFECT STABILITY</div>
                <QuantumCore entropy={stats.systemEntropy} pulse={bioState.pulse} />
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '15px', overflow: 'hidden' }}>
                  <motion.div 
                    animate={{ width: `${Math.min(100, divergence)}%` }}
                    style={{ height: '100%', background: 'var(--accent-cyan)' }}
                  />
                </div>
              </div>
           </div>

           <NeuralMemoryBank pinned={pinnedInsights} onUnpin={handlePin} />

           <DominanceLeaderboard data={dominance} />
           
           <WaveformGallery timeline={activeTimeline} />

           <ChronoMap data={hotspots} />

           <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                 <Radio size={18} color="var(--accent-purple)" />
                 <h3 className="font-future" style={{ fontSize: '0.8rem' }}>AETHER FLUCTUATIONS</h3>
              </div>
              <div style={{ display: 'flex', gap: '4px', height: '80px', alignItems: 'flex-end', padding: '0 10px' }}>
                 {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                      style={{ flex: 1, background: 'linear-gradient(to top, var(--accent-purple), var(--accent-cyan))', opacity: 0.6, borderRadius: '2px' }}
                    />
                 ))}
              </div>
           </div>

           <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(188, 19, 254, 0.1), rgba(0, 242, 255, 0.1))' }}>
              <h3 className="font-future" style={{ fontSize: '0.7rem', marginBottom: '12px', opacity: 0.7 }}>QUANTUM STABILITY</h3>
              <div style={{ position: 'relative', height: '60px', width: '60px', margin: '0 auto' }}>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  style={{ position: 'absolute', inset: 0, border: '2px dashed var(--accent-cyan)', borderRadius: '50%' }}
                />
                <div style={{ position: 'absolute', inset: '10px', border: '2px solid var(--accent-purple)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={16} color="white" />
                </div>
              </div>
           </div>
        </aside>
      </main>

      {/* Footer Nav */}
      <footer style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', gap: '60px', borderTop: '1px solid var(--glass-border)', padding: '40px 0', marginBottom: '40px' }}>
         {['CHRONOS', 'NEXUS', 'VOID', 'ARCHIVE'].map(item => (
            <motion.div
              key={item}
              whileHover={{ color: 'var(--accent-cyan)', scale: 1.1, opacity: 1 }}
              style={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '4px', opacity: 0.4 }}
              className="font-future"
            >
               {item}
            </motion.div>
         ))}
      </footer>

      <TemporalNewsTicker />
    </div>
  );
}

export default App;

