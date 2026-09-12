import React, { useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Zap, Activity, Waves, Volume2, Power } from 'lucide-react';

export const StompboxPedalboard = ({ isOpen, onClose }) => {
  const [pedalStates, setPedalStates] = useState({
    overdrive: { active: false, drive: 0.4, tone: 0.6 },
    chorus:    { active: false, depth: 0.5, rate: 0.3 },
    delay:     { active: false, time: 0.35, feedback: 0.4 },
    flanger:   { active: false, depth: 0.4, feedback: 0.5 }
  });

  const togglePedal = (pedalKey) => {
    const nextState = !pedalStates[pedalKey].active;
    const updated = {
      ...pedalStates,
      [pedalKey]: { ...pedalStates[pedalKey], active: nextState }
    };
    setPedalStates(updated);

    if (pedalKey === 'overdrive') {
      audioEngine.updateParam('distortionAmount', nextState ? updated.overdrive.drive : 0);
      audioEngine.updateParam('distortionWet', nextState ? 0.6 : 0);
    } else if (pedalKey === 'chorus') {
      audioEngine.updateParam('chorusWet', nextState ? updated.chorus.depth : 0);
    } else if (pedalKey === 'delay') {
      audioEngine.updateParam('delayFeedback', nextState ? updated.delay.feedback : 0);
    } else if (pedalKey === 'flanger') {
      audioEngine.updateParam('flangerWet', nextState ? updated.flanger.depth : 0);
    }
  };

  const handleKnobChange = (pedalKey, paramKey, val) => {
    const updated = {
      ...pedalStates,
      [pedalKey]: { ...pedalStates[pedalKey], [paramKey]: val }
    };
    setPedalStates(updated);

    if (pedalStates[pedalKey].active) {
      if (pedalKey === 'overdrive' && paramKey === 'drive') {
        audioEngine.updateParam('distortionAmount', val);
      } else if (pedalKey === 'chorus' && paramKey === 'depth') {
        audioEngine.updateParam('chorusWet', val);
      } else if (pedalKey === 'delay' && paramKey === 'feedback') {
        audioEngine.updateParam('delayFeedback', val);
      } else if (pedalKey === 'flanger' && paramKey === 'depth') {
        audioEngine.updateParam('flangerWet', val);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      bottom: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '920px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 48,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      borderRadius: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="glow-pink" style={{ padding: '8px', borderRadius: '10px', background: 'var(--accent-pink)' }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Analog Stompbox FX Pedalboard</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Interactive Guitar & Synthesizer Performance Pedals</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
      </div>

      {/* 4 Stompbox Pedals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        {/* 1. Cyber Overdrive Pedal */}
        <div className="glass-panel" style={{
          background: 'linear-gradient(180deg, #3f0a1d, #19030b)',
          border: '1px solid rgba(236,72,153,0.4)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          boxShadow: pedalStates.overdrive.active ? '0 0 20px rgba(236,72,153,0.5)' : 'none'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ec4899', letterSpacing: '0.05em' }}>CYBER OVERDRIVE</div>
          
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DRIVE</span>
              <input type="range" min="0" max="1" step="0.05" value={pedalStates.overdrive.drive} onChange={(e) => handleKnobChange('overdrive', 'drive', parseFloat(e.target.value))} />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TONE</span>
              <input type="range" min="0" max="1" step="0.05" value={pedalStates.overdrive.tone} onChange={(e) => handleKnobChange('overdrive', 'tone', parseFloat(e.target.value))} />
            </div>
          </div>

          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pedalStates.overdrive.active ? '#ef4444' : '#334155', boxShadow: pedalStates.overdrive.active ? '0 0 10px #ef4444' : 'none' }} />

          <button onClick={() => togglePedal('overdrive')} className="glass-pill" style={{ width: '100%', padding: '10px 0', fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: pedalStates.overdrive.active ? '#ec4899' : 'rgba(255,255,255,0.08)', border: 'none' }}>
            {pedalStates.overdrive.active ? '🔴 STOMP ON' : '⚪ STOMP OFF'}
          </button>
        </div>

        {/* 2. Space Chorus Pedal */}
        <div className="glass-panel" style={{
          background: 'linear-gradient(180deg, #092e38, #031317)',
          border: '1px solid rgba(6,182,212,0.4)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          boxShadow: pedalStates.chorus.active ? '0 0 20px rgba(6,182,212,0.5)' : 'none'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#06b6d4', letterSpacing: '0.05em' }}>SPACE CHORUS</div>
          
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DEPTH</span>
              <input type="range" min="0" max="1" step="0.05" value={pedalStates.chorus.depth} onChange={(e) => handleKnobChange('chorus', 'depth', parseFloat(e.target.value))} />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>RATE</span>
              <input type="range" min="0.1" max="2" step="0.1" value={pedalStates.chorus.rate} onChange={(e) => handleKnobChange('chorus', 'rate', parseFloat(e.target.value))} />
            </div>
          </div>

          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pedalStates.chorus.active ? '#06b6d4' : '#334155', boxShadow: pedalStates.chorus.active ? '0 0 10px #06b6d4' : 'none' }} />

          <button onClick={() => togglePedal('chorus')} className="glass-pill" style={{ width: '100%', padding: '10px 0', fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: pedalStates.chorus.active ? '#06b6d4' : 'rgba(255,255,255,0.08)', border: 'none' }}>
            {pedalStates.chorus.active ? '🔴 STOMP ON' : '⚪ STOMP OFF'}
          </button>
        </div>

        {/* 3. Tape Delay Pedal */}
        <div className="glass-panel" style={{
          background: 'linear-gradient(180deg, #2a1b06, #120b02)',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          boxShadow: pedalStates.delay.active ? '0 0 20px rgba(245,158,11,0.5)' : 'none'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em' }}>TAPE DELAY</div>
          
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TIME</span>
              <input type="range" min="0.05" max="0.8" step="0.05" value={pedalStates.delay.time} onChange={(e) => handleKnobChange('delay', 'time', parseFloat(e.target.value))} />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>REPEAT</span>
              <input type="range" min="0" max="0.8" step="0.05" value={pedalStates.delay.feedback} onChange={(e) => handleKnobChange('delay', 'feedback', parseFloat(e.target.value))} />
            </div>
          </div>

          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pedalStates.delay.active ? '#f59e0b' : '#334155', boxShadow: pedalStates.delay.active ? '0 0 10px #f59e0b' : 'none' }} />

          <button onClick={() => togglePedal('delay')} className="glass-pill" style={{ width: '100%', padding: '10px 0', fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: pedalStates.delay.active ? '#f59e0b' : 'rgba(255,255,255,0.08)', border: 'none' }}>
            {pedalStates.delay.active ? '🔴 STOMP ON' : '⚪ STOMP OFF'}
          </button>
        </div>

        {/* 4. Neon Flanger Pedal */}
        <div className="glass-panel" style={{
          background: 'linear-gradient(180deg, #240a38, #0e0318)',
          border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          boxShadow: pedalStates.flanger.active ? '0 0 20px rgba(139,92,246,0.5)' : 'none'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.05em' }}>NEON FLANGER</div>
          
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>JET DEPTH</span>
              <input type="range" min="0" max="1" step="0.05" value={pedalStates.flanger.depth} onChange={(e) => handleKnobChange('flanger', 'depth', parseFloat(e.target.value))} />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>FEEDBACK</span>
              <input type="range" min="0" max="0.8" step="0.05" value={pedalStates.flanger.feedback} onChange={(e) => handleKnobChange('flanger', 'feedback', parseFloat(e.target.value))} />
            </div>
          </div>

          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pedalStates.flanger.active ? '#8b5cf6' : '#334155', boxShadow: pedalStates.flanger.active ? '0 0 10px #8b5cf6' : 'none' }} />

          <button onClick={() => togglePedal('flanger')} className="glass-pill" style={{ width: '100%', padding: '10px 0', fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: pedalStates.flanger.active ? '#8b5cf6' : 'rgba(255,255,255,0.08)', border: 'none' }}>
            {pedalStates.flanger.active ? '🔴 STOMP ON' : '⚪ STOMP OFF'}
          </button>
        </div>

      </div>
    </div>
  );
};
