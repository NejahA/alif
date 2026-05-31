import React, { useState, useEffect } from 'react';
import { Layout, Volume2, Zap, Layers, Play, Square, Activity, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import MacroDashboard from './MacroDashboard';
import SessionLoopRecorder from './SessionLoopRecorder';
import MasterMetering from './MasterMetering';

export default function PerformanceDashboard() {
  const [masterVol, setMasterVol] = useState(0);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1200px', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
      gap: '20px',
      padding: '20px'
    }}>
      {/* Essential Control Section */}
      <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
          <Layout size={24} color="var(--accent-primary)" />
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Performance Master</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Large Master Fader */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>MASTER OUTPUT</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{masterVol} dB</span>
            </div>
            <input 
              type="range" min="-60" max="6" step="1"
              value={masterVol}
              onChange={(e) => setMasterVol(Number(e.target.value))}
              style={{ 
                width: '100%', 
                height: '30px', 
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <button className="btn-glass active" style={{ height: '60px', fontSize: '1rem' }}>
              <Zap size={20} /> KILL EFFECTS
            </button>
            <button className="btn-glass active" style={{ height: '60px', fontSize: '1rem', background: '#ef4444' }}>
              <Square size={20} /> STOP ALL
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', opacity: 0.5 }}>ACTIVE SCENE</h4>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px' }}>MAIN STAGE v1.2</div>
          </div>
        </div>
      </div>

      {/* Embedded Macro Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <MacroDashboard />
        <MasterMetering />
      </div>

      {/* Embedded Looper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SessionLoopRecorder />
        <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Activity size={18} color="var(--accent-primary)" />
            <h4 style={{ margin: 0 }}>System Health</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
               <span>Latency</span>
               <span style={{ color: '#10b981' }}>12ms</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
               <span>Buffer Usage</span>
               <span>24%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
