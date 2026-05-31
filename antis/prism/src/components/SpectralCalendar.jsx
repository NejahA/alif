import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpectralCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());

    const calendarGrid = [];
    for (let i = 0; i < startDay; i++) calendarGrid.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(i);

    const eventList = [
        { id: 1, title: 'SYSTEM_SYNC_REBOOT', time: '09:00', type: 'system' },
        { id: 2, title: 'NEURAL_LINK_STABILIZATION', time: '14:30', type: 'critical' },
        { id: 3, title: 'DATA_PACKET_ARCHIVAL', time: '18:00', type: 'utility' }
    ];

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CalendarIcon size={14} color="var(--s-glow)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px' }}>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                {days.map(d => (
                    <div key={d} style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', paddingBottom: '5px' }}>{d}</div>
                ))}
                {calendarGrid.map((day, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: day ? 1.1 : 1 }}
                        onClick={() => day && setSelectedDay(day)}
                        style={{
                            height: '35px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            borderRadius: '50%',
                            cursor: day ? 'pointer' : 'default',
                            background: selectedDay === day ? 'var(--s-primary)' : 'transparent',
                            color: selectedDay === day ? 'white' : day ? 'white' : 'transparent',
                            boxShadow: selectedDay === day ? '0 0 15px rgba(255, 0, 204, 0.4)' : 'none',
                            border: day && (day === 15 || day === 22) ? '1px solid rgba(0, 255, 255, 0.3)' : 'none'
                        }}
                    >
                        {day}
                    </motion.div>
                ))}
            </div>

            {/* Upcoming Events */}
            <div style={{ marginTop: '5px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={12} color="var(--s-primary)" />
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px' }}>UPCOMING_NEURAL_EVENTS</span>
                    </div>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>0x{selectedDay}_ACTIVE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {eventList.map(event => (
                        <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: event.type === 'critical' ? 'var(--s-primary)' : 'var(--s-glow)' }} />
                                <span style={{ fontSize: '0.65rem', color: 'white' }}>{event.title}</span>
                            </div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700 }}>{event.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '5px' }}>
                <Zap size={14} color="var(--s-glow)" />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>SYNCHRONIZED_WITH_VOID_CORE</span>
            </div>
        </div>
    );
};

export default SpectralCalendar;
