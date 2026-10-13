import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, Cpu, RefreshCw, Send } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function QuantumCipherStudio({ onLogMessage, soundEnabled = true }) {
  const [algorithm, setAlgorithm] = useState('KYBER-1024');
  const [inputText, setInputText] = useState('ORBITAL_PAYLOAD_ALPHA_99');
  const [cipherOutput, setCipherOutput] = useState('0x8F4A...B902');
  const [isEncrypting, setIsEncrypting] = useState(false);

  const generateHexHash = () => {
    let hash = '0x';
    const chars = '0123456789ABCDEF';
    for (let i = 0; i < 32; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleTransmit = () => {
    setIsEncrypting(true);
    if (soundEnabled) playBeep(1200, 'square', 0.08);

    setTimeout(() => {
      const hash = generateHexHash();
      setCipherOutput(hash);
      setIsEncrypting(false);

      if (onLogMessage) {
        onLogMessage(
          'SIGNAL',
          `Quantum Cipher Transmitted [${algorithm}]: Payload "${inputText}" -> Hash ${hash.slice(0, 10)}...`
        );
      }
      if (soundEnabled) playBeep(1600, 'sine', 0.1);
    }, 600);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-violet)' }}>
            <Lock style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>Quantum Cipher Studio</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Post-Quantum Cryptographic Relay</p>
          </div>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--accent-violet)', fontFamily: 'var(--font-mono)' }}>
          SECURE 256-BIT
        </span>
      </div>

      {/* Algorithm Selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '0.85rem' }}>
        {['KYBER-1024', 'DILITHIUM-5', 'SPHINCS+', 'AES-Q256'].map((algo) => (
          <button
            key={algo}
            onClick={() => setAlgorithm(algo)}
            className={`btn-cosmo-outline ${algorithm === algo ? 'active' : ''}`}
            style={{ flex: 1, padding: '4px', fontSize: '0.65rem', justifyContent: 'center' }}
          >
            {algo}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <div style={{ marginBottom: '0.85rem' }}>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
          PAYLOAD DATA STREAM
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter payload string..."
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleTransmit}
            disabled={isEncrypting}
            className="btn-cosmo"
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            {isEncrypting ? <RefreshCw className="spin" style={{ width: '14px', height: '14px' }} /> : <Send style={{ width: '14px', height: '14px' }} />}
            ENCRYPT
          </button>
        </div>
      </div>

      {/* Output Cipher Box */}
      <div style={{ marginTop: 'auto', background: 'rgba(5, 8, 20, 0.9)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span>ENCRYPTED CIPHERHASH</span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>{algorithm} VERIFIED</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
          {isEncrypting ? 'COMPUTING QUANTUM RESISTANT HASH...' : cipherOutput}
        </div>
      </div>

    </div>
  );
}
