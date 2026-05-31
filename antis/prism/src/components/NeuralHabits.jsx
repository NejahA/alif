import React, { useState } from 'react';
import { CheckCircle, Circle, Award, Target, Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NeuralHabits = () => {
    const [habits, setHabits] = useState([
        { id: 1, title: 'DEEP_WORK_SYNC', completed: false, streak: 5 },
        { id: 2, title: 'CODE_OPTIMIZATION', completed: true, streak: 12 },
        { id: 3, title: 'ATMOSPHERIC_WALK', completed: false, streak: 3 },
        { id: 4, title: 'NEURAL_LINK_BOOT', completed: false, streak: 8 }
    ]);

    const [flowPoints, setFlowPoints] = useState(65);

    const toggleHabit = (id) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const newState = !h.completed;
                if (newState) setFlowPoints(p => Math.min(100, p + 5));
                else setFlowPoints(p => Math.max(0, p - 5));
                return { ...h, completed: newState };
            }
            return h;
        }));
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Target size={14} color="var(--s-primary)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px' }}>FLOW_PROTOCOLS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Flame size={12} color="#fb923c" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fb923c' }}>12_DAY_STREAK</span>
                </div>
            </div>

            {/* Neural Clarity Gauge */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>NEURAL_CLARITY_SYNC</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--s-glow)', fontWeight: 800 }}>{flowPoints.toFixed(0)}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <motion.div 
                        initial={false}
                        animate={{ width: `${flowPoints}%` }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--s-primary), var(--s-glow))', borderRadius: '4px' }}
                    />
                    {/* Animated scanning glow */}
                    <motion.div 
                        animate={{ left: ['-20%', '120%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        style={{ position: 'absolute', top: 0, height: '100%', width: '20%', background: 'rgba(255,255,255,0.3)', filter: 'blur(5px)', pointerEvents: 'none' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {habits.map((habit) => (
                    <motion.div
                        key={habit.id}
                        whileHover={{ x: 5 }}
                        onClick={() => toggleHabit(habit.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: habit.completed ? 'rgba(0, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${habit.completed ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {habit.completed ? <CheckCircle size={16} color="var(--s-glow)" /> : <Circle size={16} color="var(--text-dim)" />}
                            <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                color: habit.completed ? 'white' : 'var(--text-dim)',
                                textDecoration: habit.completed ? 'line-through' : 'none',
                                opacity: habit.completed ? 0.6 : 1
                            }}>
                                {habit.title}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.7 }}>
                            <Zap size={10} color="var(--s-primary)" />
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700 }}>+{habit.streak}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>
                    <Award size={14} color="var(--s-glow)" />
                    DAILY_QUOTA_PENDING_ACTION
                </div>
            </div>
        </div>
    );
};

export default NeuralHabits;
