import React, { useState } from 'react';
import { AlertTriangle, Zap, ShieldAlert, XCircle, CheckCircle2 } from 'lucide-react';
import { playAlarmSound, playBeep } from '../utils/soundEngine';

export default function AnomalyAlertBanner({ onTriggerAnomaly, onLogMessage, soundEnabled = true }) {
  const [activeAnomaly, setActiveAnomaly] = useState(null);

  const anomalies = [
    { id: 'SOLAR_FLARE', name: 'Solar Flare Burst', type: 'CRITICAL', color: '#f43f5e', desc: 'EM radiation spike detected in Sector 7' },
    { id: 'QUANTUM_SPIKE', name: 'Quantum Decoherence', type: 'WARN', color: '#f59e0b', desc: 'Flux resonance fluctuation +18.4%' },
    { id: 'SIGNAL_LOSS', name: 'TITAN-03 Signal Loss', type: 'CRITICAL', color: '#f43f5e', desc: 'Satellite downlink packet timeout' },
  ];

  const handleSimulate = (anomaly) => {
    setActiveAnomaly(anomaly);
    if (soundEnabled) playAlarmSound();

    if (onLogMessage) {
      onLogMessage(anomaly.type, `ANOMALY TRIGGERED: [${anomaly.name}] - ${anomaly.desc}`);
    }

    if (onTriggerAnomaly) {
      onTriggerAnomaly(anomaly);
    }
  };

  const handleClear = () => {
    setActiveAnomaly(null);
    if (soundEnabled) playBeep(500, 'sine', 0.08);
    if (onLogMessage) {
      onLogMessage('INFO', 'Active anomaly cleared. Systems returned to nominal baseline.');
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      
      {/* Active Anomaly Banner */}
      {activeAnomaly && (
        <div
          style={{
            background: `linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(225, 29, 72, 0.4) 100%)`,
            border: `1px solid ${activeAnomaly.color}`,
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            boxShadow: `0 0 20px ${activeAnomaly.color}`,
            animation: 'pulse-ring 2s infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertTriangle style={{ width: '22px', height: '22px', color: activeAnomaly.color }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>
                ALERT: {activeAnomaly.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>
                {activeAnomaly.desc}
              </div>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="btn-cosmo-outline"
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: '#ffffff', color: '#ffffff' }}
          >
            DISMISS ALERT
          </button>
        </div>
      )}

      {/* Trigger Buttons Toolbar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldAlert style={{ width: '16px', height: '16px', color: 'var(--accent-rose)' }} /> SIMULATE ANOMALY SCENARIOS:
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {anomalies.map((a) => (
            <button
              key={a.id}
              onClick={() => handleSimulate(a)}
              className="btn-cosmo-outline"
              style={{
                padding: '4px 10px',
                fontSize: '0.725rem',
                borderColor: a.color,
                color: '#ffffff',
                background: `rgba(244, 63, 94, 0.1)`
              }}
            >
              <Zap style={{ width: '12px', height: '12px', color: a.color }} /> {a.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
