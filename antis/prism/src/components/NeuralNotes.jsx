import React, { useState, useEffect } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NeuralNotes = () => {
    const [note, setNote] = useState(() => {
        return localStorage.getItem('prism_neural_note') || '';
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem('prism_neural_note', note);
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 1000);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [note]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ 
                flex: 1, 
                minWidth: '320px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px',
                padding: '24px',
                position: 'relative',
                maxHeight: '400px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                        padding: '8px', 
                        borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Edit3 size={18} color="var(--s-primary)" />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>NEURAL_NOTES</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AnimatePresence>
                        {isSaving && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ fontSize: '0.6rem', color: 'var(--s-glow)', letterSpacing: '1px' }}
                            >
                                AUTO_SAVING...
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button 
                        onClick={() => setNote('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Synchronize your thoughts..."
                className="custom-scrollbar"
                style={{
                    flex: 1,
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    resize: 'none',
                    outline: 'none',
                    padding: '10px 0'
                }}
            />

            <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.05)', 
                paddingTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.65rem',
                color: 'var(--text-dim)',
                letterSpacing: '1px'
            }}>
                <span>CHARS: {note.length}</span>
                <span style={{ color: 'var(--s-primary)' }}>LOCAL_SYNC_ACTIVE</span>
            </div>
        </motion.div>
    );
};

export default NeuralNotes;
