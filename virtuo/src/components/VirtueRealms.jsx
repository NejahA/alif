import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, Mountain, Waves, Zap, Sparkles, Music, 
  Lock, CheckCircle2, Map as MapIcon, Compass
} from 'lucide-react';

const REALMS = [
  { 
    id: 'r1', 
    name: 'The Harmonic Plains', 
    desc: 'A serene landscape of lush pads and perfect cadences.', 
    virtue: 'harmony', 
    level: 5, 
    color: '#3b82f6', 
    icon: <Mountain size={40} /> 
  },
  { 
    id: 'r2', 
    name: 'The Rhythmic Rift', 
    desc: 'A high-energy zone of precision beats and complex syncopation.', 
    virtue: 'rhythm', 
    level: 8, 
    color: '#ef4444', 
    icon: <Zap size={40} /> 
  },
  { 
    id: 'r3', 
    name: 'The Timbral Tundra', 
    desc: 'An icy wasteland of evolving textures and metallic synthesis.', 
    virtue: 'timbre', 
    level: 12, 
    color: '#f59e0b', 
    icon: <Cloud size={40} /> 
  },
  { 
    id: 'r4', 
    name: 'The Expressive Ocean', 
    desc: 'A deep sea of dynamic shifts and emotional swells.', 
    virtue: 'expression', 
    level: 15, 
    color: '#ec4899', 
    icon: <Waves size={40} /> 
  },
  { 
    id: 'r5', 
    name: 'The Innovation Nebula', 
    desc: 'A cosmic expanse of randomized structures and avant-garde ideas.', 
    virtue: 'innovation', 
    level: 20, 
    color: '#8b5cf6', 
    icon: <Sparkles size={40} /> 
  }
];

const VirtueRealms = () => {
  const virtues = JSON.parse(localStorage.getItem('virtuo_virtues')) || {};
  
  const getLevel = (virtue) => {
    const data = virtues[virtue];
    if (!data) return 0;
    return Math.floor(Math.sqrt(data.xp / 100));
  };

  return (
    <div className="virtue-realms-container" style={{ width: '100%', maxWidth: '1200px', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Musical Realms</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Explore the dimensions of sound unlocked by your mastery.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        {REALMS.map(realm => {
          const currentLevel = getLevel(realm.virtue);
          const isUnlocked = currentLevel >= realm.level;
          const progress = Math.min(100, (currentLevel / realm.level) * 100);

          return (
            <motion.div
              key={realm.id}
              whileHover={isUnlocked ? { scale: 1.02, y: -5 } : {}}
              className="glass-panel"
              style={{
                padding: '40px',
                textAlign: 'center',
                border: isUnlocked ? `2px solid ${realm.color}` : '1px solid var(--glass-border)',
                background: isUnlocked ? `linear-gradient(135deg, ${realm.color}15, rgba(0,0,0,0.4))` : 'rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                cursor: isUnlocked ? 'pointer' : 'default'
              }}
            >
              {/* Realm Visual */}
              <div style={{ 
                color: isUnlocked ? realm.color : 'var(--text-muted)', 
                opacity: isUnlocked ? 1 : 0.3,
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {isUnlocked ? realm.icon : <Lock size={40} />}
              </div>

              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '10px', 
                color: isUnlocked ? 'var(--text-main)' : 'var(--text-muted)' 
              }}>
                {realm.name}
              </h3>
              
              <p style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-muted)', 
                marginBottom: '30px',
                minHeight: '45px'
              }}>
                {isUnlocked ? realm.desc : `Requires ${realm.virtue.toUpperCase()} Level ${realm.level}`}
              </p>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  <span>Unlock Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    style={{ height: '100%', background: realm.color, boxShadow: `0 0 10px ${realm.color}80` }}
                  />
                </div>
              </div>

              {isUnlocked && (
                <button className="btn-glass" style={{ width: '100%', borderColor: realm.color, color: realm.color }}>
                  <Compass size={16} /> ENTER REALM
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="glass-panel" style={{ marginTop: '50px', padding: '30px', textAlign: 'center' }}>
        <MapIcon size={32} color="var(--accent-primary)" style={{ marginBottom: '15px' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>World Domination</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Unlock all five realms to become a **Master of the Multiverse** and earn the exclusive "Ethereal Traveler" familiar skin.
        </p>
      </div>
    </div>
  );
};

export default VirtueRealms;
