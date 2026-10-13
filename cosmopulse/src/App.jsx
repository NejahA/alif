import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ParticleBackground from './components/ParticleBackground';
import ThroughputChart from './components/ThroughputChart';
import QuantumFluxGauge from './components/QuantumFluxGauge';
import SensorMatrix from './components/SensorMatrix';
import ThermalCore from './components/ThermalCore';
import LogConsole from './components/LogConsole';
import ControlWorkbench from './components/ControlWorkbench';
import OrbitalSystemTracker from './components/OrbitalSystemTracker';
import QuantumCipherStudio from './components/QuantumCipherStudio';
import AnomalyAlertBanner from './components/AnomalyAlertBanner';
import AICopilotConsole from './components/AICopilotConsole';
import Spatial3DConstellation from './components/Spatial3DConstellation';
import ReportExportModal from './components/ReportExportModal';
import AudioSynthesizerVisualizer from './components/AudioSynthesizerVisualizer';
import FlightRecorderTimeline from './components/FlightRecorderTimeline';
import HUDModeOverlay from './components/HUDModeOverlay';
import MissionPresetManager from './components/MissionPresetManager';
import { FileText } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('cosmic-violet');
  const [isStreaming, setIsStreaming] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isHUDOpen, setIsHUDOpen] = useState(false);

  // Workbench Sliders State
  const [orbitalVelocity, setOrbitalVelocity] = useState(1.0);
  const [sensorGain, setSensorGain] = useState(1.0);
  const [particleDensity, setParticleDensity] = useState(60);
  const [signalAmplification, setSignalAmplification] = useState(1.0);

  // Log Feed State
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '12:40:02', type: 'INFO', message: 'CosmoPulse command kernel v3.6 initialized.' },
    { id: 2, timestamp: '12:40:05', type: 'SIGNAL', message: 'Orbital node mesh handshake established with 6 satellite nodes.' },
    { id: 3, timestamp: '12:40:12', type: 'WARN', message: 'Plasma Core Zone 7 thermal gradient increased +4.2K.' },
    { id: 4, timestamp: '12:40:20', type: 'INFO', message: 'Quantum flux stability verified at 98.4%.' },
  ]);

  // Apply theme dataset to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto generate streaming log entries periodically
  useEffect(() => {
    if (!isStreaming) return;

    const sampleMessages = [
      { type: 'INFO', msg: 'Deep space telemetry packet synced across spatial sector 7.' },
      { type: 'SIGNAL', msg: 'Quantum harmonic sync verified. Frequency delta optimal.' },
      { type: 'WARN', msg: 'Orbital velocity perturbation detected (+0.04 AU/s).' },
      { type: 'INFO', msg: 'Solar array alignment recalibrated.' },
      { type: 'SIGNAL', msg: 'Encrypted relay packet received from TITAN-03.' },
    ];

    const interval = setInterval(() => {
      const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      const timeStr = new Date().toTimeString().split(' ')[0];
      setLogs((prev) => [
        ...prev.slice(-49),
        { id: Date.now(), timestamp: timeStr, type: sample.type, message: sample.msg },
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const addLogMessage = (type, message) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      { id: Date.now(), timestamp: timeStr, type, message },
    ]);
  };

  const handleManualPing = () => {
    addLogMessage('SIGNAL', 'Manual telemetry ping packet dispatched to deep space beacon grid.');
  };

  const handleResetControls = () => {
    setOrbitalVelocity(1.0);
    setSensorGain(1.0);
    setParticleDensity(60);
    setSignalAmplification(1.0);
    addLogMessage('INFO', 'Workbench simulation parameters reset to default baseline.');
  };

  const handleTriggerAnomaly = (anomaly) => {
    if (anomaly.id === 'SOLAR_FLARE') {
      setSignalAmplification(2.4);
      setSensorGain(1.8);
    } else if (anomaly.id === 'QUANTUM_SPIKE') {
      setSensorGain(2.2);
    }
  };

  const handleAICopilotAction = (action) => {
    if (action === 'PING_ALL') handleManualPing();
    if (action === 'SET_VELOCITY_14') setOrbitalVelocity(1.4);
  };

  const handleApplyPreset = (preset) => {
    setTheme(preset.theme);
    setOrbitalVelocity(preset.velocity);
    setSensorGain(preset.gain);
    setParticleDensity(preset.density);
    setSignalAmplification(preset.amp);
    addLogMessage('INFO', `Scenario Preset Applied: [${preset.name}]`);
  };

  // Theme color for particles
  const getThemeParticleColor = () => {
    switch (theme) {
      case 'cyber-cyan': return '#06b6d4';
      case 'solar-flare': return '#f97316';
      case 'deep-nebula': return '#ec4899';
      default: return '#8b5cf6';
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '1.5rem 2rem', zIndex: 1 }}>
      {/* Background canvas & grid */}
      <div className="cosmo-grid-bg" />
      <ParticleBackground
        speed={orbitalVelocity}
        density={particleDensity}
        particleColor={getThemeParticleColor()}
      />

      <HUDModeOverlay
        isOpen={isHUDOpen}
        onClose={() => setIsHUDOpen(false)}
        soundEnabled={soundEnabled}
      />

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        telemetryState={{ orbitalVelocity, sensorGain, particleDensity, signalAmplification, theme }}
        soundEnabled={soundEnabled}
      />

      <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Navigation & Header */}
        <Header
          currentTheme={theme}
          setTheme={setTheme}
          isStreaming={isStreaming}
          setIsStreaming={setIsStreaming}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onOpenHUD={() => setIsHUDOpen(true)}
        />

        {/* Mission Scenario Preset Launcher */}
        <MissionPresetManager onApplyPreset={handleApplyPreset} soundEnabled={soundEnabled} />

        {/* Anomaly Simulation Alert Banner & Report Button Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <AnomalyAlertBanner
              onTriggerAnomaly={handleTriggerAnomaly}
              onLogMessage={addLogMessage}
              soundEnabled={soundEnabled}
            />
          </div>
          <button
            onClick={() => setIsReportOpen(true)}
            className="btn-cosmo"
            style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}
          >
            <FileText style={{ width: '16px', height: '16px' }} /> EXPORT REPORT
          </button>
        </div>

        {/* Dashboard Grid Layout */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Row: Core Throughput & Quantum Gauge */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2', minWidth: '320px', '@media (max-width: 900px)': { gridColumn: 'span 1' } }}>
              <ThroughputChart isStreaming={isStreaming} amplification={signalAmplification} />
            </div>
            <div>
              <QuantumFluxGauge isStreaming={isStreaming} gain={sensorGain} />
            </div>
          </div>

          {/* Audio Synthesizer Visualizer & Telemetry Flight Recorder Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            <div>
              <AudioSynthesizerVisualizer soundEnabled={soundEnabled} />
            </div>
            <div>
              <FlightRecorderTimeline soundEnabled={soundEnabled} />
            </div>
          </div>

          {/* AI Copilot & 3D Spatial Constellation Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            <div>
              <AICopilotConsole onExecuteAction={handleAICopilotAction} soundEnabled={soundEnabled} />
            </div>
            <div>
              <Spatial3DConstellation soundEnabled={soundEnabled} />
            </div>
          </div>

          {/* Orbital System Tracker & Quantum Cipher Studio */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            <div>
              <OrbitalSystemTracker speedMultiplier={orbitalVelocity} soundEnabled={soundEnabled} />
            </div>
            <div>
              <QuantumCipherStudio onLogMessage={addLogMessage} soundEnabled={soundEnabled} />
            </div>
          </div>

          {/* Spatial Sensor Matrix & Core Thermal Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            <div>
              <SensorMatrix isStreaming={isStreaming} onLogMessage={addLogMessage} />
            </div>
            <div>
              <ThermalCore isStreaming={isStreaming} onLogMessage={addLogMessage} soundEnabled={soundEnabled} />
            </div>
          </div>

          {/* Bottom Row: Workbench Controls & Real-Time Log Console */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            <div>
              <ControlWorkbench
                orbitalVelocity={orbitalVelocity}
                setOrbitalVelocity={setOrbitalVelocity}
                sensorGain={sensorGain}
                setSensorGain={setSensorGain}
                particleDensity={particleDensity}
                setParticleDensity={setParticleDensity}
                signalAmplification={signalAmplification}
                setSignalAmplification={setSignalAmplification}
                onResetControls={handleResetControls}
              />
            </div>
            <div style={{ gridColumn: 'span 2', '@media (max-width: 1024px)': { gridColumn: 'span 1' } }}>
              <LogConsole
                logs={logs}
                onClearLogs={() => setLogs([])}
                onSendPing={handleManualPing}
                isStreaming={isStreaming}
              />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
