'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Download, RefreshCw, CheckCircle2, User, Key, Server } from 'lucide-react';

export default function AuditLogStream() {
  const [events, setEvents] = useState<any[]>([]);
  const [exported, setExported] = useState(false);

  const fetchAudit = () => {
    fetch('/api/audit-trail')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEvents(data.events);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + events.map(e => `${e.id},${e.user},${e.action},${e.resource},${e.ip},${e.timestamp}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "saassy_security_audit_trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Shield size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>SOC2 Compliance Trail</span>
          </div>
          <h2 className="section-title">Immutable Security Audit Trail Log</h2>
          <p className="section-desc">
            Track user administrative actions, API key rotations, and environment changes in real-time.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security Audit Events ({events.length})</h3>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={fetchAudit} className="btn btn-secondary btn-sm">
                <RefreshCw size={14} /> Refresh
              </button>
              <button onClick={handleExport} className="btn btn-primary btn-sm">
                <Download size={14} /> {exported ? 'Exported CSV' : 'Export Audit CSV'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((evt) => (
              <div key={evt.id} style={{ background: '#090d16', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {evt.action} — <span style={{ color: 'var(--accent-cyan)' }}>{evt.resource}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      User: {evt.user} | IP: {evt.ip}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
