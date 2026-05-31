import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, Disc, Zap, Heart, Sparkles, Brain, 
  Bird, Ghost, Squirrel, Cat, Rabbit, HelpCircle
} from 'lucide-react';

const FAMILIAR_TYPES = {
  harmony: { icon: Bird, color: '#3b82f6', name: 'Lyra', behavior: 'flying' },
  rhythm: { icon: Rabbit, color: '#ef4444', name: 'Tempo', behavior: 'bouncing' },
  timbre: { icon: Ghost, color: '#f59e0b', name: 'Echo', behavior: 'floating' },
  expression: { icon: Cat, color: '#ec4899', name: 'Muse', behavior: 'purring' },
  innovation: { icon: Squirrel, color: '#8b5cf6', name: 'Spark', behavior: 'spinning' },
  theory: { icon: Brain, color: '#10b981', name: 'Sage', behavior: 'pulsing' }
};

const VirtueFamiliar = ({ dominantVirtue, level }) => {
  const config = FAMILIAR_TYPES[dominantVirtue] || { icon: HelpCircle, color: '#8a2be2', name: '???', behavior: 'floating' };
  const Icon = config.icon;

  const animation = useMemo(() => {
    switch (config.behavior) {
      case 'flying':
        return { y: [0, -10, 0], x: [0, 5, 0], rotate: [0, 5, -5, 0] };
      case 'bouncing':
        return { y: [0, -15, 0], scaleY: [1, 0.8, 1.2, 1] };
      case 'floating':
        return { y: [0, -8, 0], opacity: [0.7, 1, 0.7] };
      case 'purring':
        return { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] };
      case 'spinning':
        return { rotate: [0, 360], scale: [1, 1.1, 1] };
      case 'pulsing':
        return { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] };
      default:
        return { y: [0, -5, 0] };
    }
  }, [config.behavior]);

  // Evolution stage based on level
  const size = 16 + Math.min(level, 10) * 2;
  const stage = level >= 20 ? 'Ascended' : (level >= 10 ? 'Elder' : (level >= 5 ? 'Grown' : 'Hatchling'));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px 12px', borderRadius: '20px', border: `1px solid ${config.color}30` }}>
      <motion.div
        animate={animation}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ color: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon size={size} />
      </motion.div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: config.color, letterSpacing: '1px' }}>{config.name.toUpperCase()}</span>
        <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stage} Familiar</span>
      </div>
    </div>
  );
};

export default VirtueFamiliar;
