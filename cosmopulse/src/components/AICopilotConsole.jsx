import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function AICopilotConsole({ onExecuteAction, soundEnabled = true }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI', text: 'AETHER-AI Copilot online. How can I assist with orbital telemetry or reactor diagnostics today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'Analyze Core Heat',
    'Run Diagnostic Ping',
    'Optimize Orbital Velocity',
    'Status Report'
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    if (soundEnabled) playBeep(900, 'sine', 0.05);

    const userMsg = { id: Date.now(), sender: 'USER', text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');

    // Generate AI response
    setTimeout(() => {
      let aiText = '';
      const lower = text.toLowerCase();

      if (lower.includes('heat') || lower.includes('thermal') || lower.includes('purge')) {
        aiText = 'Plasma Core analysis: Zone 7 temperature is nominal (380K). Recommending automatic coolant purge if peak exceeds 440K.';
        if (onExecuteAction) onExecuteAction('PURGE_SUGGESTION');
      } else if (lower.includes('ping') || lower.includes('diagnostic')) {
        aiText = 'Dispatched diagnostic signal across 6 satellite nodes. Network latency averaged 10.8ms (OPTIMAL).';
        if (onExecuteAction) onExecuteAction('PING_ALL');
      } else if (lower.includes('velocity') || lower.includes('speed') || lower.includes('optimize')) {
        aiText = 'Orbital velocity synchronized to 1.4x for optimal signal reception across Sector 7.';
        if (onExecuteAction) onExecuteAction('SET_VELOCITY_14');
      } else if (lower.includes('status') || lower.includes('report')) {
        aiText = 'Mission Status: ALL 6 NODES ONLINE | Flux Stability: 98.4% | Core Temp: 342K AVG. No critical anomalies active.';
      } else {
        aiText = `AETHER-AI processed request: "${text}". Quantum telemetry parameters adjusted. All orbital relays operating within safe tolerances.`;
      }

      if (soundEnabled) playBeep(1300, 'sine', 0.08);
      setMessages((prev) => [...prev, { id: Date.now(), sender: 'AI', text: aiText }]);
    }, 500);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Bot style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>AETHER AI Telemetry Copilot</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Neural Mission Assistant</p>
          </div>
        </div>

        <span style={{ fontSize: '0.7rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.2)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
          LLM ACTIVE
        </span>
      </div>

      {/* Quick Suggestion Chips */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="btn-cosmo-outline"
            style={{ padding: '3px 8px', fontSize: '0.65rem' }}
          >
            <Sparkles style={{ width: '10px', height: '10px', color: 'var(--accent-cyan)' }} /> {prompt}
          </button>
        ))}
      </div>

      {/* Chat History Box */}
      <div
        style={{
          flex: 1,
          minHeight: '160px',
          maxHeight: '220px',
          background: 'rgba(5, 8, 20, 0.85)',
          borderRadius: '10px',
          border: '1px solid var(--border-glass)',
          padding: '0.75rem',
          fontSize: '0.75rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.sender === 'USER' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.sender === 'USER' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(30, 41, 59, 0.6)',
              border: m.sender === 'USER' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-glass)',
              padding: '6px 10px',
              borderRadius: m.sender === 'USER' ? '10px 10px 0 10px' : '10px 10px 10px 0',
              color: 'var(--text-primary)'
            }}
          >
            {m.sender === 'AI' && (
              <div style={{ fontSize: '0.65rem', color: '#c084fc', fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles style={{ width: '10px', height: '10px' }} /> AETHER-AI
              </div>
            )}
            {m.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AETHER-AI or request diagnostic..."
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '6px 10px',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSend()}
          className="btn-cosmo"
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
        >
          <Send style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

    </div>
  );
}
