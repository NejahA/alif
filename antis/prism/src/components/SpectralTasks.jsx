import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, ListChecks, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpectralTasks = () => {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('prism_spectral_tasks');
        return saved ? JSON.parse(saved) : [];
    });
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        localStorage.setItem('prism_spectral_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ 
                flex: 1.5, 
                minWidth: '400px', 
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
                        <ListChecks size={20} color="var(--s-glow)" />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>SPECTRAL_TASKS</h3>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>
                    {tasks.filter(t => t.completed).length} / {tasks.length} COMPLETE
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Initialize new objective..."
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                />
                <button 
                    onClick={addTask}
                    className="btn-prism"
                    style={{ padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Plus size={20} />
                </button>
            </div>

            <div 
                className="custom-scrollbar"
                style={{ 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    padding: '5px'
                }}
            >
                <AnimatePresence>
                    {tasks.map((task) => (
                        <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px', 
                                padding: '12px 16px', 
                                borderRadius: '12px', 
                                background: task.completed ? 'rgba(0, 255, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${task.completed ? 'var(--s-glow)' : 'rgba(255,255,255,0.05)'}`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <button 
                                onClick={() => toggleTask(task.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.completed ? 'var(--s-glow)' : 'var(--text-dim)' }}
                            >
                                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                            <span style={{ 
                                flex: 1, 
                                fontSize: '0.9rem', 
                                color: task.completed ? 'var(--text-dim)' : 'var(--text-main)',
                                textDecoration: task.completed ? 'line-through' : 'none',
                                fontFamily: 'var(--font-body)'
                            }}>
                                {task.text}
                            </span>
                            <button 
                                onClick={() => deleteTask(task.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: '0.8rem', opacity: 0.5 }}>
                        NO_TASKS_INITIALIZED
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SpectralTasks;
