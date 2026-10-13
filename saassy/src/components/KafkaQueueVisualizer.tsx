'use client';

import React, { useState } from 'react';
import { Radio, Send, CheckCircle2, Server, Loader2, Zap } from 'lucide-react';

export default function KafkaQueueVisualizer() {
  const [topic, setTopic] = useState('orders.created');
  const [loading, setLoading] = useState(false);
  const [pubResult, setPubResult] = useState<any>(null);

  const topics = ['orders.created', 'payments.settled', 'embeddings.indexed', 'logs.ingested'];

  const handlePublish = async () => {
    setLoading(true);
    setPubResult(null);

    try {
      const res = await fetch('/api/queue-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setPubResult(data);
    } catch (err) {
      setPubResult({ success: false, error: 'Publish failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Radio size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>Kafka / RabbitMQ Broker</span>
          </div>
          <h2 className="section-title">Event Streaming Message Queue Console</h2>
          <p className="section-desc">
            Inspect partition offset streaming, message broker throughput, and zero-lag consumer groups.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Select Event Stream Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              >
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handlePublish} disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '46px' }}>
                {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                {loading ? 'Publishing to Broker...' : 'Publish Test Message to Queue'}
              </button>
            </div>
          </div>

          <div className="terminal-box">
            <div className="terminal-header">
              <Server size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Kafka Partition & Offset Telemetry
              </span>
            </div>

            <div className="terminal-body" style={{ minHeight: '140px', fontSize: '0.825rem' }}>
              {!loading && !pubResult && (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Select a topic and click "Publish Test Message to Queue" to inspect streaming offsets.
                </span>
              )}

              {loading && (
                <span style={{ color: 'var(--accent-cyan)' }}>
                  Writing record to partition offset...
                </span>
              )}

              {!loading && pubResult && pubResult.success && (
                <div>
                  <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px', fontWeight: 600 }}>
                    ✔ Published Message ID: {pubResult.messageId} ({pubResult.deliveredInMs}ms)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#0d1322', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <div>Topic: <strong style={{ color: 'var(--accent-cyan)' }}>{pubResult.topic}</strong></div>
                    <div>Partition: <strong style={{ color: 'var(--text-primary)' }}>Partition #{pubResult.partition}</strong></div>
                    <div>Offset: <strong style={{ color: 'var(--accent-primary)' }}>{pubResult.offset}</strong></div>
                    <div>Consumer Lag: <strong style={{ color: 'var(--accent-emerald)' }}>{pubResult.consumerLag} msgs</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
