import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

const DraggableWindow = ({ children, title, id }) => {
    return (
        <motion.div
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.02, zIndex: 1000 }}
            className="glass-card"
            style={{ 
                flex: 1, 
                minWidth: '320px', 
                position: 'relative',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div 
                style={{ 
                    padding: '8px 16px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'grab'
                }}
                className="window-header"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GripVertical size={14} color="rgba(255,255,255,0.2)" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '1px' }}>{title || 'WINDOW_REF'}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </motion.div>
    );
};

export default DraggableWindow;
