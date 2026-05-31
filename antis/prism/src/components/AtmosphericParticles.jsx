import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const AtmosphericParticles = ({ condition = 'CLEAR' }) => {
  const particleCount = condition === 'ELECTRIC' ? 40 : 25;
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * (condition === 'ELECTRIC' ? 3 : 2) + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5
    }));
  }, [condition, particleCount]);

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', 
      overflow: 'hidden', 
      zIndex: 5 
    }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: ['0vh', '110vh'],
            x: condition === 'ELECTRIC' ? [ `${p.x}vw`, `${p.x + (Math.random() * 5 - 2.5)}vw` ] : `${p.x}vw`,
            opacity: [0, 0.4, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: condition === 'ELECTRIC' ? 'var(--s-glow)' : 'white',
            filter: 'blur(1px)',
            boxShadow: condition === 'ELECTRIC' ? `0 0 10px var(--s-glow)` : 'none'
          }}
        />
      ))}
    </div>
  );
};

export default AtmosphericParticles;
