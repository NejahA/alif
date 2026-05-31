import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { User, Shield, Zap, Star } from 'lucide-react';

const HolographicProfile = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: '1000px' }}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative',
                    overflow: 'visible'
                }}
                className="glass-card"
            >
                {/* 3D Floating Elements */}
                <div style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--s-primary), var(--s-accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'translateZ(40px)',
                    boxShadow: '0 0 30px rgba(255, 0, 204, 0.3)'
                }}>
                    <User size={50} color="white" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute',
                            width: '120px',
                            height: '120px',
                            border: '1px dashed var(--s-glow)',
                            borderRadius: '50%',
                            opacity: 0.3
                        }}
                    />
                </div>

                <div style={{ transform: 'translateZ(20px)', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'white' }}>PRISM_USER</h2>
                    <p style={{ fontSize: '0.65rem', color: 'var(--s-glow)', letterSpacing: '2px', fontWeight: 600 }}>RANK: SPECTRAL_ARCHITECT</p>
                </div>

                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    transform: 'translateZ(10px)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '12px 20px',
                    borderRadius: '40px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                        <Shield size={14} color="var(--s-primary)" />
                        <span>LVL 42</span>
                    </div>
                    <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                        <Star size={14} color="var(--s-glow)" />
                        <span>PREMIUM</span>
                    </div>
                </div>

                {/* Background 3D Refractions */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) translateZ(-20px)',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, var(--s-primary) 0%, transparent 70%)',
                    opacity: 0.05,
                    pointerEvents: 'none'
                }} />
            </motion.div>
        </motion.div>
    );
};

export default HolographicProfile;
