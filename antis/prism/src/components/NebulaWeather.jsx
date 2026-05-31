import React, { useState } from 'react';
import { Cloud, CloudRain, CloudLightning, Sun, Wind, Droplets, Thermometer, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const WeatherIcon = ({ condition, size = 24, color = 'white' }) => {
    switch (condition) {
        case 'STORM': return <CloudLightning size={size} color={color} />;
        case 'RAIN': return <CloudRain size={size} color={color} />;
        case 'CLEAR': return <Sun size={size} color={color} />;
        default: return <Cloud size={size} color={color} />;
    }
};

const NebulaWeather = () => {
    const [city, setCity] = useState('NEO_TOKYO');
    const [weather] = useState({
        temp: '24°C',
        high: '28°C',
        low: '19°C',
        condition: 'CLEAR',
        humidity: '42%',
        wind: '12km/h',
        uv: 'LOW'
    });

    const forecast = [
        { day: 'MON', temp: '22', condition: 'CLEAR' },
        { day: 'TUE', temp: '19', condition: 'RAIN' },
        { day: 'WED', temp: '24', condition: 'STORM' },
        { day: 'THU', temp: '26', condition: 'CLEAR' },
        { day: 'FRI', temp: '23', condition: 'CLOUDY' }
    ];

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={14} color="var(--s-primary)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>{city}</span>
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>SYNCED_LAT: 35.6895</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', padding: '10px 0' }}>
                <motion.div
                    animate={{ 
                        filter: ['drop-shadow(0 0 5px var(--s-glow))', 'drop-shadow(0 0 15px var(--s-glow))', 'drop-shadow(0 0 5px var(--s-glow))']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <WeatherIcon condition={weather.condition} size={48} color="var(--s-glow)" />
                </motion.div>
                <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: '1' }}>{weather.temp}</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, marginTop: '5px' }}>{weather.condition}_ATMOSPHERE</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <Droplets size={14} color="var(--s-primary)" style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>HUMIDITY</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{weather.humidity}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <Wind size={14} color="var(--s-glow)" style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>WIND</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{weather.wind}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <Thermometer size={14} color="var(--s-accent)" style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>UV_LEVEL</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{weather.uv}</div>
                </div>
            </div>

            {/* Forecast */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 5px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {forecast.map((f, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 700 }}>{f.day}</span>
                        <WeatherIcon condition={f.condition} size={16} color="var(--text-dim)" />
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>{f.temp}°</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NebulaWeather;
