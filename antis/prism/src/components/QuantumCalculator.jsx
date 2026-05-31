import React, { useState } from 'react';
import { Cpu, Delete, Divide, Minus, Plus, X, Percent, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuantumCalculator = () => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [isComputing, setIsComputing] = useState(false);

    const handleNumber = (n) => {
        setDisplay(prev => prev === '0' ? String(n) : prev + n);
    };

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const compute = () => {
        setIsComputing(true);
        setTimeout(() => {
            try {
                // Using Function instead of eval for safer simple math
                const result = new Function(`return ${equation.replace(/X/g, '*') + display}`)();
                setDisplay(String(result));
                setEquation('');
            } catch (err) {
                setDisplay('ERR_LOGIC');
            }
            setIsComputing(false);
        }, 800);
    };

    const clear = () => {
        setDisplay('0');
        setEquation('');
    };

    const CalcButton = ({ children, onClick, color = 'var(--text-main)', wide = false }) => (
        <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                gridColumn: wide ? 'span 2' : 'span 1',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '15px',
                color: color,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
            }}
        >
            {children}
        </motion.button>
    );

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Logic Display */}
            <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '20px', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'right',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '5px', height: '15px' }}>
                    {equation}
                </div>
                <div style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 700, 
                    color: isComputing ? 'var(--s-glow)' : 'white',
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                }}>
                    {isComputing ? 'COMPUTING...' : display}
                </div>
                
                {/* CRT Scanline Effect */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.05))',
                    backgroundSize: '100% 4px, 3px 100%',
                    pointerEvents: 'none',
                    opacity: 0.3
                }} />

                {/* Computing Pulse */}
                <AnimatePresence>
                    {isComputing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'absolute',
                                left: 0, bottom: 0,
                                height: '2px',
                                background: 'var(--s-glow)',
                                width: '100%',
                                boxShadow: '0 0 15px var(--s-glow)'
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <CalcButton onClick={clear} color="var(--s-primary)">CLR</CalcButton>
                <CalcButton onClick={() => handleOperator('/')}><Divide size={16} color="var(--s-glow)" /></CalcButton>
                <CalcButton onClick={() => handleOperator('X')}><X size={16} color="var(--s-glow)" /></CalcButton>
                <CalcButton onClick={() => setDisplay(prev => prev === '0' ? '0' : prev.slice(0, -1))}><Delete size={16} color="var(--s-primary)" /></CalcButton>
                
                <CalcButton onClick={() => handleNumber(7)}>7</CalcButton>
                <CalcButton onClick={() => handleNumber(8)}>8</CalcButton>
                <CalcButton onClick={() => handleNumber(9)}>9</CalcButton>
                <CalcButton onClick={() => handleOperator('-')}><Minus size={16} color="var(--s-glow)" /></CalcButton>
                
                <CalcButton onClick={() => handleNumber(4)}>4</CalcButton>
                <CalcButton onClick={() => handleNumber(5)}>5</CalcButton>
                <CalcButton onClick={() => handleNumber(6)}>6</CalcButton>
                <CalcButton onClick={() => handleOperator('+')}><Plus size={16} color="var(--s-glow)" /></CalcButton>
                
                <CalcButton onClick={() => handleNumber(1)}>1</CalcButton>
                <CalcButton onClick={() => handleNumber(2)}>2</CalcButton>
                <CalcButton onClick={() => handleNumber(3)}>3</CalcButton>
                <CalcButton onClick={compute} color="var(--s-glow)">=</CalcButton>
                
                <CalcButton onClick={() => handleNumber(0)} wide>0</CalcButton>
                <CalcButton onClick={() => handleNumber('.')}>.</CalcButton>
                <CalcButton onClick={() => handleOperator('%')}><Percent size={16} color="var(--s-glow)" /></CalcButton>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 5px' }}>
                <Zap size={14} color="var(--s-glow)" />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '2px' }}>NEURAL_COMPUTE_ESTABLISHED</span>
            </div>
        </div>
    );
};

export default QuantumCalculator;
