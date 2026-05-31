import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const CrystallineCore = ({ isActive, timeLeft, onToggle }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]));
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]));

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        className="glass-card" 
        style={{ 
            flex: 1.5, 
            minWidth: '400px', 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden',
            border: isActive ? '1px solid var(--s-primary)' : '1px solid var(--border-glass)',
            perspective: '1000px'
        }}
    >
        {/* Iridescent Background Glow */}
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            background: 'var(--s-primary)',
            filter: 'blur(150px)',
            opacity: isActive ? 0.15 : 0.05,
            zIndex: 0
        }} />

        <motion.div 
            style={{ 
                rotateX, 
                rotateY, 
                position: 'relative', 
                zIndex: 1,
                cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            onClick={onToggle}
        >
            <div style={{ 
                width: '180px', 
                height: '180px', 
                borderRadius: '50%', 
                background: isActive 
                    ? 'radial-gradient(circle, var(--s-primary) 0%, rgba(255,255,255,0.01) 70%)'
                    : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 70%)',
                border: isActive ? '2px solid var(--s-primary)' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: isActive ? '0 0 50px rgba(255, 0, 204, 0.3)' : 'none',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <h4 style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '5px', letterSpacing: '2px' }}>CORE_PHASE</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'white' }}>{formatTime(timeLeft)}</div>
                <div style={{ fontSize: '0.5rem', opacity: 0.5, marginTop: '5px', letterSpacing: '1px' }}>{isActive ? 'ACTIVE' : 'IDLE'}</div>
            </div>
            
            {/* Crystalline Rings */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: '200px',
                    height: '200px',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}
            />
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '-20px',
                    width: '220px',
                    height: '220px',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}
            />
        </motion.div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1, marginTop: '20px' }}>
            <button 
                className="btn-prism" 
                onClick={onToggle}
                style={{ 
                    padding: '12px 30px', 
                    borderRadius: '30px', 
                    fontSize: '0.7rem',
                    background: isActive ? 'rgba(255, 0, 204, 0.1)' : 'rgba(255,255,255,0.05)',
                    borderColor: isActive ? 'var(--s-primary)' : 'var(--border-glass)'
                }}
            >
                {isActive ? 'PAUSE_CORE' : (timeLeft === 0 ? 'RESET_ST' : 'IGNITE_CORE')}
            </button>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px', opacity: 0.5 }}>CORE_TEMP: NORMAL [32.4°C]</p>
        </div>
    </div>
  );
};

export default CrystallineCore;
