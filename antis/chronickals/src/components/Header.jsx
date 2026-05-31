import React from 'react';
import { Terminal, Shield, Monitor, HardDrive } from 'lucide-react';

const Header = ({ isConnected, address, onConnect }) => {
  return (
    <header className="glass-panel" style={{ margin: '20px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Terminal className="terminal-glow" />
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>CHRONICKALS.V1.0</h1>
      </div>
      
      <nav style={{ display: 'flex', gap: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Monitor size={18} />
          <span style={{ fontSize: '0.8rem' }}>GALLERY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <HardDrive size={18} />
          <span style={{ fontSize: '0.8rem' }}>ARCHIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
          <Shield size={18} />
          <span style={{ fontSize: '0.8rem' }}>NETSEC</span>
        </div>
      </nav>

      <button className="button-primary" onClick={onConnect} style={{ fontSize: '0.7rem' }}>
        {isConnected ? address : 'CONNECT_WALLET'}
      </button>
    </header>
  );
};

export default Header;
