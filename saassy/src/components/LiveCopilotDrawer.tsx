'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';

export default function LiveCopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am your Saassy AI Copilot. How can I assist you with your Next.js API routes or edge deployments today?' }
  ]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I encountered an issue. Please try again.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Network connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--gradient-brand)',
          color: '#ffffff',
          border: 'none',
          boxShadow: 'var(--shadow-glow)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.25s ease',
        }}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '92px',
            right: '24px',
            zIndex: 999,
            width: '360px',
            maxHeight: '520px',
            background: '#0d1322',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ background: '#141c2e', padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <div className="logo-badge" style={{ width: '30px', height: '30px' }}>
              <Bot size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Saassy AI Assistant</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>● Online (gpt-4o-mini)</span>
            </div>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '260px', maxHeight: '340px' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'var(--gradient-brand)' : 'var(--bg-surface)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  border: msg.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '14px', fontSize: '0.85rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={14} className="spin" /> Thinking...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} style={{ padding: '12px', background: '#090d16', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask anything about Saassy..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: '#141c2e',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
