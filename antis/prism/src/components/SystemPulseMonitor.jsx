import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Cpu, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemPulseMonitor = () => {
    const [points, setPoints] = useState([]);
    const [load, setLoad] = useState({ cpu: 42, ram: 61 });

    useEffect(() => {
        const interval = setInterval(() => {
            setLoad(prev => ({
                cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
                ram: Math.max(10, Math.min(95, prev.ram + (Math.random() * 4 - 2)))
            }));
            
            setPoints(prev => {
                const newPoints = [...prev, Math.random() * 40 + 30];
                if (newPoints.length > 50) return newPoints.slice(1);
                return newPoints;
            });
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const pathData = useMemo(() => {
        if (points.length < 2) return "";
        return points.map((p, i) => `${i * 6},${p}`).join(" L ");
    }, [points]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ 
                flex: 1, 
                minWidth: '320px', 
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        padding: '8px', 
                        borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Cpu size={20} color="var(--s-glow)" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>SYSTEM_PULSE</h3>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--s-glow)', letterSpacing: '2px', fontWeight: 600 }}>LIVE_TELEMETRY</div>
            </div>

            <div style={{ height: '100px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <path 
                        d={`M 0,50 L ${pathData}`}
                        fill="none"
                        stroke="var(--s-glow)"
                        strokeWidth="2"
                        style={{ filter: 'drop-shadow(0 0 5px var(--s-glow))' }}
                    />
                    {/* Dynamic scanning line */}
                    <motion.line 
                        x1="0" y1="0" x2="0" y2="100"
                        animate={{ x: [0, 300] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        stroke="rgba(0, 255, 255, 0.2)"
                        strokeWidth="1"
                    />
                </svg>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>CPU_LOAD</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--s-primary)', fontWeight: 800 }}>{load.cpu.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div 
                            animate={{ width: `${load.cpu}%` }}
                            style={{ height: '100%', background: 'var(--s-primary)' }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>RAM_SYNC</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--s-glow)', fontWeight: 800 }}>{load.ram.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div 
                            animate={{ width: `${load.ram}%` }}
                            style={{ height: '100%', background: 'var(--s-glow)' }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SystemPulseMonitor;
