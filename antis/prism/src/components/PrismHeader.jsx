import React from 'react';
import { Search, Bell, Monitor, ShieldCheck, Cpu } from 'lucide-react';

const PrismHeader = ({ children }) => {
  return (
    <header 
        className="glass-card" 
        style={{ 
            margin: '20px 40px', 
            padding: '10px 30px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(255, 255, 255, 0.01)'
        }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--s-primary), var(--s-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)'
        }}>
            <Monitor size={20} color="white" />
        </div>
        <h1 className="iridescent-text" style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>PRISM::OS</h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {children}
        
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={12} color="var(--s-glow)" />
                <span>KRNL_UP</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={12} color="var(--s-primary)" />
                <span>SECR_EN</span>
            </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-prism" style={{ padding: '8px', borderRadius: '10px' }}>
            <Bell size={18} />
        </button>
        <button className="btn-prism" style={{ padding: '8px', borderRadius: '10px' }}>
            <Search size={18} />
        </button>
      </div>
    </header>
  );
};

export default PrismHeader;
