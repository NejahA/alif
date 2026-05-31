import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const QuantumMarket = () => {
    const [prices, setPrices] = useState([45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85]);
    const [activeAsset, setActiveAsset] = useState('VOID');

    const assets = [
        { id: 'VOID', symbol: '$VOID', price: '1,240.42', change: '+12.4%', color: 'var(--s-primary)' },
        { id: 'PRISM', symbol: '$PRISM', price: '0.842', change: '-2.1%', color: 'var(--s-glow)' },
        { id: 'NEURAL', symbol: '$NEURAL', price: '42.069', change: '+5.7%', color: 'var(--s-secondary)' }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setPrices(prev => {
                const next = prev.slice(1);
                const last = prev[prev.length - 1];
                const change = (Math.random() - 0.45) * 10;
                return [...next, Math.max(10, Math.min(90, last + change))];
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const maxValue = Math.max(...prices);
    const minValue = Math.min(...prices);
    const range = maxValue - minValue;

    const points = prices.map((p, i) => `${(i / (prices.length - 1)) * 100},${90 - ((p - minValue) / range) * 80}`).join(' ');

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {assets.map(asset => (
                        <button
                            key={asset.id}
                            onClick={() => setActiveAsset(asset.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                background: activeAsset === asset.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: `1px solid ${activeAsset === asset.id ? asset.color : 'transparent'}`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>{asset.symbol}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: activeAsset === asset.id ? 'white' : 'var(--text-dim)' }}>
                                {asset.price}
                            </div>
                        </button>
                    ))}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontSize: '0.7rem', fontWeight: 700 }}>
                        <TrendingUp size={12} />
                        VOLATILITY: HIGH
                    </div>
                </div>
            </div>

            {/* Price Chart */}
            <div style={{ height: '120px', width: '100%', position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={assets.find(a => a.id === activeAsset).color} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={assets.find(a => a.id === activeAsset).color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    <motion.path
                        d={`M 0 100 L ${points} L 100 100 Z`}
                        fill="url(#gradient)"
                        initial={false}
                    />
                    
                    <motion.polyline
                        points={points}
                        fill="none"
                        stroke={assets.find(a => a.id === activeAsset).color}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        initial={false}
                        animate={{ 
                            filter: [`drop-shadow(0 0 2px ${assets.find(a => a.id === activeAsset).color})`, `drop-shadow(0 0 5px ${assets.find(a => a.id === activeAsset).color})`, `drop-shadow(0 0 2px ${assets.find(a => a.id === activeAsset).color})`]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Horizontal Scanlines */}
                    {[20, 40, 60, 80].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    ))}
                </svg>

                {/* Data Points */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={10} color={assets.find(a => a.id === activeAsset).color} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>FLUX_CAPACITANCE: 98.4%</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        <span style={{ fontWeight: 700, color: 'white' }}>MAX: </span>
                        {maxValue.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        <span style={{ fontWeight: 700, color: 'white' }}>MIN: </span>
                        {minValue.toFixed(2)}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: assets.find(a => a.id === activeAsset).color, boxShadow: `0 0 8px ${assets.find(a => a.id === activeAsset).color}` }} />
                     <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'white', letterSpacing: '1px' }}>LIVE_NODE_04</span>
                </div>
            </div>
        </div>
    );
};

export default QuantumMarket;
