import React, { useState, useEffect } from 'react';
import { Activity, Zap, Cpu, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

const PulseNode = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="glass-card"
    style={{
      padding: '24px',
      flex: 1,
      minWidth: '200px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ padding: '10px', background: `${color}15`, borderRadius: '12px' }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '40px' }}>
        LIVE_PULSE
      </div>
    </div>
    
    <div>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{value}</h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
    </div>

    {/* Refractive Light Pulse */}
    <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', marginTop: '8px' }}>
      <motion.div 
        animate={{ width: value }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ 
          height: '100%', 
          background: `linear-gradient(90deg, ${color}, transparent)`, 
          borderRadius: '10px',
          boxShadow: `0 0 10px ${color}55`
        }} 
      />
    </div>
  </motion.div>
);

const PrismPulse = () => {
  const [cpu, setCpu] = useState("45%");
  const [ram, setRam] = useState("62%");

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(`${Math.floor(Math.random() * 20) + 35}%`);
      setRam(`${Math.floor(Math.random() * 5) + 58}%`);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '20px', width: '100%', overflowX: 'auto', padding: '10px 0' }} className="custom-scrollbar">
      <PulseNode icon={Cpu} label="CPU USAGE" value={cpu} color="var(--s-primary)" delay={0.1} />
      <PulseNode icon={HardDrive} label="RAM USAGE" value={ram} color="var(--s-secondary)" delay={0.2} />
      <PulseNode icon={Zap} label="NETWORK TRAFFIC" value="2.4 MB/S" color="var(--s-glow)" delay={0.3} />
    </div>
  );
};

export default PrismPulse;
