import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Layout, Zap, Activity, Waves, Sliders, Volume2, Target, Grid, ListMusic } from 'lucide-react';

const SECTIONS = [
  { name: "Intro", length: 8, color: "#3b82f6" },
  { name: "Verse 1", length: 16, color: "#10b981" },
  { name: "Build-up", length: 8, color: "#f59e0b" },
  { name: "Drop", length: 16, color: "#f43f5e" },
  { name: "Verse 2", length: 16, color: "#10b981" },
  { name: "Outro", length: 8, color: "#8b5cf6" }
];

const AIArrangementHelper = () => {
  const [arrangement, setArrangement] = useState(SECTIONS);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="ai-arrangement-helper" style={{ color: 'white', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '5px' }}>
            <ListMusic color="var(--accent-primary)" /> AI Arrangement Helper
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Neural structural analysis and automated song structure suggestions.</p>
        </div>
        <button 
          className={`btn-glass ${isAnalyzing ? 'active' : ''}`}
          onClick={() => setIsAnalyzing(!isAnalyzing)}
          style={{ padding: '10px 40px', background: isAnalyzing ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700 }}
        >
          {isAnalyzing ? 'ANALYZING PROJECT...' : 'SUGGEST STRUCTURE'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
         <div style={{ display: 'flex', gap: '10px', height: '120px', alignItems: 'flex-end' }}>
            {arrangement.map((section, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ 
                    scaleY: 1,
                    opacity: currentSection === i ? 1 : 0.5,
                    border: currentSection === i ? `2px solid ${section.color}` : 'none'
                }}
                style={{ 
                    flex: section.length, 
                    height: '100%', 
                    background: section.color, 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => setCurrentSection(i)}
              >
                 <span style={{ fontSize: '0.65rem', fontWeight: 800, transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>{section.name}</span>
                 <div style={{ position: 'absolute', bottom: '-25px', fontSize: '0.6rem', opacity: 0.4 }}>{section.length}B</div>
              </motion.div>
            ))}
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
         <div className="glass-panel" style={{ padding: '25px' }}>
            <h3 style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '2px' }}>ENERGY PROFILE</h3>
            <div style={{ height: '150px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
               {[...Array(50)].map((_, i) => (
                  <div 
                    key={i} 
                    style={{ 
                        flex: 1, 
                        height: `${Math.random() * 100}%`, 
                        background: 'linear-gradient(0deg, var(--accent-primary), transparent)',
                        opacity: 0.3
                    }} 
                  />
               ))}
            </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
               <div style={{ textAlign: 'center' }}>
                  <Zap size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>FLOW</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>DYNAMO</p>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <Target size={16} opacity={0.5} style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.6rem', opacity: 0.4 }}>GENRE</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>ELECTRONIC</p>
               </div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
               <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '10px' }}>AI RECOMMENDATION</p>
               <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>"Extend Verse 2 by 8 bars to improve build-up tension."</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AIArrangementHelper;
