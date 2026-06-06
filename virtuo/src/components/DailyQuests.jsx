import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Trophy, Star, 
  Calendar, RefreshCcw, Zap, Music, Disc
} from 'lucide-react';

const QUEST_POOL = [
  { id: 'q1', text: 'Play 50 notes on any instrument', target: 50, virtue: 'expression', xp: 100 },
  { id: 'q2', text: 'Achieve a score of 10 in Pitch Training', target: 10, virtue: 'harmony', xp: 150 },
  { id: 'q3', text: 'Record a loop longer than 8 bars', target: 1, virtue: 'innovation', xp: 120 },
  { id: 'q4', text: 'Achieve a score of 15 in Rhythm Training', target: 15, virtue: 'rhythm', xp: 150 },
  { id: 'q5', text: 'Experiment with 5 different synth presets', target: 5, virtue: 'timbre', xp: 100 },
  { id: 'q6', text: 'Complete a music theory session', target: 1, virtue: 'theory', xp: 200 },
  { id: 'q7', text: 'Create a 16-step drum pattern', target: 1, virtue: 'rhythm', xp: 80 },
  { id: 'q8', text: 'Apply 3 different effects in the mixer', target: 3, virtue: 'timbre', xp: 110 }
];

const DailyQuests = () => {
  const [quests, setQuests] = useState([]);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('virtuo_daily_quests');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setQuests(parsed.quests);
        setCompletedToday(parsed.quests.filter(q => q.completed).length);
        return;
      }
    }

    // Generate new quests for today
    const selected = [];
    const pool = [...QUEST_POOL];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push({ ...pool[idx], progress: 0, completed: false });
      pool.splice(idx, 1);
    }

    const newState = { date: today, quests: selected };
    setQuests(selected);
    setCompletedToday(0);
    localStorage.setItem('virtuo_daily_quests', JSON.stringify(newState));
  }, []);

  const claimReward = (questId) => {
    setQuests(prev => {
      const next = prev.map(q => {
        if (q.id === questId && !q.completed) {
          window.dispatchEvent(new CustomEvent('virtuo-gain-xp', {
            detail: { virtue: q.virtue, amount: q.xp }
          }));
          window.dispatchEvent(new CustomEvent('virtuo-notification', {
            detail: { title: 'QUEST COMPLETED!', message: `You earned ${q.xp} ${q.virtue} XP`, type: 'success' }
          }));
          return { ...q, completed: true };
        }
        return q;
      });
      
      const today = new Date().toDateString();
      localStorage.setItem('virtuo_daily_quests', JSON.stringify({ date: today, quests: next }));
      setCompletedToday(next.filter(q => q.completed).length);
      return next;
    });
  };

  return (
    <div className="daily-quests-container" style={{ width: '100%', maxWidth: '600px', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Daily Quests</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Complete tasks to earn bonus XP</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{completedToday}/3</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Completed</div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel"
            style={{ 
              padding: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              border: quest.completed ? '1px solid #10b98140' : '1px solid var(--glass-border)',
              background: quest.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ color: quest.completed ? '#10b981' : 'var(--text-muted)' }}>
              {quest.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                color: quest.completed ? 'var(--text-muted)' : 'var(--text-main)',
                textDecoration: quest.completed ? 'line-through' : 'none'
              }}>
                {quest.text}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  +{quest.xp} {quest.virtue.toUpperCase()} XP
                </span>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--glass-border)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily Quest</span>
              </div>
            </div>

            {!quest.completed && (
              <button 
                className="btn-glass" 
                onClick={() => claimReward(quest.id)}
                style={{ fontSize: '0.7rem', padding: '5px 12px' }}
              >
                Complete
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {completedToday === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: '30px', 
            padding: '20px', 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #f59e0b20, #8b5cf620)', 
            borderRadius: '20px',
            border: '1px solid #f59e0b40'
          }}
        >
          <Trophy size={32} color="#f59e0b" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 5px 0' }}>All Quests Done!</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            You've mastered today's challenges. Come back tomorrow for new goals!
          </p>
        </motion.div>
      )}

      <footer style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', opacity: 0.5 }}>
        <Calendar size={12} />
        <span style={{ fontSize: '0.7rem' }}>Resets in {getRemainingTime()}</span>
      </footer>
    </div>
  );
};

const getRemainingTime = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};

export default DailyQuests;
