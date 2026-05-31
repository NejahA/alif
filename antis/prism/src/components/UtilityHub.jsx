import React, { useState, useEffect } from 'react';
import { Cloud, Zap, HardDrive, Battery, Signal, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UtilityHub = ({ condition, setCondition }) => {
    const [weather, setWeather] = useState({ temp: '--°C', condition: 'SYNCING...', humidity: '--%' });
    const [stats, setStats] = useState({ disk: '64%', battery: '82%', latency: '24ms' });
    const [loading, setLoading] = useState(true);

    const fetchWeather = async () => {
        try {
            // Defaulting to London coordinates, can be made dynamic later
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current_weather=true&relative_humidity_2m=true');
            const data = await response.json();
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            
            // Map weather codes to our Atmospheric conditions
            // 0: Clear, 1-3: Partly Cloudy, 95-99: Thunderstorm
            let atmosphericCondition = 'CLEAR';
            if (code >= 95) atmosphericCondition = 'ELECTRIC';
            
            setWeather({ 
                temp: `${temp}°C`, 
                condition: atmosphericCondition === 'ELECTRIC' ? 'STORM' : 'CLEAR',
                humidity: '45%' 
            });
            setCondition(atmosphericCondition);
            setLoading(false);
        } catch (error) {
            console.error("UtilityHub Weather Fetch Failure", error);
            setWeather({ temp: '22°C', condition: 'CLEAR', humidity: '40%' });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                latency: `${Math.floor(Math.random() * 10) + 20}ms`,
                battery: `${Math.max(0, parseInt(prev.battery) - 0.1)}%`
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleCondition = () => {
        setCondition(prev => prev === 'CLEAR' ? 'ELECTRIC' : 'CLEAR');
    };

    const UtilityItem = ({ icon: Icon, label, value, color, onClick }) => (
        <div 
            onClick={onClick}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '10px', 
                borderRadius: '10px', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: onClick ? 'pointer' : 'default' 
            }}
        >
            <div style={{ padding: '8px', borderRadius: '8px', background: `${color}10`, border: `1px solid ${color}30` }}>
                <Icon size={16} color={color} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>{label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{value}</span>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ 
                flex: 1, 
                minWidth: '320px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                padding: '24px',
                position: 'relative'
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
                        <Cloud size={20} color="var(--s-secondary)" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>UTILITY_HUB</h3>
                </div>
                <div style={{ fontSize: '0.6rem', color: condition === 'ELECTRIC' ? 'var(--s-glow)' : 'var(--text-dim)', letterSpacing: '1px', fontWeight: 700 }}>
                    {condition}_PHASE
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <UtilityItem icon={Thermometer} label="ATMOSPHERE" value={condition === 'ELECTRIC' ? 'STORM' : 'CLEAR'} color="var(--s-primary)" onClick={toggleCondition} />
                <UtilityItem icon={Battery} label="ENERGY_LVL" value={stats.battery} color="var(--s-secondary)" />
                <UtilityItem icon={HardDrive} label="STORAGE_SYS" value={stats.disk} color="var(--s-accent)" />
                <UtilityItem icon={Signal} label="SYNC_LATENCY" value={stats.latency} color="var(--s-glow)" />
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                    <span style={{ color: 'var(--text-dim)', letterSpacing: '1px' }}>DIAGNOSTICS_SUMMARY</span>
                    <span style={{ color: 'var(--s-glow)', fontWeight: 700 }}>NOMINAL</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.02)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                    <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, transparent, var(--s-glow), transparent)' }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default UtilityHub;
