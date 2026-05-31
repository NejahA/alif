import React, { useState, useEffect } from 'react';
import { MessageSquare, Shield, Signal, Lock, Unlock, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EncryptedMessage = ({ text, delay = 0 }) => {
    const [decryptedText, setDecryptedText] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(true);

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDecryptedText(
                text.split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                setIsDecrypting(false);
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <div style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${isDecrypting ? 'var(--s-primary)' : 'rgba(255,255,255,0.05)'}`,
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: isDecrypting ? 'var(--s-glow)' : 'white',
            letterSpacing: '0.5px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.3s ease'
        }}>
            {isDecrypting ? <Lock size={14} color="var(--s-primary)" /> : <Unlock size={14} color="var(--s-glow)" />}
            <div>{decryptedText}</div>
        </div>
    );
};

const EncryptedSignal = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: 'SYSTEM_ROOT::INCOMING_DATALink_Established' },
        { id: 2, text: 'PACKET_SEQUENCE_04_RESOLVED' }
    ]);
    const [signalStrength, setSignalStrength] = useState(84);

    useEffect(() => {
        const interval = setInterval(() => {
            setSignalStrength(prev => Math.max(10, Math.min(100, prev + (Math.random() * 10 - 5))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const addMessage = () => {
        const presets = [
            'NEURAL_PATH_0x4F_ACTIVE',
            'ENCRYPTED_HANDSHAKE_COMPLETED',
            'VOID_PROTOCOL_REBOOTING',
            'GATEWAY_SYNC_PENDING',
            'PRISM_CORE_OVERLOAD_PREVENTED'
        ];
        const newMsg = presets[Math.floor(Math.random() * presets.length)];
        setMessages(prev => [{ id: Date.now(), text: newMsg }, ...prev.slice(0, 3)]);
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Signal size={14} color="var(--s-primary)" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px' }}>SIGNAL_SYNC</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                width: '3px', 
                                height: `${(i + 1) * 3}px`, 
                                background: signalStrength > (i * 20) ? 'var(--s-glow)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '1px'
                            }} 
                        />
                    ))}
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: '5px' }}>{signalStrength.toFixed(0)}%</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
                            <EncryptedMessage text={msg.text} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={addMessage}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '10px',
                        color: 'var(--text-dim)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <RefreshCcw size={12} />
                    POLL_SIGNAL
                </button>
            </div>

            <div style={{ marginTop: '5px', padding: '10px', background: 'rgba(255,0,204,0.05)', borderRadius: '10px', border: '1px solid rgba(255,0,204,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <Shield size={12} color="var(--s-primary)" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--s-primary)', letterSpacing: '1px' }}>SECURITY_LAYER_V2</span>
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                   ALL_COMMUNICATIONS_ARE_TUNNELED_THROUGH_VOID_NODES. 100%_ANONYMITY_GUARANTEED.
                </div>
            </div>
        </div>
    );
};

export default EncryptedSignal;
