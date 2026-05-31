import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const WorldClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (timeZone) => {
        return time.toLocaleTimeString('en-US', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const zones = [
        { label: 'SFO', zone: 'America/Los_Angeles', color: 'var(--s-primary)' },
        { label: 'LON', zone: 'Europe/London', color: 'var(--s-glow)' },
        { label: 'TYO', zone: 'Asia/Tokyo', color: 'var(--s-secondary)' }
    ];

    return (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Globe size={14} color="var(--text-dim)" />
            {zones.map((z, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '1px' }}>{z.label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: z.color, fontFamily: 'monospace' }}>{formatTime(z.zone)}</span>
                </div>
            ))}
        </div>
    );
};

export default WorldClock;
