import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Music, Activity, Waves, Sliders, Volume2, Shield } from 'lucide-react';

const ENSEMBLES = ["Chamber Strings", "Symphonic Ensemble", "Spiccato Violins", "Pizzicato Cello"];

const OrchestralStrings = () => {
  const [ensemble, setEnsemble] = useState(ENSEMBLES[0]);
  const [expression, setExpression] = useState(0.7);
  const [vibrato, setVibrato] = useState(0.4);
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="orchestral-strings" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <Music color="#f43f5e" /> Orchestral Strings Pro
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Lush cinematic string ensembles with real-time expression modeling.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button className="btn-glass" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'STOP' : 'TEST PERFORMANCE'}
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                 <label style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginBottom: '10px' }}>ENSEMBLE TYPE</label>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {ENSEMBLES.map(e => (
                      <button 
                        key={e} 
                        className={`btn-glass ${ensemble === e ? 'active' : ''}`}
                        onClick={() => setEnsemble(e)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {e.toUpperCase()}
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>EXPRESSION (DYNAMICS)</span>
                    <span style={{ fontSize: '0.8rem', color: '#f43f5e' }}>{Math.round(expression * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={expression} onChange={(e) => setExpression(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} />
              </div>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem' }}>VIBRATO INTENSITY</span>
                    <span style={{ fontSize: '0.8rem', color: '#f43f5e' }}>{Math.round(vibrato * 100)}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={vibrato} onChange={(e) => setVibrato(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} />
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '30px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                 {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scaleY: isPlaying ? [1, 1.5, 0.8, 1.3, 1] : 1,
                        opacity: isPlaying ? [0.4, 1, 0.4] : 0.2
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: '4px', height: '100px', background: '#f43f5e', borderRadius: '2px' }}
                    />
                 ))}
                 <div style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', height: '100px' }} />
                 <Music size={48} color="#f43f5e" style={{ opacity: isPlaying ? 1 : 0.1 }} />
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                 <Activity size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>LEGATO</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>POLY</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Shield size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>CON SORDO</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>OFF</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <Waves size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                 <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>REVERB</p>
                 <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>HALL</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrchestralStrings;
