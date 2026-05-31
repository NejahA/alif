import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Star, Zap, Heart, Sparkles, Brain, ArrowUp } from 'lucide-react';

const VIRTUE_CONFIG = {
  harmony: { color: '#3b82f6', icon: <Star size={14} /> },
  rhythm: { color: '#ef4444', icon: <Zap size={14} /> },
  timbre: { color: '#f59e0b', icon: <Zap size={14} /> },
  expression: { color: '#ec4899', icon: <Heart size={14} /> },
  innovation: { color: '#8b5cf6', icon: <Sparkles size={14} /> },
  theory: { color: '#10b981', icon: <Brain size={14} /> }
};

const VirtueNotification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleGainXP = (e) => {
      const { virtue, amount } = e.detail;
      const config = VIRTUE_CONFIG[virtue] || { color: '#8a2be2', icon: <Star size={14} /> };
      
      const id = Date.now() + Math.random();
      const newNotification = {
        id,
        virtue,
        amount,
        color: config.color,
        icon: config.icon
      };

      setNotifications(prev => [...prev, newNotification]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
    };

    window.addEventListener('virtuo-gain-xp', handleGainXP);
    return () => window.removeEventListener('virtuo-gain-xp', handleGainXP);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '120px',
      right: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 10000,
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            style={{
              background: 'rgba(0,0,0,0.8)',
              border: `1px solid ${n.color}40`,
              padding: '10px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: `0 0 20px ${n.color}20`,
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '6px', 
              background: `${n.color}20`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: n.color
            }}>
              {n.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>{n.virtue}</span>
              <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                +{n.amount} XP <ArrowUp size={12} color={n.color} />
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default VirtueNotification;
