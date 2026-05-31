import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

const SpectralTerminal = ({ onCommand }) => {
    const [history, setHistory] = useState([
        { type: 'system', text: 'SPECTRAL_KERNEL_V5.0.0_LOADED...' },
        { type: 'system', text: 'ESTABLISHING_NEURAL_LINK...' },
        { type: 'success', text: 'LINK_STABLE. READY_FOR_INPUT.' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            if (!cmd) return;

            setHistory(prev => [...prev, { type: 'user', text: `> ${input}` }]);
            
            // Process command
            processCommand(cmd);
            setInput('');
        }
    };

    const processCommand = (cmd) => {
        if (cmd === 'help') {
            setHistory(prev => [...prev, { type: 'system', text: 'AVAILABLE_CMDS: /theme, /focus, /clear, /ping, /system' }]);
        } else if (cmd === 'clear') {
            setHistory([]);
        } else if (cmd.startsWith('/theme ')) {
            const theme = cmd.split(' ')[1];
            setHistory(prev => [...prev, { type: 'system', text: `SHIFTING_SPECTRUM_TO: ${theme.toUpperCase()}...` }]);
            if (onCommand) onCommand('theme', theme);
        } else if (cmd === '/focus') {
            setHistory(prev => [...prev, { type: 'system', text: 'IGNITING_FOCUS_CORE...' }]);
            if (onCommand) onCommand('focus');
        } else {
            setHistory(prev => [...prev, { type: 'error', text: `ERROR: UNKNOWN_CMD: '${cmd}'` }]);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card custom-scrollbar"
            style={{ 
                flex: 1.5, 
                minWidth: '400px', 
                background: 'rgba(5, 5, 10, 0.6)', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--s-glow)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0, 255, 255, 0.05)', borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Terminal size={14} color="var(--s-glow)" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--s-glow)' }}>SPECTRAL_TERMINAL</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
                </div>
            </div>

            <div 
                ref={scrollRef}
                style={{ 
                    flex: 1, 
                    padding: '15px', 
                    overflowY: 'auto', 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem',
                    lineHeight: '1.6'
                }}
            >
                {history.map((line, i) => (
                    <div key={i} style={{ 
                        color: line.type === 'error' ? '#f43f5e' : 
                               line.type === 'success' ? '#10b981' : 
                               line.type === 'user' ? 'white' : 'var(--text-dim)',
                        opacity: line.type === 'system' ? 0.7 : 1,
                        marginBottom: '4px',
                        textShadow: line.type === 'success' ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
                    }}>
                        {line.text}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <ChevronRight size={14} color="var(--s-glow)" />
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    placeholder="TYPE_COMMANDS_HERE..."
                    style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        outline: 'none',
                        letterSpacing: '0.5px'
                    }}
                />
            </div>
        </motion.div>
    );
};

export default SpectralTerminal;
