import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PrismLock = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        setScanComplete(false);
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
        }, 3000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ 
                padding: '30px', 
                flex: 1, 
                minWidth: '320px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                position: 'relative',
                overflow: 'hidden',
                borderColor: isScanning ? 'var(--spectrum-cyan)' : 'var(--border-glass)'
            }}
        >
            {/* Crystalline Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'var(--spectrum-cyan)',
                filter: 'blur(100px)',
                opacity: isScanning ? 0.2 : 0.1,
                zIndex: 0
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                    padding: '12px', 
                    borderRadius: '16px', 
                    background: 'rgba(0, 255, 255, 0.05)', 
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isScanning ? '0 0 20px rgba(0, 255, 255, 0.3)' : '0 0 15px rgba(0, 255, 255, 0.1)'
                }}>
                    {isScanning ? <Loader2 className="animate-spin" size={24} color="var(--spectrum-cyan)" /> : <Shield size={24} color="var(--spectrum-cyan)" />}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>PRISM_LOCK</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{isScanning ? 'Scanning Modules...' : 'System Armor Active'}</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={14} /> Encryption</span>
                    <span style={{ color: 'var(--spectrum-cyan)' }}>{isScanning ? 'VERIFYING...' : 'AES_256_ACTIVE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} /> Data Integrity</span>
                    <span style={{ color: 'var(--spectrum-pink)' }}>{isScanning ? 'CHECKING...' : 'VERIFIED'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={14} /> Threats</span>
                    <span style={{ opacity: 0.5 }}>{isScanning ? 'SEARCHING...' : 'NON_DETECTED'}</span>
                </div>
            </div>

            <button 
                className="btn-prism" 
                onClick={handleScan}
                disabled={isScanning}
                style={{ 
                    width: '100%', 
                    marginTop: 'auto',
                    opacity: isScanning ? 0.7 : 1,
                    cursor: isScanning ? 'not-allowed' : 'pointer'
                }}
            >
                {isScanning ? 'SCANNING...' : (scanComplete ? 'RE-SCAN_SYSTEM' : 'SCAN_SYSTEM')}
            </button>
        </motion.div>
    );
};

export default PrismLock;
