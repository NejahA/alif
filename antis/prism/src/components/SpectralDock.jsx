import { Mail, Globe, Code, MessageCircle, MoreHorizontal, Terminal, Shield, Cpu, Aperture, Settings, Music, TrendingUp, CloudRain, Calendar, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const DockIcon = ({ icon: Icon, color, label, onClick }) => (
  <motion.div 
    whileHover={{ y: -12, scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer'
    }}
  >
    <div 
      className="glass-card"
      style={{
        width: '68px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `rgba(255, 255, 255, 0.04)`,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        color: color,
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.2)`
      }}
    >
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.5px' }}>{label}</span>
  </motion.div>
);

const SpectralDock = ({ activeWidgets = {}, onToggleWidget }) => {
  return (
    <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ marginTop: 'auto', padding: '20px 0', width: '100%', display: 'flex', justifyContent: 'center' }}
    >
        <div 
            className="glass-card"
            style={{ 
                padding: '20px 40px', 
                display: 'inline-flex', 
                gap: '24px', 
                borderRadius: '80px', 
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                maxWidth: '95vw',
                overflowX: 'auto'
            }}
        >
            <DockIcon icon={Terminal} color="#f472b6" label="CLI" />
            <DockIcon icon={Music} color="#00ffff" label="AUDIO" onClick={() => onToggleWidget('audio')} />
            <DockIcon icon={TrendingUp} color="#10b981" label="MARKET" onClick={() => onToggleWidget('market')} />
            <DockIcon icon={CloudRain} color="#38bdf8" label="SKY" onClick={() => onToggleWidget('weather')} />
            <DockIcon icon={Calendar} color="#fcd34d" label="PLAN" onClick={() => onToggleWidget('calendar')} />
            <DockIcon icon={CheckCircle} color="#4ade80" label="GOAL" onClick={() => onToggleWidget('habits')} />
            <DockIcon icon={Zap} color="#fbbf24" label="CORE" onClick={() => onToggleWidget('xray')} />
            <DockIcon icon={Cpu} color="#a855f7" label="LOGIC" onClick={() => onToggleWidget('calc')} />
            <DockIcon icon={MessageCircle} color="#fbbf24" label="SIGNAL" onClick={() => onToggleWidget('signal')} />
            <DockIcon icon={Settings} color="#94a3b8" label="CFG" />
        </div>
    </motion.div>
  );
};

export default SpectralDock;
