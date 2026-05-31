import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Cpu, Gauge, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CoreVisual = ({ id, load, color }) => (
    <div style={{ position: 'relative', width: '100%', height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 800 }}>CORE_{id}</div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.55rem', color: color, fontWeight: 800 }}>{load.toFixed(1)}%</div>
        <motion.div 
            initial={false}
            animate={{ width: `${load}%` }}
            style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: color, borderRadius: '2px' }}
        />
        {/* Animated grid background */}
        <div style={{ width: '100%', height: '100%', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '10px 10px', pointerEvents: 'none' }} />
    </div>
);

const HardwareXRay = () => {
    const [cores, setCores] = useState([42, 58, 21, 88, 34, 12, 65, 49]);
    const [temp, setTemp] = useState(52);
    const [mode, setMode] = useState('X-RAY');

    useEffect(() => {
        const interval = setInterval(() => {
            setCores(prev => prev.map(c => Math.max(5, Math.min(100, c + (Math.random() * 20 - 10)))));
            setTemp(prev => Math.max(30, Math.min(85, prev + (Math.random() * 4 - 2))));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const avgLoad = cores.reduce((a, b) => a + b, 0) / cores.length;

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={14} color="var(--s-glow)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>HARDWARE_DIAGNOSTICS</span>
                </div>
                <div 
                    onClick={() => setMode(prev => prev === 'X-RAY' ? 'THERMAL' : 'X-RAY')}
                    className="btn-prism"
                    style={{ fontSize: '0.55rem', padding: '4px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}
                >
                    {mode}_VIEW
                </div>
            </div>

            {/* Core Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {cores.map((load, i) => (
                    <CoreVisual key={i} id={i} load={load} color={load > 85 ? 'var(--s-primary)' : load > 60 ? 'var(--s-accent)' : 'var(--s-glow)'} />
                ))}
            </div>

            {/* Thermal/Load Gauge */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>SYSTEM_TEMP</span>
                        <span style={{ fontSize: '0.65rem', color: temp > 75 ? 'var(--s-primary)' : 'var(--s-glow)', fontWeight: 800 }}>{temp.toFixed(1)}°C</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div 
                            initial={false}
                            animate={{ width: `${(temp / 100) * 100}%` }}
                            style={{ height: '100%', background: `linear-gradient(90deg, var(--s-glow), ${temp > 75 ? 'var(--s-primary)' : 'var(--s-accent)'})` }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>AVG_LOAD</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--s-accent)', fontWeight: 800 }}>{avgLoad.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div 
                            initial={false}
                            animate={{ width: `${avgLoad}%` }}
                            style={{ height: '100%', background: 'var(--s-accent)' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     {temp > 80 && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <AlertTriangle size={14} color="var(--s-primary)" />
                            <span style={{ fontSize: '0.6rem', color: 'var(--s-primary)', fontWeight: 800 }}>CRITICAL_HEAT_DETECTED</span>
                         </div>
                     )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--s-glow)', boxShadow: '0 0 10px var(--s-glow)' }} />
                     <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white', letterSpacing: '1px' }}>X-RAY_LINK_STABLE</span>
                </div>
            </div>
        </div>
    );
};

export default HardwareXRay;
