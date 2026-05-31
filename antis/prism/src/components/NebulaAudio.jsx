import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, Music, Wind, Zap, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NebulaAudio = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePreset, setActivePreset] = useState('NEURAL_HUM');
    const [volume, setVolume] = useState(65);

    const presets = [
        { id: 'NEURAL_HUM', icon: Zap, label: 'NEURAL_HUM', color: 'var(--s-primary)' },
        { id: 'CYBER_RAIN', icon: Wind, label: 'CYBER_RAIN', color: 'var(--s-glow)' },
        { id: 'VOID_AMB', icon: Waves, label: 'VOID_AMB', color: 'var(--s-secondary)' }
    ];

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div 
                        className="glass-card"
                        style={{ 
                            width: '50px', 
                            height: '50px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px'
                        }}
                    >
                        <Music size={24} color={presets.find(p => p.id === activePreset).color} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px' }}>{activePreset}</h4>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>ATMOSPHERIC_LINK_ACTIVE</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={togglePlay}
                        style={{
                            background: 'var(--s-primary)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 0 15px rgba(255, 0, 204, 0.4)'
                        }}
                    >
                        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" style={{ marginLeft: '3px' }} />}
                    </button>
                </div>
            </div>

            {/* Visualizer */}
            <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '0 10px' }}>
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            height: isPlaying ? [10, Math.random() * 30 + 10, 10] : 4
                        }}
                        transition={{ 
                            duration: 0.5 + Math.random(), 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ 
                            flex: 1, 
                            background: presets.find(p => p.id === activePreset).color,
                            borderRadius: '2px',
                            opacity: isPlaying ? 0.7 : 0.2
                        }}
                    />
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                {presets.map((preset) => {
                    const Icon = preset.icon;
                    return (
                        <button
                            key={preset.id}
                            onClick={() => setActivePreset(preset.id)}
                            style={{
                                flex: 1,
                                background: activePreset === preset.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                                border: `1px solid ${activePreset === preset.id ? preset.color : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '12px',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Icon size={16} color={activePreset === preset.id ? preset.color : 'var(--text-dim)'} />
                            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: activePreset === preset.id ? 'white' : 'var(--text-dim)' }}>
                                {preset.id.split('_')[0]}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 5px' }}>
                <Volume2 size={14} color="var(--text-dim)" />
                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative' }}>
                    <motion.div 
                        style={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            height: '100%', 
                            width: `${volume}%`, 
                            background: 'var(--s-glow)',
                            borderRadius: '2px',
                            boxShadow: '0 0 10px var(--s-glow)'
                        }} 
                    />
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                    />
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', minWidth: '25px' }}>{volume}%</span>
            </div>
        </div>
    );
};

export default NebulaAudio;
