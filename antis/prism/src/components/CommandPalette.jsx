import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Moon, Sun, Monitor, Zap, Edit3, ListTodo, X } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose, actions }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
        }
    }, [isOpen]);

    const filteredActions = actions.filter(action => 
        action.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(5,5,10,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2000,
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '15vh'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    style={{
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '400px',
                        background: 'var(--bg-acrylic)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '20px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ 
                        padding: '20px', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px' 
                    }}>
                        <Search size={22} color="var(--s-glow)" />
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="TYPE_CMD_OR_SEARCH..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.2rem',
                                outline: 'none',
                                letterSpacing: '1px'
                            }}
                        />
                        <div style={{ 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            background: 'rgba(255,255,255,0.05)', 
                            fontSize: '0.6rem', 
                            color: 'var(--text-dim)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>ESC_TO_CLOSE</div>
                    </div>

                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredActions.map((action, index) => (
                            <div 
                                key={index}
                                onClick={() => { action.onSelect(); onClose(); }}
                                style={{
                                    padding: '16px 25px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    borderLeft: '2px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderLeftColor = 'var(--s-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.borderLeftColor = 'transparent';
                                }}
                            >
                                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
                                    {action.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{action.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{action.description}</div>
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--s-glow)', fontWeight: 800 }}>ENTER</div>
                            </div>
                        ))}
                        {filteredActions.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', opacity: 0.5 }}>
                                NO_COMMAND_MATCHED
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommandPalette;
