import React, { useState } from 'react';
import { FileText, Download, X, Check, Copy, Sliders } from 'lucide-react';
import { playBeep } from '../utils/soundEngine';

export default function ReportExportModal({ isOpen, onClose, telemetryState, soundEnabled = true }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportData = {
    mission: 'COSMOPULSE_ORBITAL_v3.5',
    timestamp: new Date().toISOString(),
    telemetry: {
      throughputPeak: '98 GB/s',
      quantumFlux: '74.2%',
      nodesOnline: '6 / 6',
      coreTempAvg: '342 K',
    },
    parameters: telemetryState || {},
  };

  const jsonString = JSON.stringify(reportData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    if (soundEnabled) playBeep(1200, 'sine', 0.08);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmopulse_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (soundEnabled) playBeep(1400, 'sine', 0.1);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '1.5rem',
          position: 'relative',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--accent-violet)',
          boxShadow: 'var(--glow-violet)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText style={{ width: '22px', height: '22px', color: 'var(--accent-violet)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Telemetry Report Export</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* JSON Display */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            SNAPSHOT DATA (JSON)
          </div>
          <pre
            style={{
              background: 'rgba(5, 8, 20, 0.9)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '0.85rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {jsonString}
          </pre>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={handleCopy} className="btn-cosmo-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            {copied ? <Check style={{ width: '14px', height: '14px', color: 'var(--accent-emerald)' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
            {copied ? 'COPIED!' : 'COPY JSON'}
          </button>
          <button onClick={handleDownload} className="btn-cosmo" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            <Download style={{ width: '14px', height: '14px' }} /> DOWNLOAD REPORT
          </button>
        </div>
      </div>
    </div>
  );
}
