import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flower, Leaf, Sprout, Wind, Sun, CloudRain, 
  Sparkles, Music, Zap, Brain, Heart, Disc
} from 'lucide-react';

const PLANT_TYPES = {
  harmony: { icon: Flower, color: '#3b82f6', name: 'Bluebell', description: 'Grows with melodic balance' },
  rhythm: { icon: Leaf, color: '#ef4444', name: 'Pulse Vine', description: 'Thrives on consistent beats' },
  timbre: { icon: Sprout, color: '#f59e0b', name: 'Amber Moss', description: 'Evolves through sound design' },
  expression: { icon: Heart, color: '#ec4899', name: 'Lush Rose', description: 'Blooms with emotional depth' },
  innovation: { icon: Sparkles, color: '#8b5cf6', name: 'Void Orchid', description: 'Expands with new ideas' },
  theory: { icon: Brain, color: '#10b981', name: 'Sage Fern', description: 'Strengthens with logic' }
};

const VirtuoGarden = () => {
  const [virtues, setVirtues] = useState({});
  const [garden, setGarden] = useState([]);

  useEffect(() => {
    const savedVirtues = JSON.parse(localStorage.getItem('virtuo_virtues')) || {};
    setVirtues(savedVirtues);

    const savedGarden = JSON.parse(localStorage.getItem('virtuo_garden')) || [];
    if (savedGarden.length === 0) {
      // Initialize a default garden if empty
      const initialGarden = Object.keys(PLANT_TYPES).map((v, i) => ({
        id: `plant-${v}`,
        virtue: v,
        position: { x: 15 + (i * 14), y: 40 + (Math.random() * 20) },
        growth: 0
      }));
      setGarden(initialGarden);
      localStorage.setItem('virtuo_garden', JSON.stringify(initialGarden));
    } else {
      setGarden(savedGarden);
    }
  }, []);

  const getLevel = (virtue) => {
    const data = virtues[virtue];
    if (!data) return 0;
    return Math.floor(Math.sqrt(data.xp / 100));
  };

  return (
    <div className="virtuo-garden" style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      background: 'linear-gradient(to bottom, #0d1117, #161b22)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{ padding: '30px', textAlign: 'center', zIndex: 10 }}>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>The Sonic Garden</h2>
        <p style={{ color: 'var(--text-muted)' }}>Watch your musical virtues bloom as you practice.</p>
      </header>

      <div style={{ flex: 1, position: 'relative', margin: '0 40px 40px 40px', background: 'rgba(0,0,0,0.3)', borderRadius: '30px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        {/* Environment Decorations */}
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '10%', right: '10%', opacity: 0.1 }}
        >
          <Sun size={120} color="#f59e0b" />
        </motion.div>
        
        <motion.div 
          animate={{ x: [20, -20, 20] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '20%', left: '15%', opacity: 0.2 }}
        >
          <CloudRain size={80} color="#3b82f6" />
        </motion.div>

        {/* The Plants */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }}>
          {garden.map((plant) => {
            const level = getLevel(plant.virtue);
            const config = PLANT_TYPES[plant.virtue];
            const Icon = config.icon;
            const size = 30 + (level * 5);
            const opacity = 0.3 + (level * 0.07);

            return (
              <motion.div
                key={plant.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: `${plant.position.x}%`, 
                  y: `${plant.position.y}%`
                }}
                whileHover={{ scale: 1.1, y: `${plant.position.y - 2}%` }}
                style={{ 
                  position: 'absolute', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <motion.div
                    animate={{ 
                      rotate: [-2, 2, -2],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ color: config.color, filter: `drop-shadow(0 0 ${level}px ${config.color}80)` }}
                  >
                    <Icon size={size} />
                  </motion.div>
                  
                  {level >= 10 && (
                    <motion.div
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ position: 'absolute', top: -10, right: -10, color: '#fff' }}
                    >
                      <Sparkles size={16} />
                    </motion.div>
                  )}
                </div>

                <div style={{ 
                  marginTop: '10px', 
                  background: 'rgba(0,0,0,0.6)', 
                  padding: '4px 10px', 
                  borderRadius: '10px', 
                  border: `1px solid ${config.color}40`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: config.color }}>{config.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'white', opacity: 0.6 }}>Level {level}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ground */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          height: '10%', 
          background: 'linear-gradient(to top, rgba(16, 185, 129, 0.1), transparent)',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)'
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '0 40px 40px 40px' }}>
        {Object.entries(PLANT_TYPES).map(([virtue, config]) => {
          const level = getLevel(virtue);
          return (
            <div key={virtue} className="glass-panel" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ color: config.color, background: `${config.color}20`, padding: '10px', borderRadius: '12px' }}>
                <config.icon size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{config.name}</h4>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{config.description}</p>
                <div style={{ fontSize: '0.7rem', color: config.color, fontWeight: 700, marginTop: '4px' }}>Level {level}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtuoGarden;
